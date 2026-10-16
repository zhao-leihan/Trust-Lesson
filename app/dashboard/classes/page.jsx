"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, apiFetch } from "@/src/context/AuthContext";
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
  History,
  Award,
  Calendar,
} from "lucide-react";
import Footer from "@/src/components/Footer";
import { Card, PrimaryButton, SecondaryButton, GhostButton, StatusPill, EmptyState } from "@/src/components/ui/DesignTokens";

export default function MyClassesPage() {
  const { user, authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch("/enrollments?role=learner");
      setEnrollments(data.enrollments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchEnrollments();
    }
  }, [user, authLoading]);

  const activeClasses = enrollments.filter(
    (e) => !["COMPLETED", "RESOLVED"].includes(e.escrowStatus)
  );
  const completedClasses = enrollments.filter(
    (e) => ["COMPLETED", "RESOLVED"].includes(e.escrowStatus)
  );

  // If there are no active classes but there are completed classes, default to history
  useEffect(() => {
    if (enrollments.length > 0) {
      const activeCount = enrollments.filter(
        (e) => !["COMPLETED", "RESOLVED"].includes(e.escrowStatus)
      ).length;
      if (activeCount === 0) {
        setActiveTab("history");
      }
    }
  }, [enrollments]);

  const displayedEnrollments = activeTab === "active" ? activeClasses : completedClasses;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold uppercase tracking-wider border border-violet-100">
                  Classroom
                </span>
                <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-normal">
                  <Shield size={12} className="text-emerald-600" />
                  <span>Escrow Gated</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                My Enrolled Classes
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Access your course materials, curriculum modules, and scheduled live meetings with mentors.
              </p>
            </div>

            <Link href="/explore">
              <PrimaryButton className="!min-h-[40px] !py-2 !px-4 text-xs">
                <span>Explore More Gigs</span>
                <ArrowRight size={14} />
              </PrimaryButton>
            </Link>
          </div>

          {/* Navigation Tabs: Active Classes vs History & Completed */}
          {!loading && !error && enrollments.length > 0 && (
            <div className="inline-flex p-1 bg-gray-100 rounded-full">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "active"
                    ? "bg-violet-50 text-violet-700 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Clock size={15} />
                <span>Active Classes ({activeClasses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-violet-50 text-violet-700 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Calendar size={15} />
                <span>History & Completed ({completedClasses.length})</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4 animate-pulse"
                >
                  <div className="w-full h-44 bg-gray-100 rounded-xl" />
                  <div className="h-5 bg-gray-100 rounded-md w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-md w-1/2" />
                  <div className="h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold">Unable to load classes</p>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
              <PrimaryButton
                onClick={() => fetchEnrollments()}
                className="!min-h-[36px] !py-1.5 !px-3.5 text-xs bg-rose-600 hover:bg-rose-700 from-rose-600 to-rose-700"
              >
                Retry
              </PrimaryButton>
            </div>
          )}

          {/* Completely Empty State */}
          {!loading && !error && enrollments.length === 0 && (
            <EmptyState
              icon={GraduationCap}
              title="No Enrolled Classes Yet"
              description="You have not enrolled in any mentorship packages yet. Once you book a gig and lock payment into Arbitrum escrow, your classroom will unlock here."
              actionText="Browse Available Gigs"
              actionHref="/explore"
              className="max-w-lg mx-auto"
            />
          )}

          {/* Empty Tab: Active tab with 0 classes */}
          {!loading && !error && enrollments.length > 0 && activeTab === "active" && activeClasses.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="No Active Ongoing Classes"
              description="You have completed your active classes. All finalized coursework and Soulbound certificates are archived in your Class History."
              actionText="View Class History"
              onAction={() => setActiveTab("history")}
              className="max-w-lg mx-auto"
            />
          )}

          {/* Empty Tab: History tab with 0 classes */}
          {!loading && !error && enrollments.length > 0 && activeTab === "history" && completedClasses.length === 0 && (
            <EmptyState
              icon={History}
              title="No Completed Classes Yet"
              description="Once your mentorship is completed and escrow released, your verifiable graduation credentials and archived classrooms will appear here."
              className="max-w-lg mx-auto"
            />
          )}

          {/* Enrollments Grid */}
          {!loading && !error && displayedEnrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEnrollments.map((enrollment) => {
                const gig = enrollment.gig;
                const mentor = enrollment.mentor;
                const sessionsTotal = enrollment.sessionsIncluded || 1;
                const sessionsUsed = enrollment.sessionsUsed || 0;
                const sessionsReserved = enrollment.sessionsReserved || 0;
                const sessionsRemaining = Math.max(0, sessionsTotal - sessionsUsed - sessionsReserved);
                const percentUsed = Math.min(100, Math.round((sessionsUsed / sessionsTotal) * 100));
                const isCompleted = ["COMPLETED", "RESOLVED"].includes(enrollment.escrowStatus);

                return (
                  <Card
                    key={enrollment.id}
                    className="overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover & Status */}
                      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
                        <img
                          src={gig?.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80"}
                          alt={gig?.title || "Class cover"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-gray-800 font-semibold text-[10px] uppercase tracking-wider shadow-2xs border border-gray-100">
                            {gig?.category || "Mentorship"}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <StatusPill status={enrollment.escrowStatus} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4">
                        <div>
                          <span className="text-[11px] font-semibold text-violet-600 tracking-wide uppercase">
                            {enrollment.packageName || "Standard Package"}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mt-0.5">
                            {gig?.title || "Mentorship Program"}
                          </h3>
                        </div>

                        {/* Mentor Details */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                          <img
                            src={mentor?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                            alt={mentor?.name || "Mentor"}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {mentor?.name || "Mentor"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate font-normal">
                              {mentor?.domain || "Software Mentor"}
                            </p>
                          </div>
                        </div>

                        {/* Quota Meter */}
                        {sessionsTotal > 0 && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-medium text-gray-500">
                                {isCompleted ? "Course Status" : "Live Quota Usage"}
                              </span>
                              <span className="font-bold text-gray-900 tabular-nums">
                                {isCompleted
                                  ? "All sessions completed"
                                  : `${sessionsUsed} / ${sessionsTotal} used ${sessionsReserved > 0 ? `(${sessionsReserved} pending)` : ""}`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  isCompleted ? "bg-emerald-600" : "bg-violet-600"
                                }`}
                                style={{ width: isCompleted ? "100%" : `${percentUsed}%` }}
                              />
                              {!isCompleted && sessionsReserved > 0 && (
                                <div
                                  className="bg-amber-400 h-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100 - percentUsed, (sessionsReserved / sessionsTotal) * 100)}%`,
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400">
                              <span>Duration: {enrollment.sessionDurationMin || 60}m per session</span>
                              <span className={`font-semibold ${isCompleted ? "text-emerald-600" : "text-violet-600"}`}>
                                {isCompleted ? "Graduated" : `${sessionsRemaining} left`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Button */}
                    <div className="p-5 pt-0">
                      <Link href={`/dashboard/classes/${enrollment.id}`} className="block w-full">
                        <PrimaryButton className="w-full !min-h-[42px] text-xs">
                          {isCompleted ? (
                            <>
                              <Award size={14} className="shrink-0" />
                              <span>Review Materials & Certificate</span>
                            </>
                          ) : (
                            <>
                              <span>Enter Classroom</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </PrimaryButton>
                      </Link>
                    </div>
                  </Card>
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
