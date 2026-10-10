"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import {
  GraduationCap,
  BookOpen,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  Video,
} from "lucide-react";
import Footer from "@/src/components/Footer";

function StatusBadge({ status }) {
  const map = {
    FUNDED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Escrow Funded" },
    IN_SESSION: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "In Session" },
    COMPLETED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Completed" },
    DISPUTED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "In Dispute" },
    CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Cancelled" },
    RESOLVED: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: "Resolved" },
    CREATED: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "Pending Funding" },
  };

  const current = map[status] || map.FUNDED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{current.label}</span>
    </span>
  );
}

export default function MyClassesPage() {
  const { user, authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchEnrollments() {
      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("tl_jwt");
        const res = await fetch("/api/enrollments?role=learner", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load classes");
        if (isMounted) {
          setEnrollments(data.enrollments || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      fetchEnrollments();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider">
                  Classroom
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-medium">
                  <Shield size={12} className="text-emerald-600" />
                  <span>Escrow Gated</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Enrolled Classes
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Access your course materials, curriculum modules, and scheduled live meetings with mentors.
              </p>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 w-fit"
            >
              <span>Explore More Gigs</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 animate-pulse"
                >
                  <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                  <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Unable to load classes</p>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && enrollments.length === 0 && (
            <div className="bg-white rounded-3xl p-12 sm:p-16 border border-slate-200/80 shadow-xs text-center flex flex-col items-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <GraduationCap size={32} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">No Enrolled Classes Yet</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">
                  You have not enrolled in any mentorship packages yet. Once you book a gig and lock payment into Arbitrum escrow, your classroom and curriculum will unlock here.
                </p>
              </div>
              <Link
                href="/explore"
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 inline-flex items-center gap-2"
              >
                <span>Browse Available Gigs</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Enrollments Grid */}
          {!loading && !error && enrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => {
                const gig = enrollment.gig;
                const mentor = enrollment.mentor;
                const sessionsTotal = enrollment.sessionsIncluded || 1;
                const sessionsUsed = enrollment.sessionsUsed || 0;
                const sessionsReserved = enrollment.sessionsReserved || 0;
                const sessionsRemaining = Math.max(0, sessionsTotal - sessionsUsed - sessionsReserved);
                const percentUsed = Math.min(100, Math.round((sessionsUsed / sessionsTotal) * 100));

                return (
                  <div
                    key={enrollment.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover & Status */}
                      <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={gig?.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"}
                          alt={gig?.title || "Class cover"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 font-bold text-[10px] uppercase tracking-wider shadow-xs border border-slate-100">
                            {gig?.category || "Mentorship"}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <StatusBadge status={enrollment.escrowStatus} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        <div>
                          <span className="text-[11px] font-bold text-purple-700 tracking-wide uppercase">
                            {enrollment.packageName || "Standard Package"}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mt-0.5">
                            {gig?.title || "Mentorship Program"}
                          </h3>
                        </div>

                        {/* Mentor Details */}
                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                          <img
                            src={mentor?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={mentor?.name || "Mentor"}
                            className="w-8 h-8 rounded-full object-cover border border-purple-200"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {mentor?.name || "Mentor"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {mentor?.domain || "Software Mentor"}
                            </p>
                          </div>
                        </div>

                        {/* Quota Meter */}
                        {sessionsTotal > 0 && (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-600">Live Quota Usage</span>
                              <span className="font-bold text-slate-900">
                                {sessionsUsed} / {sessionsTotal} used
                                {sessionsReserved > 0 && ` (${sessionsReserved} pending)`}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                              <div
                                className="bg-purple-600 h-full transition-all duration-300"
                                style={{ width: `${percentUsed}%` }}
                              />
                              {sessionsReserved > 0 && (
                                <div
                                  className="bg-amber-400 h-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100 - percentUsed, (sessionsReserved / sessionsTotal) * 100)}%`,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Duration: {enrollment.sessionDurationMin || 60}m per session</span>
                              <span className="font-bold text-purple-700">{sessionsRemaining} left</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Button */}
                    <div className="p-5 pt-0">
                      <Link
                        href={`/dashboard/classes/${enrollment.id}`}
                        className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 group-hover:bg-purple-600 shadow-xs"
                      >
                        <span>Enter Classroom</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
