"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Users,
  Shield,
  Layers,
  Sparkles,
  Check,
  X,
  MessageSquare,
  Copy,
} from "lucide-react";
import Footer from "@/src/components/Footer";

function GoogleMeetIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.5 24V14.5C29.5 12.57 27.93 11 26 11H8.5C6.57 11 5 12.57 5 14.5V33.5C5 35.43 6.57 37 8.5 37H26C27.93 37 29.5 35.43 29.5 33.5V24Z" fill="#00832D"/>
      <path d="M29.5 19.5L39.84 12.61C40.94 11.88 42.5 12.67 42.5 14V34C42.5 35.33 40.94 36.12 39.84 35.39L29.5 28.5V19.5Z" fill="#00AA47"/>
      <path d="M8.5 11H26C27.93 11 29.5 12.57 29.5 14.5V17.5H5V14.5C5 12.57 6.57 11 8.5 11Z" fill="#EA4335"/>
      <path d="M29.5 30.5V33.5C29.5 35.43 27.93 37 26 37H8.5C6.57 37 5 35.43 5 33.5V30.5H29.5Z" fill="#2684FC"/>
      <path d="M5 17.5H29.5V30.5H5V17.5Z" fill="#FFBA00"/>
    </svg>
  );
}

function ZoomIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#2D8CFF"/>
      <path d="M4.5 9C4.5 7.62 5.62 6.5 7 6.5H13C14.38 6.5 15.5 7.62 15.5 9V15C15.5 16.38 14.38 17.5 13 17.5H7C5.62 17.5 4.5 16.38 4.5 15V9Z" fill="white"/>
      <path d="M16.5 10.2L19.5 7.8C19.8 7.6 20.2 7.8 20.2 8.2V15.8C20.2 16.2 19.8 16.4 19.5 16.2L16.5 13.8V10.2Z" fill="white"/>
    </svg>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACCEPTED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Accepted" },
    PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending Response" },
    DECLINED: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "Declined" },
    SUPERSEDED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Counter-Proposed" },
    CANCELLED_BY_LEARNER: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Cancelled by Student" },
    CANCELLED_BY_MENTOR: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Cancelled by Mentor" },
    COMPLETED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Completed" },
  };

  const current = map[status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: status };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{current.label}</span>
    </span>
  );
}

