"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, apiFetch } from "@/src/context/AuthContext";
import { useWebRTCChat } from "@/src/hooks/useWebRTCChat";
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
  ClipboardList,
  CheckSquare,
  Square,
  Send,
  Award,
  BookOpen,
  X,
  FileCheck,
  MessageSquare,
  Paperclip,
  Upload,
  File,
  Trophy,
  Share2,
} from "lucide-react";
import Footer from "@/src/components/Footer";
import ClassroomLeaderboard from "@/src/components/ClassroomLeaderboard";
import TransactionStatusTimeline from "@/src/components/TransactionStatusTimeline";
import CourseCompletionFeedbackModal from "@/src/components/CourseCompletionFeedbackModal";

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

  // Roadmap completion persisted locally
  const [completedModules, setCompletedModules] = useState({});

  // Assignment states
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    instructions: "",
    dueAt: "",
    passingScore: 70,
  });
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({ content: "", fileRefs: "" });
  const [gradingAssignmentId, setGradingAssignmentId] = useState(null);
  const [gradingForm, setGradingForm] = useState({ decision: "APPROVED", score: 100, feedback: "" });
  const [actionLoading, setActionLoading] = useState(false);

  // File upload state for tasks
  const [uploadedTaskFile, setUploadedTaskFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Classroom Chat Input & State
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Escrow Completion and Certificate States
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [completingEscrow, setCompletingEscrow] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Persistent Roadmap Module Completion (localStorage)
  useEffect(() => {
    if (!enrollmentId || typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(`tl_completed_modules_${enrollmentId}`);
      if (saved) {
        setCompletedModules(JSON.parse(saved));
      }
    } catch (e) {}
  }, [enrollmentId]);

  const toggleModuleCompletion = (idx) => {
    setCompletedModules((prev) => {
      const updated = { ...prev, [idx]: !prev[idx] };
      if (typeof window !== "undefined" && enrollmentId) {
        try {
          localStorage.setItem(`tl_completed_modules_${enrollmentId}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  };

  // Instant Cache Restoration (0ms initial render)
  useEffect(() => {
    if (!enrollmentId || typeof window === "undefined") return;
    try {
      const cached = sessionStorage.getItem(`tl_classroom_cache_${enrollmentId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.enrollment) {
          setData(parsed);
          setLoading(false);
        }
      }
    } catch (e) {}
  }, [enrollmentId]);

  // Reload Classroom Data
  const reloadClassroom = async () => {
    if (!enrollmentId) return;
    try {
      const json = await apiFetch(`/enrollments/${enrollmentId}`);
      setData(json);
      try {
        sessionStorage.setItem(`tl_classroom_cache_${enrollmentId}`, JSON.stringify(json));
      } catch (e) {}
    } catch (e) {}
  };

  // Immediate Fetch on Mount with Stale-While-Revalidate
  useEffect(() => {
    let isMounted = true;
    const hasToken =
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token"));

    async function fetchClassroom() {
      if (!enrollmentId) return;
      try {
        const json = await apiFetch(`/enrollments/${enrollmentId}`);
        if (isMounted) {
          setData(json);
          setLoading(false);
          try {
            sessionStorage.setItem(`tl_classroom_cache_${enrollmentId}`, JSON.stringify(json));
          } catch (e) {}
        }
      } catch (err) {
        if (isMounted && !data) {
          setError(err.message || "Failed to load classroom details");
          setLoading(false);
        }
      }
    }

    if (hasToken || !authLoading) {
      fetchClassroom();
    }

    return () => {
      isMounted = false;
    };
  }, [enrollmentId, user, authLoading]);

  const fetchCertificate = async () => {
    if (!enrollmentId) return;
    try {
      const res = await apiFetch(`/certificates/${enrollmentId}`);
      if (res?.certificate) {
        setCertificateData(res.certificate);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (data?.access?.status === "COMPLETED" || data?.enrollment?.status === "COMPLETED") {
      fetchCertificate();
    }
  }, [data, enrollmentId]);

  // Derive whether current user is mentor
  const isMentor =
    user &&
    data?.enrollment &&
    (user.id === data.enrollment.mentorId ||
      user.id === data.enrollment.mentor?.id ||
      (user.walletAddress &&
        data.enrollment.mentor?.walletAddress &&
        user.walletAddress.toLowerCase() === data.enrollment.mentor.walletAddress.toLowerCase()));

  // WebRTC P2P Direct Chat (Zero DB overhead)
  const peerUser = isMentor
    ? { id: data?.enrollment?.learnerId, name: data?.enrollment?.learner?.name }
    : { id: data?.enrollment?.mentorId || data?.enrollment?.mentor?.id, name: data?.enrollment?.mentor?.name };

  const {
    messages: chatMessages,
    sendMessage: sendP2PMessage,
    isP2PConnected,
    connectionState,
  } = useWebRTCChat({
    roomId: enrollmentId,
    currentUser: user,
    peerUser,
  });

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;
    const text = chatInput.trim();
    setChatInput("");
    setSendingChat(true);
    try {
      await sendP2PMessage(text);
    } catch (err) {
      console.warn("P2P send error:", err);
    } finally {
      setSendingChat(false);
    }
  };

  // Upload file for assignment deliverable
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("tl_jwt") || localStorage.getItem("tl_token");
      const res = await fetch("/api/tasks/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      setUploadedTaskFile({
        url: result.url,
        fileName: result.fileName,
        fileSize: result.fileSize,
      });
    } catch (err) {
      alert("File upload error: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  // End Mentorship & Release Escrow
  const handleCompleteAndRelease = async () => {
    setCompletingEscrow(true);
    try {
      let clientTxHash = null;
      if (typeof window !== "undefined" && window.ethereum && enrollment?.onchainSessionId !== undefined && enrollment?.onchainSessionId !== null) {
        try {
          const { ethers } = await import("ethers");
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const routerAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT;
          if (routerAddress) {
            const routerAbi = [
              "function releaseEscrow(uint256 sessionId) external",
              "function confirmMilestone(uint256 sessionId, uint256 milestoneIndex) external",
              "function getSession(uint256 sessionId) external view returns (address learner, address mentor, uint256 totalAmount, uint256 platformFeeAmount, uint8 status, uint256 createdAt, uint256 milestoneCount)",
            ];
            const routerContract = new ethers.Contract(routerAddress, routerAbi, signer);
            const sess = await routerContract.getSession(enrollment.onchainSessionId).catch(() => null);
            if (sess && Number(sess[4]) < 3) {
              const tx = await routerContract.releaseEscrow(enrollment.onchainSessionId, { gasLimit: 350000 });
              const receipt = await tx.wait(1);
              clientTxHash = receipt.hash;
            }
          }
        } catch (onChainErr) {
          console.warn("[On-Chain Client Release Notice]:", onChainErr.message);
        }
      }

      const res = await apiFetch(`/enrollments/${enrollmentId}/complete-and-release`, {
        method: "POST",
        body: JSON.stringify({ txHash: clientTxHash }),
      });
      if (res?.certificate) {
        setCertificateData(res.certificate);
        setShowCertModal(true);
      }
      setShowReleaseModal(false);
      setTimeout(() => setShowFeedbackModal(true), 800);
      await reloadClassroom();
    } catch (err) {
      alert("Failed to release escrow: " + err.message);
    } finally {
      setCompletingEscrow(false);
    }
  };

  // Learner submits work (with file or link or both)
  const handleSubmitAssignment = async (e, assignmentId) => {
    e.preventDefault();
    if (!uploadedTaskFile && !submissionForm.fileRefs.trim() && !submissionForm.content.trim()) {
      alert("Please provide a deliverable file, external link, or submission notes");
      return;
    }
    setActionLoading(true);

    const deliverablePayload = uploadedTaskFile
      ? JSON.stringify({
          fileUrl: uploadedTaskFile.url,
          fileName: uploadedTaskFile.fileName,
          fileSize: uploadedTaskFile.fileSize,
          externalUrl: submissionForm.fileRefs.trim() || null,
        })
      : submissionForm.fileRefs.trim();

    try {
      await apiFetch(`/enrollments/${enrollmentId}/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: JSON.stringify({
          content: submissionForm.content,
          fileRefs: deliverablePayload,
        }),
      });
      setSubmittingAssignmentId(null);
      setSubmissionForm({ content: "", fileRefs: "" });
      setUploadedTaskFile(null);
      await reloadClassroom();
    } catch (err) {
      alert(err.message || "Failed to submit assignment");
    } finally {
      setActionLoading(false);
    }
  };

  // Mentor grades submission
  const handleGradeAssignment = async (e, assignmentId) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await apiFetch(`/enrollments/${enrollmentId}/assignments/${assignmentId}/grade`, {
        method: "POST",
        body: JSON.stringify(gradingForm),
      });
      setGradingAssignmentId(null);
      setGradingForm({ decision: "APPROVED", score: 100, feedback: "" });
      await reloadClassroom();
    } catch (err) {
      alert(err.message || "Failed to grade assignment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
        <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
          <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
              <div className="h-6 w-24 bg-slate-200 rounded-full" />
            </div>

            {/* Header Hero Skeleton */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="h-8 w-3/4 bg-slate-200 rounded-xl" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
                  <div className="flex gap-4 pt-2">
                    <div className="h-10 w-44 bg-slate-100 rounded-2xl" />
                    <div className="h-10 w-36 bg-slate-100 rounded-2xl" />
                  </div>
                </div>
                <div className="w-full md:w-64 h-28 bg-purple-50/50 rounded-2xl border border-purple-100/60 p-4" />
              </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-3 border-b border-slate-200 pb-2">
              <div className="h-10 w-28 bg-purple-100 rounded-2xl" />
              <div className="h-10 w-32 bg-slate-100 rounded-2xl" />
              <div className="h-10 w-28 bg-slate-100 rounded-2xl" />
              <div className="h-10 w-24 bg-slate-100 rounded-2xl" />
            </div>

            {/* Module Cards Skeleton */}
            <div className="space-y-4">
              <div className="h-20 bg-white rounded-2xl border border-slate-200 shadow-2xs" />
              <div className="h-20 bg-white rounded-2xl border border-slate-200 shadow-2xs" />
              <div className="h-20 bg-white rounded-2xl border border-slate-200 shadow-2xs" />
            </div>
          </div>
        </main>
        <Footer />
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

  const { enrollment, access, quota, meetings = [], assignments = [] } = data;
  const gig = enrollment?.gig;
  const mentor = enrollment?.mentor;
  const modules = gig?.parsedModules || [];
  const isCompleted = enrollment?.escrowStatus === "COMPLETED" || access?.status === "COMPLETED";
  const effectiveStatus = isCompleted ? "COMPLETED" : (access?.status || enrollment?.escrowStatus || "FUNDED");

  // Calculate Roadmap Progress
  const completedCount = modules.filter((_, idx) => completedModules[idx]).length;
  const totalCount = modules.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={effectiveStatus} />
              {enrollment.onchainSessionId && (
                <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Session #{enrollment.onchainSessionId}
                </span>
              )}
              {!isCompleted ? (
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 size={13} />
                  <span>End Mentorship & Release Escrow</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      fetchCertificate();
                      setShowCertModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                  >
                    <Award size={13} />
                    <span>View On-Chain Certificate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(true)}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
                  >
                    <Share2 size={13} />
                    <span>Feedback & Share</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Visual On-Chain Transaction Progress Tracker */}
          <TransactionStatusTimeline
            status={effectiveStatus}
            txHashCreate={enrollment.txHash}
            txHashRelease={certificateData?.txHash || enrollment.txHashRelease}
            onchainSessionId={enrollment.onchainSessionId}
            amount={enrollment.packagePrice || 50}
          />

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
                  {isMentor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      You are Mentor
                    </span>
                  )}
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
              {isCompleted ? (
                <button
                  type="button"
                  onClick={() => {
                    fetchCertificate();
                    setShowCertModal(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  <Award size={14} />
                  <span>View On-Chain Certificate</span>
                </button>
              ) : quota.canBook ? (
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
                    ? `Booking disabled for ${effectiveStatus} status`
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
              <Layers size={16} />
              <span>Curriculum Roadmap ({modules.length})</span>
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
            <button
              onClick={() => setActiveTab("tasks")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "tasks"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ClipboardList size={16} />
              <span>Assignments & Tasks ({assignments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "chat"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <MessageSquare size={16} />
              <span>Chat with Mentor</span>
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "leaderboard"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Trophy size={16} />
              <span>Leaderboard</span>
            </button>
          </div>

          {/* TAB 1: CURRICULUM ROADMAP & MATERIALS */}
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

              {(isCompleted || (access.isReadOnly && access.canViewMaterials)) && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-purple-600 shrink-0" />
                    <span>
                      Mentorship completed. All course modules, video lessons, and learning materials remain permanently unlocked for review.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetchCertificate();
                      setShowCertModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    <Award size={13} />
                    <span>View Certificate</span>
                  </button>
                </div>
              )}

              {/* Roadmap Header & Progress Card */}
              {modules.length > 0 && (
                <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-600" />
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Learning Roadmap & Progress
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Complete modules by watching lessons or reading materials, then check them off as completed.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">
                          {completedCount} of {totalCount} Completed
                        </span>
                        <span className="text-purple-700">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    {progressPercent === 100 && (
                      <span className="p-2 rounded-full bg-emerald-100 text-emerald-700" title="All modules completed">
                        <Award size={20} />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Modules Roadmap Stepper */}
              {modules.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-2">
                  <FileText size={32} className="mx-auto text-slate-400" />
                  <p className="font-bold text-slate-800">No Modules Uploaded</p>
                  <p className="text-xs text-slate-500">
                    The mentor has not attached asynchronous video modules to this offering. Live sessions can be scheduled directly in the Live Meetings tab.
                  </p>
                </div>
              ) : (
                <div className="relative space-y-4">
                  {modules.map((mod, idx) => {
                    const isExpanded = expandedModule === idx;
                    const isLocked = !isCompleted && (!access.canViewMaterials || mod.isLocked);
                    const isDone = Boolean(completedModules[idx]);

                    return (
                      <div
                        key={mod.id || idx}
                        className={`relative pl-12 sm:pl-14 ${
                          idx !== modules.length - 1 ? "pb-6" : ""
                        }`}
                      >
                        {/* Connecting Roadmap Line */}
                        {idx !== modules.length - 1 && (
                          <div
                            className={`absolute left-[20px] sm:left-[23px] top-11 bottom-0 w-0.5 ${
                              isDone ? "bg-emerald-300" : "bg-slate-200"
                            }`}
                          />
                        )}

                        {/* Roadmap Node Circle */}
                        <button
                          type="button"
                          onClick={() => !isLocked && toggleModuleCompletion(idx)}
                          disabled={isLocked}
                          title={isDone ? "Click to mark as incomplete" : "Click to mark as completed"}
                          className={`absolute left-0 top-3 w-10 sm:w-11 h-10 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs sm:text-sm transition-all border-2 z-10 ${
                            isDone
                              ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                              : isLocked
                              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                              : "bg-white text-purple-700 border-purple-300 hover:border-purple-600 shadow-sm"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={20} />
                          ) : isLocked ? (
                            <Lock size={16} />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </button>

                        {/* Card Container */}
                        <div
                          className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                            isDone
                              ? "border-emerald-200/80 shadow-xs"
                              : "border-slate-200/80 shadow-xs"
                          }`}
                        >
                          {/* Module Header */}
                          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => setExpandedModule(isExpanded ? -1 : idx)}
                              className="text-left flex-1 min-w-0 flex items-center justify-between gap-4 cursor-pointer"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold tracking-wider uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                    Step {idx + 1}
                                  </span>
                                  {isDone && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      <CheckCircle2 size={11} />
                                      <span>Completed</span>
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                                      <BookOpen size={11} />
                                      <span>Review Material</span>
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                  {mod.title || `Module ${idx + 1}`}
                                </h4>
                                {mod.description && (
                                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                    {mod.description}
                                  </p>
                                )}
                              </div>
                            </button>

                            <div className="flex items-center gap-2.5 shrink-0">
                              {/* Completion Toggle Button */}
                              {!isLocked && (
                                <button
                                  type="button"
                                  onClick={() => toggleModuleCompletion(idx)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border ${
                                    isDone
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                                  }`}
                                >
                                  {isDone ? (
                                    <>
                                      <CheckSquare size={14} className="text-emerald-600" />
                                      <span>Completed</span>
                                    </>
                                  ) : (
                                    <>
                                      <Square size={14} />
                                      <span>Mark as Complete</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {isLocked ? (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
                                  <Lock size={12} />
                                  <span>Locked</span>
                                </span>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => setExpandedModule(isExpanded ? -1 : idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Module Content */}
                          {isExpanded && (
                            <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/40">
                              {isLocked ? (
                                <div className="p-8 bg-slate-50 rounded-2xl text-center border border-slate-200/80 space-y-2">
                                  <Lock size={28} className="mx-auto text-slate-400" />
                                  <p className="font-bold text-slate-800 text-sm">Content Gated by Escrow</p>
                                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    This module is protected by smart contract escrow. Access unlocks automatically once your transaction reaches FUNDED or IN_SESSION status.
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {mod.description && (
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">
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
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={mod.videoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={() => {
                                            if (!completedModules[idx]) toggleModuleCompletion(idx);
                                          }}
                                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors shrink-0"
                                        >
                                          <span>Watch Video</span>
                                          <ExternalLink size={13} />
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {/* Resources & Files */}
                                  {mod.resources && mod.resources.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Reading Materials & Documents
                                      </h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {mod.resources.map((res, rIdx) => (
                                          <div
                                            key={res.id || rIdx}
                                            className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <FileText size={16} className="text-purple-600 shrink-0" />
                                              <span className="text-xs font-semibold text-slate-800 truncate">
                                                {res.name || `Document Material ${rIdx + 1}`}
                                              </span>
                                            </div>
                                            {res.url && (
                                              <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => {
                                                  if (!completedModules[idx]) toggleModuleCompletion(idx);
                                                }}
                                                className="text-purple-700 hover:text-purple-900 text-xs font-bold shrink-0"
                                              >
                                                View Material
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

          {/* TAB 3: ASSIGNMENTS & TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <ClipboardList className="text-purple-600" size={18} />
                    <span>Practical Tasks & Assignments</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isMentor
                      ? "Assign practical tasks or projects for review and grading before completing the mentorship."
                      : "Complete assigned tasks from your mentor and submit your repository or deliverable links."}
                  </p>
                </div>

                {isMentor && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingAssignment(!isCreatingAssignment)}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-md shadow-purple-500/20 shrink-0 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{isCreatingAssignment ? "Close Form" : "Create New Task"}</span>
                  </button>
                )}
              </div>

              {/* Mentor: Create Assignment Form */}
              {isMentor && isCreatingAssignment && (
                <div className="p-6 bg-purple-50/50 border border-purple-200 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                      <Plus size={16} className="text-purple-600" />
                      <span>Create New Task for Learner</span>
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
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Task Title *</label>
                      <input
                        type="text"
                        required
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                        placeholder="e.g. Smart Contract Implementation & Unit Tests"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Instructions & Guidelines *</label>
                      <textarea
                        required
                        rows={4}
                        value={newAssignment.instructions}
                        onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                        placeholder="Detail the task requirements, deliverables, repository guidelines, or acceptance criteria..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Minimum Passing Score (0-100)</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={newAssignment.passingScore}
                          onChange={(e) => setNewAssignment({ ...newAssignment, passingScore: e.target.value })}
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
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-50"
                      >
                        {actionLoading ? "Saving..." : "Assign Task"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Assignment List */}
              {assignments.length === 0 ? (
                <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
                  <ClipboardList size={36} className="mx-auto text-slate-300" />
                  <p className="font-bold text-slate-800 text-sm">No Tasks Assigned</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {isMentor
                      ? "Click 'Create New Task' above to assign a milestone task or final project to the learner."
                      : "The mentor has not assigned any tasks yet. You can focus on learning materials or schedule a live meeting."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => {
                    const def = assignment.definition || {};
                    const latestSubmission = assignment.submissions?.[0];
                    const isSubmitted = assignment.status === "SUBMITTED" || assignment.status === "APPROVED";
                    const isApproved = assignment.status === "APPROVED";
                    const isRevision = assignment.status === "CHANGES_REQUESTED";

                    const statusPill = {
                      ASSIGNED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Not Submitted" },
                      SUBMITTED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Under Review" },
                      APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Passed & Approved" },
                      CHANGES_REQUESTED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Revision Requested" },
                    }[assignment.status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: assignment.status };

                    return (
                      <div
                        key={assignment.id}
                        className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs"
                      >
                        {/* Assignment Title & Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                Target: {def.passingScore || 70}/100
                              </span>
                              {assignment.dueAt && (
                                <span className="text-[11px] font-medium text-slate-500">
                                  Due: {new Date(assignment.dueAt).toLocaleDateString("en-US")}
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-base text-slate-900">
                              {def.title || "Independent Assignment"}
                            </h4>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 self-start sm:self-auto ${statusPill.bg} ${statusPill.text} ${statusPill.border}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{statusPill.label}</span>
                          </span>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                          <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <BookOpen size={13} className="text-purple-600" />
                            <span>Task Instructions:</span>
                          </h5>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {def.instructions}
                          </p>
                        </div>

                        {/* Submissions & Review Block */}
                        {latestSubmission && (
                          <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                                <FileCheck size={14} className="text-purple-600" />
                                <span>Latest Submission (Version {latestSubmission.version})</span>
                              </h5>
                              <span className="text-[11px] text-slate-400">
                                {new Date(latestSubmission.createdAt).toLocaleString("en-US")}
                              </span>
                            </div>

                            {latestSubmission.fileRefs && (() => {
                              let fileInfo = null;
                              let linkUrl = latestSubmission.fileRefs;
                              try {
                                const parsed = JSON.parse(latestSubmission.fileRefs);
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
                                            {(fileInfo.fileSize / 1024).toFixed(1)} KB • Document
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

                            {latestSubmission.content && (
                              <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700 block mb-1">Submission Notes:</span>
                                <p className="whitespace-pre-line">{latestSubmission.content}</p>
                              </div>
                            )}

                            {/* Review result if graded */}
                            {latestSubmission.reviewedAt && (
                              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                                    <Award size={14} className="text-amber-500" />
                                    <span>Score: {latestSubmission.score} / 100</span>
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      latestSubmission.decision === "APPROVED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {latestSubmission.decision === "APPROVED" ? "PASSED" : "REVISION"}
                                  </span>
                                </div>
                                {latestSubmission.feedback && (
                                  <p className="text-xs text-slate-600 mt-1 italic">
                                    "{latestSubmission.feedback}"
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions for Learner: Submit Assignment */}
                        {!isMentor && !isApproved && (
                          <div className="pt-2">
                            {submittingAssignmentId === assignment.id ? (
                              <form
                                onSubmit={(e) => handleSubmitAssignment(e, assignment.id)}
                                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4"
                              >
                                <h5 className="text-xs font-bold text-slate-800">
                                  {isRevision ? "Submit Revision" : "Submit Assignment"}
                                </h5>

                                {/* 1. File Upload Option */}
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                                    <span>Upload Deliverable File (PDF, TXT, DOCX, ZIP, etc.)</span>
                                    {uploadingFile && (
                                      <span className="text-purple-600 font-semibold text-[10px] animate-pulse">
                                        Uploading file...
                                      </span>
                                    )}
                                  </label>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <label className="px-3.5 py-2 rounded-xl border border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50/50 cursor-pointer text-xs font-semibold text-purple-700 inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                                      <Upload size={13} />
                                      <span>{uploadedTaskFile ? "Replace File" : "Choose File"}</span>
                                      <input
                                        type="file"
                                        accept=".pdf,.txt,.doc,.docx,.zip,.png,.jpg,.jpeg,.json"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                      />
                                    </label>
                                    {uploadedTaskFile && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
                                        <Check size={12} />
                                        <span className="truncate max-w-[220px]">{uploadedTaskFile.fileName}</span>
                                        <button
                                          type="button"
                                          onClick={() => setUploadedTaskFile(null)}
                                          className="text-emerald-600 hover:text-rose-600 ml-1"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 2. External Link Option */}
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-700">
                                    Or External Link (Google Form, GitHub Repo, Google Docs, Figma)
                                  </label>
                                  <input
                                    type="url"
                                    placeholder="https://forms.gle/... or https://github.com/..."
                                    value={submissionForm.fileRefs}
                                    onChange={(e) =>
                                      setSubmissionForm({ ...submissionForm, fileRefs: e.target.value })
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                                  />
                                </div>

                                {/* 3. Reflection / Notes */}
                                <div className="space-y-1">
                                  <label className="text-[11px] font-bold text-slate-700">
                                    Notes / Summary (Optional)
                                  </label>
                                  <textarea
                                    rows={2}
                                    placeholder="Briefly explain your solution or deliverables for the mentor to review..."
                                    value={submissionForm.content}
                                    onChange={(e) =>
                                      setSubmissionForm({ ...submissionForm, content: e.target.value })
                                    }
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-purple-600"
                                  />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setSubmittingAssignmentId(null)}
                                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                  >
                                    <Send size={12} />
                                    <span>{actionLoading ? "Submitting..." : "Submit Work"}</span>
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSubmittingAssignmentId(assignment.id);
                                  setSubmissionForm({ content: "", fileRefs: "" });
                                }}
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-purple-500/20"
                              >
                                <Send size={12} />
                                <span>{isRevision ? "Submit Revision" : isSubmitted ? "Update Submission" : "Submit Assignment"}</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Actions for Mentor: Grade Submission */}
                        {isMentor && latestSubmission && (
                          <div className="pt-2 border-t border-slate-100">
                            {gradingAssignmentId === assignment.id ? (
                              <form
                                onSubmit={(e) => handleGradeAssignment(e, assignment.id)}
                                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                              >
                                <h5 className="text-xs font-bold text-slate-800">
                                  Grade & Review Learner Submission
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-700">
                                      Review Decision *
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
                                    placeholder="Provide constructive feedback or revision notes for the learner..."
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
                                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
                                    decision: latestSubmission.decision || "APPROVED",
                                    score: latestSubmission.score || 100,
                                    feedback: latestSubmission.feedback || "",
                                  });
                                }}
                                className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold inline-flex items-center gap-1.5"
                              >
                                <Award size={13} />
                                <span>{latestSubmission.reviewedAt ? "Edit Evaluation" : "Grade & Review Task"}</span>
                              </button>
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

          {/* TAB 4: CHAT WITH MENTOR */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[640px]">
              {/* Chat Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={mentor?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={mentor?.name || "Mentor"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {isMentor ? (enrollment.learner?.name || "Student") : (mentor?.name || "Verified Mentor")}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isP2PConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                      <span>{isP2PConnected ? "P2P Connected" : "Connecting P2P..."}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${isP2PConnected ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"}`}>
                    {isP2PConnected ? "WebRTC Active" : "WebRTC Direct"}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                    <MessageSquare size={36} className="text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No Messages Yet</p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Send your questions, project updates, or schedule coordination notes directly to your mentor.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                            isMe
                              ? "bg-purple-600 text-white rounded-br-xs"
                              : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.body}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Composer */}
              <form
                onSubmit={handleSendChatMessage}
                className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={sendingChat}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-purple-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || sendingChat}
                  className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send size={13} />
                  <span>{sendingChat ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CLASSROOM LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <ClassroomLeaderboard gigId={gig?.id || enrollment?.gigId} />
          )}
        </div>

        {/* Release Escrow Confirmation Modal */}
        {showReleaseModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={32} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Complete Mentorship & Release Escrow?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This will release the escrow funds ({enrollment.packagePrice || 50} USDC) to your mentor ({mentor?.name}) and issue your official on-chain completion certificate on Arbitrum Sepolia.
                </p>
              </div>

              {/* Pass / Fail Guard Notice */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wide text-amber-800">
                  <Shield size={13} />
                  <span>Academic Evaluation Guard</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Passing criteria requires completion of all deliverables with an average score of at least 70%. If any required task is missing or average score is under 70%, the issuance will fail.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="font-semibold">Course Gig:</span>
                  <span className="font-bold text-slate-900">{gig?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Mentor:</span>
                  <span className="font-bold text-slate-900">{mentor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Network:</span>
                  <span className="font-bold text-purple-700">Arbitrum Sepolia</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Gas Fee:</span>
                  <span className="font-bold text-emerald-700">Sponsored by Platform ($0.00)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  disabled={completingEscrow}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteAndRelease}
                  disabled={completingEscrow}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>{completingEscrow ? "Releasing Escrow..." : "Confirm & Release"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertModal && certificateData && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-purple-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Official Certificate of Completion</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Arbitrum Sepolia Verifiable Credential</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Certificate Visual Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white space-y-4 border border-purple-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl" />
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                  <span>TRUST LESSON VERIFIABLE CREDENTIAL</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/30">Arbitrum Nitro</span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Awarded To</p>
                  <h3 className="text-xl font-black text-white">{certificateData.learnerName || user?.name || "Student"}</h3>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">For Completing</p>
                  <p className="text-sm font-bold text-purple-200">{certificateData.skillTitle || gig?.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Verified Mentor</p>
                    <p className="font-bold text-white truncate">{certificateData.mentorName || mentor?.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Issue Date</p>
                    <p className="font-bold text-white">
                      {new Date(certificateData.issuedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>

              {/* On-Chain Verification Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Attestation UID:</span>
                  <span className="font-mono text-[11px] font-bold text-purple-700 truncate max-w-[220px]">
                    {certificateData.attestationUid || "0x..."}
                  </span>
                </div>

                {certificateData.txHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Transaction:</span>
                    <a
                      href={certificateData.explorerUrl || `https://sepolia.arbiscan.io/tx/${certificateData.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] font-bold text-purple-700 hover:text-purple-900 underline inline-flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{certificateData.txHash.slice(0, 10)}...{certificateData.txHash.slice(-8)}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Gas Fee Sponsor:</span>
                  <span className="font-bold text-emerald-700">Covered by Platform ($0.00 Paid by Learner)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/certificate/${certificateData.id}`}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Award size={14} />
                  <span>View Official Certificate</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Course Completion Feedback & Multi-Platform Share Modal */}
        <CourseCompletionFeedbackModal
          open={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          role={isMentor ? "mentor" : "learner"}
          courseTitle={gig?.title || "Web3 Mentorship"}
          counterpartyName={isMentor ? (enrollment?.learner?.name || "Student") : (mentor?.name || "Mentor")}
          enrollmentId={enrollmentId}
          certificateId={certificateData?.id}
        />
      </main>
      <Footer />
    </div>
  );
}
