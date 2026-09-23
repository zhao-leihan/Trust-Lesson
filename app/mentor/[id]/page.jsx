"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Star,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  Award,
  Video,
  Globe,
  Wallet,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import ExploreCard from "@/src/components/ExploreCard";
import { CurrencyBadge, formatPriceCurrency } from "@/src/components/CurrencyBadge";

export default function MentorPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/mentor/public-profile/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Mentor profile not found");
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          setMentor(data.profile);
        } else {
          throw new Error("No profile data found");
        }
      })
      .catch((err) => {
        console.error("Failed to load mentor profile:", err);
        setError(err.message || "Failed to load mentor profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-32 pb-20 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading Mentor Profile & Verified Credentials...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-32 pb-20 px-4 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Mentor Profile Unavailable</h2>
            <p className="text-slate-500 text-xs">
              The mentor profile you requested could not be found or has not published public offerings yet.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Explore All Mentors</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Back Button */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Explore Catalog</span>
          </Link>

          {/* Hero Profile Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-purple-100 shadow-xl shadow-purple-950/5 relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-400/10 via-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-purple-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar with Verified Ring */}
                <div className="relative shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-lg border-3 border-purple-200 bg-slate-900">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl border-2 border-white shadow-md flex items-center gap-1 text-[10px] font-black"
                    title="Arbitrum Escrow Verified Mentor"
                  >
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {mentor.domain || "Mentor & Educator"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Shield size={11} /> 100% Escrow Backed
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {mentor.name}
                  </h1>
                  <p className="text-slate-400 text-xs font-mono font-medium">
                    @{mentor.nickname || mentor.name.toLowerCase().replace(/\s+/g, "_")}
                  </p>

                  <p className="text-slate-600 text-xs sm:text-sm max-w-xl leading-relaxed pt-1">
                    {mentor.bio}
                  </p>
                </div>
              </div>

              {/* Action / Rate Summary Card */}
              <div className="bg-purple-50/70 p-4 sm:p-5 rounded-2xl border border-purple-100 self-stretch md:self-auto flex flex-col justify-between shrink-0 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Starting Hourly Rate
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900">
                      ${mentor.hourlyRate}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ hour</span>
                    <CurrencyBadge currency="USDC" size="sm" />
                  </div>
                </div>

                {mentor.offerings && mentor.offerings.length > 0 && (
                  <a
                    href="#offerings"
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 active:scale-95"
                  >
                    <span>Browse Offerings ({mentor.offerings.length})</span>
                    <ArrowRight size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Stats & Credential Badges Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Star size={18} className="fill-amber-400" />
                </div>
                <div>
                  <span className="text-slate-900 font-black text-sm sm:text-base block leading-tight">
                    {mentor.rating || 4.95} ★
                  </span>
                  <span className="text-slate-400 text-[10px] font-medium">Student Rating</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <span className="text-slate-900 font-black text-sm sm:text-base block leading-tight">
                    {mentor.reputationScore || 99}%
                  </span>
                  <span className="text-slate-400 text-[10px] font-medium">Reputation Score</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <span className="text-slate-900 font-black text-sm sm:text-base block leading-tight">
                    {mentor.sessionsCompleted || 14}
                  </span>
                  <span className="text-slate-400 text-[10px] font-medium">Sessions Completed</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Wallet size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-slate-900 font-bold text-xs truncate block font-mono">
                    {mentor.walletAddress
                      ? `${mentor.walletAddress.slice(0, 6)}...${mentor.walletAddress.slice(-4)}`
                      : "Verified Arbitrum"}
                  </span>
                  <span className="text-emerald-700 text-[10px] font-bold">Payout Locked</span>
                </div>
              </div>
            </div>

            {/* Social / External Links */}
            {(mentor.linkedin || mentor.twitter || mentor.portfolio) && (
              <div className="flex items-center gap-3 pt-6 border-t border-purple-50 flex-wrap">
                <span className="text-slate-400 text-xs font-semibold">Verified Links:</span>
                {mentor.linkedin && (
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {mentor.twitter && (
                  <a
                    href={mentor.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Twitter / X</span>
                    <ExternalLink size={11} />
                  </a>
                )}
                {mentor.portfolio && (
                  <a
                    href={mentor.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Portfolio</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Published Courses & Milestone Gigs Section */}
          <section id="offerings" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
              <div>
                <h2 className="text-slate-950 font-black text-xl tracking-tight">
                  Courses & Gigs by {mentor.name}
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  All offerings are protected by Trust Lesson milestone escrow contracts on Arbitrum.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full self-start sm:self-auto">
                {mentor.offerings?.length || 0} Available
              </span>
            </div>

            {mentor.offerings && mentor.offerings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentor.offerings.map((offering) => (
                  <ExploreCard key={offering.id} item={offering} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-dashed border-purple-200 p-10 text-center space-y-3">
                <BookOpen size={24} className="text-purple-400 mx-auto" />
                <p className="text-slate-900 font-extrabold text-sm">No Published Gigs at This Moment</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  {mentor.name} is currently accepting direct 1-on-1 private mentorship sessions.
                </p>
                <Link
                  href={`/book/mentor/${mentor.id}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20"
                >
                  <Calendar size={14} />
                  <span>Book 1-on-1 Session</span>
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
