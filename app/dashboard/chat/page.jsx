"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { usePusherChat } from "@/src/hooks/usePusherChat";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  User,
  Shield,
  Clock,
  Sparkles,
  Search,
  BookOpen,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/Avatar";
import Footer from "@/src/components/Footer";

export default function ChatPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchThreads = async () => {
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token")) : null;
      const res = await fetch("/api/chat/threads", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load threads");
      const data = await res.json();
      setThreads(data.threads || []);
      if (!activeThreadId && data.threads?.length > 0) {
        setActiveThreadId(data.threads[0].id);
      }
    } catch (err) {
      console.warn("Error fetching threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const otherParticipant = activeThread?.participants?.find(
    (p) => p.userId !== user?.id
  )?.user;

  // Realtime Pusher Channels Chat Hook with instant sync & database persistence
  const {
    messages,
    sendMessage: sendChatMessage,
    isPusherConnected,
    connectionState,
  } = usePusherChat({
    roomId: activeThread?.id,
    currentUser: user,
    peerUser: otherParticipant,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThread || sending) return;

    const bodyText = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      await sendChatMessage(bodyText);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageInput(bodyText);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between pt-24 selection:bg-violet-500 selection:text-white">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="text-violet-600" size={24} />
                <span>Classroom Messages</span>
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time communication between mentors and enrolled students
              </p>
            </div>
          </div>
        </div>

        {/* Chat Layout Container */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs flex-1 flex flex-col md:flex-row min-h-[580px] overflow-hidden">
          {/* Left Panel: Threads List */}
          <div className={`${activeThreadId ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-gray-100 flex-col bg-white shrink-0`}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Conversations</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {threads.length} active discussion thread{threads.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loadingThreads ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading chats...</div>
              ) : threads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-bold text-xs text-gray-800">No Conversations Yet</h4>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] mx-auto">
                    Chat threads are automatically created when a student enrolls in a course.
                  </p>
                </div>
              ) : (
                threads.map((thread) => {
                  const peer = thread.participants?.find((p) => p.userId !== user?.id)?.user;
                  const lastMsg = thread.messages?.[0];
                  const isSelected = thread.id === activeThreadId;

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setActiveThreadId(thread.id)}
                      className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-violet-50 border-l-2 border-violet-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar className="w-10 h-10 shrink-0 border border-gray-200">
                        <AvatarImage src={peer?.avatarUrl || ""} alt={peer?.name || "User"} />
                        <AvatarFallback className="bg-violet-50 text-violet-700 font-semibold text-xs">
                          {peer?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-xs text-gray-900 truncate">
                            {peer?.name || "Classroom Peer"}
                          </p>
                          {lastMsg && (
                            <span className="text-[10px] text-gray-400 shrink-0 font-normal">
                              {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        {thread.enrollment?.gig?.title && (
                          <p className="text-[10px] text-violet-600 font-medium truncate flex items-center gap-1 mt-0.5">
                            <BookOpen size={10} />
                            <span>{thread.enrollment.gig.title}</span>
                          </p>
                        )}

                        <p className="text-xs text-gray-500 truncate mt-1">
                          {lastMsg ? lastMsg.body : "Pusher Realtime Channel"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Messages */}
          <div className={`${!activeThreadId ? "hidden md:flex" : "flex"} flex-1 flex-col bg-white`}>
            {activeThread ? (
              <>
                {/* Active Thread Header */}
                <div className="p-4 sm:px-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveThreadId(null)}
                      className="md:hidden p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                      title="Back to conversations"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <Avatar className="w-10 h-10 border border-gray-200">
                      <AvatarImage src={otherParticipant?.avatarUrl || ""} />
                      <AvatarFallback className="bg-violet-50 text-violet-700 font-semibold text-xs">
                        {otherParticipant?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <span>{otherParticipant?.name || "Participant"}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-semibold">
                          {otherParticipant?.role || "Member"}
                        </span>
                      </h3>
                      {activeThread.enrollment?.gig?.title && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                          Enrolled Course: {activeThread.enrollment.gig.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${isPusherConnected ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPusherConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                      <span>{isPusherConnected ? "Live Connected" : "Connecting..."}</span>
                    </span>
                    <div className="hidden sm:flex items-center gap-1 text-gray-400 text-xs ml-1">
                      <Shield size={14} className="text-emerald-600" />
                      <span>Escrow Gated</span>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-gray-50/50">
                  {messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-2">
                        <Sparkles size={18} />
                      </div>
                      <p className="font-bold text-xs text-gray-700">Start the Discussion</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Send message via realtime channel with instant synchronization.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-md sm:max-w-lg px-4 py-2.5 text-xs leading-relaxed ${
                              isMe
                                ? "bg-violet-600 text-white rounded-2xl rounded-br-sm"
                                : "bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm"
                            }`}
                          >
                            <p className="break-words">{msg.body}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 px-1 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 sm:p-4 border-t border-gray-100 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-600 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-gray-700">Select a Conversation</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    Choose a student or class from the sidebar to start live discussion.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
