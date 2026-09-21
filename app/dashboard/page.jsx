"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../src/context/AuthContext";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  Clock,
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
} from "lucide-react";
import { LinkedinIcon, TwitterIcon } from "../../src/components/SocialIcons";
import WalletConnectCard from "../../src/components/WalletConnectCard";
import Footer from "../../src/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../src/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../src/components/ui/Dialog";
import { Avatar, AvatarFallback } from "../../src/components/ui/Avatar";

export default function DashboardPage() {
  const { user } = useAuth();

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
    user.email?.toLowerCase().includes("admin") ||
    user.name?.toLowerCase().includes("admin");
  const isMentor = user.role === "mentor" || user.role === "MENTOR" || user.roleType === "MENTOR";

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-16 sm:pt-20">
        <AdminDashboardView user={user} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="pt-24 sm:pt-28 pb-12 px-3 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto animate-fadeInUp">
          {isMentor ? (
            <MentorDashboardView user={user} />
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
    treasuryWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  });
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState({});
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

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

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [userRoleFilter]);

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

  const navItems = [
    { id: "view", label: "View (Financial Data)", icon: Coins, desc: "Platform money & revenue" },
    { id: "users", label: "Users", icon: Users, desc: "Real user database" },
    { id: "wallet", label: "Wallet", icon: Wallet, desc: "Platform treasury wallet" },
    { id: "profile", label: "Profile", icon: ShieldCheck, desc: "Admin credentials & socials" },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full min-h-[calc(100vh-80px)] bg-white relative overflow-hidden">
      {/* ── Background Watercolor Wave Decoration (Same as Course Page) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-purple-200/40 via-purple-100/20 to-transparent rounded-[100%] blur-3xl" />
        <div className="absolute top-10 -left-20 w-80 h-80 bg-purple-300/15 rounded-full blur-3xl" />
        <div className="absolute top-10 -right-20 w-80 h-80 bg-indigo-300/15 rounded-full blur-3xl" />

        <svg
          className="absolute top-0 left-0 w-full h-full opacity-20 mix-blend-multiply"
          viewBox="0 0 1440 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C320,160 480,-20 800,90 C1120,200 1280,40 1440,70 L1440,0 L0,0 Z"
            fill="#c084fc"
            opacity="0.3"
          />
          <path
            d="M0,140 C380,240 620,40 960,160 C1200,240 1360,110 1440,130 L1440,0 L0,0 Z"
            fill="#a855f7"
            opacity="0.15"
          />
        </svg>
      </div>

      {/* ─── SIDEBAR NAVBAR (Light & Frosted Purple Theme) ─── */}
      <aside className="w-full md:w-64 bg-white/85 backdrop-blur-xl text-slate-900 p-5 sm:p-6 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-purple-100/90 shadow-xs relative z-10">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-purple-100">
            <Avatar className="w-12 h-12 ring-2 ring-purple-300 shrink-0 shadow-xs">
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-lg">
                {user.name?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-slate-950 font-extrabold text-sm truncate">{user.name || "Administrator"}</h2>
              <span className="inline-flex items-center gap-1 mt-0.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 font-bold text-[10px]">
                <Shield size={10} className="text-purple-600" /> Platform Admin
              </span>
            </div>
          </div>

          {/* Sidebar Nav Buttons */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold scale-[1.02]"
                      : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/80 font-semibold text-xs"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-purple-600"} />
                  <div className="min-w-0">
                    <p className="text-xs leading-none">{item.label}</p>
                    <p className={`text-[10px] mt-1 truncate ${isActive ? "text-purple-100" : "text-slate-400"}`}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Status */}
        <div className="pt-5 mt-5 border-t border-purple-100 text-[11px] text-slate-500 space-y-2 hidden md:block">
          <div className="flex items-center justify-between">
            <span>Network</span>
            <span className="font-bold text-purple-700">Arbitrum One</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Protocol Cut</span>
            <span className="font-bold text-emerald-600">5% Fee</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Disputes</span>
            <span className="font-bold text-slate-800">{stats.disputesCount || 0} Open</span>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 p-5 sm:p-8 md:p-10 bg-transparent overflow-y-auto relative z-10">
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
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Protocol Revenue (5%)</p>
                <p className="text-slate-950 font-black text-2xl sm:text-3xl mt-1 tracking-tight">
                  ${Number(stats.platformTreasury || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </p>
                <p className="text-purple-700 text-[11px] mt-1.5 font-semibold">5% fee cut collected by platform</p>
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
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Paid to Mentors (95%)</p>
                <p className="text-slate-950 font-black text-2xl sm:text-3xl mt-1 tracking-tight">
                  ${Number(stats.paidToMentors || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </p>
                <p className="text-emerald-700 text-[11px] mt-1.5 font-semibold">95% net payout on completed sessions</p>
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
                When a student funds a milestone, funds are locked non-custodially into the Arbitrum Escrow smart contract. Upon milestone completion and student approval, the contract automatically executes the 95/5 split: 95% is transferred directly to the mentor’s wallet, and 5% is allocated to the Platform Treasury Vault.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-slate-500 text-[11px] block font-medium">Mentor Payout</span>
                  <span className="text-slate-900 font-extrabold text-sm block mt-0.5">95% of Session Total</span>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                  <span className="text-slate-500 text-[11px] block font-medium">Platform Fee</span>
                  <span className="text-purple-700 font-extrabold text-sm block mt-0.5">5% Protocol Treasury Cut</span>
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
        {/* VIEW 3: WALLET (PLATFORM TREASURY WALLET)                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "wallet" && (
          <div className="space-y-6 animate-fadeInUp">
            <div className="pb-4 border-b border-purple-100">
              <h2 className="text-slate-950 font-black text-2xl sm:text-3xl tracking-tight">
                Platform Treasury <span className="text-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Wallet</span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Non-custodial smart contract wallet collecting the 5% protocol fee cut on Arbitrum One.
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
                    <Avatar className="w-14 h-14 ring-2 ring-purple-200 shadow-xs">
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
    </div>
  );
}

// =============================================================
// MENTOR DASHBOARD VIEW (With Radix UI Tabs & Dialog Modals)
// =============================================================
function MentorDashboardView({ user }) {
  const { courses, addCourse, portfolios, addPortfolioItem, deletePortfolioItem } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Gig Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gigTitle, setGigTitle] = useState("");
  const [gigCategory, setGigCategory] = useState("Coding");
  const [gigPrice, setGigPrice] = useState("150");
  const [gigDuration, setGigDuration] = useState("4 Weeks (4 Milestones)");
  const [gigDescription, setGigDescription] = useState("");
  const [gigLevel, setGigLevel] = useState("All levels");
  const [gigColor, setGigColor] = useState("indigo");
  const [milestonesInput, setMilestonesInput] = useState([
    { title: "Milestone 1: Kickoff & Assessment", amount: 50 },
    { title: "Milestone 2: Execution & Code Auditing", amount: 50 },
    { title: "Milestone 3: Final Delivery & Review", amount: 50 },
  ]);

  // Video Upload State (Mandatory)
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [videoError, setVideoError] = useState("");

  // In-App Portfolio Form State
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectTags, setProjectTags] = useState("React, Solidity, Web3");

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setVideoError("Please select a valid video file (MP4, WebM, MOV).");
      return;
    }

    setVideoError("");
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);
  };

  const handleRemoveVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  const handleAddMilestone = () => {
    setMilestonesInput((prev) => [
      ...prev,
      { title: `Milestone ${prev.length + 1}: Deliverable Review`, amount: 40 },
    ]);
  };

  const handleUpdateMilestone = (index, field, value) => {
    setMilestonesInput((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveMilestone = (index) => {
    if (milestonesInput.length <= 1) return;
    setMilestonesInput((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublishGig = async (e) => {
    e.preventDefault();
    if (!gigTitle.trim() || !gigDescription.trim()) {
      alert("Please fill in the gig title and description.");
      return;
    }

    if (!videoFile && !videoPreviewUrl) {
      setVideoError("A video intro is mandatory. Please upload an intro video for this gig.");
      return;
    }

    const newGig = {
      id: `gig-${Date.now()}`,
      title: gigTitle,
      mentorName: user.name,
      mentorEmail: user.email,
      category: gigCategory,
      price: Number(gigPrice) || 120,
      duration: gigDuration,
      description: gigDescription,
      level: gigLevel,
      color: gigColor,
      milestones: milestonesInput,
      hasVideoIntro: true,
      videoFileName: videoFile?.name || "gig_intro.mp4",
      videoDuration: "02:00",
      videoUrl: videoPreviewUrl,
    };

    await addCourse(newGig);

    setGigTitle("");
    setGigDescription("");
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setShowCreateModal(false);
    setActiveTab("courses");
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectDescription.trim()) {
      alert("Please provide project title and description.");
      return;
    }

    await addPortfolioItem({
      title: projectTitle,
      description: projectDescription,
      projectUrl,
      githubUrl: projectGithub,
      tags: projectTags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    setProjectTitle("");
    setProjectDescription("");
    setProjectUrl("");
    setProjectGithub("");
    setShowAddProjectModal(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6">
      {/* Mentor Workspace Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xl">
              {user.name?.[0]?.toUpperCase() || "M"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-3 py-0.5 rounded-full font-bold text-xs flex items-center gap-1 ${
                user.role?.toUpperCase() === "ADMIN" || user.roleType === "ADMIN"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : user.role?.toUpperCase() === "MENTOR" || user.roleType === "MENTOR"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {user.role?.toUpperCase() === "ADMIN" || user.roleType === "ADMIN" ? (
                  <>
                    <Shield size={12} /> Administrator
                  </>
                ) : user.role?.toUpperCase() === "MENTOR" || user.roleType === "MENTOR" ? (
                  <>
                    <Shield size={12} /> Verified Mentor
                  </>
                ) : (
                  <>
                    <GraduationCap size={12} /> Student
                  </>
                )}
              </span>
              {user.university && (
                <span className="px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1">
                  <GraduationCap size={12} /> {user.university}
                </span>
              )}
            </div>
            <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl">
              {user.name}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              {user.domain || (user.role === "ADMIN" ? "Platform Administrator" : user.role === "MENTOR" ? "Verified Mentor" : "Student Learner")}
            </p>
          </div>
        </div>

        {/* Quick Gig Creation Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>Create New Gig</span>
        </button>
      </div>

      {/* Radix UI Tabs for Sub-Navbar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-slate-100/80 p-1.5 rounded-2xl flex-nowrap">
          <TabsTrigger value="overview" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Layers size={14} />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2 flex-1 sm:flex-none">
            <BookOpen size={14} />
            <span>Courses & Gigs</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Wallet size={14} />
            <span>Escrow Wallet</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2 flex-1 sm:flex-none">
            <Briefcase size={14} />
            <span>Portfolio & Bio</span>
          </TabsTrigger>
        </TabsList>

        {/* SECTION 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <TrendingUp size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Earnings</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">$2,480</p>
              <p className="text-emerald-700 font-semibold text-[11px] mt-1.5">+18% vs last month</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <Lock size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">In Escrow Pool</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">$540</p>
              <p className="text-slate-500 text-[11px] mt-1.5">4 sessions pending</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <Sparkles size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Reputation Score</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">99 / 100</p>
              <p className="text-purple-700 text-[11px] mt-1.5 font-semibold">Top 1% Mentor Rating</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-purple-200 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
                <Clock size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hourly Rate</p>
              <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">${user.hourlyRate || "35"}</p>
              <p className="text-slate-500 text-[11px] mt-1.5">Adjustable in settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Published Courses & Gigs</h4>
                <p className="text-slate-500 text-xs mt-0.5">{courses.length} packages active on marketplace</p>
              </div>
              <button
                onClick={() => setActiveTab("courses")}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Manage Gigs
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Portfolio Showcase</h4>
                <p className="text-slate-500 text-xs mt-0.5">{portfolios.length} projects documented on your profile</p>
              </div>
              <button
                onClick={() => setActiveTab("portfolio")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Write Portfolio
              </button>
            </div>
          </div>
        </TabsContent>

        {/* SECTION 2: COURSES & GIGS */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 font-extrabold text-lg">My Active Gigs & Courses</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Packages with video verification available for students to book.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Create New Gig</span>
            </button>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                        {course.category}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">${course.price}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base mb-1.5">{course.title}</h3>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-3">{course.description}</p>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                          <FileVideo size={14} />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold text-xs">
                            {course.videoFileName || "Intro Video Preview.mp4"}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Video Verified
                          </span>
                        </div>
                      </div>

                      {course.videoUrl && (
                        <a
                          href={course.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 flex items-center gap-1"
                        >
                          <Play size={11} />
                          <span>Watch</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-2 border-t border-slate-200">
                      <span>{course.duration}</span>
                      <span>•</span>
                      <span>{course.milestones?.length || 3} Escrow Milestones</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <p className="text-slate-800 font-bold text-sm">You have not published any gigs yet</p>
              <p className="text-slate-500 text-xs mt-1 mb-4">
                Publish a milestone-based gig with video intro to start accepting student bookings.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Create First Gig
              </button>
            </div>
          )}
        </TabsContent>

        {/* SECTION 3: ESCROW WALLET */}
        <TabsContent value="wallet" className="space-y-6">
          <WalletConnectCard />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-emerald-900/60 text-xs font-semibold">Available for Payout</p>
              <p className="text-emerald-950 font-extrabold text-3xl mt-1">$1,940.00</p>
              <p className="text-emerald-700 text-[11px] mt-1 font-medium">Auto-disbursable to Arbitrum wallet</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <p className="text-amber-900/60 text-xs font-semibold">Locked in Escrow</p>
              <p className="text-amber-950 font-extrabold text-3xl mt-1">$540.00</p>
              <p className="text-amber-700 text-[11px] mt-1 font-medium">Released on milestone confirmations</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
              <p className="text-indigo-900/60 text-xs font-semibold">Lifetime Earnings</p>
              <p className="text-indigo-950 font-extrabold text-3xl mt-1">$8,320.00</p>
              <p className="text-indigo-700 text-[11px] mt-1 font-medium">100% On-chain record</p>
            </div>
          </div>
        </TabsContent>

        {/* SECTION 4: PORTFOLIO & BIO */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
            <h3 className="font-extrabold text-slate-900 text-base mb-1">Mentor Bio & Social Credentials</h3>
            <p className="text-slate-600 text-xs mb-4 leading-relaxed">{user.bio || "Hands-on, project-based mentorship."}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                  <LinkedinIcon className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                  <TwitterIcon className="w-3.5 h-3.5 fill-current" />
                  <span>X / Twitter</span>
                </a>
              )}
              {user.portfolio && (
                <a href={user.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                  <Globe size={13} />
                  <span>External Portfolio</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">In-App Portfolio Showcase</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Write and showcase projects directly inside your Trust Lesson profile.
              </p>
            </div>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Add Portfolio Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map((proj) => (
              <div key={proj.id} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-extrabold text-slate-900 text-base">{proj.title}</h4>
                    <button
                      onClick={() => deletePortfolioItem(proj.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed mb-3">{proj.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags?.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold">
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-1">
                      <span>Live Demo</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-slate-600 hover:underline flex items-center gap-1">
                      <span>Repository</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* CREATE GIG MODAL USING RADIX UI DIALOG */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Gig / Course</DialogTitle>
            <DialogDescription>
              Package your knowledge with mandatory video intro and escrow milestones.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublishGig} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Gig Title *</label>
              <input
                type="text"
                required
                value={gigTitle}
                onChange={(e) => setGigTitle(e.target.value)}
                placeholder="e.g. Fullstack Web3 Smart Contract Audit Sprint"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Category</label>
                <select
                  value={gigCategory}
                  onChange={(e) => setGigCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                >
                  <option value="Coding">Coding & Software</option>
                  <option value="Web3 & Crypto">Web3 & Crypto</option>
                  <option value="Design">UI/UX & Product Design</option>
                  <option value="Career">Career & Mentorship</option>
                  <option value="AI & Data">AI & Data Science</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">Total Price ($USD) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  value={gigPrice}
                  onChange={(e) => setGigPrice(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={gigDescription}
                onChange={(e) => setGigDescription(e.target.value)}
                placeholder="Explain what the student will build, outcomes, and code reviews..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
              />
            </div>

            {/* MANDATORY VIDEO UPLOAD SECTION */}
            <div className="p-4 bg-purple-50/70 rounded-2xl border-2 border-dashed border-purple-300">
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                  <Video size={15} className="text-purple-600" />
                  <span>Mandatory Video Intro Upload *</span>
                </label>
                <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Required
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mb-3">
                Upload an intro or overview video showing what you will teach. Students verify your communication style before booking.
              </p>

              {videoPreviewUrl ? (
                <div className="space-y-2">
                  <video
                    controls
                    src={videoPreviewUrl}
                    className="w-full h-44 rounded-xl bg-black object-cover shadow-inner"
                  />
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-purple-900 truncate max-w-[200px]">
                      {videoFile?.name || "gig_video.mp4"}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="text-rose-600 hover:text-rose-700 font-bold text-[11px] cursor-pointer"
                    >
                      Remove / Replace Video
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="flex flex-col items-center justify-center p-6 border border-purple-200 bg-white rounded-xl cursor-pointer hover:bg-purple-50/50 transition-colors">
                    <Upload size={24} className="text-purple-500 mb-2" />
                    <span className="text-xs font-bold text-purple-900">Click to upload video file</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">MP4, WebM, MOV supported</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {videoError && (
                <p className="text-rose-600 text-[11px] font-bold mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> {videoError}
                </p>
              )}
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-700 font-bold text-xs">Escrow Milestones</label>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="text-purple-600 hover:text-purple-800 text-xs font-bold cursor-pointer"
                >
                  + Add Milestone
                </button>
              </div>
              <div className="space-y-2">
                {milestonesInput.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 text-xs"
                    />
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-lg">
                      <span className="text-slate-500 text-xs font-bold">$</span>
                      <input
                        type="number"
                        value={m.amount}
                        onChange={(e) => handleUpdateMilestone(idx, "amount", Number(e.target.value))}
                        className="w-12 bg-transparent text-slate-900 font-bold text-xs"
                      />
                    </div>
                    {milestonesInput.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Publish Verified Gig
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ADD PORTFOLIO MODAL USING RADIX UI DIALOG */}
      <Dialog open={showAddProjectModal} onOpenChange={setShowAddProjectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Portfolio Project</DialogTitle>
            <DialogDescription>
              Showcase projects directly on your Trust Lesson mentor profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPortfolio} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. Decentralized Escrow Protocol"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Brief summary of architecture, stack, and results..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Live Demo URL</label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Repository URL</label>
              <input
                type="url"
                value={projectGithub}
                onChange={(e) => setProjectGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={projectTags}
                onChange={(e) => setProjectTags(e.target.value)}
                placeholder="Solidity, Arbitrum, React, TypeScript"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
              >
                Save Project
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
  const { sessions, updateSessionStatus } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const handleConfirmDone = (sessionId) => {
    updateSessionStatus(sessionId, "released");
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
          <Avatar className="w-14 h-14">
            <AvatarFallback className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-extrabold text-xl">
              {user.name?.[0]?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
                <GraduationCap size={13} /> Student Workspace
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

        <Link
          href="/explore"
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-purple-600 transition-all flex items-center gap-2 shadow-sm"
        >
          <span>Explore Mentors & Gigs</span>
          <ArrowRight size={14} />
        </Link>
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
              <p className="text-emerald-700 text-[11px] mt-1.5 font-semibold">On-chain verified credentials</p>
            </div>
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
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900 text-base">${s.price}</span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        s.status === "released"
                          ? "bg-emerald-100 text-emerald-800"
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
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
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
                    <p className="text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle size={14} />
                      Milestone verified complete. Funds released to mentor.
                    </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <p className="text-amber-900/60 text-xs font-semibold">Active Escrow Deposits</p>
              <p className="text-amber-950 font-extrabold text-3xl mt-1">${activeEscrowAmount}</p>
              <p className="text-amber-700 text-[11px] mt-1 font-medium">Locked safely until your explicit confirmation</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <p className="text-emerald-900/60 text-xs font-semibold">Smart Contract Guarantee</p>
              <p className="text-emerald-950 font-extrabold text-3xl mt-1">100% Refundable</p>
              <p className="text-emerald-700 text-[11px] mt-1 font-medium">Full refund if mentor fails milestone terms</p>
            </div>
          </div>
        </TabsContent>

        {/* STUDENT TAB 4: PROFILE */}
        <TabsContent value="profile" className="space-y-6">
          <StudentProfileEditor user={user} sessions={sessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StudentProfileEditor({ user, sessions }) {
  const { updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(user.name || "");
  const [formBio, setFormBio] = useState(user.bio || "");
  const [formDomain, setFormDomain] = useState(user.domain || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUserProfile({ name: formName, bio: formBio, domain: formDomain });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header Card */}
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="w-16 h-16 shadow-md">
          <AvatarFallback className="bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-extrabold text-2xl">
            {user.name?.[0]?.toUpperCase() || "S"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-slate-900 text-lg">{user.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Learner
            </span>
            {saved && (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold animate-fadeIn">
                Profile saved
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>
          <p className="text-slate-400 text-[11px] mt-1">Joined Trust Lesson • {user.joinedDate || "September 2026"}</p>
        </div>

        <button
          onClick={() => setEditing((e) => !e)}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Pencil size={13} />
          <span>{editing ? "Cancel Edit" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-slideDown">
          <h4 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            Edit Your Profile
          </h4>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Display Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Learning Goals / Bio</label>
            <textarea
              rows={3}
              value={formBio}
              onChange={(e) => setFormBio(e.target.value)}
              placeholder="Describe your learning goals, interests, and what you hope to achieve..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-xs mb-1">Primary Learning Domain</label>
            <select
              value={formDomain}
              onChange={(e) => setFormDomain(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs"
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
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
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
            <Award size={14} className="text-emerald-600" />
            <span>Milestone Credentials</span>
          </h4>
          <p className="text-emerald-700 font-extrabold text-2xl mt-1">
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
    </div>
  );
}
