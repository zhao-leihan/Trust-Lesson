"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiFetch } from "@/src/context/AuthContext";
import { useWebRTCChat } from "@/src/hooks/useWebRTCChat";
import {
  ArrowLeft,
  Users,
  Search,
  Calendar,
  Clock,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Video,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ClipboardList,
  Send,
  Plus,
  BookOpen,
  X,
  FileCheck,
  Award,
  CheckSquare,
  Square,
  File,
  Download,
  Trophy,
} from "lucide-react";
import Footer from "@/src/components/Footer";
import ClassroomLeaderboard from "@/src/components/ClassroomLeaderboard";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  Card,
  StatusPill,
} from "@/src/components/ui/DesignTokens";

function StatusBadge({ status }) {
  const map = {
    FUNDED: { label: "Funded" },
    IN_SESSION: { label: "In Session" },
    COMPLETED: { label: "Completed" },
    DISPUTED: { label: "Disputed" },
    CANCELLED: { label: "Cancelled" },
    RESOLVED: { label: "Resolved" },
    CREATED: { label: "Pending Escrow" },
  };
  const label = map[status]?.label || status;
  return <StatusPill status={status} label={label} />;
}

export default function MentorGigClassroomPage() {
  const params = useParams();
  const gigId = params?.gigId;
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("learners"); // "learners" | "chat" | "meetings" | "tasks"

  // Chat State
  const [selectedLearnerIndex, setSelectedLearnerIndex] = useState(0);
  const [newMessageText, setNewMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Assignment Modal & Form State
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    instructions: "",
    dueAt: "",
    passingScore: 70,
    targetLearnerId: "ALL",
  });
  const [gradingAssignmentId, setGradingAssignmentId] = useState(null);
  const [gradingForm, setGradingForm] = useState({ decision: "APPROVED", score: 100, feedback: "" });
  const [actionLoading, setActionLoading] = useState(false);

  // Search in Learners tab
  const [searchQuery, setSearchQuery] = useState("");

  const fetchClassroom = async () => {
    if (!gigId || !user) return;
    try {
      const json = await apiFetch(`/gigs/${gigId}/classroom`);
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to load classroom");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchClassroom();
    }
  }, [gigId, user, authLoading]);

  // Active selected learner for direct communication
  const activeLearner = data?.learners?.[selectedLearnerIndex];

  // WebRTC P2P Direct Chat (Zero DB overhead)
  const {
    messages,
    sendMessage: sendP2PMessage,
    isP2PConnected,
    connectionState,
  } = useWebRTCChat({
    roomId: activeLearner?.enrollmentId,
    currentUser: user,
    peerUser: activeLearner?.learner,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send Chat Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || sendingMessage || !activeLearner) return;

    setSendingMessage(true);
    try {
      await sendP2PMessage(newMessageText.trim());
      setNewMessageText("");
    } catch (err) {
      alert(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Accept Meeting Request
  const handleAcceptMeeting = async (meetingId) => {
    setActionLoading(true);
    try {
      await apiFetch(`/meetings/${meetingId}/accept`, {
        method: "POST",
      });
      await fetchClassroom();
    } catch (err) {
      alert(err.message || "Failed to accept meeting");
    } finally {
      setActionLoading(false);
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim() || !newAssignment.instructions.trim()) return;
    setActionLoading(true);
    try {
      await apiFetch(`/gigs/${gigId}/assignments`, {
        method: "POST",
        body: JSON.stringify(newAssignment),
      });
      setIsCreatingAssignment(false);
      setNewAssignment({
        title: "",
        instructions: "",
        dueAt: "",
        passingScore: 70,
        targetLearnerId: "ALL",
      });
      await fetchClassroom();
    } catch (err) {
      alert(err.message || "Failed to create assignment");
    } finally {
      setActionLoading(false);
    }
  };

  // Grade Assignment
  const handleGradeAssignment = async (e, assignmentId, enrollmentId) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiFetch(`/enrollments/${enrollmentId}/assignments/${assignmentId}/grade`, {
        method: "POST",
        body: JSON.stringify(gradingForm),
      });
      setGradingAssignmentId(null);
      setGradingForm({ decision: "APPROVED", score: 100, feedback: "" });
      await fetchClassroom();
    } catch (err) {
      alert(err.message || "Failed to grade assignment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-28">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-xl border border-slate-200 flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-slate-900 font-bold text-base mb-1">Loading Classroom Area</h2>
          <p className="text-slate-500 text-xs">
            Fetching enrolled learners, messages, meeting requests, and tasks...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="pt-28 pb-20 px-4 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
              <p className="text-slate-600 text-xs leading-relaxed">
                {error || "Classroom could not be loaded."}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { gig, learners = [], meetings = [], assignments = [] } = data;
  const totalModules = gig?.parsedModules?.length || gig?.modules?.length || 1;

  const filteredLearners = learners.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.learner?.name?.toLowerCase().includes(q) ||
      item.learner?.email?.toLowerCase().includes(q) ||
      item.learner?.walletAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Mentor Classroom Hub
              </span>
              <Link
                href={`/book/course/${gig.id}`}
                target="_blank"
                className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200 inline-flex items-center gap-1 shadow-2xs"
              >
                <span>View Public Page</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Gig Class Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                  {gig.category || "Mentorship"}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-bold text-slate-600">
                  {gig.duration || "1 Live Meeting"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Class: {gig.title}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                {gig.description}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                <span className="block text-xl font-extrabold text-purple-900">
                  {learners.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  Learners
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <span className="block text-xl font-extrabold text-blue-900">
                  {meetings.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Meetings
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="block text-xl font-extrabold text-emerald-900">
                  {assignments.length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Tasks
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-100/80 p-1.5 rounded-full max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("learners")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "learners"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Users size={15} />
              <span>Learners & Progress ({learners.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "chat"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <MessageSquare size={15} />
              <span>Chat with Learners</span>
            </button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "meetings"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Calendar size={15} />
              <span>Meeting Requests ({meetings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "tasks"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <ClipboardList size={15} />
              <span>Tasks & Assignments ({assignments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "leaderboard"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Trophy size={15} />
              <span>Leaderboard</span>
            </button>
          </div>

          {/* TAB 1: LEARNERS & PROGRESS */}
          {activeTab === "learners" && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by learner name, email, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                  Showing {filteredLearners.length} enrolled student(s)
                </div>
              </div>

              {/* Learners List / Table */}
              {filteredLearners.length === 0 ? (
                <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
                  <Users size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-800 text-sm">No Learners Enrolled Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When students purchase this offering on Arbitrum, they will automatically appear here with their module roadmap progress.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLearners.map((item, idx) => {
                    const l = item.learner;
                    const quota = item.quota;
                    const nextM = item.nextMeeting;

                    return (
                      <div
                        key={item.enrollmentId}
                        className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs hover:border-purple-200 transition-all"
                      >
                        {/* Header: Learner Info & Escrow Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={
                                l?.avatarUrl ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                              }
                              alt={l?.name || "Learner"}
                              className="w-11 h-11 rounded-full object-cover border-2 border-purple-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {l?.name || "Enrolled Learner"}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {l?.email || l?.walletAddress || "Verified Student"}
                              </p>
                            </div>
                          </div>

                          <StatusBadge status={item.escrowStatus} />
                        </div>

                        {/* Package & Quota Details */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">
                              Package Tier
                            </span>
                            <span className="font-bold text-purple-700">
                              {item.packageTier}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">
                              Live Session Quota
                            </span>
                            <span className="font-bold text-slate-900">
                              {quota.used} of {quota.total} Used
                            </span>
                          </div>
                        </div>

                        {/* Learning Roadmap Progress Meter */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Roadmap Progress</span>
                            <span className="text-purple-700">
                              {quota.used > 0 ? "In Progress" : "Enrolled"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                            <div
                              className="bg-purple-600 h-full transition-all duration-300"
                              style={{
                                width: `${quota.total > 0 ? Math.min(100, Math.round((quota.used / quota.total) * 100)) : 50}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Upcoming Meeting / Activity */}
                        {nextM && (
                          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-purple-600" />
                              <span className="font-semibold text-slate-800">
                                {new Date(nextM.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(nextM.startAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                              {nextM.platform}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLearnerIndex(idx);
                              setActiveTab("chat");
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            <span>Chat</span>
                          </button>

                          <Link
                            href={`/dashboard/classes/${item.enrollmentId}`}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <span>Open 1:1 Class</span>
                            <ExternalLink size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT WITH LEARNERS */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[550px]">
              {/* Left Column: Learners Selector */}
              <div className="border-r border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 px-2">
                  Enrolled Students ({learners.length})
                </h3>

                {learners.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 text-center">
                    No students enrolled yet to start a chat.
                  </p>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto max-h-[480px]">
                    {learners.map((item, idx) => {
                      const isSelected = selectedLearnerIndex === idx;
                      const l = item.learner;

                      return (
                        <button
                          key={item.enrollmentId}
                          type="button"
                          onClick={() => setSelectedLearnerIndex(idx)}
                          className={`w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                              : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/70"
                          }`}
                        >
                          <img
                            src={
                              l?.avatarUrl ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                            }
                            alt={l?.name || "Learner"}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate">
                              {l?.name || "Learner"}
                            </p>
                            <p
                              className={`text-[11px] truncate ${
                                isSelected ? "text-purple-200" : "text-slate-400"
                              }`}
                            >
                              {item.packageTier} • {item.escrowStatus}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Chat Feed & Composer */}
              <div className="lg:col-span-2 flex flex-col justify-between h-[550px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                  {activeLearner ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          activeLearner.learner?.avatarUrl ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                        }
                        alt="Active Learner"
                        className="w-9 h-9 rounded-full object-cover border border-purple-200"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">
                          {activeLearner.learner?.name || "Student"}
                        </h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className={`w-2 h-2 rounded-full ${isP2PConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                          <span>{isP2PConnected ? "P2P Connected" : "Connecting P2P..."}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-500">Select a student</span>
                  )}

                  {activeLearner && (
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isP2PConnected ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                        {isP2PConnected ? "WebRTC Active" : "WebRTC Direct"}
                      </span>
                      <Link
                        href={`/dashboard/classes/${activeLearner.enrollmentId}`}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                      >
                        <span>Classroom</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No messages yet</p>
                      <p className="text-[11px] mt-0.5">
                        Send a message to greet your student and discuss project goals via WebRTC DataChannel!
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
                            className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? "bg-purple-600 text-white rounded-br-xs"
                                : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-2xs"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.body}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString("en-US", {
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

                {/* Chat Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    disabled={!activeLearner || sendingMessage}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                  />
                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || sendingMessage || !activeLearner}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: MEETING REQUESTS SPECIFIC TO THIS GIG */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Live Session Requests for this Offering
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    View schedule requests submitted by enrolled learners and accept them to auto-generate meeting rooms.
                  </p>
                </div>
              </div>

              {meetings.length === 0 ? (
                <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
                  <Calendar size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-800 text-sm">No Meeting Requests Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When students request a live video consultation for this gig, their schedule proposals will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((m) => {
                    const participant = m.participants?.[0];
                    const student = participant?.enrollment?.learner;
                    const isPending = m.status === "PENDING";
                    const isAccepted = m.status === "ACCEPTED";

                    return (
                      <div
                        key={m.id}
                        className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {student?.name || "Student"}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-purple-700 font-bold text-xs">
                              {new Date(m.startAt).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at{" "}
                              {new Date(m.startAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Platform: <span className="font-semibold text-slate-700">{m.platform}</span>
                            {m.agenda && ` • Agenda: ${m.agenda}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              isAccepted
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : isPending
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {m.status}
                          </span>

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => handleAcceptMeeting(m.id)}
                              disabled={actionLoading}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                            >
                              <span>Accept Request</span>
                            </button>
                          )}

                          {m.joinUrl && (
                            <a
                              href={m.joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                            >
                              <span>Join Room</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TASKS & ASSIGNMENTS */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <ClipboardList className="text-purple-600" size={18} />
                    <span>Tasks & Coursework for this Offering</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign milestone projects, review submissions, and provide scores and evaluations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingAssignment(!isCreatingAssignment)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{isCreatingAssignment ? "Close Form" : "Create New Task"}</span>
                </button>
              </div>

              {/* Create Assignment Form */}
              {isCreatingAssignment && (
                <div className="p-6 bg-purple-50/50 border border-purple-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                      <Plus size={16} className="text-purple-600" />
                      <span>Assign Coursework to Students</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsCreatingAssignment(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Target Student *</label>
                        <select
                          value={newAssignment.targetLearnerId}
                          onChange={(e) =>
                            setNewAssignment({ ...newAssignment, targetLearnerId: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                        >
                          <option value="ALL">All Enrolled Students in this Gig</option>
                          {learners.map((item) => (
                            <option key={item.learner?.id} value={item.learner?.id}>
                              {item.learner?.name || item.learner?.email} ({item.packageTier})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Task Title *</label>
                        <input
                          type="text"
                          required
                          value={newAssignment.title}
                          onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                          placeholder="e.g. Smart Contract Milestone & Unit Tests"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Instructions & Guidelines *</label>
                      <textarea
                        required
                        rows={4}
                        value={newAssignment.instructions}
                        onChange={(e) =>
                          setNewAssignment({ ...newAssignment, instructions: e.target.value })
                        }
                        placeholder="Detail the deliverable format, acceptance criteria, or GitHub repo guidelines..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Minimum Passing Score</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newAssignment.passingScore}
                          onChange={(e) =>
                            setNewAssignment({ ...newAssignment, passingScore: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Due Date (Optional)</label>
                        <input
                          type="date"
                          value={newAssignment.dueAt}
                          onChange={(e) => setNewAssignment({ ...newAssignment, dueAt: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingAssignment(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading ? "Assigning..." : "Assign Task"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assignment List */}
              {assignments.length === 0 ? (
                <div className="p-16 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
                  <ClipboardList size={36} className="mx-auto text-slate-300" />
                  <h4 className="font-bold text-slate-800 text-sm">No Tasks Created Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click "Create New Task" above to assign coursework or practical projects to your students.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const def = assignment.definition || {};
                    const latestSub = assignment.submissions?.[0];
                    const student = assignment.learner;

                    return (
                      <div
                        key={assignment.id}
                        className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                Target: {def.passingScore || 70}/100
                              </span>
                              <span className="text-[11px] font-semibold text-slate-700">
                                Assigned to: {student?.name || student?.email || "Student"}
                              </span>
                              {assignment.dueAt && (
                                <span className="text-[11px] text-slate-500">
                                  • Due: {new Date(assignment.dueAt).toLocaleDateString("en-US")}
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-base text-slate-900">
                              {def.title || "Assignment"}
                            </h4>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                              assignment.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : assignment.status === "SUBMITTED"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : assignment.status === "CHANGES_REQUESTED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {assignment.status === "APPROVED"
                              ? "Passed & Approved"
                              : assignment.status === "SUBMITTED"
                              ? "Submitted (Needs Review)"
                              : assignment.status === "CHANGES_REQUESTED"
                              ? "Revision Requested"
                              : "Not Submitted Yet"}
                          </span>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <BookOpen size={13} className="text-purple-600" />
                            <span>Instructions:</span>
                          </h5>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {def.instructions}
                          </p>
                        </div>

                        {/* Submissions Section */}
                        {latestSub ? (
                          <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <FileCheck size={14} className="text-purple-600" />
                                <span>Student Submission (Version {latestSub.version})</span>
                              </h5>
                              <span className="text-[11px] text-slate-400">
                                {new Date(latestSub.createdAt).toLocaleString("en-US")}
                              </span>
                            </div>

                            {latestSub.fileRefs && (() => {
                              let fileInfo = null;
                              let linkUrl = latestSub.fileRefs;
                              try {
                                const parsed = JSON.parse(latestSub.fileRefs);
                                if (parsed && (parsed.fileUrl || parsed.externalUrl)) {
                                  fileInfo = parsed;
                                  linkUrl = parsed.externalUrl;
                                }
                              } catch (e) {}

                              return (
                                <div className="space-y-2">
                                  {fileInfo?.fileUrl && (
                                    <div className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-purple-200">
                                      <File className="text-purple-600 shrink-0" size={18} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">
                                          {fileInfo.fileName || "Uploaded File Deliverable"}
                                        </p>
                                        {fileInfo.fileSize && (
                                          <p className="text-[10px] text-slate-400">
                                            {(fileInfo.fileSize / 1024).toFixed(1)} KB • Student Upload
                                          </p>
                                        )}
                                      </div>
                                      <a
                                        href={fileInfo.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                                      >
                                        <Download size={13} />
                                        <span>Download</span>
                                      </a>
                                    </div>
                                  )}

                                  {linkUrl && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="font-bold text-slate-700">
                                        {linkUrl.includes("forms.gle") || linkUrl.includes("docs.google.com/forms")
                                          ? "Google Form:"
                                          : linkUrl.includes("github.com")
                                          ? "GitHub Repository:"
                                          : linkUrl.includes("docs.google.com")
                                          ? "Google Document:"
                                          : "Deliverable Link:"}
                                      </span>
                                      <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-700 hover:text-purple-900 font-semibold underline inline-flex items-center gap-1 truncate max-w-md"
                                      >
                                        <span>{linkUrl}</span>
                                        <ExternalLink size={12} />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {latestSub.content && (
                              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700 block mb-1">Student Notes:</span>
                                <p className="whitespace-pre-line">{latestSub.content}</p>
                              </div>
                            )}

                            {/* Evaluation Box */}
                            {latestSub.reviewedAt && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                                    <Award size={14} className="text-amber-500" />
                                    <span>Score: {latestSub.score} / 100</span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      latestSub.decision === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {latestSub.decision === "APPROVED" ? "PASSED" : "REVISION"}
                                  </span>
                                </div>
                                {latestSub.feedback && (
                                  <p className="text-xs text-slate-600 mt-1 italic">
                                    "{latestSub.feedback}"
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Grading Form Modal / Toggle */}
                            <div className="pt-2">
                              {gradingAssignmentId === assignment.id ? (
                                <form
                                  onSubmit={(e) =>
                                    handleGradeAssignment(e, assignment.id, assignment.enrollmentId)
                                  }
                                  className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3"
                                >
                                  <h5 className="text-xs font-bold text-slate-800">
                                    Submit Grade & Feedback
                                  </h5>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[11px] font-bold text-slate-700">
                                        Decision *
                                      </label>
                                      <select
                                        value={gradingForm.decision}
                                        onChange={(e) =>
                                          setGradingForm({ ...gradingForm, decision: e.target.value })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                                      >
                                        <option value="APPROVED">Approve & Pass (APPROVED)</option>
                                        <option value="CHANGES_REQUESTED">Request Changes (REVISION)</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1">
                                      <label className="text-[11px] font-bold text-slate-700">
                                        Score (0-100) *
                                      </label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        required
                                        value={gradingForm.score}
                                        onChange={(e) =>
                                          setGradingForm({ ...gradingForm, score: e.target.value })
                                        }
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">
                                      Feedback & Review Comments
                                    </label>
                                    <textarea
                                      rows={3}
                                      placeholder="Provide actionable feedback or instructions for improvement..."
                                      value={gradingForm.feedback}
                                      onChange={(e) =>
                                        setGradingForm({ ...gradingForm, feedback: e.target.value })
                                      }
                                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setGradingAssignmentId(null)}
                                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={actionLoading}
                                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                      <CheckCircle2 size={13} />
                                      <span>{actionLoading ? "Saving..." : "Save Evaluation"}</span>
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGradingAssignmentId(assignment.id);
                                    setGradingForm({
                                      decision: latestSub.decision || "APPROVED",
                                      score: latestSub.score || 100,
                                      feedback: latestSub.feedback || "",
                                    });
                                  }}
                                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Award size={13} />
                                  <span>{latestSub.reviewedAt ? "Edit Evaluation" : "Grade & Review Submission"}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 italic">
                            Waiting for the student to submit their deliverables.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CLASSROOM LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <ClassroomLeaderboard gigId={gigId} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
