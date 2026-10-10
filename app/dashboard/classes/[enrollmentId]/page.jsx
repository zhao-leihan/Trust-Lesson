"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Shield,
  Clock,
  Calendar,
  Lock,
  Unlock,
  Video,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Play,
  Download,
  ExternalLink,
  Users,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Plus,
} from "lucide-react";
import Footer from "@/src/components/Footer";

function StatusBadge({ status }) {
  const map = {
    FUNDED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Escrow Funded" },
    IN_SESSION: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "In Session" },
    COMPLETED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Completed (Read-Only)" },
    DISPUTED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Frozen (Disputed)" },
    CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Cancelled" },
    RESOLVED: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: "Resolved" },
    CREATED: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "Pending Escrow" },
  };

  const current = map[status] || map.FUNDED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="w-2 h-2 rounded-full bg-current" />
      <span>{current.label}</span>
    </span>
  );
}

export default function ClassroomDetailPage() {
  const params = useParams();
  const enrollmentId = params?.enrollmentId;
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("materials"); // "materials" | "meetings" | "tasks"
  const [expandedModule, setExpandedModule] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function fetchClassroom() {
      if (!enrollmentId || !user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("tl_jwt");
        const res = await fetch(`/api/enrollments/${enrollmentId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.status === 404) {
          throw new Error("Classroom not found or you do not have permission to access it.");
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load classroom details");
        if (isMounted) setData(json);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      fetchClassroom();
    }

    return () => {
      isMounted = false;
    };
  }, [enrollmentId, user, authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-28">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-xl border border-slate-200 flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-slate-900 font-bold text-base mb-1">Loading Classroom</h2>
          <p className="text-slate-500 text-xs">
            Verifying escrow status and loading curriculum materials...
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
                {error || "Enrollment could not be loaded."}
              </p>
            </div>
            <Link
              href="/dashboard/classes"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to My Classes</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { enrollment, access, quota, meetings = [] } = data;
  const gig = enrollment?.gig;
  const mentor = enrollment?.mentor;
  const modules = gig?.parsedModules || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link
              href="/dashboard/classes"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to My Classes</span>
            </Link>

            <div className="flex items-center gap-2">
              <StatusBadge status={access.status} />
              {enrollment.onchainSessionId && (
                <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Session #{enrollment.onchainSessionId}
                </span>
              )}
            </div>
          </div>

          {/* Hero Banner with Gig Info & Quota Meter */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gig & Mentor Summary */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold uppercase tracking-wider">
                    {gig?.category || "Mentorship"}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-xs font-bold text-purple-700">
                    {enrollment.packageName || "Standard Package"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {gig?.title || "Mentorship Classroom"}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {gig?.description}
                </p>
              </div>

              {/* Mentor Row */}
              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <img
                  src={mentor?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                  alt={mentor?.name || "Mentor"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {mentor?.name || "Verified Mentor"}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {mentor?.email || mentor?.walletAddress || "Verified Expert"}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Session Quota Meter */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Live Session Quota
                  </span>
                  <span className="text-xs font-bold text-purple-700">
                    {quota.remaining} Available
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {quota.used} of {quota.total} Used
                </h3>
                {quota.reserved > 0 && (
                  <p className="text-xs text-amber-700 font-medium mt-1">
                    {quota.reserved} session(s) currently reserved in pending request
                  </p>
                )}
              </div>

              {/* Meter Visual */}
              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200/60">
                  <div
                    className="bg-purple-600 h-full transition-all duration-300"
                    style={{
                      width: `${quota.total > 0 ? (quota.used / quota.total) * 100 : 0}%`,
                    }}
                    title={`${quota.used} used`}
                  />
                  {quota.reserved > 0 && (
                    <div
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{
                        width: `${quota.total > 0 ? (quota.reserved / quota.total) * 100 : 0}%`,
                      }}
                      title={`${quota.reserved} reserved`}
                    />
                  )}
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Duration: {enrollment.sessionDurationMin || 60}m per session</span>
                  <span>{quota.remaining} of {quota.total} remaining</span>
                </div>
              </div>

              {/* Action Button */}
              {quota.canBook ? (
                <Link
                  href={`/dashboard/classes/${enrollment.id}/schedule`}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-500/20"
                >
                  <Calendar size={14} />
                  <span>Request Live Session</span>
                </Link>
              ) : (
                <div className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-500 font-semibold text-xs text-center border border-slate-200">
                  {quota.remaining === 0
                    ? "Quota Exhausted: 0 sessions remaining"
                    : !access.canRequestMeeting
                    ? `Booking disabled for ${access.status} status`
                    : "Scheduling temporarily unavailable"}
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab("materials")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "materials"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText size={16} />
              <span>Curriculum & Materials ({modules.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("meetings")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "meetings"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Video size={16} />
              <span>Live Meetings ({meetings.length})</span>
            </button>
          </div>

          {/* TAB 1: CURRICULUM & MATERIALS */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              {/* Materials Gating Banner */}
              {!access.canViewMaterials && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4 text-amber-900">
                  <Lock size={24} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm">Materials Locked</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Course videos and document resources are protected by smart contract escrow. Materials unlock automatically once your transaction reaches the FUNDED or IN_SESSION escrow status. Current status: <span className="font-bold">{access.status}</span>.
                    </p>
                  </div>
                </div>
              )}

              {access.isReadOnly && access.canViewMaterials && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-purple-900 text-xs">
                  <CheckCircle2 size={18} className="text-purple-600 shrink-0" />
                  <span>
                    Mentorship completed. All video lessons and resources remain accessible to you indefinitely in read-only mode.
                  </span>
                </div>
              )}

              {/* Modules List */}
              {modules.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-2">
                  <FileText size={32} className="mx-auto text-slate-400" />
                  <p className="font-bold text-slate-800">No Modules Uploaded</p>
                  <p className="text-xs text-slate-500">
                    The mentor has not attached asynchronous video modules to this offering. Live sessions can be scheduled directly in the Live Meetings tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, idx) => {
                    const isExpanded = expandedModule === idx;
                    const isLocked = !access.canViewMaterials || mod.isLocked;

                    return (
                      <div
                        key={mod.id || idx}
                        className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
                      >
                        {/* Module Header */}
                        <button
                          onClick={() => setExpandedModule(isExpanded ? -1 : idx)}
                          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                {mod.title || `Module ${idx + 1}`}
                              </h4>
                              {mod.description && (
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                  {mod.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
                                <Lock size={12} />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
                                <Unlock size={12} />
                                <span>Unlocked</span>
                              </span>
                            )}
                            {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                          </div>
                        </button>

                        {/* Module Content */}
                        {isExpanded && (
                          <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5">
                            {isLocked ? (
                              <div className="p-8 bg-slate-50 rounded-2xl text-center border border-slate-200/80 space-y-2">
                                <Lock size={28} className="mx-auto text-slate-400" />
                                <p className="font-bold text-slate-800 text-sm">Content Gated by Escrow</p>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                  This module contains proprietary mentor videos and resources. Access requires an active funded escrow session.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {mod.description && (
                                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    {mod.description}
                                  </p>
                                )}

                                {/* Video Player / Link */}
                                {mod.videoUrl && (
                                  <div className="p-4 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center shrink-0">
                                        <Play size={18} />
                                      </div>
                                      <div>
                                        <p className="font-bold text-xs sm:text-sm">Video Lesson</p>
                                        <p className="text-[11px] text-slate-400">Stream encrypted video material</p>
                                      </div>
                                    </div>
                                    <a
                                      href={mod.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors shrink-0"
                                    >
                                      <span>Watch Lesson</span>
                                      <ExternalLink size={13} />
                                    </a>
                                  </div>
                                )}

                                {/* Resources & Files */}
                                {mod.resources && mod.resources.length > 0 && (
                                  <div className="space-y-2 pt-2">
                                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                      Attached Documents & Resources
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      {mod.resources.map((res, rIdx) => (
                                        <div
                                          key={res.id || rIdx}
                                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2"
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <FileText size={16} className="text-purple-600 shrink-0" />
                                            <span className="text-xs font-semibold text-slate-800 truncate">
                                              {res.name || `Document ${rIdx + 1}`}
                                            </span>
                                          </div>
                                          {res.url && (
                                            <a
                                              href={res.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-purple-700 hover:text-purple-900 text-xs font-bold shrink-0"
                                            >
                                              Download
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIVE SESSIONS & MEETINGS */}
          {activeTab === "meetings" && (
            <div className="space-y-6">
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    1:1 Live Video Meetings
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Schedule live collaborative sessions with your mentor using Google Meet or Zoom.
                  </p>
                </div>

                {quota.canBook ? (
                  <Link
                    href={`/dashboard/classes/${enrollment.id}/schedule`}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-md shadow-purple-500/20 shrink-0"
                  >
                    <Plus size={14} />
                    <span>Schedule New Meeting</span>
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
                    No Quota Available
                  </span>
                )}
              </div>

              {/* Meetings List */}
              {meetings.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
                  <Calendar size={36} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-800 text-sm">No Meetings Scheduled Yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You have not scheduled any live sessions yet. Click "Schedule New Meeting" to pick a date and time slot from the mentor's available calendar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((meeting) => {
                    const start = new Date(meeting.startAt);
                    const end = new Date(meeting.endAt);
                    const now = new Date();
                    const isUpcoming = end > now;

                    return (
                      <div
                        key={meeting.id}
                        className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">
                              {start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-purple-700">
                              {start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - {end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Platform: <span className="font-semibold text-slate-700">{meeting.platform || "Google Meet"}</span>
                            {meeting.agenda && ` • Agenda: ${meeting.agenda}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              meeting.status === "ACCEPTED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : meeting.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {meeting.status}
                          </span>

                          {meeting.joinUrl && access.canSeeJoinLink && (
                            <a
                              href={meeting.joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
