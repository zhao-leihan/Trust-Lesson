"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
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
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/chat/threads");
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

  const fetchMessages = async (threadId) => {
    if (!threadId) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/threads/${threadId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.warn("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
      const interval = setInterval(() => {
        fetchMessages(activeThreadId);
      }, 5000); // 5s poll
      return () => clearInterval(interval);
    }
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeThreadId || sending) return;

    const bodyText = messageInput.trim();
    setMessageInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/chat/threads/${activeThreadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: bodyText }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      fetchThreads(); // update last message preview
    } catch (err) {
      console.error("Failed to send:", err);
      setMessageInput(bodyText); // restore on error
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const otherParticipant = activeThread?.participants?.find(
    (p) => p.userId !== user?.id
  )?.user;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-24">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 flex flex-col">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                <MessageSquare className="text-purple-600" size={24} />
                <span>Classroom Messages</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time encrypted communication between mentors and enrolled students
              </p>
            </div>
          </div>
        </div>

        {/* Chat Layout Container */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex-1 flex flex-col md:flex-row min-h-[580px] overflow-hidden">
          {/* Left Panel: Threads List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Conversations</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {threads.length} active discussion thread{threads.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loadingThreads ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
              ) : threads.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800">No Conversations Yet</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[200px] mx-auto">
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
                          ? "bg-purple-50/70 border-l-4 border-purple-600"
                          : "hover:bg-white"
                      }`}
                    >
                      <Avatar className="w-10 h-10 shrink-0 border border-slate-200">
                        <AvatarImage src={peer?.avatarUrl || ""} alt={peer?.name || "User"} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-xs">
                          {peer?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {peer?.name || "Classroom Peer"}
                          </p>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                              {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        {thread.enrollment?.gig?.title && (
                          <p className="text-[10px] text-purple-600 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <BookOpen size={10} />
                            <span>{thread.enrollment.gig.title}</span>
                          </p>
                        )}

                        <p className="text-xs text-slate-500 truncate mt-1">
                          {lastMsg ? lastMsg.body : "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Chat Messages */}
          <div className="flex-1 flex flex-col bg-white">
            {activeThread ? (
              <>
                {/* Active Thread Header */}
                <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-slate-200">
                      <AvatarImage src={otherParticipant?.avatarUrl || ""} />
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-xs">
                        {otherParticipant?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{otherParticipant?.name || "Participant"}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {otherParticipant?.role || "Member"}
                        </span>
                      </h3>
                      {activeThread.enrollment?.gig?.title && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Enrolled Course: {activeThread.enrollment.gig.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Shield size={14} className="text-emerald-600" />
                    <span className="hidden sm:inline">Escrow Gated</span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/20">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-slate-400">Loading conversation...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                        <Sparkles size={18} />
                      </div>
                      <p className="font-bold text-xs text-slate-700">Start the Discussion</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ask questions about mentorship milestones, schedule dates, or project deliverables.
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
                            className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                              isMe
                                ? "bg-purple-600 text-white rounded-br-xs"
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-xs"
                            }`}
                          >
                            <p className="break-words">{msg.body}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
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
                  className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-purple-600/20"
                  >
                    <span>Send</span>
                    <Send size={13} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700">Select a Conversation</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Choose a student or class from the sidebar to view message history and send updates.
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
