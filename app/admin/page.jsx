"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  Users,
  Coins,
  Wallet,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  Search,
  Lock,
  Save,
  Check,
  RefreshCw,
  Sliders,
} from "lucide-react";
import Footer from "@/src/components/Footer";

export default function AdminVersePage() {
  const { user, authLoading, activeRole, switchRole, updateUserProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("jurors");
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
    treasuryWallet: process.env.NEXT_PUBLIC_PLATFORM_TREASURY_WALLET || "0x656c943c3a8BB5d5F7306CC5ED66C3a938Cb75eC",
  });
  const [jurorsData, setJurorsData] = useState({
    totalJurors: 0,
    quorumRequired: 3,
    councilCapacity: 5,
    exOfficioAdmins: [],
    mentorJurors: [],
  });
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState({});

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    domain: "Platform Administrator",
    bio: "Managing Trust Lesson Arbitrum Escrow, protocol fees, and dispute council governance.",
    linkedin: "",
    twitter: "",
    instagram: "",
    portfolio: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        domain: user.domain || "Platform Administrator",
        bio: user.bio || "Managing Trust Lesson Arbitrum Escrow, protocol fees, and dispute council governance.",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
        instagram: user.instagram || "",
        portfolio: user.portfolio || "",
      });
    }
  }, [user]);

  // URL search param check for tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) setActiveTab(tabParam);
    }
  }, []);

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

  const fetchJurors = async () => {
    try {
      const res = await fetch("/api/admin/jurors");
      if (res.ok) {
        const data = await res.json();
        setJurorsData(data);
      }
    } catch (err) {
      console.warn("Failed to fetch jurors", err);
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
    fetchJurors();
    fetchUsers();
  }, [userRoleFilter]);

  const handleToggleVerify = async (userId) => {
    setIsVerifying((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerified: data.user.isVerified } : u))
        );
        fetchStats();
        fetchJurors();
      }
    } catch {
      alert("Failed to update user verification");
    } finally {
      setIsVerifying((prev) => ({ ...prev, [userId]: false }));
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

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "ADMIN" ||
    user?.roleType === "ADMIN" ||
    user?.email?.toLowerCase() === "rayhanabbrar233@gmail.com" ||
    user?.email?.toLowerCase() === "jilonasalma@gmail.com";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md text-center text-white">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/30 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Lock size={26} />
          </div>
          <h2 className="text-xl font-bold mb-2">Restricted to Admin Verse</h2>
          <p className="text-slate-400 text-xs sm:text-sm mb-6">
            Only authorized Trust Lesson Super Administrators (`rayhanabbrar233@gmail.com` and `jilonasalma@gmail.com`) can access this Verse.
          </p>
          <Link
            href="/login"
            className="w-full inline-block py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold text-xs"
          >
            Sign In with Admin Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-20">
      {/* ─── Top Admin Verse Header Bar & Multi-Role Switcher ─── */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-400">Trust Lesson Verse</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Council Juror Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Signed in as <strong className="text-slate-200">{user.email}</strong>
              </p>
            </div>
          </div>

          {/* Interactive Role Switcher for Admins */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => {
                switchRole("admin");
                setActiveTab("jurors");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRole === "admin"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield size={13} />
              <span>Admin Verse</span>
            </button>

            <button
              onClick={() => {
                switchRole("mentor");
                router.push("/dashboard");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRole === "mentor"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Briefcase size={13} />
              <span>Mentor Mode</span>
            </button>

            <button
              onClick={() => {
                switchRole("student");
                router.push("/dashboard");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeRole === "student"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap size={13} />
              <span>Student Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container ─── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-slate-800">
          {[
            { id: "jurors", label: "Dispute Council & Jurors", icon: Scale },
            { id: "financial", label: "Treasury & Financials", icon: Coins },
            { id: "users", label: "User Governance", icon: Users },
            { id: "profile", label: "Admin Profile", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: DISPUTE COUNCIL & JURORS ─── */}
        {activeTab === "jurors" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Intro Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/30 border border-purple-800/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                    <Scale className="text-purple-400" size={22} />
                    Decentralized Dispute Council (3-of-5 Juror Quorum)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                    Protected by Arbitrum smart contract <code className="text-purple-300 font-mono">DisputeCouncil.sol</code>.
                    All platform administrators are automatically registered as Permanent Ex-Officio Jurors.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-xs text-slate-500 font-medium">Council Quorum</div>
                    <div className="text-sm font-black text-purple-400">3 of 5 Required</div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <div className="text-xs text-slate-500 font-medium">Total Jurors</div>
                    <div className="text-sm font-black text-emerald-400">{jurorsData.totalJurors} Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Guide: How Mentors Become Jurors */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Sparkles className="text-amber-400" size={16} />
                How Mentors Become Dispute Council Jurors (Architecture Rules)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-purple-400 font-extrabold mb-1">1. Stake Collateral</div>
                  <p className="text-slate-400">
                    Mentor must stake <strong className="text-slate-200">&ge; 100 USDC</strong> in <code className="text-purple-300">MentorStaking.sol</code> to qualify as Tier PRO or MASTER.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-purple-400 font-extrabold mb-1">2. Reputation Score</div>
                  <p className="text-slate-400">
                    Must maintain a high rating (<strong className="text-slate-200">&ge; 4.8 / 5.0</strong>) across completed sessions with zero slashing marks.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-purple-400 font-extrabold mb-1">3. On-Chain Sortition</div>
                  <p className="text-slate-400">
                    When a dispute occurs, jurors are chosen via pseudo-random blockhash sortition.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-purple-400 font-extrabold mb-1">4. Conflict Filter</div>
                  <p className="text-slate-400">
                    Mentors cannot judge their own dispute or sessions involving former direct students.
                  </p>
                </div>
              </div>
            </div>

            {/* Jurors Roster List */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300">Active Juror Council Roster</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Permanent Admins */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Ex-Officio Super Admin</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                      Permanent Seat
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rayhan Abbrar</h4>
                    <p className="text-xs text-slate-400 font-mono">rayhanabbrar233@gmail.com</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Role: Protocol Architect &amp; Admin</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Auto-Juror: Active</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">Ex-Officio Super Admin</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                      Permanent Seat
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Jilona Salma</h4>
                    <p className="text-xs text-slate-400 font-mono">jilonasalma@gmail.com</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>Role: Global Operations Lead &amp; Admin</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Auto-Juror: Active</span>
                  </div>
                </div>

                {/* 2. Qualified Mentors */}
                {jurorsData.mentorJurors.map((juror) => (
                  <div key={juror.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Qualified Mentor Juror</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        Tier {juror.mentorLevel || "PRO"}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{juror.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{juror.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Stake: ${juror.stakeAmount} USDC</span>
                      <span>&bull;</span>
                      <span className="text-emerald-400">Sortition Eligible</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: FINANCIAL & TREASURY ─── */}
        {activeTab === "financial" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Protocol Treasury (10% Cut)</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  ${Number(stats.platformTreasury || 0).toFixed(2)} USDC
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Diverted from completed escrow milestones</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Active Escrow Pool</div>
                <div className="text-2xl font-black text-purple-400 mt-1">
                  ${Number(stats.activeEscrow || 0).toFixed(2)} USDC
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Locked in Arbitrum smart vaults</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Total Gross Volume</div>
                <div className="text-2xl font-black text-white mt-1">
                  ${Number(stats.totalVolume || 0).toFixed(2)} USDC
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Lifetime mentorship session value</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-medium">Total Paid to Mentors</div>
                <div className="text-2xl font-black text-indigo-400 mt-1">
                  ${Number(stats.paidToMentors || 0).toFixed(2)} USDC
                </div>
                <p className="text-[11px] text-slate-500 mt-2">100% base fees released on approval</p>
              </div>
            </div>

            {/* Treasury Wallet Info */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Platform Treasury Cold Wallet</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono break-all">{stats.treasuryWallet}</p>
                </div>
                <a
                  href={`https://sepolia.arbiscan.io/address/${stats.treasuryWallet}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-purple-300 flex items-center gap-1.5"
                >
                  <span>Arbiscan</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: USER GOVERNANCE ─── */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
                {["ALL", "MENTOR", "LEARNER", "ADMIN"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userRoleFilter === role
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, email, address..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Juror Duty</th>
                    <th className="p-4">Stake / Tier</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.name || "Anonymous"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-purple-300">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isJuror || u.role === "ADMIN" ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Juror Active
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Non-Juror</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-slate-200">
                          ${u.stakeAmount || 0} USDC &bull; {u.mentorLevel || "RISING"}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.isVerified ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            Verified
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleVerify(u.id)}
                          disabled={isVerifying[u.id]}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          {u.isVerified ? "Revoke Badge" : "Grant Verified"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── TAB 4: ADMIN PROFILE ─── */}
        {activeTab === "profile" && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 animate-fadeIn">
            <h3 className="text-base font-bold text-white mb-1">Admin Profile &amp; Governance Details</h3>
            <p className="text-xs text-slate-400 mb-6">
              Update credentials and public administrator presence on Trust Lesson.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profileForm.email}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Bio &amp; Scope</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save size={14} />
                  <span>{savingProfile ? "Saving Profile..." : "Save Admin Profile"}</span>
                </button>
                {profileSuccess && (
                  <p className="text-center text-xs text-emerald-400 font-bold mt-2 animate-fadeIn">
                    Admin Profile Updated Successfully!
                  </p>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
