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
} from "lucide-react";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("mentors"); // "mentors" | "students"
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
        <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-amber-300">
          1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-slate-200">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-amber-600">
          3
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200">
        {rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900">
      {/* ── Full-Width Hero Section (Bright & Light, styled like About hero with bright leaderboard.webp background) ── */}
      <section className="relative w-full pt-32 pb-24 text-center px-6 overflow-hidden border-b border-slate-200 bg-white">
        {/* Panoramic Background Image: Bright & Vibrant */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/leaderboard.webp')" }}
        />
        {/* Soft Light Overlay to keep the bright image vibrant while ensuring high contrast for text */}
        <div className="absolute inset-0 bg-white/75 sm:bg-white/70 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-white/95 text-purple-950 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6 border border-purple-200 shadow-sm backdrop-blur-md font-bold">
            <Trophy size={14} className="text-amber-500" />
            The Protocol Leaderboard
          </span>

          <h1
            className="font-extrabold tracking-tight text-slate-950 mb-6"
            style={{
              fontSize: "clamp(34px, 5vw, 56px)",
              lineHeight: 1.1,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)",
            }}
          >
            Transparent On-Chain<br />Performance Leaderboard
          </h1>

          <p
            className="text-slate-800 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-semibold"
            style={{
              textShadow: "0 1px 6px rgba(0, 0, 0, 0.3)",
            }}
          >
            On-chain performance rankings for mentors and students. Staked mentors with high ratings become eligible as Dispute Council Jurors.
          </p>
        </div>
      </section>

      {/* ── Main Content Container ── */}
      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── KPI Metric Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs sm:text-sm font-medium">Total Staked in Vault</span>
                <Coins className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ${stats.totalStakedUsdc.toLocaleString()} <span className="text-xs sm:text-sm font-semibold text-slate-500">USDC</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Locked in MentorStaking.sol</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs sm:text-sm font-medium">Dispute Juror Pool</span>
                <Scale className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.activeJurorsCount} <span className="text-xs sm:text-sm font-semibold text-purple-600">Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Stake ≥ $100 & Rating ≥ 4.8</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs sm:text-sm font-medium">Settled Sessions</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalCompletedSessions} <span className="text-xs sm:text-sm font-semibold text-slate-500">Completed</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Non-custodial Escrow releases</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs sm:text-sm font-medium">On-Chain Credentials</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stats.totalCertificates} <span className="text-xs sm:text-sm font-semibold text-slate-500">Issued</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">W3C JSON-LD pinned to IPFS</p>
            </div>
          </div>

          {/* ── TOP 3 SPOTLIGHT PODIUM (Visual Engagement) ── */}
          {!loading && !error && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Top Performers Spotlight
                </h2>
                <span className="text-xs text-slate-400 font-medium">Ranked by Protocol Score</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {(activeTab === "mentors" ? top3Mentors : top3Students).map((item, idx) => {
                  const isGold = idx === 0;
                  const isSilver = idx === 1;
                  const isBronze = idx === 2;

                  const borderClass = isGold
                    ? "border-amber-400/80 shadow-md shadow-amber-500/10 ring-1 ring-amber-300/40"
                    : isSilver
                    ? "border-slate-300 shadow-sm"
                    : "border-amber-700/40 shadow-sm";

                  const tagBg = isGold
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : isSilver
                    ? "bg-slate-100 text-slate-800 border-slate-300"
                    : "bg-amber-50 text-amber-800 border-amber-200";

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl p-5 border ${borderClass} relative overflow-hidden transition-all hover:-translate-y-0.5`}
                    >
                      {/* Top Rank Badge */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatarUrl}
                            alt={item.name}
                            className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 text-base">{item.name}</span>
                              {activeTab === "mentors" && item.isVerified && (
                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1">
                              {activeTab === "mentors" ? item.domain : item.university}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black border ${tagBg}`}>
                          <Medal className="w-3.5 h-3.5" />
                          Rank #{item.rank}
                        </span>
                      </div>

                      {/* Stats Grid inside Spotlight */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                        {activeTab === "mentors" ? (
                          <>
                            <div className="bg-slate-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-slate-500 font-medium block">Staked Vault</span>
                              <span className="font-extrabold text-emerald-700 text-sm">${item.stakeAmount} USDC</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-slate-500 font-medium block">Rating & Sessions</span>
                              <span className="font-extrabold text-slate-900 text-sm">
                                {item.rating} ★ ({item.sessionsCount})
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-slate-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-slate-500 font-medium block">Sessions Completed</span>
                              <span className="font-extrabold text-indigo-700 text-sm">{item.sessionsCount} Sessions</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5">
                              <span className="text-[11px] text-slate-500 font-medium block">Credentials</span>
                              <span className="font-extrabold text-amber-700 text-sm">{item.certificatesCount} Verified</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Footer Badge inside Spotlight */}
                      <div className="mt-3.5 flex items-center justify-between">
                        {activeTab === "mentors" ? (
                          item.isJurorEligible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                              <Scale className="w-3 h-3 text-purple-600" />
                              Council Juror Eligible
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Standard Mentor</span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            On-Chain Verified
                          </span>
                        )}

                        <span className="text-xs font-black text-slate-400">Score: {item.score}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Tabs & Search Filter ── */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tab Buttons */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => {
                    setActiveTab("mentors");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "mentors"
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Top Mentors & Jurors ({data.mentors.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("students");
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "students"
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Certified Learners ({data.students.length})
                </button>
              </div>

              {/* Search Input & Juror Filter Toggle */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={activeTab === "mentors" ? "Search mentors, skills..." : "Search students, university..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                  />
                </div>

                {activeTab === "mentors" && (
                  <button
                    onClick={() => setFilterJurorOnly(!filterJurorOnly)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      filterJurorOnly
                        ? "bg-purple-50 border-purple-300 text-purple-800 font-bold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    Jurors Only
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Table Content ── */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-12 sm:p-16 text-center shadow-xs relative overflow-hidden">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100 shadow-2xs">
                  <RefreshCw className="w-7 h-7 text-purple-600 animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping opacity-75" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Syncing Leaderboard</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Fetching verified on-chain metrics & juror reputation...</p>

              {/* Sleek skeleton placeholder rows for realistic Web3 feel */}
              <div className="mt-8 space-y-3 max-w-2xl mx-auto">
                <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse opacity-70" />
                <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse opacity-40" />
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-center text-sm font-medium">
              Error loading leaderboard: {error}
            </div>
          ) : activeTab === "mentors" ? (
            /* ── MENTORS TABLE ── */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6 w-16">Rank</th>
                      <th className="py-4 px-4 sm:px-6">Mentor & Expertise</th>
                      <th className="py-4 px-4 sm:px-6 text-center">USDC Stake</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Rating</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Sessions</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Dispute Council Status</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMentors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                          No mentors match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedMentors.map((m) => (
                        <tr key={m.id} className="hover:bg-purple-50/30 transition-colors group">
                          {/* Rank */}
                          <td className="py-4 px-4 sm:px-6">{getRankBadge(m.rank)}</td>

                          {/* Mentor Profile */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={m.avatarUrl}
                                alt={m.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 ring-2 ring-transparent group-hover:ring-purple-400 transition-all flex-shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                                    {m.name}
                                  </span>
                                  {m.nickname && (
                                    <span className="text-xs text-slate-500 font-medium">(@{m.nickname})</span>
                                  )}
                                  {m.isVerified && (
                                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium line-clamp-1">{m.domain}</p>

                                {/* Skills Pills */}
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  {(m.skills || []).map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
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
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Lock className="w-3 h-3 text-emerald-600" />
                              ${m.stakeAmount} USDC
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">{m.mentorLevel}</p>
                          </td>

                          {/* Rating */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="inline-flex items-center gap-1 font-black text-slate-900 text-sm">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              {m.rating}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">100% Satisfied</p>
                          </td>

                          {/* Sessions Completed */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="font-bold text-slate-900">{m.sessionsCount} Sessions</div>
                            <p className="text-[10px] text-slate-500 font-medium">${m.totalVolume} settled</p>
                          </td>

                          {/* Dispute Juror Status */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            {m.isJurorEligible ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100/80 text-purple-800 border border-purple-300 shadow-xs">
                                  <Scale className="w-3.5 h-3.5 text-purple-700" />
                                  Council Juror
                                </span>
                                <span className="text-[10px] text-purple-600 font-semibold mt-1">Eligible for 3-of-5 Quorum</span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  Need $100 Stake
                                </span>
                                <span className="text-[10px] text-slate-500 mt-1">Requires $100 USDC</span>
                              </div>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <Link
                              href="/explore"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm hover:shadow-md hover:shadow-purple-500/25 active:scale-95 transition-all duration-200 border border-purple-400/30 whitespace-nowrap group cursor-pointer"
                            >
                              <span>Book Session</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Thematic Web3 Pagination for Mentors ── */}
              {filteredMentors.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/80 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span>
                      Showing <strong className="text-slate-900 font-bold">{(mentorPage - 1) * itemsPerPage + 1}</strong>–
                      <strong className="text-slate-900 font-bold">{Math.min(mentorPage * itemsPerPage, filteredMentors.length)}</strong> of{" "}
                      <strong className="text-slate-900 font-bold">{filteredMentors.length}</strong> Ranked Mentors
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMentorPage((p) => Math.max(p - 1, 1))}
                      disabled={mentorPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:pointer-events-none shadow-2xs transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalMentorPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setMentorPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            mentorPage === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/30 ring-2 ring-purple-300/40"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setMentorPage((p) => Math.min(p + 1, totalMentorPages))}
                      disabled={mentorPage === totalMentorPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:pointer-events-none shadow-2xs transition-all cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-4 px-4 sm:px-6 w-16">Rank</th>
                      <th className="py-4 px-4 sm:px-6">Student & Campus</th>
                      <th className="py-4 px-4 sm:px-6">Learning Interests</th>
                      <th className="py-4 px-4 sm:px-6 text-center">Sessions Completed</th>
                      <th className="py-4 px-4 sm:px-6 text-center">On-Chain Credentials</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Credential Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                          No students match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                          {/* Rank */}
                          <td className="py-4 px-4 sm:px-6">{getRankBadge(s.rank)}</td>

                          {/* Student Profile */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={s.avatarUrl}
                                alt={s.name}
                                className="w-11 h-11 rounded-full object-cover border border-slate-200 ring-2 ring-transparent group-hover:ring-indigo-400 transition-all flex-shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                    {s.name}
                                  </span>
                                  {s.nickname && (
                                    <span className="text-xs text-slate-500 font-medium">(@{s.nickname})</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                  {s.university || "Web3 Academy"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Interests */}
                          <td className="py-4 px-4 sm:px-6 max-w-xs">
                            <p className="text-xs text-slate-700 font-medium line-clamp-2">
                              {s.learningInterests}
                            </p>
                          </td>

                          {/* Sessions Completed */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="font-bold text-slate-900">{s.sessionsCount} Sessions</div>
                            <span className="text-[10px] text-emerald-600 font-semibold">100% Escrow Released</span>
                          </td>

                          {/* Certificates */}
                          <td className="py-4 px-4 sm:px-6 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              {s.certificatesCount} Credentials
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">W3C JSON-LD / EIP-712</p>
                          </td>

                          {/* Latest Certificate Action */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            {s.latestCertificate ? (
                              <Link
                                href={`/certificate/${s.latestCertificate.attestationUid}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 whitespace-nowrap group cursor-pointer"
                              >
                                <span>Verify Proof</span>
                                <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic whitespace-nowrap">Pending Attestation</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Thematic Web3 Pagination for Students ── */}
              {filteredStudents.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-slate-50/80 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse inline-block" />
                    <span>
                      Showing <strong className="text-slate-900 font-bold">{(studentPage - 1) * itemsPerPage + 1}</strong>–
                      <strong className="text-slate-900 font-bold">{Math.min(studentPage * itemsPerPage, filteredStudents.length)}</strong> of{" "}
                      <strong className="text-slate-900 font-bold">{filteredStudents.length}</strong> Certified Students
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStudentPage((p) => Math.max(p - 1, 1))}
                      disabled={studentPage === 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:pointer-events-none shadow-2xs transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setStudentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            studentPage === pageNum
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/30 ring-2 ring-indigo-300/40"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setStudentPage((p) => Math.min(p + 1, totalStudentPages))}
                      disabled={studentPage === totalStudentPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-40 disabled:pointer-events-none shadow-2xs transition-all cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Redesigned Modern Web3 Dispute Governance Showcase (Replaced dark card) ── */}
          <div className="mt-14 bg-gradient-to-b from-white via-purple-50/20 to-slate-50/80 rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header Badge & Title */}
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200/80 shadow-2xs mb-3">
                  <Scale className="w-3.5 h-3.5 text-purple-600" />
                  Decentralized Dispute Governance
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 mb-2">
                  How Top Mentors Become Dispute Council Jurors
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Unlike centralized platforms where disputes are decided by opaque corporate moderators, Trust Lesson selects dispute jurors transparently from the top-ranked mentors on this leaderboard.
                </p>
              </div>

              {/* 3 Step Interactive Workflow Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs border border-emerald-100 group-hover:scale-105 transition-transform">
                      <Coins className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Step 01
                    </span>
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-base mb-1.5">Stake ≥ 100 USDC</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Lock security collateral into MentorStaking.sol to establish economic skin-in-the-game and prevent malicious rulings.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Smart Contract</span>
                    <span className="text-emerald-700 font-bold font-mono">MentorStaking.sol</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-2xs border border-amber-100 group-hover:scale-105 transition-transform">
                      <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                      Step 02
                    </span>
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-base mb-1.5">Maintain Rating ≥ 4.8</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Deliver high-quality mentorship sessions to earn Soulbound EAS credentials and top leaderboard rank.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Attestation Proof</span>
                    <span className="text-amber-700 font-bold font-mono">EAS Attestation</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-6 border border-purple-200/80 shadow-xs hover:border-purple-400 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-2xs border border-purple-100 group-hover:scale-105 transition-transform">
                      <Scale className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                      Step 03
                    </span>
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-base mb-1.5">Earn Dispute Protocol Fees</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Cast independent rulings on 3-of-5 quorum cases by inspecting IPFS evidence and earn $3–$5 USDC per vote.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Consensus Quorum</span>
                    <span className="text-purple-700 font-bold font-mono">3-of-5 Juror Multi-Sig</span>
                  </div>
                </div>
              </div>

              {/* Bottom Callout Strip */}
              <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Ready to qualify for the Protocol Dispute Council?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Stake collateral on Arbitrum Sepolia to enter the active juror candidate pool.
                    </p>
                  </div>
                </div>

                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-purple-600 transition-all shadow-xs whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <span>Explore Mentorship</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
