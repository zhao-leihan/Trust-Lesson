"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../../src/components/Footer";
import {
  Trophy,
  ShieldCheck,
  Scale,
  Award,
  Sparkles,
  ExternalLink,
  Search,
  CheckCircle2,
  Lock,
  Star,
  Users,
  GraduationCap,
  Coins,
  RefreshCw,
  ArrowRight,
  Medal,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, StatCard, PrimaryButton, GhostButton, StatusPill } from "@/src/components/ui/DesignTokens";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("mentors"); // "mentors" | "students"

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = activeTab === "mentors"
        ? "Top Mentors Leaderboard | Trust Lesson"
        : "Top Students Leaderboard | Trust Lesson";
    }
  }, [activeTab]);
  const [data, setData] = useState({ stats: null, mentors: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJurorOnly, setFilterJurorOnly] = useState(false);
  const [mentorPage, setMentorPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to load live leaderboard from database");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || "Unknown server response");
      }
    } catch (err) {
      console.error("[Leaderboard Fetch Error]:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const stats = data.stats || {
    totalMentors: 0,
    totalStudents: 0,
    totalStakedUsdc: 0,
    activeJurorsCount: 0,
    totalCompletedSessions: 0,
    totalCertificates: 0,
  };

  // ── Filters ──
  const filteredMentors = (data.mentors || []).filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesJuror = filterJurorOnly ? m.isJurorEligible : true;
    return matchesSearch && matchesJuror;
  });

  const filteredStudents = (data.students || []).filter((s) => {
    return (
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.learningInterests?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
 
  // Reset pagination on filter or tab change
  useEffect(() => {
    setMentorPage(1);
    setStudentPage(1);
  }, [activeTab, searchQuery, filterJurorOnly]);

  const totalMentorPages = Math.ceil(filteredMentors.length / itemsPerPage) || 1;
  const paginatedMentors = filteredMentors.slice(
    (mentorPage - 1) * itemsPerPage,
    mentorPage * itemsPerPage
  );

  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice(
    (studentPage - 1) * itemsPerPage,
    studentPage * itemsPerPage
  );

  const top3Mentors = (data.mentors || []).slice(0, 3);
  const top3Students = (data.students || []).slice(0, 3);

  // Clean numerical badge with NO unicode emojis
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-violet-300">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-800 font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-violet-200">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-700 font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-violet-200">
          3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center border border-gray-200">
        {rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900">
      {/* ── Full-Width Hero Section ── */}
      <section className="relative w-full pt-32 pb-24 text-center px-6 overflow-hidden border-b border-gray-100 bg-white">
        {/* Panoramic Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/leaderboard.webp')" }}
        />
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6 border border-violet-100 shadow-xs font-semibold">
            <Trophy size={14} className="text-violet-600" />
            The Protocol Leaderboard
          </span>

          <h1
            className="font-extrabold tracking-tight text-gray-900 mb-6"
            style={{
              fontSize: "clamp(34px, 5vw, 56px)",
              lineHeight: 1.1,
            }}
          >
            Transparent On-Chain<br />Performance Leaderboard
          </h1>

          <p
            className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal"
          >
            On-chain performance rankings for mentors and students. Rankings are earned through verified teaching delivery and student ratings — economic stake acts as a safety collateral tier.
          </p>
        </div>
      </section>

      {/* ── Main Content Container ── */}
      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── KPI Metric Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <StatCard
              icon={Coins}
              label="Total Staked in Vault"
              value={`$${stats.totalStakedUsdc.toLocaleString()} USDC`}
              subtext="Locked in MentorStaking.sol"
            />
            <StatCard
              icon={Scale}
              label="Dispute Juror Pool"
              value={`${stats.activeJurorsCount} Active`}
              subtext="Stake ≥ $100, 5+ Sess & Rating ≥ 4.8"
            />
            <StatCard
              icon={Users}
              label="Settled Sessions"
              value={`${stats.totalCompletedSessions} Done`}
              subtext="Non-custodial Escrow releases"
            />
            <StatCard
              icon={Award}
              label="On-Chain Credentials"
              value={`${stats.totalCertificates} Issued`}
              subtext="W3C JSON-LD pinned to IPFS"
            />
          </div>

          {/* ── TOP 3 SPOTLIGHT PODIUM ── */}
          {!loading && !error && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-violet-600" />
                  Top Performers Spotlight
                </h2>
                <span className="text-xs text-gray-400 font-medium">Ranked by Protocol Score</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end">
                {(activeTab === "mentors" ? top3Mentors : top3Students).map((item, idx) => {
                  const isGold = idx === 0;

                  const borderClass = isGold
                    ? "ring-2 ring-violet-400 bg-violet-50/30 shadow-md md:scale-[1.02]"
                    : "ring-2 ring-violet-200 bg-white shadow-xs";

                  const tagBg = isGold
                    ? "bg-violet-600 text-white"
                    : "bg-violet-50 text-violet-700 border border-violet-100";

                  return (
                    <Card
                      key={item.id}
                      className={`p-5 relative overflow-hidden transition-all duration-200 ${borderClass}`}
                    >
                      {/* Top Rank Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <Link href={`/mentor/${encodeURIComponent(item.id)}`} className="block group/avatar">
                              <img
                                src={item.avatarUrl}
                                alt={item.name}
                                className={`w-14 h-14 rounded-full object-cover transition-all cursor-pointer ${
                                  isGold ? "ring-2 ring-violet-400" : "ring-2 ring-violet-200"
                                }`}
                              />
                              {item.isVerified && (
                                <span
                                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs"
                                  title="Verified"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                                </span>
                              )}
                            </Link>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                href={`/mentor/${encodeURIComponent(item.id)}`}
                                className="font-bold text-gray-900 text-base hover:text-violet-600 transition-colors cursor-pointer"
                              >
                                {item.name}
                              </Link>
                              {activeTab === "mentors" && item.role === "ADMIN" && (
                                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-normal line-clamp-1">
                              {activeTab === "mentors" ? item.domain : item.university}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tagBg}`}>
                          <Medal className="w-3.5 h-3.5" />
                          Rank #{item.rank}
                        </span>
                      </div>

                      {/* Stats Grid inside Spotlight */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                        {activeTab === "mentors" ? (
                          <>
                            <div className="bg-gray-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Staked Vault</span>
                              <span className="font-bold text-emerald-600 text-sm tabular-nums">${item.stakeAmount} USDC</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Rating & Sessions</span>
                              <span className="font-bold text-gray-900 text-sm tabular-nums">
                                {item.rating !== null ? `${item.rating} (${item.sessionsCount})` : `New (${item.sessionsCount})`}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Sessions</span>
                              <span className="font-bold text-violet-600 text-sm tabular-nums">{item.sessionsCount} Done</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Credentials</span>
                              <span className="font-bold text-gray-900 text-sm tabular-nums">{item.certificatesCount} Verified</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer Badge inside Spotlight */}
                      <div className="mt-3.5 flex items-center justify-between">
                        {activeTab === "mentors" ? (
                          item.isJurorEligible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                              <Scale className="w-3 h-3 text-violet-600" />
                              Council Juror Eligible
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-normal">
                              {item.stakeAmount >= 100 ? (item.sessionsCount < 5 ? "Need 5+ Sessions" : "Rating < 4.8") : "Need $100 Stake"}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            On-Chain Verified
                          </span>
                        )}

                        <span className="text-xs font-semibold text-gray-500 tabular-nums flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          Score: {item.score}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}


          {/* ── Tabs & Search Filter ── */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tab Buttons */}
              <div className="inline-flex p-1 bg-gray-100 rounded-full">
                <button
                  onClick={() => {
                    setActiveTab("mentors");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "mentors"
                      ? "bg-violet-50 text-violet-700 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  Top Mentors & Jurors ({data.mentors.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("students");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === "students"
                      ? "bg-violet-50 text-violet-700 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-violet-600" />
                  Certified Learners ({data.students.length})
                </button>
              </div>

              {/* Search Input & Juror Filter Toggle */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={activeTab === "mentors" ? "Search mentors, skills..." : "Search students..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-600 focus:bg-white transition-all"
                  />
                </div>

                {activeTab === "mentors" && (
                  <button
                    onClick={() => setFilterJurorOnly(!filterJurorOnly)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      filterJurorOnly
                        ? "bg-violet-50 border-violet-200 text-violet-700 shadow-xs"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-violet-600" />
                    Jurors Only
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Table Content ── */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 sm:p-16 text-center shadow-xs relative overflow-hidden">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-100">
                  <RefreshCw className="w-6 h-6 text-violet-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Syncing Leaderboard</h3>
              <p className="text-xs text-gray-400 mt-1 font-medium">Fetching verified on-chain metrics and juror reputation...</p>

              <div className="mt-8 space-y-3 max-w-2xl mx-auto">
                <div className="h-10 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
                <div className="h-10 bg-gray-50 border border-gray-100 rounded-xl animate-pulse opacity-70" />
                <div className="h-10 bg-gray-50 border border-gray-100 rounded-xl animate-pulse opacity-40" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl p-6 text-center text-sm font-medium">
              Error loading leaderboard: {error}
            </div>
          ) : activeTab === "mentors" ? (
            /* ── MENTORS TABLE ── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6 w-16">Rank</th>
                      <th className="py-4 px-4 sm:px-6">Mentor & Expertise</th>
                      <th className="py-4 px-4 sm:px-6 text-center">USDC Stake</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Rating</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Sessions</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Dispute Council Status</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMentors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                          No mentors match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedMentors.map((m) => (
                        <tr key={m.id} className="hover:bg-violet-50/40 transition-colors group">
                          {/* Rank */}
                          <td className="py-4 px-4 sm:px-6">{getRankBadge(m.rank)}</td>

                          {/* Mentor Profile */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <Link href={`/mentor/${encodeURIComponent(m.id)}`} className="block group/avatar">
                                  <img
                                    src={m.avatarUrl}
                                    alt={m.name}
                                    className={`w-11 h-11 rounded-full object-cover transition-all flex-shrink-0 cursor-pointer ${
                                      m.isVerified
                                        ? "ring-2 ring-emerald-400"
                                        : "border border-gray-200 ring-2 ring-transparent group-hover/avatar:ring-violet-300"
                                    }`}
                                  />
                                  {m.isVerified && (
                                    <span
                                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs"
                                      title="Verified Mentor"
                                    >
                                      <CheckCircle2 className="w-3 h-3 fill-emerald-600 text-white" />
                                    </span>
                                  )}
                                </Link>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/mentor/${encodeURIComponent(m.id)}`}
                                    className="font-bold text-gray-900 hover:text-violet-600 transition-colors cursor-pointer"
                                  >
                                    {m.name}
                                  </Link>
                                  {m.nickname && (
                                    <span className="text-xs text-gray-400 font-normal">(@{m.nickname})</span>
                                  )}
                                  {m.role === "ADMIN" && (
                                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase">
                                      Admin
                                    </span>
                                  )}
                                  {m.isVerified && (
                                    <span title="Verified">
                                      <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white flex-shrink-0" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 font-normal line-clamp-1">{m.domain}</p>

                                {/* Skills Pills */}
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  {(m.skills || []).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Stake Amount */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 tabular-nums">
                              <Lock className="w-3 h-3 text-emerald-600" />
                              ${m.stakeAmount} USDC
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">{m.mentorLevel}</p>
                          </td>

                          {/* Rating */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            {m.rating !== null ? (
                              <>
                                <div className="inline-flex items-center gap-1 font-bold text-gray-900 text-sm tabular-nums">
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                  {m.rating}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">100% Satisfied</p>
                              </>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">New</span>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">No sessions</p>
                              </div>
                            )}
                          </td>

                          {/* Sessions Completed */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="font-bold text-gray-900 tabular-nums">{m.sessionsCount} Sessions</div>
                            <p className="text-[10px] text-gray-400 font-medium tabular-nums">${m.totalVolume} settled</p>
                          </td>

                          {/* Dispute Juror Status */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            {m.isJurorEligible ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                                  <Scale className="w-3.5 h-3.5 text-violet-600" />
                                  Council Juror
                                </span>
                                <span className="text-[10px] text-violet-600 font-medium mt-1">
                                  {m.role === "ADMIN" ? "Ex-Officio Authority" : "Eligible for 3-of-5 Quorum"}
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                  {m.stakeAmount < 100
                                    ? "Need $100 Stake"
                                    : m.sessionsCount < 5
                                    ? "Need 5+ Sessions"
                                    : "Rating < 4.8"}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <Link href="/explore">
                              <PrimaryButton className="!min-h-[36px] !py-1.5 !px-3.5 text-xs">
                                <span>Book</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </PrimaryButton>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination for Mentors ── */}
              {filteredMentors.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>
                      Showing <strong className="text-gray-900 font-semibold">{(mentorPage - 1) * itemsPerPage + 1}</strong>–
                      <strong className="text-gray-900 font-semibold">{Math.min(mentorPage * itemsPerPage, filteredMentors.length)}</strong> of{" "}
                      <strong className="text-gray-900 font-semibold">{filteredMentors.length}</strong> Ranked Mentors
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMentorPage((p) => Math.max(p - 1, 1))}
                      disabled={mentorPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:border-violet-200 hover:text-violet-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalMentorPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setMentorPage(pageNum)}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            mentorPage === pageNum
                              ? "bg-violet-600 text-white shadow-xs"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setMentorPage((p) => Math.min(p + 1, totalMentorPages))}
                      disabled={mentorPage === totalMentorPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:border-violet-200 hover:text-violet-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── STUDENTS TABLE ── */
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6 w-16">Rank</th>
                      <th className="py-4 px-4 sm:px-6">Student & Campus</th>
                      <th className="py-4 px-4 sm:px-6">Learning Interests</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Sessions</th>
                      <th className="py-4 px-4 sm:px-6 text-center">On-Chain Credentials</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                          No students match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-violet-50/40 transition-colors group">
                          {/* Rank */}
                          <td className="py-4 px-4 sm:px-6">{getRankBadge(s.rank)}</td>

                          {/* Student Profile */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <Link href={`/mentor/${encodeURIComponent(s.id)}`} className="block group/avatar">
                                  <img
                                    src={s.avatarUrl}
                                    alt={s.name}
                                    className="w-11 h-11 rounded-full object-cover border border-gray-200 ring-2 ring-transparent group-hover:ring-violet-300 transition-all flex-shrink-0 cursor-pointer"
                                  />
                                </Link>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={`/mentor/${encodeURIComponent(s.id)}`}
                                    className="font-bold text-gray-900 hover:text-violet-600 transition-colors cursor-pointer"
                                  >
                                    {s.name}
                                  </Link>
                                  {s.nickname && (
                                    <span className="text-xs text-gray-400 font-normal">(@{s.nickname})</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 font-normal mt-0.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                                  {s.university || "Web3 Academy"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Interests */}
                          <td className="py-4 px-4 sm:px-6 max-w-xs">
                            <p className="text-xs text-gray-600 font-normal line-clamp-2">
                              {s.learningInterests}
                            </p>
                          </td>

                          {/* Sessions Completed */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="font-bold text-gray-900 tabular-nums">{s.sessionsCount} Sessions</div>
                            <span className="text-[10px] text-emerald-600 font-semibold">100% Escrow Released</span>
                          </td>

                          {/* Certificates */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 tabular-nums">
                              <Award className="w-3.5 h-3.5 text-violet-600" />
                              {s.certificatesCount} Credentials
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">W3C JSON-LD / EIP-712</p>
                          </td>

                          {/* Latest Certificate Action */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            {s.latestCertificate ? (
                              <Link
                                href={`/certificate/${s.latestCertificate.attestationUid}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 hover:bg-violet-600 text-white shadow-xs transition-all duration-200 whitespace-nowrap cursor-pointer"
                              >
                                <span>Verify Proof</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-400 font-normal italic whitespace-nowrap">Pending Attestation</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination for Students ── */}
              {filteredStudents.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-violet-600 inline-block" />
                    <span>
                      Showing <strong className="text-gray-900 font-semibold">{(studentPage - 1) * itemsPerPage + 1}</strong>–
                      <strong className="text-gray-900 font-semibold">{Math.min(studentPage * itemsPerPage, filteredStudents.length)}</strong> of{" "}
                      <strong className="text-gray-900 font-semibold">{filteredStudents.length}</strong> Certified Students
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStudentPage((p) => Math.max(p - 1, 1))}
                      disabled={studentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:border-violet-200 hover:text-violet-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setStudentPage(pageNum)}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            studentPage === pageNum
                              ? "bg-violet-600 text-white shadow-xs"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setStudentPage((p) => Math.min(p + 1, totalStudentPages))}
                      disabled={studentPage === totalStudentPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200 hover:border-violet-200 hover:text-violet-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Dispute Governance Showcase ── */}
          <div className="mt-14 bg-white rounded-2xl p-6 sm:p-10 border border-gray-100 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100 mb-3">
                  <Scale className="w-3.5 h-3.5 text-violet-600" />
                  Decentralized Dispute Governance
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 mb-2">
                  How Top Mentors Become Dispute Council Jurors
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Dispute jurors are selected transparently from verified top-ranked mentors on this leaderboard.
                </p>
              </div>

              {/* 3 Step Interactive Workflow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                {/* Step 1 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                      <Coins className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                      Step 01
                    </span>
                  </div>
                  <h4 className="text-gray-900 font-bold text-base mb-1.5">Stake ≥ 100 USDC</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Lock collateral into MentorStaking.sol to establish economic skin-in-the-game.
                  </p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Smart Contract</span>
                    <span className="text-violet-700 font-medium font-mono">MentorStaking.sol</span>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                      <Star className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                      Step 02
                    </span>
                  </div>
                  <h4 className="text-gray-900 font-bold text-base mb-1.5">5+ Sessions & Rating ≥ 4.8</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Complete at least 5 verified sessions while maintaining a 4.8+ rating to earn juror eligibility.
                  </p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Attestation Proof</span>
                    <span className="text-violet-700 font-medium font-mono">EAS Attestation</span>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                      Step 03
                    </span>
                  </div>
                  <h4 className="text-gray-900 font-bold text-base mb-1.5">Earn Dispute Protocol Fees</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Cast independent rulings on 3-of-5 quorum cases by inspecting IPFS evidence and earn protocol fees.
                  </p>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400 font-medium">Consensus Quorum</span>
                    <span className="text-violet-700 font-medium font-mono">3-of-5 Juror Multi-Sig</span>
                  </div>
                </Card>
              </div>

              {/* Bottom Callout Strip */}
              <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">
                      Ready to qualify for the Protocol Dispute Council?
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Stake collateral on Arbitrum Sepolia to enter the active juror candidate pool.
                    </p>
                  </div>
                </div>

                <Link href="/explore">
                  <PrimaryButton className="!min-h-[38px] !py-2 !px-4 text-xs">
                    <span>Explore Mentorship</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
