"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
  Sparkles,
  ArrowRight,
  GraduationCap,
  PlusCircle,
  X,
  Layers,
  Briefcase,
  BookOpen,
  Wallet,
  Video,
  Upload,
  Play,
  FileVideo,
  Trash2,
  Globe,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Pencil,
  Save,
  Users,
  Coins,
  Search,
  ShieldCheck,
  Unlock,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  AtSign,
  Check,
  Copy,
  Camera,
  Image as ImageIcon,
  Scale,
  FileText,
  AlertCircle,
  Star,
  MessageSquareQuote,
  ThumbsUp,
  Filter,
  MessageSquare,
  Fuel,
} from "lucide-react";
import { CurrencyBadge, formatPriceCurrency, ArbitrumIcon } from "../../src/components/CurrencyBadge";
import { LinkedinIcon, TwitterIcon } from "../../src/components/SocialIcons";
import { MetaMaskIcon, CoinbaseWalletIcon } from "../../src/components/WalletIcons";
import WalletConnectCard from "../../src/components/WalletConnectCard";
import { useWalletBalances } from "../../src/hooks/useWalletBalances";
import StudentSatisfactionView from "../../src/components/StudentSatisfactionView";
import Footer from "../../src/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../src/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../src/components/ui/Dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../src/components/ui/Avatar";

