"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useWebRTCChat Hook
 * Provides WebRTC P2P DataChannel chat with zero database overhead.
 * Direct browser-to-browser communication with local storage persistence.
 */
export function useWebRTCChat({ roomId, currentUser, peerUser }) {
  const [messages, setMessages] = useState([]);
  const [isP2PConnected, setIsP2PConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected"); // 'disconnected' | 'connecting' | 'connected'

  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);
  const storageKey = roomId ? `tl_p2p_chat_${roomId}` : null;
  const pollingRef = useRef(null);

  // Load existing messages from localStorage on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([]);
      }
    } catch (e) {
      console.warn("Failed to load local chat messages:", e);
    }
  }, [storageKey]);

  // Save message locally in browser storage
  const saveMessageLocally = useCallback(
    (newMsg) => {
      if (!storageKey || !newMsg) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        const updated = [...prev, newMsg];
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save message to localStorage:", e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  // Initialize WebRTC P2P Peer Connection
  useEffect(() => {
    if (!roomId || !currentUser?.id) return;

    let isMounted = true;
    const myId = currentUser.id;
    const peerId = peerUser?.id;

    // Deterministic role: initiator creates offer & data channel
    const isInitiator = !peerId || String(myId) > String(peerId);

    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    let pc;
    try {
      pc = new RTCPeerConnection(configuration);
      pcRef.current = pc;
      setConnectionState("connecting");
    } catch (err) {
      console.warn("RTCPeerConnection not supported:", err);
      return;
    }

    // Helper: send in-memory signal (Zero DB usage)
    const sendSignal = async (type, data) => {
      try {
        const token = localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token");
        await fetch("/api/webrtc/signal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            roomId,
            recipientId: peerId,
            type,
            data,
          }),
        });
      } catch (err) {
        // silent
      }
    };

    // ICE candidates exchange
    pc.onicecandidate = (event) => {
      if (event.candidate && isMounted) {
        sendSignal("candidate", event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      if (!isMounted) return;
      if (pc.connectionState === "connected") {
        setConnectionState("connected");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setConnectionState("disconnected");
        setIsP2PConnected(false);
      }
    };

    const attachChannelEvents = (channel) => {
      dataChannelRef.current = channel;

      channel.onopen = () => {
        if (!isMounted) return;
        setIsP2PConnected(true);
        setConnectionState("connected");
      };

      channel.onclose = () => {
        if (!isMounted) return;
        setIsP2PConnected(false);
        setConnectionState("disconnected");
      };

      channel.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          saveMessageLocally(msg);
        } catch (e) {
          console.warn("Failed to parse DataChannel message:", e);
        }
      };
    };

    if (isInitiator) {
      const channel = pc.createDataChannel("chat");
      attachChannelEvents(channel);

      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (isMounted) sendSignal("offer", pc.localDescription);
        })
        .catch((err) => console.warn("P2P offer error:", err));
    } else {
      pc.ondatachannel = (event) => {
        attachChannelEvents(event.channel);
      };
    }

    // In-memory signaling loop
    const pollSignals = async () => {
      if (!isMounted) return;
      try {
        const token = localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token");
        const res = await fetch(`/api/webrtc/signals?roomId=${encodeURIComponent(roomId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const json = await res.json();
        const signals = json.signals || [];

        for (const sig of signals) {
          if (sig.senderId === myId) continue;

          if (sig.type === "offer" && !isInitiator) {
            await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendSignal("answer", pc.localDescription);
          } else if (sig.type === "answer" && isInitiator) {
            if (pc.signalingState !== "stable") {
              await pc.setRemoteDescription(new RTCSessionDescription(sig.data));
            }
          } else if (sig.type === "candidate") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(sig.data));
            } catch (iceErr) {
              // ignore duplicate candidate
            }
          } else if (sig.type === "p2p_msg") {
            saveMessageLocally(sig.data);
          }
        }
      } catch (e) {
        // silent
      }
    };

    const pollTimer = setInterval(pollSignals, 2000);
    pollingRef.current = pollTimer;

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [roomId, currentUser?.id, peerUser?.id, saveMessageLocally]);

  // Send message
  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || !currentUser?.id) return;

      const newMsg = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        roomId,
        senderId: currentUser.id,
        senderName: currentUser.name || "User",
        senderRole: currentUser.role || "LEARNER",
        body: text.trim(),
        createdAt: new Date().toISOString(),
        isP2P: isP2PConnected,
      };

      // 1. Save locally in localStorage
      saveMessageLocally(newMsg);

      // 2. Transmit via WebRTC DataChannel if open
      if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
        dataChannelRef.current.send(JSON.stringify(newMsg));
      } else {
        // 3. Fallback: transmit via in-memory signal (Zero DB usage)
        try {
          const token = localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token");
          await fetch("/api/webrtc/signal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              roomId,
              recipientId: peerUser?.id,
              type: "p2p_msg",
              data: newMsg,
            }),
          });
        } catch (e) {
          console.warn("In-memory fallback transmission failed:", e);
        }
      }
    },
    [roomId, currentUser, peerUser, isP2PConnected, saveMessageLocally]
  );

  return {
    messages,
    sendMessage,
    isP2PConnected,
    connectionState,
  };
}
