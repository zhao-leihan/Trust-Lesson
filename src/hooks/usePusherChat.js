"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Pusher from "pusher-js";

/**
 * usePusherChat Hook
 * Real-time classroom chat powered by Pusher Channels with automated database persistence and polling fallback.
 */
export function usePusherChat({ roomId, currentUser, peerUser }) {
  const [messages, setMessages] = useState([]);
  const [isPusherConnected, setIsPusherConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("connecting"); // 'connecting' | 'connected' | 'offline'

  const pusherRef = useRef(null);
  const channelRef = useRef(null);
  const threadId = roomId;

  // 1. Fetch message history from database
  const fetchMessages = useCallback(async () => {
    if (!threadId) return;
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token")) : null;
      const wallet = currentUser?.walletAddress || currentUser?.address || (typeof window !== "undefined" ? localStorage.getItem("tl_wallet") : null);
      const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(wallet ? { "x-wallet-address": wallet } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const hasNew = data.messages.some((m) => !existingIds.has(m.id));
            if (!hasNew && prev.length === data.messages.length) return prev;
            return data.messages;
          });
        }
      }
    } catch (err) {
      console.warn("[usePusherChat] History fetch error:", err.message);
    }
  }, [threadId]);

  // Initial load on thread change
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 2. Setup Pusher Realtime Connection
  useEffect(() => {
    if (!threadId) return;

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

    let pusher = null;
    let channel = null;

    if (pusherKey) {
      try {
        pusher = new Pusher(pusherKey, {
          cluster: pusherCluster,
        });

        pusher.connection.bind("connected", () => {
          setIsPusherConnected(true);
          setConnectionState("connected");
        });

        pusher.connection.bind("disconnected", () => {
          setIsPusherConnected(false);
          setConnectionState("offline");
        });

        channel = pusher.subscribe(`thread-${threadId}`);
        channel.bind("message:new", (newMsg) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        });

        pusherRef.current = pusher;
        channelRef.current = channel;
      } catch (err) {
        console.warn("[Pusher Client Init Warning]:", err.message);
      }
    } else {
      // If Pusher key is not yet set in .env, maintain active connection status with fast polling
      setIsPusherConnected(true);
      setConnectionState("connected");
    }

    // 3. Fallback / Sync polling every 3.5s to ensure zero message loss
    const pollInterval = setInterval(() => {
      fetchMessages();
    }, 3500);

    return () => {
      clearInterval(pollInterval);
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [threadId, fetchMessages]);

  // 4. Send Message Function
  const sendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || !threadId) return;
      const body = text.trim();

      // Optimistic message
      const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const optimisticMsg = {
        id: optimisticId,
        threadId,
        senderId: currentUser?.id || "me",
        body,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        const token = typeof window !== "undefined" ? (localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token")) : null;
        const wallet = currentUser?.walletAddress || currentUser?.address || (typeof window !== "undefined" ? localStorage.getItem("tl_wallet") : null);
        const res = await fetch(`/api/chat/threads/${threadId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(wallet ? { "x-wallet-address": wallet } : {}),
          },
          body: JSON.stringify({ body }),
        });

        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        const data = await res.json();
        if (data.message) {
          // Replace optimistic message with confirmed database message
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticId ? data.message : m))
          );
        }
      } catch (err) {
        console.error("[usePusherChat] Send error:", err);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        throw err;
      }
    },
    [threadId, currentUser]
  );

  return {
    messages,
    sendMessage,
    isP2PConnected: isPusherConnected,
    isPusherConnected,
    connectionState,
    fetchMessages,
  };
}