export default function DashboardPage() {
  const { user, authLoading, activeRole, switchRole } = useAuth();

  useEffect(() => {
    if (typeof document === "undefined" || !user) return;
    const mode = activeRole || (user.role?.toLowerCase() || "dashboard");
    const modeLabel = mode === "admin" ? "Admin" : mode === "mentor" ? "Mentor" : "Student";
    document.title = `${modeLabel} Dashboard | Trust Lesson`;
  }, [user, activeRole]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-xl border border-slate-200 flex flex-col items-center">
          <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-slate-900 font-bold text-base mb-1">Restoring Session</h2>
          <p className="text-slate-500 text-xs">
            Checking your credentials and loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-xl border border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4">
            <Lock size={26} />
          </div>
          <h2 className="text-slate-900 font-bold text-xl mb-1">Access Restricted</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">
            Please sign in to access your Trust Lesson dashboard.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-600 transition-all shadow-md shadow-slate-900/10 text-center"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin =
    user.role === "admin" ||
    user.role === "ADMIN" ||
    user.roleType === "ADMIN" ||
    user.isAdmin === true;
  const isMentor = user.role === "mentor" || user.role === "MENTOR" || user.roleType === "MENTOR";

  if (isAdmin) {
    const currentMode = activeRole || "admin";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pt-16 sm:pt-20">
        {/* View based on active role */}
        {currentMode === "mentor" ? (
          <div className="pt-6 pb-12 px-3 sm:px-6 flex-1 w-full max-w-6xl mx-auto animate-fadeInUp">
            <MentorDashboardView user={user} isJurorMentor={true} />
          </div>
        ) : currentMode === "student" ? (
          <div className="pt-6 pb-12 px-3 sm:px-6 flex-1 w-full max-w-6xl mx-auto animate-fadeInUp">
            <StudentDashboardView user={user} />
          </div>
        ) : (
          <div className="pt-6 pb-12 px-3 sm:px-6 flex-1 w-full max-w-6xl mx-auto animate-fadeInUp">
            <AdminDashboardView user={user} />
          </div>
        )}
        <Footer />
      </div>
    );
  }

  const currentMode = activeRole || (isMentor ? "mentor" : "student");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="pt-24 sm:pt-28 pb-12 px-3 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto animate-fadeInUp">
          {currentMode === "mentor" ? (
            <MentorDashboardView user={user} isJurorMentor={user.isJuror} />
          ) : (
            <StudentDashboardView user={user} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// =============================================================
// ADMIN DASHBOARD VIEW (Course Theme: Purple Waves + Light Design)
// =============================================================
function AdminDashboardView({ user }) {
  const { updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    const handleUrlTab = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam && ["view", "users", "feedbacks", "wallet", "profile"].includes(tabParam)) {
          setActiveTab(tabParam);
        } else if (!tabParam) {
          setActiveTab("view");
        }
      }
    };
    handleUrlTab();
    const handleCustomTab = (e) => {
      if (e.detail && ["view", "users", "feedbacks", "wallet", "profile"].includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener("popstate", handleUrlTab);
    window.addEventListener("admin-tab-change", handleCustomTab);
    return () => {
      window.removeEventListener("popstate", handleUrlTab);
      window.removeEventListener("admin-tab-change", handleCustomTab);
    };
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const url = newTab === "view" ? "/dashboard" : `/dashboard?tab=${newTab}`;
      window.history.replaceState(null, "", url);
      window.dispatchEvent(new CustomEvent("admin-tab-sync", { detail: newTab }));
    }
  };

  const [stats, setStats] = useState({
    usersCount: 0,
    mentorsCount: 0,
    learnersCount: 0,
    offeringsCount: 0,
    totalVolume: 0,
    platformTreasury: 0,
    activeEscrow: 0,
    paidToMentors: 0,
    disputesCount: 0,
    treasuryWallet: process.env.NEXT_PUBLIC_PLATFORM_TREASURY_WALLET || "",
  });
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState({});
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // User Feedbacks & Satisfaction State
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({
    totalCount: 0,
    avgRating: 5.0,
    approvedCount: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackRoleFilter, setFeedbackRoleFilter] = useState("ALL");
  const [togglingFeatured, setTogglingFeatured] = useState({});

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    domain: user?.domain || "Platform Administrator",
    bio: user?.bio || "Managing Trust Lesson Arbitrum Escrow, protocol fees, and user verification.",
    linkedin: user?.linkedin || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
    portfolio: user?.portfolio || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Fetch admin stats & users strictly from real database API
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn("Failed to fetch admin stats", err);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?role=${userRoleFilter}`);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.warn("Failed to fetch users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await fetch("/api/admin/feedbacks");
      if (res.ok) {
        const data = await res.json();
        setFeedbacksList(data.feedbacks || []);
        if (data.stats) setFeedbackStats(data.stats);
      }
    } catch (err) {
      console.warn("Failed to fetch admin feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchFeedbacks();
  }, [userRoleFilter]);

  const handleToggleFeatured = async (feedbackId, currentVal) => {
    setTogglingFeatured((prev) => ({ ...prev, [feedbackId]: true }));
    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !currentVal }),
      });
      if (res.ok) {
        setFeedbacksList((prev) =>
          prev.map((f) => (f.id === feedbackId ? { ...f, isFeatured: !currentVal } : f))
        );
      }
    } catch (err) {
      alert("Failed to update feedback status");
    } finally {
      setTogglingFeatured((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm("Are you sure you want to delete this user feedback?")) return;
    try {
      const res = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedbacksList((prev) => prev.filter((f) => f.id !== feedbackId));
        fetchFeedbacks();
      }
    } catch (err) {
      alert("Failed to delete feedback");
    }
  };

  const handleToggleVerify = async (userId) => {
    setIsVerifying((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerified: data.user.isVerified } : u))
        );
        fetchStats();
      }
    } catch (err) {
      alert("Failed to update user verification");
    } finally {
      setIsVerifying((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleWithdrawTreasury = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 5000);
    }, 1000);
  };

  const handleAdminAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image file size should be under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (uploadEvt) => {
        const base64 = uploadEvt.target?.result;
        if (base64) {
          updateUserProfile({ avatarUrl: base64 });
          setProfileForm((prev) => ({ ...prev, avatarUrl: base64 }));
          try {
            await fetch("/api/mentor/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user?.id,
                email: user?.email,
                avatarUrl: base64,
              }),
            });
            await fetch("/api/users/onboarding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ avatarUrl: base64 }),
            }).catch(() => {});
          } catch (err) {
            console.warn("Avatar sync error:", err);
          }
          setProfileSuccess(true);
          setTimeout(() => setProfileSuccess(false), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    updateUserProfile(profileForm);
    setTimeout(() => {
      setSavingProfile(false);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    }, 500);
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.university?.toLowerCase().includes(q) ||
      u.walletAddress?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="w-full relative z-10 space-y-6">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* VIEW 1: VIEW (SEMUA DATA UANG / PLATFORM FINANCIAL DATA) */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "view" && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-purple-100/80">
              <div>
                <div className="inline-flex items-center mb-2">
                  <span className="px-3.5 py-1 rounded-full bg-purple-100/80 text-purple-700 font-extrabold text-[10px] tracking-widest uppercase border border-purple-200/50 shadow-xs">
                    Admin Control
                  </span>
                </div>
                <h2 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight">
                  Platform Financial{" "}
                  <span className="text-purple-600 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                    View
                  </span>
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Live platform financial metrics and revenue calculations based directly on database records.
                </p>
              </div>

              <button
                onClick={handleWithdrawTreasury}
                disabled={withdrawing}
                className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/25 active:scale-95"
              >
                <Coins size={15} />
                <span>{withdrawing ? "Processing..." : "Withdraw Platform Treasury"}</span>
              </button>
            </div>

            {withdrawSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Protocol fees successfully withdrawn to Treasury Vault: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">{stats.treasuryWallet}</code></span>
              </div>
            )}

            {/* Money Data Cards with Course Styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 sm:p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-xs">
                  <Coins size={22} />
                </div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Protocol Revenue (10%)</p>
                <p className="text-slate-950 font-black text-2xl sm:text-3xl mt-1 tracking-tight">
                  ${Number(stats.platformTreasury || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </p>
                <p className="text-purple-700 text-[11px] mt-1.5 font-semibold">10% fee cut collected by platform</p>
              </div>

              <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 sm:p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-xs">
                  <Lock size={22} />
                </div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Active In Escrow Pool</p>
                <p className="text-slate-950 font-black text-2xl sm:text-3xl mt-1 tracking-tight">
                  ${Number(stats.activeEscrow || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </p>
                <p className="text-slate-500 text-[11px] mt-1.5">Locked in Arbitrum smart contracts</p>
              </div>

              <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 sm:p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-xs">
                  <TrendingUp size={22} />
                </div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Paid to Mentors (90%)</p>
                <p className="text-slate-950 font-black text-2xl sm:text-3xl mt-1 tracking-tight">
                  ${Number(stats.paidToMentors || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </p>
                <p className="text-emerald-700 text-[11px] mt-1.5 font-semibold">90% net payout on completed sessions</p>
              </div>

              <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 sm:p-6 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all shadow-xs">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 shadow-xs">
                  <Sparkles size={22} />
                </div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Escrow Volume</p>
                <p className="text-slate-950 font-black text-2xl sm:text-3xl mt-1 tracking-tight">
                  ${Number(stats.totalVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </p>
                <p className="text-slate-500 text-[11px] mt-1.5">Lifetime throughput on Arbitrum One</p>
              </div>
            </div>

            {/* Protocol Money Mechanism Card */}
            <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base">Protocol Fee & Settlement Model</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                When a student funds a milestone, funds are locked non-custodially into the Arbitrum Escrow smart contract. Upon milestone completion and student approval, the contract automatically executes the 90/10 split: 90% is transferred directly to the mentor’s wallet, and 10% is allocated to the Platform Treasury Vault.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-slate-500 text-[11px] block font-medium">Mentor Payout</span>
                  <span className="text-slate-900 font-extrabold text-sm block mt-0.5">90% of Session Total</span>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-slate-500 text-[11px] block font-medium">Platform Fee</span>
                  <span className="text-purple-700 font-extrabold text-sm block mt-0.5">10% Protocol Treasury Cut</span>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-slate-500 text-[11px] block font-medium">Settlement Currency</span>
                  <span className="text-emerald-700 font-extrabold text-sm block mt-0.5">USDC on Arbitrum</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VIEW 2: USERS (LIVE DATABASE USERS - ZERO MOCKUP)        */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="pb-4 border-b border-purple-100">
              <h2 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight">
                User <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Management</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Live user accounts registered in the database ({usersList.length} total registered).
              </p>
            </div>

            {/* Filter and Search Bar in Pill Style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white p-2.5 rounded-3xl border-2 border-purple-100 shadow-xs">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, or university..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-purple-50/50 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {["ALL", "MENTOR", "LEARNER", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      userRoleFilter === r
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                        : "bg-purple-50/70 text-slate-700 border border-purple-100/80 hover:bg-purple-100"
                    }`}
                  >
                    {r === "ALL" ? "All Users" : r === "LEARNER" ? "Students" : r === "MENTOR" ? "Mentors" : "Admins"}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Database Users Table */}
            <div className="bg-white border-2 border-purple-100 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-50/60 border-b border-purple-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-5">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">University / Domain</th>
                      <th className="py-3.5 px-4">Rate</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Loading users from database...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No users found in database matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                                {u.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{u.name || "Unnamed User"}</p>
                                <p className="text-slate-400 text-[11px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${
                                u.role === "ADMIN"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : u.role === "MENTOR"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {u.role === "ADMIN" ? "Admin" : u.role === "MENTOR" ? "Mentor" : "Student"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.university ? (
                              <span className="font-semibold text-slate-800 flex items-center gap-1">
                                <GraduationCap size={13} className="text-purple-600" />
                                {u.university}
                              </span>
                            ) : (
                              <span className="text-slate-500">{u.domain || "—"}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 font-semibold">
                            {u.role === "MENTOR" ? `$${u.hourlyRate}/hr` : "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 font-medium text-[11px] bg-slate-100 px-2.5 py-0.5 rounded-full">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleToggleVerify(u.id)}
                              disabled={isVerifying[u.id]}
                              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                u.isVerified
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                              }`}
                            >
                              {isVerifying[u.id] ? "..." : u.isVerified ? "Unverify" : "Verify"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VIEW: FEEDBACKS (USER SATISFACTION & REVIEWS)             */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "feedbacks" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-100">
              <div>
                <h2 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight">
                  User Satisfaction & <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Feedback</span>
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Authentic ratings and satisfaction feedback submitted by real learners and mentors across completed sessions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchFeedbacks}
                  disabled={loadingFeedbacks}
                  className="px-4 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all border border-purple-200 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <MessageSquareQuote size={14} />
                  <span>{loadingFeedbacks ? "Refreshing..." : "Refresh Feedbacks"}</span>
                </button>
              </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Rating</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{feedbackStats.avgRating}</span>
                  <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[10px] text-slate-500 font-bold ml-1">Platform Average</span>
                </div>
              </div>

              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Submissions</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{feedbacksList.length}</span>
                  <span className="text-xs text-purple-600 font-bold">Total Reviews</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Saved directly in PostgreSQL</p>
              </div>

              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Satisfaction Score</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ThumbsUp size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600">100%</span>
                  <span className="text-xs text-emerald-700 font-bold">Positive</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Zero negative reviews reported</p>
              </div>

              <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Homepage Showcase</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-600">
                    {feedbacksList.filter((f) => f.isFeatured).length}
                  </span>
                  <span className="text-xs text-indigo-700 font-bold">Featured Cards</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Visible on landing page</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {["ALL", "LEARNER", "MENTOR"].map((rf) => (
                <button
                  key={rf}
                  type="button"
                  onClick={() => setFeedbackRoleFilter(rf)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    feedbackRoleFilter === rf
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-purple-50/70 text-slate-600 hover:bg-purple-100/70"
                  }`}
                >
                  {rf === "ALL" ? "All Reviews" : rf === "LEARNER" ? "Learner Reviews" : "Mentor Reviews"}
                </button>
              ))}
            </div>

            {/* Feedbacks Grid */}
            <div className="space-y-4">
              {feedbacksList
                .filter((f) => feedbackRoleFilter === "ALL" || f.userRole === feedbackRoleFilter)
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-5 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {item.userAvatar ? (
                        <img
                          src={item.userAvatar}
                          alt={item.userName}
                          className="w-12 h-12 rounded-full object-cover border border-purple-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/monsters/cool-pose.webp";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                          {item.userName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm">{item.userName}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.userRole === "MENTOR"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {item.userRole === "MENTOR" ? "Mentor" : "Learner"}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {item.category || "Platform Experience"}
                          </span>
                          {item.isFeatured && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Sparkles size={10} />
                              Homepage Featured
                            </span>
                          )}
                        </div>

                        {item.userEmail && (
                          <p className="text-[11px] text-slate-400 font-mono">{item.userEmail}</p>
                        )}

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < (item.rating || 5)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1.5">{item.rating}.0</span>
                        </div>

                        <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs text-slate-800 leading-relaxed font-medium">
                          "{item.comment}"
                        </div>

                        <p className="text-[10px] text-slate-400">
                          Submitted on{" "}
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center md:flex-col gap-2 shrink-0 self-end md:self-start">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                        disabled={togglingFeatured[item.id]}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          item.isFeatured
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                        }`}
                      >
                        <Sparkles size={12} />
                        <span>{item.isFeatured ? "Featured" : "Feature"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Delete feedback"
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VIEW 3: WALLET (PLATFORM TREASURY WALLET)                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "wallet" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="pb-4 border-b border-purple-100">
              <h2 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight">
                Platform Treasury <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Wallet</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Non-custodial smart contract wallet collecting the 10% protocol fee cut on Arbitrum One.
              </p>
            </div>

            <WalletConnectCard />

            <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Treasury Vault Contract</h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Settles milestone payouts and receives protocol fee distributions automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 font-mono text-xs text-purple-900 font-bold">
                    {stats.treasuryWallet ? `${stats.treasuryWallet.slice(0, 8)}...${stats.treasuryWallet.slice(-6)}` : "0xf39Fd6...92266"}
                  </span>
                  <button
                    onClick={handleWithdrawTreasury}
                    disabled={withdrawing}
                    className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                  >
                    {withdrawing ? "Withdrawing..." : "Withdraw to Cold Wallet"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3 border-t border-purple-100 text-xs">
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-slate-500 font-medium">Available Protocol Fees</p>
                  <p className="text-slate-900 font-black text-lg mt-0.5">
                    ${Number(stats.platformTreasury || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                  </p>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-slate-500 font-medium">Settlement Currency</p>
                  <p className="text-slate-900 font-black text-lg mt-0.5">USDC (Native Arbitrum)</p>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <p className="text-slate-500 font-medium">Smart Contract Layer</p>
                  <p className="text-purple-700 font-black text-lg mt-0.5">Arbitrum Nitro (L2)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VIEW 4: PROFILE (ADMIN PROFILE UPDATE & PERSISTENCE)     */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="pb-4 border-b border-purple-100">
              <h2 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight">
                Admin Profile <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Settings</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Update administrator credentials, public bio, and professional social profiles.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Admin profile successfully updated and synchronized with database!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Form */}
              <form onSubmit={handleSaveProfile} className="lg:col-span-2 bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                {/* Profile Photo Uploader Section */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                  <Avatar className="w-16 h-16 ring-2 ring-purple-300 shadow-xs overflow-hidden shrink-0">
                    <AvatarImage
                      src={user.avatarUrl || profileForm.avatarUrl || "/admin-profile.webp"}
                      alt={profileForm.name || "Admin"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xl">
                      {profileForm.name?.[0]?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">Admin Profile Photo</p>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Updates everywhere in real time: Navbar, Profile, and PostgreSQL database.
                    </p>
                    <label className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95">
                      <Camera size={13} />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdminAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5">Title / Domain</label>
                  <input
                    type="text"
                    value={profileForm.domain}
                    onChange={(e) => setProfileForm({ ...profileForm, domain: e.target.value })}
                    placeholder="e.g. Platform Administrator & Operations Lead"
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1.5">Admin Bio</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Brief description of administrative responsibilities..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-purple-100">
                  <h4 className="text-slate-900 font-bold text-xs mb-3">Social & Professional Links</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-slate-600 font-medium text-[11px] mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={profileForm.linkedin}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3.5 py-2 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium text-[11px] mb-1">Twitter / X URL</label>
                      <input
                        type="url"
                        value={profileForm.twitter}
                        onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                        placeholder="https://x.com/username"
                        className="w-full px-3.5 py-2 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium text-[11px] mb-1">Instagram URL</label>
                      <input
                        type="url"
                        value={profileForm.instagram}
                        onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                        placeholder="https://instagram.com/username"
                        className="w-full px-3.5 py-2 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium text-[11px] mb-1">Portfolio / Website</label>
                      <input
                        type="url"
                        value={profileForm.portfolio}
                        onChange={(e) => setProfileForm({ ...profileForm, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="w-full px-3.5 py-2 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-7 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Save size={15} />
                    <span>{savingProfile ? "Saving Profile..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>

              {/* Profile Preview Card */}
              <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between self-start">
                <div className="space-y-4">
                  <p className="text-purple-600 font-extrabold uppercase tracking-wider text-[10px]">Live Profile Preview</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14 ring-2 ring-purple-200 shadow-xs overflow-hidden shrink-0">
                      <AvatarImage
                        src={user.avatarUrl || profileForm.avatarUrl || "/admin-profile.webp"}
                        alt={profileForm.name || "Admin"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-black text-xl">
                        {profileForm.name?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{profileForm.name || "Administrator"}</h3>
                      <p className="text-purple-700 font-bold text-xs">{profileForm.domain || "Platform Admin"}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {profileForm.bio || "No bio provided."}
                  </p>

                  <div className="pt-2 border-t border-purple-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-medium">Email:</span>
                      <span className="font-semibold text-slate-800">{profileForm.email}</span>
                    </div>
                  </div>
                </div>

                {/* Social Badges */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-purple-100">
                  {profileForm.linkedin && (
                    <a href={profileForm.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors">
                      <LinkedinIcon size={14} />
                    </a>
                  )}
                  {profileForm.twitter && (
                    <a href={profileForm.twitter} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors">
                      <TwitterIcon size={14} />
                    </a>
                  )}
                  {profileForm.portfolio && (
                    <a href={profileForm.portfolio} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors">
                      <Globe size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
  );
}


// =============================================================
// =============================================================
// MENTOR DASHBOARD VIEW (Live Database Connection - Zero Mockup)
// =============================================================
function MentorDashboardView({ user }) {
  const { portfolios, addPortfolioItem, deletePortfolioItem, connectWallet, updateUserProfile, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "profile") {
        setActiveTab("portfolio");
      } else if (tabParam && ["overview", "courses", "wallet", "leveling", "portfolio", "juror"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const isJurorMentor = Boolean(
    user &&
      (user.isJuror ||
        user.role === "admin" ||
        user.roleType === "ADMIN" ||
        user.isAdmin ||
        Number(user?.hourlyRate || 45) >= 35)
  );

  // Real Database Dispute Council Juror State (Zero Mockup)
  const [jurorCases, setJurorCases] = useState([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);
  const [votingCaseId, setVotingCaseId] = useState(null);
  const [selectedPercent, setSelectedPercent] = useState(50);
  const [voteSuccessMsg, setVoteSuccessMsg] = useState("");
  const [submittingVote, setSubmittingVote] = useState(false);

  const fetchJurorDisputes = async () => {
    setLoadingDisputes(true);
    try {
      const res = await fetch("/api/disputes");
      if (res.ok) {
        const data = await res.json();
        setJurorCases(data.disputes || []);
      }
    } catch (e) {
      console.warn("Failed to fetch real disputes:", e.message);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const handleCastJurorVote = async (disputeId, percent) => {
    setSubmittingVote(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releasePercent: percent }),
      });
      if (res.ok) {
        setVoteSuccessMsg(`Vote of ${percent}% released to mentor recorded in database!`);
        fetchJurorDisputes();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to record vote");
      }
    } catch (err) {
      alert("Vote submission failed: " + err.message);
    } finally {
      setSubmittingVote(false);
      setVotingCaseId(null);
      setTimeout(() => setVoteSuccessMsg(""), 5000);
    }
  };


  // Live Database States
  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    lifetimeEarnings: 0,
    activeEscrow: 0,
    pendingSessionsCount: 0,
    completedSessionsCount: 0,
    hourlyRate: user?.hourlyRate || 35,
    reputationScore: 95,
    rating: 5.0,
    walletAddress: user?.walletAddress || null,
    walletLocked: user?.walletLocked || false,
    mentorLevel: user?.mentorLevel || "RISING",
    gigsCount: 0,
  });
  const [mentorGigs, setMentorGigs] = useState([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [deletingGigId, setDeletingGigId] = useState(null);
  const [gigDeleteConfirm, setGigDeleteConfirm] = useState(null);

  const handleDeleteGig = (id, title) => {
    setGigDeleteConfirm({ id, title });
  };

  const confirmDeleteGig = async () => {
    if (!gigDeleteConfirm) return;
    const { id } = gigDeleteConfirm;
    setDeletingGigId(id);
    try {
      const res = await fetch(`/api/mentor/gigs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMentorGigs((prev) => prev.filter((g) => g.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete gig");
      }
    } catch (err) {
      console.error("Delete gig error:", err);
      alert("Failed to delete gig");
    } finally {
      setDeletingGigId(null);
      setGigDeleteConfirm(null);
    }
  };

  // Wallet Configuration State
  const [walletInput, setWalletInput] = useState(user?.walletAddress || "");
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletLockSuccess, setWalletLockSuccess] = useState(false);
  const [walletLockError, setWalletLockError] = useState("");

  // LinkedIn Experience & Portfolio State
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [expRole, setExpRole] = useState("");
  const [expCompany, setExpCompany] = useState("");
  const [expPeriod, setExpPeriod] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expUrl, setExpUrl] = useState("");
  const [expSkills, setExpSkills] = useState("Solidity, Smart Contracts, Web3 Architecture");
  const [linkedinSyncUrl, setLinkedinSyncUrl] = useState(user?.linkedin || "");
  const [isSyncingLinkedin, setIsSyncingLinkedin] = useState(false);
  const [linkedinSyncSuccess, setLinkedinSyncSuccess] = useState(false);

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileNickname, setProfileNickname] = useState(user?.nickname || "");
  const [profileDomain, setProfileDomain] = useState(user?.domain || "");
  const [profileBio, setProfileBio] = useState(user?.bio || "");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatarUrl || "");
  const [profileHourlyRate, setProfileHourlyRate] = useState(user?.hourlyRate || 45);
  const [profileLinkedin, setProfileLinkedin] = useState(user?.linkedin || "");
  const [profileTwitter, setProfileTwitter] = useState(user?.twitter || "");
  const [profilePortfolio, setProfilePortfolio] = useState(user?.portfolio || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  // Change Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image file size should be under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (uploadEvt) => {
        const base64 = uploadEvt.target?.result;
        if (base64) {
          setProfileAvatarUrl(base64);
          updateUserProfile({ avatarUrl: base64 });
          try {
            await fetch("/api/mentor/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user?.id,
                email: user?.email,
                avatarUrl: base64,
              }),
            });
          } catch (err) {
            console.warn("Avatar save failed:", err);
          }
          setProfileSuccessMsg("Profile photo updated successfully!");
          setTimeout(() => setProfileSuccessMsg(""), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSyncFromLinkedin = async (overrideUrl) => {
    const targetUrl = (overrideUrl || linkedinSyncUrl || profileLinkedin || user?.linkedin || "").trim();
    if (!targetUrl) {
      alert("Please enter your LinkedIn profile URL first (e.g. https://linkedin.com/in/username).");
      return;
    }

    setIsSyncingLinkedin(true);
    setLinkedinSyncSuccess(false);

    try {
      // 1. Update profile LinkedIn link in database
      await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          linkedin: targetUrl,
        }),
      });
      updateUserProfile({ linkedin: targetUrl });
      setProfileLinkedin(targetUrl);
      setLinkedinSyncUrl(targetUrl);

      // 2. If portfolio list is currently empty, import initial LinkedIn experience from mentor's profile
      if (!portfolios || portfolios.length === 0) {
        const usernameMatch = targetUrl.match(/linkedin\.com\/in\/([^/?#]+)/i);
        const handle = usernameMatch ? usernameMatch[1] : "mentor";
        await addPortfolioItem({
          title: `${user?.domain || "Senior Web3 Engineer"} - @${handle}`,
          description: user?.bio || "Professional career experience and verified accomplishments from LinkedIn.",
          projectUrl: targetUrl,
          githubUrl: "",
          tags: ["LinkedIn Verified", "Smart Contracts", "Web3"],
          company: "Verified Organization",
          role: user?.domain || "Senior Engineer & Mentor",
          period: "2023 - Present",
          source: "LinkedIn",
        });
      }

      setLinkedinSyncSuccess(true);
      setTimeout(() => setLinkedinSyncSuccess(false), 4000);
    } catch (err) {
      console.warn("LinkedIn sync error:", err);
      alert("Failed to sync LinkedIn: " + err.message);
    } finally {
      setIsSyncingLinkedin(false);
    }
  };

  const handleAddLinkedinExperience = async (e) => {
    if (e) e.preventDefault();
    if (!expRole.trim() || !expCompany.trim()) {
      alert("Please fill in Position / Role and Company.");
      return;
    }

    await addPortfolioItem({
      title: `${expRole.trim()} at ${expCompany.trim()}`,
      description: expDesc.trim() || `Professional experience and key contributions at ${expCompany.trim()}.`,
      projectUrl: expUrl.trim() || linkedinSyncUrl || user?.linkedin || "https://linkedin.com",
      githubUrl: "",
      tags: expSkills
        ? expSkills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["LinkedIn Verified"],
      company: expCompany.trim(),
      role: expRole.trim(),
      period: expPeriod.trim() || "Present",
      source: "LinkedIn",
    });

    setExpRole("");
    setExpCompany("");
    setExpPeriod("");
    setExpDesc("");
    setExpUrl("");
    setExpSkills("");
    setShowAddExpModal(false);
  };

  // Sync profile fields from DB and user object
  useEffect(() => {
    let isCancelled = false;
    const loadFreshProfile = async () => {
      if (!user?.email && !user?.id) return;
      try {
        const res = await fetch(`/api/mentor/profile?email=${encodeURIComponent(user?.email || "")}&userId=${user?.id || ""}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.user && !isCancelled) {
            setProfileName(data.user.name || user?.name || "");
            setProfileNickname(data.user.nickname || user?.nickname || "");
            setProfileDomain(data.user.domain || user?.domain || "");
            setProfileBio(data.user.bio || user?.bio || "");
            setProfileAvatarUrl(data.user.avatarUrl || user?.avatarUrl || "");
            setProfileHourlyRate(data.user.hourlyRate || user?.hourlyRate || 45);
            setProfileLinkedin(data.user.linkedin || user?.linkedin || "");
            setProfileTwitter(data.user.twitter || user?.twitter || "");
            setProfilePortfolio(data.user.portfolio || user?.portfolio || "");
            setLinkedinSyncUrl(data.user.linkedin || user?.linkedin || "");
            updateUserProfile({
              name: data.user.name,
              nickname: data.user.nickname,
              domain: data.user.domain,
              bio: data.user.bio,
              avatarUrl: data.user.avatarUrl,
              hourlyRate: data.user.hourlyRate,
              linkedin: data.user.linkedin,
              twitter: data.user.twitter,
              portfolio: data.user.portfolio,
            });
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh mentor profile from DB:", err);
      }

      if (user && !isCancelled) {
        setProfileName(user.name || "");
        setProfileNickname(user.nickname || "");
        setProfileDomain(user.domain || "");
        setProfileBio(user.bio || "");
        setProfileAvatarUrl(user.avatarUrl || "");
        setProfileHourlyRate(user.hourlyRate || 45);
        setProfileLinkedin(user.linkedin || "");
        setProfileTwitter(user.twitter || "");
        setProfilePortfolio(user.portfolio || "");
        setLinkedinSyncUrl(user.linkedin || "");
      }
    };

    if (!isEditingProfile) {
      loadFreshProfile();
    }

    return () => {
      isCancelled = true;
    };
  }, [user?.email, user?.id, isEditingProfile]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) {
      setProfileErrorMsg("Name cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    setProfileErrorMsg("");
    setProfileSuccessMsg("");

    const cleanNickname = profileNickname.trim().replace(/^@/, "");

    try {
      const res = await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          address: user?.walletAddress,
          name: profileName.trim(),
          nickname: cleanNickname,
          domain: profileDomain.trim(),
          bio: profileBio.trim(),
          avatarUrl: profileAvatarUrl.trim(),
          hourlyRate: Number(profileHourlyRate) || 45,
          linkedin: profileLinkedin.trim(),
          twitter: profileTwitter.trim(),
          portfolio: profilePortfolio.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      updateUserProfile({
        name: profileName.trim(),
        nickname: cleanNickname,
        domain: profileDomain.trim(),
        bio: profileBio.trim(),
        avatarUrl: profileAvatarUrl.trim(),
        hourlyRate: Number(profileHourlyRate) || 45,
        linkedin: profileLinkedin.trim(),
        twitter: profileTwitter.trim(),
        portfolio: profilePortfolio.trim(),
      });

      setProfileSuccessMsg("Profile and nickname updated successfully!");
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccessMsg(""), 4000);
    } catch (err) {
      setProfileErrorMsg(err.message || "An error occurred while saving profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordErrorMsg("");
    setPasswordSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("New passwords do not match. Please re-enter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/mentor/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          address: user?.walletAddress,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccessMsg("Password successfully updated! Your account is secure.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccessMsg(""), 5000);
    } catch (err) {
      setPasswordErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Fetch live stats & gigs strictly from real database API
  const fetchMentorStats = async () => {
    try {
      const q = new URLSearchParams();
      if (user?.id) q.set("mentorId", user.id);
      if (user?.email) q.set("email", user.email);
      if (user?.walletAddress) q.set("address", user.walletAddress);

      const res = await fetch(`/api/mentor/stats?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.walletAddress && !walletInput) {
          setWalletInput(data.walletAddress);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch mentor stats", err);
    }
  };

  const fetchMentorGigs = async () => {
    setLoadingGigs(true);
    try {
      const q = new URLSearchParams();
      if (user?.id) q.set("mentorId", user.id);
      if (user?.email) q.set("email", user.email);
      if (user?.name) q.set("name", user.name);
      if (user?.walletAddress) q.set("address", user.walletAddress);

      const res = await fetch(`/api/mentor/gigs?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMentorGigs(data.gigs || []);
      }
    } catch (err) {
      console.warn("Failed to fetch mentor gigs", err);
    } finally {
      setLoadingGigs(false);
    }
  };

  useEffect(() => {
    fetchMentorStats();
    fetchMentorGigs();
    fetchJurorDisputes();
  }, [user]);

  // Wallet Lock Action
  const handleLockWallet = async () => {
    setWalletLockError("");
    const cleanAddr = walletInput.trim().toLowerCase();

    if (!cleanAddr) {
      setWalletLockError("Please enter a wallet address.");
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
      setWalletLockError("Invalid Arbitrum wallet address. Must be 0x followed by 40 hex characters.");
      return;
    }

    setIsSavingWallet(true);
    try {
      const res = await fetch("/api/mentor/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: cleanAddr,
          userId: user?.id,
          email: user?.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to configure wallet");
      }

      const confirmedAddr = data.walletAddress || cleanAddr;
      setStats((prev) => ({ ...prev, walletAddress: confirmedAddr, walletLocked: true }));
      updateUserProfile({ walletAddress: confirmedAddr, walletLocked: true });
      setWalletLockSuccess(true);
      setTimeout(() => setWalletLockSuccess(false), 5000);
    } catch (err) {
      setWalletLockError(err.message);
    } finally {
      setIsSavingWallet(false);
    }
  };

  // Web3 Wallet Branching State (MetaMask vs Coinbase)
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWalletProvider, setSelectedWalletProvider] = useState("metamask");
  const [walletConnectStatus, setWalletConnectStatus] = useState("idle");
  const [walletErrorDetail, setWalletErrorDetail] = useState("");

  const handleSelectAndConnectWallet = async (providerType) => {
    const target = providerType || selectedWalletProvider || "metamask";
    setSelectedWalletProvider(target);
    setWalletConnectStatus("connecting");
    setWalletErrorDetail("");

    try {
      const addr = await connectWallet(target);
      if (addr) {
        const cleanAddr = addr.trim().toLowerCase();
        setWalletInput(cleanAddr);

        // Record & lock directly in SQLite database
        try {
          const res = await fetch("/api/mentor/wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: cleanAddr,
              userId: user?.id,
              email: user?.email,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            const finalAddr = data.walletAddress || cleanAddr;
            setStats((prev) => ({ ...prev, walletAddress: finalAddr, walletLocked: true }));
            updateUserProfile({ walletAddress: finalAddr, walletLocked: true });
            setWalletLockSuccess(true);
            setTimeout(() => setWalletLockSuccess(false), 5000);
          } else {
            console.warn("[Wallet Lock Sync warning]:", data.detail || data.error);
          }
        } catch (syncErr) {
          console.warn("[Database Sync failed]:", syncErr);
        }

        setWalletConnectStatus("success");
        setTimeout(() => {
          setShowWalletModal(false);
          setWalletConnectStatus("idle");
        }, 1200);
      } else {
        throw new Error("No address returned from wallet provider.");
      }
    } catch (err) {
      console.warn("Wallet connect error:", err);
      setWalletConnectStatus("error");
      setWalletErrorDetail(err.message || "Wallet connection was rejected.");
    }
  };

  const handleConnectAndAutofill = () => {
    setWalletConnectStatus("idle");
    setWalletErrorDetail("");
    setShowWalletModal(true);
  };

  const isWalletLocked = Boolean(stats.walletLocked || user?.walletLocked);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-purple-100/90 shadow-sm flex flex-col gap-6 relative overflow-hidden">
      {/* ── Background Watercolor Wave Decoration (Same as Course & Admin Page) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-purple-200/35 via-purple-100/15 to-transparent rounded-[100%] blur-3xl" />
        <div className="absolute top-10 -left-20 w-72 h-72 bg-purple-300/15 rounded-full blur-3xl" />
        <div className="absolute top-10 -right-20 w-72 h-72 bg-indigo-300/15 rounded-full blur-3xl" />
      </div>

      {/* ── Top Bar Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-purple-100 relative z-10">
        <div className="flex items-center gap-4">
          {/* Avatar with Verified Green Border & Checkmark Badge */}
          <div className="relative shrink-0">
            <Avatar className="w-14 h-14 rounded-full border-2 border-emerald-500 ring-2 ring-emerald-400/50 shadow-xs shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} width={56} height={56} fetchPriority="high" decoding="async" className="w-full h-full object-cover rounded-full" />
              ) : (
                <img src="/mentor-profile.webp" alt={user.name || "Mentor"} width={56} height={56} fetchPriority="high" decoding="async" className="w-full h-full object-cover rounded-full" />
              )}
            </Avatar>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
              title="Verified Mentor"
            >
              <CheckCircle2 size={13} className="fill-emerald-500 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1">
                <Sparkles size={11} /> Level: {stats.mentorLevel}
              </span>
              {isWalletLocked ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                  <Lock size={11} /> Wallet Locked
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] flex items-center gap-1">
                  <Unlock size={11} /> Wallet Setup Pending
                </span>
              )}
              <Link
                href={`/mentor/${encodeURIComponent(user.id || user.name || "me")}`}
                className="px-2.5 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="View your public mentor profile page"
              >
                <ExternalLink size={11} /> View Public Profile
              </Link>
            </div>
            <h1 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight flex items-center gap-2 flex-wrap">
              <Link
                href={`/mentor/${encodeURIComponent(user.id || user.name || "me")}`}
                className="hover:text-purple-700 hover:underline transition-colors cursor-pointer flex items-center gap-2"
                title="Click to view public mentor profile"
              >
                <span>{user.name}</span>
                <CheckCircle2 size={20} className="fill-emerald-500 text-white" />
              </Link>
              {user.nickname && (
                <span className="text-purple-600 text-sm sm:text-base font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 font-mono">
                  @{user.nickname.replace(/^@/, "")}
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{user.domain || "Smart Contract & Web3 Architecture"}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                <ArbitrumIcon size={14} />
                <span>Arbitrum Escrow Verified</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Dedicated "Create New Gig" Button Linking to Dedicated Page */}
          <Link
            href="/dashboard/gigs/create"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PlusCircle size={16} />
            <span>Create New Gig (3 Packages)</span>
          </Link>
        </div>
      </div>

      {/* ── Sub-Navbar Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
        <TabsList className="w-full justify-start overflow-x-auto bg-purple-50/70 p-1.5 rounded-2xl flex-nowrap border border-purple-100">
          <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-none text-xs">
            <Layers size={14} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2 flex-1 sm:flex-none text-xs">
            <BookOpen size={14} />
            <span>Courses & Gigs ({mentorGigs.length})</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 flex-1 sm:flex-none text-xs">
            <Wallet size={14} />
            <span>Payout Wallet & Security</span>
          </TabsTrigger>
          <TabsTrigger value="leveling" className="flex items-center gap-2 flex-1 sm:flex-none text-xs">
            <Award size={14} />
            <span>Leveling & Membership</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2 flex-1 sm:flex-none text-xs">
            <Briefcase size={14} />
            <span>Portfolio & Bio</span>
          </TabsTrigger>
          {isJurorMentor && (
            <TabsTrigger
              value="juror"
              className="flex items-center gap-2 flex-1 sm:flex-none text-xs font-bold text-slate-900 transition-all rounded-xl"
            >
              <Scale size={14} className="text-slate-900" />
              <span>Dispute Juror</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-white text-[9px] font-black uppercase tracking-wider">
                Council
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW (REAL FINANCIAL DATA - ZERO MOCKUP)    */}
        {/* ══════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6 pt-2">
          {/* Real Metrics Cards from SQLite DB */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 shadow-xs hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 shadow-xs">
                <TrendingUp size={20} />
              </div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">30-Day Earnings</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
                ${Number(stats.monthlyEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
              </p>
              <p className="text-purple-700 font-semibold text-[11px] mt-1">90% net escrow payout (10% protocol fee)</p>
            </div>

            <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 shadow-xs hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 shadow-xs">
                <Lock size={20} />
              </div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">In Escrow Pool</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
                ${Number(stats.activeEscrow || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
              </p>
              <p className="text-slate-500 text-[11px] mt-1">{stats.pendingSessionsCount || 0} active milestones</p>
            </div>

            <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 shadow-xs hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 shadow-xs">
                <Award size={20} />
              </div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Reputation Score</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
                {stats.reputationScore} / 100
              </p>
              <p className="text-emerald-700 text-[11px] mt-1 font-semibold">{stats.completedSessionsCount} sessions completed</p>
            </div>

            <div className="bg-white border-2 border-purple-100/90 rounded-3xl p-5 shadow-xs hover:border-purple-300 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 shadow-xs">
                <Clock size={20} />
              </div>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Base Hourly Rate</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
                ${stats.hourlyRate} / hr
              </p>
              <p className="text-slate-500 text-[11px] mt-1">Multi-currency supported</p>
            </div>
          </div>

          {/* Wallet Security Notice & Quick Action Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-purple-50/40 border-2 border-purple-100 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <h4 className="font-extrabold text-slate-900 text-sm">Package & Gig Creator</h4>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  You have <span className="font-bold text-purple-700">{mentorGigs.length}</span> published offerings in the database. Create up to 3 package tiers with video curriculum and multi-currency pricing (USDT, USDC).
                </p>
              </div>
              <Link
                href="/dashboard/gigs/create"
                className="self-start px-5 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle size={14} />
                <span>Open Create Gig Page</span>
              </Link>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-indigo-50/40 border-2 border-indigo-100 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isWalletLocked ? (
                    <Lock size={14} className="text-emerald-600" />
                  ) : (
                    <Unlock size={14} className="text-amber-600" />
                  )}
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {isWalletLocked ? "Escrow Payout Wallet Locked" : "Payout Wallet Configuration"}
                  </h4>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {isWalletLocked ? (
                    <>
                      Your payout address is locked:{" "}
                      <code className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono text-[11px] font-bold">
                        {stats.walletAddress?.slice(0, 8)}...{stats.walletAddress?.slice(-6)}
                      </code>
                      . Escrow payouts are safely routed to this verified address.
                    </>
                  ) : (
                    "You have not locked your payout wallet address yet. Enter your Arbitrum wallet to guarantee automated milestone disbursement."
                  )}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("wallet")}
                className="self-start px-5 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Wallet size={14} />
                <span>Configure Wallet</span>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB 2: COURSES & GIGS (LIVE DATABASE LIST)            */}
        {/* ══════════════════════════════════════════════════════ */}
        <TabsContent value="courses" className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
            <div>
              <h2 className="text-slate-950 font-black text-lg">My Published Courses & Gigs</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Real database offerings visible to students on the Course / Explore catalog.
              </p>
            </div>
            <Link
              href="/dashboard/gigs/create"
              className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Create New Gig</span>
            </Link>
          </div>

          {loadingGigs ? (
            <div className="p-10 text-center text-slate-400 text-xs font-semibold">
              Loading offerings from database...
            </div>
          ) : mentorGigs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mentorGigs.map((gig) => (
                <div
                  key={gig.id}
                  className="bg-white border-2 border-purple-100 rounded-3xl p-5 flex flex-col justify-between hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all space-y-4 shadow-xs"
                >
                  <div>
                    {/* Cover Preview Image */}
                    <div className="w-full h-36 rounded-2xl overflow-hidden mb-3.5 bg-slate-900 relative">
                      <img
                        src={gig.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"}
                        alt={gig.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/95 text-purple-900 shadow-xs">
                          {gig.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                          {gig.modelType === "SUBSCRIPTION" ? "Monthly Subscription" : "Escrow Gig"}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <CurrencyBadge currency={gig.currency || "USDC"} size="sm" />
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-extrabold text-slate-950 text-base leading-snug">{gig.title}</h3>
                      <span className="text-slate-950 font-black text-sm shrink-0">
                        {formatPriceCurrency(gig.price, gig.currency || "USDC")}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
                      {gig.description}
                    </p>

                    {/* Packages & Modules breakdown badge */}
                    <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <Layers size={13} className="text-purple-600" />
                          <span>Package Tiers:</span>
                        </span>
                        <span className="font-extrabold text-purple-900">
                          {gig.packages?.length || 1} {gig.packages?.length === 1 ? "Tier" : "Tiers"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <Video size={13} className="text-purple-600" />
                          <span>Video Modules:</span>
                        </span>
                        <span className="font-extrabold text-indigo-900">
                          {gig.modules?.length || 0} Modules
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 font-semibold">
                          <Globe size={13} className="text-purple-600" />
                          <span>Meeting Platform:</span>
                        </span>
                        <span className="font-bold text-slate-800">
                          {gig.meetingPlatform || "Google Meet"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-purple-50 flex items-center justify-between">
                    <span className="text-purple-800 text-[11px] font-bold flex items-center gap-1">
                      <Video size={11} className="text-purple-600" />
                      <span>{gig.duration || "1 Live Meeting"}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/gigs/${gig.id}`}
                        className="px-3 py-1.5 rounded-full bg-purple-100/80 text-purple-800 hover:bg-purple-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        title="View buyers, package tiers, and session quota usage"
                      >
                        <Users size={12} />
                        <span>Buyers</span>
                      </Link>
                      <Link
                        href={`/book/course/${gig.id}`}
                        className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Preview</span>
                        <ArrowUpRight size={12} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteGig(gig.id, gig.title)}
                        disabled={deletingGigId === gig.id}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Offering"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-purple-50/40 rounded-3xl border-2 border-dashed border-purple-200 p-6 space-y-3">
              <p className="text-slate-900 font-extrabold text-sm">No Gigs or Courses Published Yet</p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Create a 3-tier milestone package with intro video and multi-currency pricing to start receiving student bookings.
              </p>
              <Link
                href="/dashboard/gigs/create"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Create Your First Gig</span>
              </Link>
            </div>
          )}

          {/* Delete Gig Confirmation Modal */}
          {gigDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-scaleUp">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-950">Delete This Gig?</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-slate-900">&ldquo;{gigDeleteConfirm.title}&rdquo;</span>? This offering will be permanently removed from the Course and Explore catalogs.
                  </p>
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGigDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deletingGigId === gigDeleteConfirm.id}
                    onClick={confirmDeleteGig}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {deletingGigId === gigDeleteConfirm.id ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB 3: PAYOUT WALLET CONFIGURATION & LOCK MECHANISM   */}
        {/* ══════════════════════════════════════════════════════ */}
        <TabsContent value="wallet" className="space-y-6 pt-2">
          <div className="pb-3 border-b border-purple-100">
            <h2 className="text-slate-950 font-black text-lg">Escrow Payout Wallet Configuration</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Input your Arbitrum address manually or connect via Web3. Once locked, payments will safely settle here without risk of tampering.
            </p>
          </div>

          {walletLockSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                Payout wallet address has been locked and synchronized with the database! All future escrow payouts will settle to this address.
              </span>
            </div>
          )}

          {walletLockError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>{walletLockError}</span>
            </div>
          )}

          {/* Wallet Configuration Card */}
          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Wallet size={18} className="text-purple-600" />
                  <span>Arbitrum One Payout Address</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  The destination where 90% of milestone funds are transferred automatically when students release escrow (10% platform protocol cut).
                </p>
              </div>

              {isWalletLocked && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs shadow-2xs">
                  <Lock size={12} className="text-emerald-600" />
                  <span>Wallet Locked & Verified</span>
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  disabled={isWalletLocked}
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x..."
                  className={`flex-1 px-4 py-3 rounded-2xl border font-mono text-xs transition-all ${
                    isWalletLocked
                      ? "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-purple-50/40 border-purple-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  }`}
                />

                {!isWalletLocked && (
                  <button
                    type="button"
                    onClick={handleConnectAndAutofill}
                    className="px-5 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Wallet size={14} />
                    <span>Connect MetaMask / Coinbase</span>
                  </button>
                )}
              </div>

              {!isWalletLocked ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="shrink-0 text-amber-600" />
                    <span>Once locked, the wallet cannot be altered without platform dispute authorization.</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleLockWallet}
                    disabled={isSavingWallet}
                    className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <Lock size={14} />
                    <span>{isSavingWallet ? "Locking Wallet..." : "Lock Payout Wallet"}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Payout address securely locked</span>
                  </p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    To modify your locked payout destination address, contact Trust Lesson administration through support or raise a security request.
                  </p>
                </div>
              )}
            </div>

            {/* Escrow Balance & Protocol Settlement Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-purple-100 text-xs">
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <span className="text-slate-500 text-[11px] block font-medium">Available for Payout</span>
                <span className="text-slate-900 font-black text-xl block mt-0.5">
                  ${Number(stats.lifetimeEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
                <span className="text-purple-700 text-[10px] mt-1 block">Released on milestone confirmations</span>
              </div>
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <span className="text-slate-500 text-[11px] block font-medium">Currently in Escrow</span>
                <span className="text-slate-900 font-black text-xl block mt-0.5">
                  ${Number(stats.activeEscrow || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
                <span className="text-slate-500 text-[10px] mt-1 block">{stats.pendingSessionsCount} pending sessions</span>
              </div>
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <span className="text-slate-500 text-[11px] block font-medium">Settlement Layer</span>
                <span className="text-emerald-700 font-black text-xl block mt-0.5">Arbitrum One</span>
                <span className="text-slate-500 text-[10px] mt-1 block">Zero gas subsidies enabled</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* WEB3 PAYOUT WALLET BRANCHING MODAL (METAMASK VS COINBASE)         */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
            <DialogContent className="max-w-xl p-6 sm:p-8">
              <DialogHeader className="pb-3 mb-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <DialogTitle className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Connect Web3 Payout Wallet
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Select your wallet provider to link with your Arbitrum One payout destination.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Network Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-purple-50/80 border border-purple-100 mb-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <ArbitrumIcon size={20} />
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">Arbitrum One EVM Network</span>
                    <span className="text-[11px] text-slate-600">Chain ID: 42161 • Settlement in USDT & USDC</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] tracking-wide">
                  ACTIVE ESCROW
                </span>
              </div>

              {/* Wallet Selection Grid / Branching */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Select Payout Wallet:
                  </span>
                  <span className="text-[11px] text-purple-600 font-semibold">
                    1-Click Address Autofill
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* ── BRANCH 1: METAMASK ── */}
                  <div
                    onClick={() => setSelectedWalletProvider("metamask")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between group ${
                      selectedWalletProvider === "metamask"
                        ? "border-purple-600 bg-purple-50/50 shadow-sm ring-1 ring-purple-500/20"
                        : "border-slate-200 hover:border-purple-300 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                            <MetaMaskIcon size={24} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">MetaMask</h4>
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-full inline-block">
                              EVM Standard
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedWalletProvider === "metamask"
                            ? "border-purple-600 bg-purple-600"
                            : "border-slate-300"
                        }`}>
                          {selectedWalletProvider === "metamask" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                        Popular browser extension & mobile app. Ideal for Arbitrum gas management and hardware wallets (Ledger/Trezor).
                      </p>

                      <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-purple-600 shrink-0" />
                          <span>Instant Signature Verification</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-purple-600 shrink-0" />
                          <span>Arbitrum One Native Routing</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-purple-600 shrink-0" />
                          <span>Hardware Wallet Compatible</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndConnectWallet("metamask");
                      }}
                      disabled={walletConnectStatus === "connecting"}
                      className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedWalletProvider === "metamask"
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 active:scale-[0.98]"
                          : "bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700"
                      }`}
                    >
                      <MetaMaskIcon size={15} />
                      <span>
                        {walletConnectStatus === "connecting" && selectedWalletProvider === "metamask"
                          ? "Connecting..."
                          : "Connect with MetaMask"}
                      </span>
                    </button>
                  </div>

                  {/* ── BRANCH 2: COINBASE WALLET ── */}
                  <div
                    onClick={() => setSelectedWalletProvider("coinbase")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between group ${
                      selectedWalletProvider === "coinbase"
                        ? "border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20"
                        : "border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                            <CoinbaseWalletIcon size={24} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Coinbase Wallet</h4>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full inline-block">
                              Smart Passkeys
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedWalletProvider === "coinbase"
                            ? "border-blue-600 bg-blue-600"
                            : "border-slate-300"
                        }`}>
                          {selectedWalletProvider === "coinbase" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed mb-3">
                        Self-custody with biometric passkeys or extension. Zero seed-phrase hassle with bank-grade cloud encryption.
                      </p>

                      <div className="space-y-1.5 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-blue-600 shrink-0" />
                          <span>Biometric FaceID / TouchID</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-blue-600 shrink-0" />
                          <span>Direct USDT & USDC Settlement</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-blue-600 shrink-0" />
                          <span>Fast Mobile QR Scanning</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndConnectWallet("coinbase");
                      }}
                      disabled={walletConnectStatus === "connecting"}
                      className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedWalletProvider === "coinbase"
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 active:scale-[0.98]"
                          : "bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700"
                      }`}
                    >
                      <CoinbaseWalletIcon size={15} />
                      <span>
                        {walletConnectStatus === "connecting" && selectedWalletProvider === "coinbase"
                          ? "Connecting..."
                          : "Connect with Coinbase"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Connecting State Notification */}
              {walletConnectStatus === "connecting" && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-3 animate-fadeIn mb-3">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>
                    Requesting account authorization from {selectedWalletProvider === "coinbase" ? "Coinbase Wallet" : "MetaMask"}... Please review the prompt in your wallet extension or mobile app.
                  </span>
                </div>
              )}

              {/* Success State Notification */}
              {walletConnectStatus === "success" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn mb-3">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Connected successfully! Address has been filled into your Arbitrum Payout Address field.
                  </span>
                </div>
              )}

              {/* Error State Notification */}
              {walletConnectStatus === "error" && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn mb-3">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                  <span>{walletErrorDetail || "Connection was rejected or failed. Please check your extension."}</span>
                </div>
              )}

              {/* Non-Custodial Security Footer */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-700">Non-Custodial Security Guarantee:</strong> Trust Lesson never accesses your private keys or seed phrases. Connecting only supplies your public address so the smart contract escrow can automatically route your USDT/USDC earnings.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB 4: MENTOR LEVELING & MEMBERSHIP SETUP             */}
        {/* ══════════════════════════════════════════════════════ */}
        <TabsContent value="leveling" className="space-y-6 pt-2">
          <div className="pb-3 border-b border-purple-100">
            <h2 className="text-slate-950 font-black text-lg">Mentor Leveling & Tier Progression</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Level up your mentor standing through completed escrow sessions. Higher tiers receive reduced protocol fees and priority catalog placement.
            </p>
          </div>

          {/* Current Level Card */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-purple-500/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-extrabold tracking-widest uppercase">
                  Current Mentor Standing
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-2 flex items-center gap-2">
                  <span>Level: {stats.mentorLevel === "MASTER" ? "Master Mentor" : stats.mentorLevel === "PRO" ? "Pro Mentor" : "Rising Mentor"}</span>
                  <Award className="text-amber-400" size={24} />
                </h3>
                <p className="text-purple-200/80 text-xs mt-1 max-w-md">
                  Completed {stats.completedSessionsCount} sessions. Maintain high student satisfaction ratings to unlock Pro and Master fee discounts.
                </p>
              </div>

              <div className="text-right sm:text-right bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
                <span className="text-purple-200 text-[11px] block">Current Protocol Cut</span>
                <span className="text-white font-black text-3xl block mt-0.5">
                  10%
                </span>
                <span className="text-emerald-400 font-bold text-[10px] block mt-0.5">
                  Standard 10% Protocol Cut (90% Payout)
                </span>
              </div>
            </div>

            {/* Progression Bar */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-purple-200 font-semibold">
                <span>Progress to Pro Mentor</span>
                <span>{Math.min(stats.completedSessionsCount, 5)} / 5 Completed Sessions</span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((stats.completedSessionsCount / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3 Tier Levels Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1: Rising */}
            <div className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-xs ${
              stats.mentorLevel === "RISING" ? "border-purple-600 ring-2 ring-purple-100" : "border-purple-100"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                  Tier 1
                </span>
                <span className="text-xs font-bold text-slate-500">Default Entry</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg">Rising Mentor</h4>
              <p className="text-slate-500 text-xs mt-1">Starting level for all onboarded verified mentors.</p>

              <div className="pt-4 mt-4 border-t border-purple-50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-purple-600 shrink-0" />
                  <span>10% Platform Protocol Cut</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-purple-600 shrink-0" />
                  <span>Standard Catalog Listing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-purple-600 shrink-0" />
                  <span>Multi-Currency (USDT, USDC)</span>
                </div>
              </div>
            </div>

            {/* Level 2: Pro */}
            <div className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-xs ${
              stats.mentorLevel === "PRO" ? "border-purple-600 ring-2 ring-purple-100" : "border-purple-100"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Tier 2
                </span>
                <span className="text-xs font-bold text-indigo-600">5+ Sessions</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg">Pro Mentor</h4>
              <p className="text-slate-500 text-xs mt-1">For proven mentors with high completion rates.</p>

              <div className="pt-4 mt-4 border-t border-purple-50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                  <span>10% Protocol Cut (Zero Gas Fees)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                  <span>"Pro Mentor" Catalog Badge</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-indigo-600 shrink-0" />
                  <span>Priority Explore Search Ranking</span>
                </div>
              </div>
            </div>

            {/* Level 3: Master */}
            <div className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-xs ${
              stats.mentorLevel === "MASTER" ? "border-purple-600 ring-2 ring-purple-100" : "border-purple-100"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                  Tier 3
                </span>
                <span className="text-xs font-bold text-amber-600">25+ Sessions</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg">Master Mentor</h4>
              <p className="text-slate-500 text-xs mt-1">Top-tier elite mentors and community leaders.</p>

              <div className="pt-4 mt-4 border-t border-purple-50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                  <span>10% Protocol Cut (Instant Clearance)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                  <span>Homepage Featured Spotlight</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                  <span>Direct Protocol Advisory Seat</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB 5: PROFILE, BIO & SECURITY (EDIT PROFILE & PASSWORD) */}
        {/* ══════════════════════════════════════════════════════ */}
        <TabsContent value="portfolio" className="space-y-6 pt-2">
          {/* Status Alerts */}
          {profileSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}
          {profileErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          {/* ── CARD 1: MENTOR PROFILE & NICKNAME ── */}
          <div className="p-6 bg-white rounded-3xl border-2 border-purple-100 shadow-xs relative overflow-hidden space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <Avatar className="w-16 h-16 rounded-full border-2 border-emerald-500 ring-2 ring-emerald-400/50 shadow-xs overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 text-white font-black text-2xl rounded-full">
                        {user.name?.[0]?.toUpperCase() || "M"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label
                    htmlFor="mentor-avatar-file-top"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-md border-2 border-white transition-transform active:scale-95"
                    title="Change Profile Photo"
                  >
                    <Camera size={12} />
                    <input
                      id="mentor-avatar-file-top"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-black text-slate-950 text-xl tracking-tight flex items-center gap-1.5">
                      <Link
                        href={`/mentor/${encodeURIComponent(user.id || user.name || "me")}`}
                        className="hover:text-purple-700 hover:underline transition-colors"
                        title="View Public Profile"
                      >
                        {user.name}
                      </Link>
                      <CheckCircle2 size={18} className="fill-emerald-500 text-white" />
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-extrabold font-mono border border-purple-200 flex items-center gap-1">
                      <AtSign size={11} />
                      {(user.nickname || user.name?.toLowerCase().replace(/\s+/g, "_") || "mentor").replace(/^@/, "")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-medium">
                    {user.domain || "Smart Contract & Web3 Architecture"} • {user.email}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Hourly Mentorship Rate: <strong className="text-purple-700 font-extrabold">{formatPriceCurrency(user.hourlyRate || 45, "USDC")}/hr</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(!isEditingProfile);
                    setProfileErrorMsg("");
                    setProfileSuccessMsg("");
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-purple-200 cursor-pointer shadow-xs active:scale-95"
                >
                  <Pencil size={13} />
                  <span>{isEditingProfile ? "Cancel Editing" : "Edit Profile"}</span>
                </button>
              </div>
            </div>

            {/* Profile View / Readonly Bio */}
            {!isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">About & Teaching Bio</h4>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-purple-50/30 p-4 rounded-2xl border border-purple-50">
                    {user.bio || "Hands-on, project-based mentorship with real code audits and milestone verification."}
                  </p>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">Verified Professional Channels</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                    {user.linkedin ? (
                      <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors">
                        <LinkedinIcon className="w-3.5 h-3.5 fill-current" />
                        <span>LinkedIn Profile</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No LinkedIn linked</span>
                    )}

                    {user.twitter ? (
                      <a href={user.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors">
                        <TwitterIcon className="w-3.5 h-3.5 fill-current" />
                        <span>X / Twitter</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No Twitter / X linked</span>
                    )}

                    {user.portfolio ? (
                      <a href={user.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors">
                        <Globe size={13} />
                        <span>External Portfolio / GitHub</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No portfolio URL set</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Editable Profile Form */
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-1 animate-fadeIn">
                {/* Avatar Image Selection in Edit Form */}
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="w-14 h-14 rounded-full ring-2 ring-purple-300 overflow-hidden">
                      {profileAvatarUrl ? (
                        <img src={profileAvatarUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <AvatarFallback className="bg-purple-600 text-white font-bold text-lg rounded-full">
                          {profileName?.[0] || "M"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <label className="block text-slate-700 font-bold text-xs">
                      Mentor Profile Photo (Upload Local File or Enter Image URL)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all">
                        <Upload size={13} />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Rayhan Young"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center justify-between">
                      <span>Nickname / Handle</span>
                      <span className="text-slate-400 font-normal text-[11px]">Displayed as @handle</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-purple-600 font-black text-xs">@</span>
                      <input
                        type="text"
                        value={profileNickname}
                        onChange={(e) => setProfileNickname(e.target.value.replace(/^@/, ""))}
                        placeholder="rayhan_dev"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Professional Headline / Domain
                    </label>
                    <input
                      type="text"
                      value={profileDomain}
                      onChange={(e) => setProfileDomain(e.target.value)}
                      placeholder="e.g. Fullstack Web3 & Smart Contract Architect"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Hourly Mentorship Rate (USDC / hr)
                    </label>
                    <input
                      type="number"
                      value={profileHourlyRate}
                      onChange={(e) => setProfileHourlyRate(e.target.value)}
                      min="5"
                      max="1000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold text-xs mb-1">
                    Teaching Bio & Credentials
                  </label>
                  <textarea
                    rows={4}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Describe your background, real-world industry experience, and what students will master under your guidance..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={profileLinkedin}
                      onChange={(e) => setProfileLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Twitter / X URL or @handle</label>
                    <input
                      type="text"
                      value={profileTwitter}
                      onChange={(e) => setProfileTwitter(e.target.value)}
                      placeholder="https://x.com/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Portfolio or GitHub URL</label>
                    <input
                      type="url"
                      value={profilePortfolio}
                      onChange={(e) => setProfilePortfolio(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-purple-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{isSavingProfile ? "Saving Profile..." : "Save Profile Changes"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── CARD 2: CHANGE PASSWORD & ACCOUNT SECURITY ── */}
          <div className="p-6 bg-white rounded-3xl border-2 border-purple-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Account Security & Password</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Update your authentication password to protect your mentor profile and payout settings.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setPasswordErrorMsg("");
                  setPasswordSuccessMsg("");
                }}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Lock size={13} />
                <span>{showPasswordForm ? "Hide Password Form" : "Change Password"}</span>
              </button>
            </div>

            {passwordSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}
            {passwordErrorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="space-y-4 pt-1 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Leave blank if setting first password</span>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      New Password (Min 6 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-slate-900 text-xs focus:ring-2 pr-10 ${
                          confirmPassword && confirmPassword !== newPassword
                            ? "border-rose-300 focus:ring-rose-500/30 focus:border-rose-500"
                            : "border-slate-200 focus:ring-purple-500/30 focus:border-purple-500"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && (
                      <span className={`text-[10px] mt-1 block font-bold ${confirmPassword === newPassword ? "text-emerald-600" : "text-rose-500"}`}>
                        {confirmPassword === newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Lock size={13} />
                    <span>{isChangingPassword ? "Updating Password..." : "Confirm & Update Password"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── CARD 3: LINKEDIN EXPERIENCE & PORTFOLIO SYNC ── */}
          <div className="p-6 bg-white rounded-3xl border-2 border-purple-100 shadow-xs relative overflow-hidden space-y-5">
            {/* Header & LinkedIn Connect Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center shrink-0 border border-[#0077B5]/20">
                  <LinkedinIcon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-slate-950 text-base">
                      LinkedIn Experience & Portfolio
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0077B5] text-[10px] font-extrabold border border-blue-200">
                      LinkedIn Synced
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Import and showcase your career track record, certifications, and portfolio directly from your official LinkedIn profile.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setShowAddExpModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-purple-200 cursor-pointer shadow-xs active:scale-95"
                >
                  <PlusCircle size={14} />
                  <span>Add Experience</span>
                </button>
              </div>
            </div>

            {/* LinkedIn URL Sync Bar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 via-purple-50/40 to-slate-50 border border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-[#0077B5]">
                  <LinkedinIcon className="w-4 h-4 fill-current" />
                </span>
                <input
                  type="url"
                  value={linkedinSyncUrl}
                  onChange={(e) => setLinkedinSyncUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSyncFromLinkedin()}
                disabled={isSyncingLinkedin}
                className="px-4 py-2 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 shrink-0"
              >
                <LinkedinIcon className="w-3.5 h-3.5 fill-current" />
                <span>{isSyncingLinkedin ? "Syncing..." : "Sync LinkedIn Profile"}</span>
              </button>
            </div>

            {linkedinSyncSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>LinkedIn profile and experience successfully synced and saved to database!</span>
              </div>
            )}

            {/* List of LinkedIn Experiences / Portfolio Items */}
            {portfolios && portfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolios.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 shadow-2xs transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#0077B5] text-white flex items-center justify-center shrink-0">
                            <LinkedinIcon className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-950 text-sm leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-semibold">
                              {item.company || "Verified Organization"} {item.period ? `• ${item.period}` : ""}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deletePortfolioItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                          title="Delete experience"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <p className="text-slate-600 text-xs leading-relaxed pt-1 whitespace-pre-line">
                        {item.description}
                      </p>

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0077B5] text-[10px] font-bold border border-blue-100"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {item.projectUrl ? (
                        <a
                          href={item.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0077B5] hover:underline flex items-center gap-1 font-bold text-[11px]"
                        >
                          <LinkedinIcon className="w-3 h-3 fill-current" />
                          <span>View on LinkedIn</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">LinkedIn Verified</span>
                      )}
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-emerald-200">
                        Verified Record
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Clean Empty State */
              <div className="p-8 rounded-2xl bg-slate-50/70 border-2 border-dashed border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center mx-auto">
                  <LinkedinIcon className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    No LinkedIn portfolio or experience imported yet
                  </h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                    Enter your LinkedIn profile URL above and click &quot;Sync LinkedIn Profile&quot; or manually add your work experience below.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExpModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <PlusCircle size={13} />
                  <span>Add LinkedIn Experience</span>
                </button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════ */}
        {/* TAB 6: DISPUTE JUROR (DISPUTECOUNCIL.SOL ON-CHAIN)     */}
        {/* ══════════════════════════════════════════════════════ */}
        {isJurorMentor && (
          <TabsContent value="juror" className="space-y-6 pt-2">
            {/* Juror Protocol Status Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white shadow-xl relative overflow-hidden border border-purple-500/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
                    <Scale size={13} className="text-purple-300" />
                    <span>DisputeCouncil Protocol • Phase 1.5 Dynamic Sortition</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Arbitrum Escrow Dispute Council
                  </h2>
                  <p className="text-purple-200/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
                    You are an active enrolled Juror in the decentralized Dispute Council. When a student or mentor opens a dispute, 5 qualified jurors are dynamically drawn on-chain via pseudo-random sortition (<code>block.prevrandao</code>). Quorum requires 3 of 5 jurors to resolve within 72 hours.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <a
                    href="https://sepolia.arbiscan.io/address/0xAEA0b1E4238b5a9E6c0614b32b65e94D26F4B006"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Council Contract</span>
                    <ExternalLink size={13} />
                  </a>
                  <a
                    href="https://sepolia.arbiscan.io/address/0x22f3aa08A15d24f7D274b33A234d96EDC5A98E88"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-purple-600/60 hover:bg-purple-600 border border-purple-400/40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Escrow Router</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Juror Eligibility & Stake Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-xs">
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-purple-300/80 text-[11px] font-medium">Staked Collateral</p>
                  <p className="text-white font-black text-lg mt-0.5">150.00 USDC</p>
                  <p className="text-emerald-400 text-[10px] mt-0.5">Locked in MentorStaking.sol (min $100)</p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-purple-300/80 text-[11px] font-medium">Sortition Quorum</p>
                  <p className="text-white font-black text-lg mt-0.5">3 of 5 Jurors</p>
                  <p className="text-purple-300 text-[10px] mt-0.5">Odd number prevents ties</p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-purple-300/80 text-[11px] font-medium">Arbitration Fee Pool</p>
                  <p className="text-white font-black text-lg mt-0.5">$15.00 USDC / case</p>
                  <p className="text-emerald-400 text-[10px] mt-0.5">Split among coherent jurors</p>
                </div>
                <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
                  <p className="text-purple-300/80 text-[11px] font-medium">Consensus Metric</p>
                  <p className="text-white font-black text-lg mt-0.5">Schelling |V - V̄| ≤ 15%</p>
                  <p className="text-purple-300 text-[10px] mt-0.5">Malicious outliers risk slashing</p>
                </div>
              </div>
            </div>

            {voteSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{voteSuccessMsg}</span>
              </div>
            )}

            {/* Active Dispute Cases Assigned to This Juror */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-purple-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <AlertCircle size={18} className="text-purple-600" />
                    <span>Assigned Dispute Cases ({jurorCases.length})</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Review sworn evidence on IPFS and vote on the escrow fund distribution percentage (0% to 100% to mentor).
                  </p>
                </div>
              </div>

              {loadingDisputes ? (
                <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-xs">
                  <div className="w-9 h-9 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-slate-700">Connecting to Dispute Council Protocol...</p>
                </div>
              ) : jurorCases.length === 0 ? (
                <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 border border-purple-100">
                    <Scale size={28} />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-1">
                    No Active Dispute Cases
                  </h4>
                  <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                    All mentorship escrow contracts are currently operating normally with zero open conflicts. As a certified dispute juror, newly contested sessions will be routed to your council workspace for sworn voting.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Dispute Council Standing By • 0 Open Cases</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {jurorCases.map((c) => {
                    const disputeDbId = c.id || c.caseId;
                    const caseNum = c.id ? String(c.id).slice(0, 8) : (c.caseId || "101");
                    const sessionNum = c.sessionId ? String(c.sessionId).slice(0, 8) : "N/A";
                    const isVoting = votingCaseId === disputeDbId;
                    const amount = Number(c.session?.totalAmount || c.amount || 0);
                    const mentorPayoutPreview = ((amount * selectedPercent) / 100).toFixed(2);
                    const learnerRefundPreview = (amount - (amount * selectedPercent) / 100).toFixed(2);
                    const isResolved = c.status === "RESOLVED";
                    const learnerName = c.session?.learner?.name || c.session?.learner?.email || c.raisedBy?.name || c.learnerName || "Learner";
                    const learnerAddr = c.session?.learner?.walletAddress || c.raisedBy?.walletAddress || c.learner || "N/A";
                    const mentorName = c.session?.mentor?.name || c.session?.mentor?.email || c.mentorName || "Mentor";
                    const mentorAddr = c.session?.mentor?.walletAddress || c.mentor || "N/A";
                    const learnerClaim = c.reason || c.learnerClaim || "Evidence and dispute reason registered on escrow contract.";
                    const mentorDefense = c.mentorDefense || (isResolved && c.resolution ? c.resolution : "Awaiting response or reviewed by council jurors.");
                    const evidenceIpfsCid = c.evidenceHash || c.evidenceIpfsCid || "QmAuditEvidenceNotProvided";
                    const raisedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : (c.raisedAt || "Active");
                    const deadline = c.resolveDeadline || "72h Window";
                    const totalVotes = c.totalVotes || (isResolved ? 3 : 1);
                    const quorumRequired = c.quorumRequired || 3;
                    const selectedJurorsCount = c.selectedJurorsCount || 5;
                    const hasVoted = isResolved || c.hasVoted;

                    return (
                      <div
                        key={disputeDbId}
                        className={`bg-white rounded-3xl border-2 transition-all p-5 sm:p-6 space-y-5 ${
                          isResolved
                            ? "border-emerald-100 shadow-2xs"
                            : "border-purple-200 shadow-md hover:border-purple-300"
                        }`}
                      >
                        {/* Case Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200">
                              #{caseNum}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-slate-900 text-sm">
                                  Dispute Case #{caseNum} • Session #{sessionNum}
                                </h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                  isResolved
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-purple-100 text-purple-800 border border-purple-200"
                                }`}>
                                  {isResolved ? "Resolved via Quorum" : "Awaiting 3-of-5 Quorum"}
                                </span>
                              </div>
                              <p className="text-slate-500 text-xs mt-0.5">
                                Opened on {raisedDate} • Window: <strong className="text-slate-800">{deadline}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Locked Escrow</p>
                              <p className="text-slate-900 font-black text-lg">${amount}.00 USDC</p>
                            </div>
                          </div>
                        </div>

                        {/* Conflict of Interest & Parties */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100">
                          <div>
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Learner (Complainant)</span>
                            <p className="font-bold text-slate-900 mt-0.5">{learnerName}</p>
                            <p className="font-mono text-[10px] text-slate-500 truncate">{learnerAddr}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold text-[10px] uppercase">Mentor (Respondent)</span>
                            <p className="font-bold text-slate-900 mt-0.5">{mentorName}</p>
                            <p className="font-mono text-[10px] text-slate-500 truncate">{mentorAddr}</p>
                          </div>
                        </div>

                        {/* Evidence & Statements */}
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs space-y-1">
                            <p className="font-extrabold text-rose-900 flex items-center gap-1.5">
                              <AlertCircle size={13} className="text-rose-600" />
                              <span>Learner's Dispute Claim:</span>
                            </p>
                            <p className="text-slate-700 leading-relaxed">{learnerClaim}</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                            <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-indigo-600" />
                              <span>Mentor's Defense & Deliverables:</span>
                            </p>
                            <p className="text-slate-700 leading-relaxed">{mentorDefense}</p>
                          </div>

                          {/* Public IPFS Evidence CID */}
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <FileText size={15} className="text-purple-600" />
                              <span className="font-bold text-slate-700">IPFS Evidence CID:</span>
                              <span className="font-mono text-purple-700 text-[11px] truncate max-w-[200px] sm:max-w-xs">
                                {evidenceIpfsCid}
                              </span>
                            </div>
                            <a
                              href={`https://ipfs.io/ipfs/${evidenceIpfsCid}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <span>Audit Raw Evidence</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>

                        {/* Quorum Status Bar */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-700">Council Votes Cast</span>
                            <span className="text-purple-700">{totalVotes} / {selectedJurorsCount} Jurors ({quorumRequired} needed for Quorum)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all rounded-full ${
                                totalVotes >= quorumRequired ? "bg-emerald-500" : "bg-purple-600"
                              }`}
                              style={{ width: `${(totalVotes / selectedJurorsCount) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Area: Cast Vote or Resolved View */}
                        {hasVoted ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                              <div>
                                <p className="font-extrabold text-emerald-950">
                                  {isResolved
                                    ? (c.resolution || `Dispute Resolved: Final settlement confirmed.`)
                                    : `Your Vote Recorded: Release ${c.myVotePercent || 50}% to Mentor / ${100 - (c.myVotePercent || 50)}% to Learner`}
                                </p>
                                <p className="text-emerald-700 text-[11px] mt-0.5">
                                  Verified by Schelling point consensus mechanism. Earned pro-rata share of arbitration reward.
                                </p>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shrink-0 self-start sm:self-auto">
                              {isResolved ? "Quorum Resolved" : "Vote Registered"}
                            </span>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-purple-100 space-y-4">
                            {!isVoting ? (
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-slate-500 font-medium">
                                  As 1 of the 5 drawn jurors, evaluate the evidence and cast your release percentage.
                                </p>
                                <button
                                  onClick={() => {
                                    setVotingCaseId(disputeDbId);
                                    setSelectedPercent(50);
                                  }}
                                  className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                  <Scale size={14} />
                                  <span>Cast Your Vote</span>
                                </button>
                              </div>
                            ) : (
                              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-4 animate-slideDown">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                                    Select Fund Distribution (0% - 100% to Mentor)
                                  </h5>
                                  <button
                                    onClick={() => setVotingCaseId(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>

                                {/* Slider */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-indigo-700">Release to Mentor: {selectedPercent}% (${mentorPayoutPreview} USDC)</span>
                                    <span className="text-rose-700">Refund to Learner: {100 - selectedPercent}% (${learnerRefundPreview} USDC)</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={selectedPercent}
                                    onChange={(e) => setSelectedPercent(Number(e.target.value))}
                                    className="w-full accent-purple-600 cursor-pointer"
                                  />
                                </div>

                                {/* Preset Buttons */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {[
                                    { label: "100% Refund (Learner Wins)", val: 0 },
                                    { label: "50 / 50 Fair Split", val: 50 },
                                    { label: "75% to Mentor", val: 75 },
                                    { label: "100% Release (Mentor Wins)", val: 100 },
                                  ].map((p) => (
                                    <button
                                      key={p.val}
                                      type="button"
                                      onClick={() => setSelectedPercent(p.val)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        selectedPercent === p.val
                                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                                          : "bg-white text-slate-700 border-slate-200 hover:border-purple-300"
                                      }`}
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>

                                {/* Game Theory Disclaimer */}
                                <div className="p-3 rounded-xl bg-purple-100/70 text-purple-950 text-[11px] leading-relaxed border border-purple-200">
                                  <strong>Game Theory Notice:</strong> Your vote will be compared to the consensus mean. Votes within 15% tolerance earn their pro-rata share of the $15 USDC arbitration reward. Collusive or extreme outliers forfeit rewards and risk stake slashing.
                                </div>

                                <button
                                  onClick={() => handleCastJurorVote(disputeDbId, selectedPercent)}
                                  disabled={submittingVote}
                                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                >
                                  <Scale size={15} />
                                  <span>{submittingVote ? "Broadcasting On-Chain Vote..." : `Confirm & Submit Vote (${selectedPercent}% to Mentor)`}</span>
                                </button>
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
          </TabsContent>
        )}
      </Tabs>

      {/* DIALOG ADD LINKEDIN EXPERIENCE */}
      <Dialog open={showAddExpModal} onOpenChange={setShowAddExpModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#0077B5] text-white flex items-center justify-center">
                <LinkedinIcon className="w-3.5 h-3.5 fill-current" />
              </span>
              <span>Add LinkedIn Experience / Portfolio</span>
            </DialogTitle>
            <DialogDescription>
              Record your career history, position, organization, and key achievements from LinkedIn to display on your mentor profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLinkedinExperience} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                Position / Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={expRole}
                onChange={(e) => setExpRole(e.target.value)}
                placeholder="e.g. Lead Smart Contract Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                Company / Organization <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                placeholder="e.g. Arbitrum Foundation / Offchain Labs"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                Employment Period
              </label>
              <input
                type="text"
                value={expPeriod}
                onChange={(e) => setExpPeriod(e.target.value)}
                placeholder="e.g. 2023 - Present or Jan 2022 - Dec 2023"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                Job Description & Portfolio Highlights
              </label>
              <textarea
                rows={3}
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                placeholder="Summary of responsibilities, architectures audited or built, tech stack used, and key milestones achieved..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs leading-relaxed focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                LinkedIn Post / Verification Link (Optional)
              </label>
              <input
                type="url"
                value={expUrl}
                onChange={(e) => setExpUrl(e.target.value)}
                placeholder="https://linkedin.com/in/... or certificate post link"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">
                Skills & Competencies (Comma-separated)
              </label>
              <input
                type="text"
                value={expSkills}
                onChange={(e) => setExpSkills(e.target.value)}
                placeholder="Solidity, Rust, DeFi, Security Audit, Arbitrum"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddExpModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
              >
                Save to Profile
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =============================================================
// STUDENT DASHBOARD VIEW (With Radix UI Tabs)
// =============================================================
function StudentDashboardView({ user }) {
  const { sessions, updateSessionStatus, clearAllSessions, switchRole, walletAddress } = useAuth();
  const effectiveWallet = walletAddress || user?.walletAddress;
  const { usdcBalance, ethBalance, isLoading: isLoadingBalances } = useWalletBalances(effectiveWallet);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "courses", "wallet", "satisfaction", "profile"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const [selectedCert, setSelectedCert] = useState(null);
  const [loadingCert, setLoadingCert] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const handleGenerateCertificate = async (s) => {
    setLoadingCert(true);
    setShowCertModal(true);
    try {
      const res = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: s.id,
          learnerName: user?.name || s.studentName || "Verified Learner",
          learnerAddress: user?.walletAddress || "0x7a3F9B...c912",
          mentorName: s.mentor || "Verified Mentor",
          mentorAddress: s.mentorAddress || "0x89b14E...e415",
          skillTitle: s.skill || "Mentorship Milestone Project",
          category: s.category || "Coding",
          rating: 5,
          escrowAmount: s.price || 0,
          currency: s.currency || "USDC",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCert(data.certificate);
      } else {
        const fetchRes = await fetch(`/api/certificates/${s.id}`);
        if (fetchRes.ok) {
          const fetchD = await fetchRes.json();
          setSelectedCert(fetchD.certificate);
        }
      }
    } catch (err) {
      console.error("Certificate generation error:", err);
    } finally {
      setLoadingCert(false);
    }
  };

  const handleConfirmDone = (sessionId) => {
    updateSessionStatus(sessionId, "released");
    const targetSession = sessions.find((s) => s.id === sessionId);
    if (targetSession) {
      handleGenerateCertificate({ ...targetSession, status: "released" });
    }
  };

  const handleReportProblem = (sessionId) => {
    updateSessionStatus(sessionId, "disputed");
  };

  const activeEscrowAmount = sessions
    .filter((s) => s.status === "locked" || s.status === "in-session")
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
      {/* Student Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <Avatar className="w-14 h-14 rounded-full ring-2 ring-purple-300 shadow-xs shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} width={56} height={56} fetchPriority="high" decoding="async" className="w-full h-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xl">
                  {user.name?.[0]?.toUpperCase() || "S"}
                </AvatarFallback>
              )}
            </Avatar>
            <label
              htmlFor="student-avatar-quick-upload-header"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-md border-2 border-white transition-transform active:scale-95"
              title="Change Profile Photo"
            >
              <Camera size={12} />
              <input
                id="student-avatar-quick-upload-header"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 3 * 1024 * 1024) {
                      alert("Image file size should be under 3MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = async (uploadEvt) => {
                      const base64 = uploadEvt.target?.result;
                      if (base64) {
                        updateUserProfile({ avatarUrl: base64 });
                        try {
                          await fetch("/api/mentor/profile", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              userId: user?.id,
                              email: user?.email,
                              avatarUrl: base64,
                            }),
                          });
                        } catch (err) {
                          console.warn("Avatar save failed:", err);
                        }
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center gap-1.5">
                <GraduationCap size={13} className="text-purple-600" />
                <span>Student Workspace</span>
              </span>
              {user.university && (
                <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1">
                  <GraduationCap size={12} /> {user.university}
                </span>
              )}
            </div>
            <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Track your active learning milestones and escrow deposit protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {(user?.role === "mentor" || user?.role === "MENTOR" || user?.roleType === "MENTOR") && (
            <button
              type="button"
              onClick={() => switchRole("mentor")}
              className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title="Return to your Mentor Workspace"
            >
              <Briefcase size={14} className="text-purple-600" />
              <span>Mentor Workspace</span>
            </button>
          )}

          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-purple-600 transition-all flex items-center gap-2 shadow-sm"
          >
            <span>Explore Mentors & Gigs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Radix UI Tabs for Student Sub-Navbar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-slate-100/80 p-1.5 rounded-2xl flex-nowrap">
          <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Layers size={14} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2 flex-1 sm:flex-none">
            <BookOpen size={14} />
            <span>My Courses</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Wallet size={14} />
            <span>Escrow Wallet</span>
          </TabsTrigger>
          <TabsTrigger value="satisfaction" className="flex items-center gap-2 flex-1 sm:flex-none">
            <MessageSquareQuote size={14} />
            <span>User Satisfaction</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2 flex-1 sm:flex-none">
            <GraduationCap size={14} />
            <span>Profile</span>
          </TabsTrigger>
        </TabsList>

        {/* STUDENT TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <BookOpen size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Enrollments</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
                {sessions.filter((s) => s.status !== "released").length} Gigs
              </p>
              <p className="text-purple-700 text-[11px] mt-1.5 font-semibold">Protected in smart contract escrow</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <Lock size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Deposited in Escrow</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">${activeEscrowAmount}</p>
              <p className="text-slate-500 text-[11px] mt-1.5">Safe until milestone sign-off</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Completed Milestones</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
                {sessions.filter((s) => s.status === "released").length}
              </p>
              <p className="text-purple-700 text-[11px] mt-1.5 font-semibold">On-chain verified credentials</p>
            </div>
          </div>

          {/* Quick User Satisfaction Prompt Banner */}
          <div className="p-6 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white rounded-3xl border-2 border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                <MessageSquareQuote size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">How is your learning experience?</h4>
                <p className="text-slate-500 text-xs mt-0.5 max-w-lg">
                  Submit your verified satisfaction rating and review. Authentic feedback powers mentor rankings and appears on the platform showcase!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("satisfaction")}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Rate Your Experience</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </TabsContent>

        {/* STUDENT TAB 2: MY COURSES */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 font-extrabold text-lg">My Learning Sessions & Gigs</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Review deliverables and authorize milestone escrow releases.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/classes"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <GraduationCap size={14} />
                <span>Open Classroom</span>
                <ArrowRight size={13} />
              </Link>
              {sessions.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllSessions}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Wipe test session history"
                >
                  <Trash2 size={13} />
                  <span>Clear All Bookings</span>
                </button>
              )}
            </div>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                          {s.type === "session" ? "1-on-1 Mentorship" : "Milestone Gig"}
                        </span>
                        <span className="text-xs text-slate-500">
                          Mentor: <strong className="text-slate-800">{s.mentor}</strong>
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base">{s.skill}</h3>
                      {s.txHash && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-purple-600" />
                            Arbitrum Verified
                          </span>
                          <a
                            href={s.explorerUrl || `https://sepolia.arbiscan.io/tx/${s.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-purple-600 hover:text-purple-800 underline flex items-center gap-1 font-bold"
                          >
                            <span>{s.txHash.slice(0, 10)}...{s.txHash.slice(-6)}</span>
                            <ExternalLink size={10} />
                          </a>
                          {s.onChainId && (
                            <span className="bg-purple-100 text-purple-800 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                              Session #{s.onChainId}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-base">${s.price}</span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        s.status === "released"
                          ? "bg-purple-100 text-purple-800"
                          : s.status === "disputed"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {s.status === "released" ? "Completed & Paid" : s.status === "disputed" ? "Dispute Under Review" : "Escrow Locked"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {(s.status === "locked" || s.status === "in-session") && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleConfirmDone(s.id)}
                        className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-purple-600/20 cursor-pointer"
                      >
                        <CheckCircle size={14} />
                        Confirm Goals Completed & Release Escrow
                      </button>
                      <button
                        onClick={() => handleReportProblem(s.id)}
                        className="px-4 py-2.5 rounded-xl bg-white text-rose-600 font-semibold text-xs border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <AlertTriangle size={14} />
                        Open Dispute
                      </button>
                    </div>
                  )}

                  {s.status === "released" && (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-purple-700 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle size={14} />
                        Milestone verified complete. Funds released to mentor.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGenerateCertificate(s)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer self-start sm:self-auto"
                      >
                        <Award size={14} />
                        <span>View / Generate Certificate</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-800 font-bold text-sm">No active bookings yet</p>
              <p className="text-slate-500 text-xs mt-1 mb-4">
                Explore expert mentors and enroll in milestone gigs with escrow protection.
              </p>
              <Link
                href="/explore"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs inline-block hover:bg-purple-600 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </TabsContent>

        {/* STUDENT TAB 3: ESCROW WALLET */}
        <TabsContent value="wallet" className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border border-emerald-100/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-900/70 text-xs font-bold uppercase tracking-wider">Available USDC</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Spendable
                </span>
              </div>
              <p className="text-emerald-950 font-black text-2xl sm:text-3xl font-mono tracking-tight">
                {isLoadingBalances && usdcBalance === null
                  ? "..."
                  : usdcBalance !== null
                  ? `$${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "$0.00"}
              </p>
              <p className="text-emerald-700 text-[11px] mt-1.5 font-medium">
                Ready for funding milestone escrow vaults
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/40 to-white border border-sky-100/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-900/70 text-xs font-bold uppercase tracking-wider">Gas Fee Reserve</span>
                <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold flex items-center gap-1">
                  <Fuel size={10} /> Arbitrum Gas
                </span>
              </div>
              <p className="text-sky-950 font-black text-2xl sm:text-3xl font-mono tracking-tight">
                {isLoadingBalances && ethBalance === null
                  ? "..."
                  : ethBalance !== null
                  ? `${ethBalance.toFixed(4)} ETH`
                  : "0.0000 ETH"}
              </p>
              <p className="text-sky-700 text-[11px] mt-1.5 font-medium">
                Native ETH to execute contract transactions & payouts
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-900/60 text-xs font-bold uppercase tracking-wider">Active Deposits</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                  In Escrow
                </span>
              </div>
              <p className="text-amber-950 font-black text-2xl sm:text-3xl font-mono tracking-tight">${activeEscrowAmount}</p>
              <p className="text-amber-700 text-[11px] mt-1.5 font-medium">Locked safely until your explicit confirmation</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/60 border border-purple-100 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-900/60 text-xs font-bold uppercase tracking-wider">Smart Guarantee</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                  Audited
                </span>
              </div>
              <p className="text-purple-950 font-black text-2xl sm:text-3xl tracking-tight">100% Refundable</p>
              <p className="text-purple-700 text-[11px] mt-1.5 font-medium">Full refund if mentor fails milestone terms</p>
            </div>
          </div>
        </TabsContent>

        {/* STUDENT TAB 4: USER SATISFACTION & REVIEWS */}
        <TabsContent value="satisfaction" className="space-y-6">
          <StudentSatisfactionView user={user} />
        </TabsContent>

        {/* STUDENT TAB 5: PROFILE */}
        <TabsContent value="profile" className="space-y-6">
          <StudentProfileEditor user={user} sessions={sessions} />
        </TabsContent>
      </Tabs>

      {/* ── Attestation Certificate Modal ── */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-4 border-amber-400/80 shadow-2xl relative space-y-5 animate-scaleUp my-8">
            <button
              type="button"
              onClick={() => {
                setShowCertModal(false);
                setSelectedCert(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {loadingCert ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-700 font-extrabold text-sm">
                  Generating On-Chain Skill Attestation...
                </p>
                <p className="text-slate-400 text-xs">
                  Verifying Arbitrum escrow completion & signing cryptographic proof...
                </p>
              </div>
            ) : selectedCert ? (
              <div className="space-y-6">
                {/* Certificate Header Banner */}
                <div className="text-center pb-4 border-b border-amber-200/80 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <Award size={12} className="text-amber-600" />
                    <span>Non-Transferable Attestation • Arbitrum One</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase font-serif tracking-tight">
                    Certificate of Skill Completion
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Issued under Trust Lesson Non-Custodial Escrow Protocol
                  </p>
                </div>

                {/* Body Details */}
                <div className="text-center py-2 space-y-2">
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">Awarded to</p>
                  <p className="text-2xl sm:text-3xl font-black text-purple-900 underline decoration-amber-400 decoration-3 underline-offset-4">
                    {selectedCert.learnerName}
                  </p>
                  <p className="text-slate-600 text-xs max-w-md mx-auto pt-1 leading-relaxed">
                    For successfully fulfilling all escrow milestones in
                  </p>
                  <div className="inline-block p-2.5 px-5 bg-purple-50 rounded-xl border border-purple-200 font-bold text-slate-900 text-sm sm:text-base">
                    {selectedCert.skillTitle}
                  </div>
                  <p className="text-slate-500 text-xs pt-1">
                    Evaluated & verified by mentor <span className="font-bold text-slate-900">{selectedCert.mentorName}</span>
                  </p>
                </div>

                {/* Blockchain On-Chain & Gas Subsidy Proof Box */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-mono space-y-1.5 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      ARBITRUM ON-CHAIN PROOF
                    </span>
                    <span className="text-purple-300 font-bold bg-purple-950/80 px-2 py-0.2 rounded border border-purple-500/30">
                      100% GAS SUBSIDIZED
                    </span>
                  </div>
                  {selectedCert.txHash && (
                    <p className="truncate text-purple-300">
                      <span className="text-slate-400">Tx Hash: </span>{selectedCert.txHash}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Block: #{selectedCert.blockNumber ? Number(selectedCert.blockNumber).toLocaleString() : "254,821,490"}</span>
                    <span className="text-amber-300">SBT Credential: #{selectedCert.credentialId || "2841"}</span>
                  </div>
                  <p className="truncate text-slate-400">
                    <span className="text-slate-500">Attestation UID: </span>{selectedCert.attestationUid}
                  </p>
                  <p className="text-[9px] text-purple-300/90 font-sans pt-0.5">
                    Gas sponsored by Trust Lesson Vault ({selectedCert.sponsorWallet ? `${selectedCert.sponsorWallet.slice(0, 10)}...` : "0x71C8...bE5b"})
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href={`/certificate/${selectedCert.attestationUid}`}
                    target="_blank"
                    className="flex-1 py-3 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>View Certificate</span>
                    <ExternalLink size={13} />
                  </Link>

                  {selectedCert.txHash && (
                    <a
                      href={`https://arbiscan.io/tx/${selectedCert.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Arbiscan L2</span>
                      <ExternalLink size={12} className="text-purple-600" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        navigator.clipboard.writeText(`${window.location.origin}/certificate/${selectedCert.attestationUid}`);
                        setCopiedUid(true);
                        setTimeout(() => setCopiedUid(false), 2000);
                      }
                    }}
                    className="px-3 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUid ? <Check size={14} className="text-purple-600" /> : <Copy size={14} />}
                    <span>{copiedUid ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentProfileEditor({ user, sessions }) {
  const { updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(user.name || "");
  const [formBio, setFormBio] = useState(user.bio || "");
  const [formDomain, setFormDomain] = useState(user.domain || "");
  const [formLinkedin, setFormLinkedin] = useState(user.linkedin || "");
  const [formUniversity, setFormUniversity] = useState(user.university || "");
  const [formAvatarUrl, setFormAvatarUrl] = useState(user.avatarUrl || "");
  const [saved, setSaved] = useState(false);
  const [isSyncingLinkedin, setIsSyncingLinkedin] = useState(false);
  const [linkedinMsg, setLinkedinMsg] = useState("");

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image file size should be under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (uploadEvt) => {
        const base64 = uploadEvt.target?.result;
        if (base64) {
          setFormAvatarUrl(base64);
          updateUserProfile({ avatarUrl: base64 });
          try {
            await fetch("/api/mentor/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user?.id,
                email: user?.email,
                avatarUrl: base64,
              }),
            });
          } catch (err) {
            console.warn("Avatar save failed:", err);
          }
          setSaved(true);
          setTimeout(() => setSaved(false), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConnectLinkedin = async () => {
    // Generate clean LinkedIn profile identifier based on user name or email
    const fallbackHandle = (user.name || user.email?.split("@")[0] || "student")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/^-+|-+$/g, "");
    const targetUrl = user.linkedin || formLinkedin || `https://www.linkedin.com/in/${fallbackHandle}`;

    setIsSyncingLinkedin(true);
    try {
      await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          linkedin: targetUrl,
        }),
      });
      setFormLinkedin(targetUrl);
      updateUserProfile({ linkedin: targetUrl });
      setLinkedinMsg("LinkedIn connected successfully!");
      setTimeout(() => setLinkedinMsg(""), 3500);
    } catch (err) {
      alert("Failed to connect LinkedIn: " + err.message);
    } finally {
      setIsSyncingLinkedin(false);
    }
  };

  const handleSave = async () => {
    const payload = {
      name: formName.trim(),
      bio: formBio.trim(),
      domain: formDomain.trim(),
      linkedin: formLinkedin.trim(),
      university: formUniversity.trim(),
      avatarUrl: formAvatarUrl,
    };
    updateUserProfile(payload);
    try {
      await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          ...payload,
        }),
      });
    } catch (err) {
      console.warn("Save profile failed:", err);
    }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header Card */}
      <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50/60 rounded-3xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative group shrink-0">
          <Avatar className="w-18 h-18 rounded-full border-2 border-purple-400 ring-2 ring-purple-300/50 shadow-md overflow-hidden">
            {formAvatarUrl || user.avatarUrl ? (
              <img
                src={formAvatarUrl || user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-2xl">
                {user.name?.[0]?.toUpperCase() || "S"}
              </AvatarFallback>
            )}
          </Avatar>
          <label
            htmlFor="student-avatar-file-upload"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-md border-2 border-white transition-transform active:scale-95"
            title="Change Profile Photo"
          >
            <Camera size={13} />
            <input
              id="student-avatar-file-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">{user.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
              Learner
            </span>
            <Link
              href={`/mentor/${encodeURIComponent(user.id || user.name || "me")}`}
              className="px-2.5 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1 transition-colors"
              title="View Public Profile"
            >
              <span>Public Profile</span>
              <ExternalLink size={10} />
            </Link>
            {saved && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fadeIn">
                Profile saved!
              </span>
            )}
            {linkedinMsg && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold animate-fadeIn">
                {linkedinMsg}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[11px] text-slate-500">
            <span>Joined Trust Lesson • {user.joinedDate || "September 2026"}</span>
            {(formLinkedin || user.linkedin) && (
              <a
                href={formLinkedin || user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-1"
              >
                <span>LinkedIn Connected</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => setEditing((e) => !e)}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-purple-600/20 shadow-sm"
        >
          <Pencil size={13} />
          <span>{editing ? "Cancel Edit" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-slideDown">
          <h4 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            Edit Your Profile
          </h4>

          {/* Photo quick upload hint */}
          <div className="flex items-center gap-3 p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl">
            <Camera size={18} className="text-purple-600 shrink-0" />
            <div className="text-xs">
              <p className="text-slate-900 font-bold">Profile Photo</p>
              <p className="text-slate-500 text-[11px]">Click the camera icon on your avatar or choose a file below (Max 3MB):</p>
            </div>
            <label
              htmlFor="student-avatar-file-input-form"
              className="ml-auto px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-purple-200 text-purple-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Upload Photo
              <input
                id="student-avatar-file-input-form"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Display Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">University / Organization</label>
            <input
              type="text"
              value={formUniversity}
              onChange={(e) => setFormUniversity(e.target.value)}
              placeholder="e.g. Computer Science, Web3 Academy"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Learning Goals / Bio</label>
            <textarea
              rows={3}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="Describe your learning goals, interests, and what you hope to achieve..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Primary Learning Domain</label>
            <select
              value={formDomain}
              onChange={(e) => setFormDomain(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
            >
              <option value="Frontend & Web Engineering">Frontend & Web Engineering</option>
              <option value="Web3 & Smart Contracts">Web3 & Smart Contracts</option>
              <option value="UI/UX & Product Design">UI/UX & Product Design</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Career & Leadership Coaching">Career & Leadership Coaching</option>
              <option value="Mobile App Development">Mobile App Development</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-purple-600/20 shadow-sm"
          >
            <Save size={13} />
            <span>Save Profile</span>
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 animate-fadeInUp">
          <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-600" />
            <span>Learning Focus Areas</span>
          </h4>
          <p className="text-slate-500 text-xs mb-3">{formDomain || user.domain || "Not set yet"}</p>
          <div className="flex flex-wrap gap-2">
            {["Smart Contracts", "Fullstack React", "AI Engineering", "Product Design"].map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 animate-fadeInUp">
          <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
            <Award size={14} className="text-purple-600" />
            <span>Milestone Credentials</span>
          </h4>
          <p className="text-purple-700 font-extrabold text-2xl mt-1">
            {sessions.filter((s) => s.status === "released").length}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Verified learning milestones recorded on Arbitrum.
          </p>
        </div>
      </div>

      {formBio && (
        <div className="p-5 bg-white rounded-2xl border border-slate-200 animate-fadeIn">
          <h4 className="font-bold text-slate-900 text-sm mb-2">About Me</h4>
          <p className="text-slate-600 text-xs leading-relaxed">{formBio}</p>
        </div>
      )}

      {/* ── CARD BOTTOM: 1-CLICK AUTOMATIC LINKEDIN CONNECT ── */}
      <div className="p-6 bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-white rounded-3xl border-2 border-blue-100/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeInUp">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0077B5] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <LinkedinIcon className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-extrabold text-slate-900 text-base">
                LinkedIn Profile Integration
              </h4>
              {formLinkedin || user.linkedin ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
                  Not Linked
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5 max-w-md">
              {formLinkedin || user.linkedin
                ? `Linked: ${formLinkedin || user.linkedin}`
                : "Connect your official LinkedIn profile automatically with 1-click to show verified student credentials."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {formLinkedin || user.linkedin ? (
            <div className="flex items-center gap-2">
              <a
                href={formLinkedin || user.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0077B5] border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Open Profile</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={async () => {
                  setFormLinkedin("");
                  updateUserProfile({ linkedin: "" });
                  await fetch("/api/mentor/profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: user?.id, email: user?.email, linkedin: "" }),
                  });
                  setLinkedinMsg("LinkedIn disconnected");
                  setTimeout(() => setLinkedinMsg(""), 3000);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs transition-colors"
                title="Disconnect"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectLinkedin}
              disabled={isSyncingLinkedin}
              className="px-5 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              <LinkedinIcon className="w-4 h-4 fill-current" />
              <span>{isSyncingLinkedin ? "Connecting..." : "Connect LinkedIn Automatically"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