export default function RequestsInboxPage() {
  const { user, authLoading } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "confirmed" | "history"
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  // Counter proposal modal state
  const [counterMeeting, setCounterMeeting] = useState(null);
  const [counterDate, setCounterDate] = useState("");
  const [counterTime, setCounterTime] = useState("10:00");
  const [counterDuration, setCounterDuration] = useState(60);
  const [counterAgenda, setCounterAgenda] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (id, link) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("tl_jwt");
      const res = await fetch("/api/requests", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMeetings(data.meetings || []);
      }
    } catch (e) {
      console.warn("Failed to load requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchMeetings();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Action Handlers
  const handleAccept = async (meetingId) => {
    setActionLoadingId(meetingId);
    setActionMessage("");
    try {
      const token = localStorage.getItem("tl_jwt");
      const res = await fetch(`/api/meetings/${meetingId}/accept`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept");
      setActionMessage("Meeting accepted!");
      await fetchMeetings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (meetingId) => {
    if (!confirm("Are you sure you want to decline this request? The student's reserved quota will be refunded.")) return;
    setActionLoadingId(meetingId);
    try {
      const token = localStorage.getItem("tl_jwt");
      const res = await fetch(`/api/meetings/${meetingId}/decline`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline");
      setActionMessage("Meeting declined. Quota refunded to student.");
      await fetchMeetings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (meetingId) => {
    if (!confirm("Are you sure you want to cancel this scheduled meeting? Cancellations less than 24h before start forfeit learner quota.")) return;
    setActionLoadingId(meetingId);
    try {
      const token = localStorage.getItem("tl_jwt");
      const res = await fetch(`/api/meetings/${meetingId}/cancel`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      setActionMessage("Meeting cancelled.");
      await fetchMeetings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleComplete = async (meetingId) => {
    if (!confirm("Confirm that this mentorship session has concluded? This will mark the session completed and consume quota.")) return;
    setActionLoadingId(meetingId);
    try {
      const token = localStorage.getItem("tl_jwt");
      const res = await fetch(`/api/meetings/${meetingId}/complete`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete");
      setActionMessage("Meeting marked completed!");
      await fetchMeetings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCounterSubmit = async (e) => {
    e.preventDefault();
    if (!counterDate || !counterTime) return;

    setActionLoadingId(counterMeeting.id);
    try {
      const startAt = new Date(`${counterDate}T${counterTime}:00`).toISOString();
      const endAt = new Date(new Date(startAt).getTime() + counterDuration * 60000).toISOString();

      const token = localStorage.getItem("tl_jwt");
      const res = await fetch(`/api/meetings/${counterMeeting.id}/counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          startAt,
          endAt,
          agenda: counterAgenda.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to counter propose");

      setCounterMeeting(null);
      setActionMessage("Counter proposal sent!");
      await fetchMeetings();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter meetings by tab
  const pendingMeetings = meetings.filter((m) => m.status === "PENDING");
  const confirmedMeetings = meetings.filter((m) => m.status === "ACCEPTED");
  const historyMeetings = meetings.filter((m) => m.status !== "PENDING" && m.status !== "ACCEPTED");

  const currentList =
    activeTab === "pending"
      ? pendingMeetings
      : activeTab === "confirmed"
      ? confirmedMeetings
      : historyMeetings;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Meeting Inbox
            </span>
          </div>

          {/* Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Session Requests Inbox
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Meeting Management
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Review incoming meeting requests, confirm slots, counter-propose alternate times, or cancel.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-4 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                {pendingMeetings.length} Pending
              </span>
              <span className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                {confirmedMeetings.length} Confirmed
              </span>
            </div>
          </div>

          {/* Action Message Alert */}
          {actionMessage && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-purple-900 text-xs font-bold flex items-center justify-between">
              <span>{actionMessage}</span>
              <button
                type="button"
                onClick={() => setActionMessage("")}
                className="text-purple-600 hover:text-purple-800"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "pending"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock size={16} />
              <span>Pending Requests ({pendingMeetings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("confirmed")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "confirmed"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckCircle2 size={16} />
              <span>Confirmed Meetings ({confirmedMeetings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "history"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Calendar size={16} />
              <span>History & Completed ({historyMeetings.length})</span>
            </button>
          </div>

          {/* Meetings List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading meeting requests...
            </div>
          ) : currentList.length === 0 ? (
            <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <Calendar size={36} className="mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-800 text-sm">No Meetings Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === "pending"
                  ? "There are no pending meeting requests awaiting response."
                  : activeTab === "confirmed"
                  ? "You have no upcoming confirmed meetings scheduled."
                  : "No past or cancelled meeting history."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentList.map((meeting) => {
                const isMentor = meeting.mentorId === user?.id;
                const participant = meeting.participants?.[0];
                const counterparty = isMentor
                  ? participant?.enrollment?.learner
                  : meeting.mentor;

                const start = new Date(meeting.startAt);
                const end = new Date(meeting.endAt);
                const isActionLoading = actionLoadingId === meeting.id;

                return (
                  <div
                    key={meeting.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left: Details */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <StatusBadge status={meeting.status} />
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-bold text-purple-700">
                          {meeting.gig?.title || "1:1 Mentorship Session"}
                        </span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                        <Calendar size={16} className="text-purple-600 shrink-0" />
                        <span>
                          {start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-slate-300 font-normal">|</span>
                        <span className="text-purple-700">
                          {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Counterparty & Platform */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <img
                            src={counterparty?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={counterparty?.name || "User"}
                            className="w-6 h-6 rounded-full object-cover border border-purple-200"
                          />
                          <span className="font-bold text-slate-900">
                            {isMentor ? `Student: ${counterparty?.name || "Student"}` : `Mentor: ${counterparty?.name || "Mentor"}`}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span>Platform:</span>
                          <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {(meeting.platform || "").toLowerCase().includes("zoom") ? (
                              <ZoomIcon className="w-3.5 h-3.5" />
                            ) : (
                              <GoogleMeetIcon className="w-3.5 h-3.5" />
                            )}
                            <span>{meeting.platform || "Google Meet"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Generated Room Link banner when accepted */}
                      {meeting.status === "ACCEPTED" && meeting.joinUrl && (
                        <div className="p-3 bg-gradient-to-r from-purple-50/90 to-indigo-50/80 rounded-2xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white border border-purple-200/80 shadow-2xs flex items-center justify-center shrink-0">
                              {(meeting.platform || "").toLowerCase().includes("zoom") ? (
                                <ZoomIcon className="w-4 h-4" />
                              ) : (
                                <GoogleMeetIcon className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-black text-purple-900 tracking-wider block">
                                Generated {(meeting.platform || "").toLowerCase().includes("zoom") ? "Zoom" : "Google Meet"} Room
                              </span>
                              <span className="text-xs font-mono font-bold text-slate-800 truncate block">
                                {meeting.joinUrl}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(meeting.id, meeting.joinUrl)}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Copy meeting link"
                            >
                              {copiedId === meeting.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                              <span>{copiedId === meeting.id ? "Copied!" : "Copy Link"}</span>
                            </button>
                            <a
                              href={meeting.joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                                (meeting.platform || "").toLowerCase().includes("zoom")
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              <span>{(meeting.platform || "").toLowerCase().includes("zoom") ? "Join Zoom" : "Join Meet"}</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      )}

                      {meeting.agenda && (
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          &ldquo;{meeting.agenda}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap md:flex-col items-end justify-center gap-2 shrink-0">
                      {meeting.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleAccept(meeting.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <Check size={14} />
                            <span>Accept</span>
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => {
                              setCounterMeeting(meeting);
                              setCounterDate(new Date(meeting.startAt).toISOString().split("T")[0]);
                            }}
                            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw size={14} />
                            <span>Counter Propose</span>
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleDecline(meeting.id)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <X size={14} />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {meeting.status === "ACCEPTED" && (
                        <>
                          {meeting.joinUrl && (
                            <a
                              href={meeting.joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-4 py-2 rounded-xl text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs ${
                                (meeting.platform || "").toLowerCase().includes("zoom")
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {(meeting.platform || "").toLowerCase().includes("zoom") ? (
                                <ZoomIcon className="w-3.5 h-3.5" />
                              ) : (
                                <GoogleMeetIcon className="w-3.5 h-3.5" />
                              )}
                              <span>{(meeting.platform || "").toLowerCase().includes("zoom") ? "Join Zoom Meeting" : "Join Google Meet"}</span>
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleComplete(meeting.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleCancel(meeting.id)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <span>Cancel Session</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Counter Proposal Modal */}
          {counterMeeting && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Counter-Propose Time
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCounterMeeting(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCounterSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">New Date</label>
                    <input
                      type="date"
                      required
                      value={counterDate}
                      onChange={(e) => setCounterDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">New Start Time</label>
                    <input
                      type="time"
                      required
                      value={counterTime}
                      onChange={(e) => setCounterTime(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">Duration (Minutes)</label>
                    <select
                      value={counterDuration}
                      onChange={(e) => setCounterDuration(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800">Reason / Note</label>
                    <textarea
                      rows={2}
                      value={counterAgenda}
                      onChange={(e) => setCounterAgenda(e.target.value)}
                      placeholder="Why this time works better..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCounterMeeting(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoadingId !== null}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      Submit Counter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
