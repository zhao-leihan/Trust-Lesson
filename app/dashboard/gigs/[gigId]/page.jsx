"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Calendar,
  Clock,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Video,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Footer from "@/src/components/Footer";

function StatusBadge({ status }) {
  const map = {
    FUNDED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Funded" },
    IN_SESSION: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "In Session" },
    COMPLETED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Completed" },
    DISPUTED: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Disputed" },
    CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Cancelled" },
    RESOLVED: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: "Resolved" },
    CREATED: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: "Created" },
  };

  const current = map[status] || map.FUNDED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{current.label}</span>
    </span>
  );
}

export default function MentorGigDetailPage() {
  const params = useParams();
  const gigId = params?.gigId;
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [gigData, setGigData] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "name"

  useEffect(() => {
    let isMounted = true;
    async function fetchBuyers() {
      if (!gigId || !user) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("tl_jwt");
        const res = await fetch(`/api/gigs/${gigId}/buyers`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load buyers");
        }
        const data = await res.json();
        if (isMounted) {
          setGigData(data.gig || null);
          setBuyers(data.buyers || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!authLoading) {
      fetchBuyers();
    }

    return () => {
      isMounted = false;
    };
  }, [gigId, user, authLoading]);

  // Filter & Sort Logic
  const filteredBuyers = buyers
    .filter((buyer) => {
      const matchSearch =
        searchQuery === "" ||
        buyer.learner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.learner?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        buyer.learner?.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || buyer.escrowStatus === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.purchasedAt) - new Date(a.purchasedAt);
      if (sortBy === "oldest") return new Date(a.purchasedAt) - new Date(b.purchasedAt);
      if (sortBy === "name") {
        const nameA = a.learner?.name || a.learner?.email || "";
        const nameB = b.learner?.name || b.learner?.email || "";
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      <main className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              Mentor Management
            </span>
          </div>

          {/* Gig Header */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Gig Buyers Overview
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {gigData?.title || "Gig Details"}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Track learner enrollments, package tiers, escrow statuses, and live session quotas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
                <span className="block text-2xl font-extrabold text-purple-700">
                  {buyers.length}
                </span>
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                  Total Buyers
                </span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by learner name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="FUNDED">Funded</option>
                  <option value="IN_SESSION">In Session</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DISPUTED">Disputed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Learner Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buyers Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading && (
              <div className="p-12 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold">Loading buyers data...</p>
              </div>
            )}

            {!loading && error && (
              <div className="p-8 text-center text-rose-600 text-xs">
                <AlertCircle size={24} className="mx-auto mb-2" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {!loading && !error && filteredBuyers.length === 0 && (
              <div className="p-16 text-center text-slate-500 space-y-3">
                <Users size={36} className="mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-800 text-sm">No Buyers Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {buyers.length === 0
                    ? "No learners have enrolled in this gig yet. When a learner funds escrow on Arbitrum, their record will appear here."
                    : "No buyers match your search and filter criteria."}
                </p>
              </div>
            )}

            {!loading && !error && filteredBuyers.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80 text-[10px]">
                    <tr>
                      <th className="py-4 px-6">Learner</th>
                      <th className="py-4 px-4">Package Tier</th>
                      <th className="py-4 px-4">Escrow Status</th>
                      <th className="py-4 px-4">Quota Used / Total</th>
                      <th className="py-4 px-4">Next Meeting</th>
                      <th className="py-4 px-4">Enrolled At</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBuyers.map((buyer) => {
                      const learner = buyer.learner;
                      const quota = buyer.quota;
                      const next = buyer.nextMeeting;

                      return (
                        <tr key={buyer.enrollmentId} className="hover:bg-slate-50/70 transition-colors">
                          {/* Learner */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={learner?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                                alt={learner?.name || "Learner"}
                                className="w-8 h-8 rounded-full object-cover border border-purple-200"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {learner?.name || "Learner"}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {learner?.email || learner?.walletAddress || "Anonymous"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Package */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                              {buyer.packageTier}
                            </span>
                          </td>

                          {/* Escrow Status */}
                          <td className="py-4 px-4">
                            <StatusBadge status={buyer.escrowStatus} />
                          </td>

                          {/* Quota */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-900">
                                {quota.used} / {quota.total} used
                              </span>
                              {quota.reserved > 0 && (
                                <span className="block text-[10px] text-amber-700 font-semibold">
                                  ({quota.reserved} pending)
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Next Meeting */}
                          <td className="py-4 px-4">
                            {next ? (
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-900">
                                  {new Date(next.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {new Date(next.startAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} • {next.platform}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None scheduled</span>
                            )}
                          </td>

                          {/* Enrolled At */}
                          <td className="py-4 px-4 text-slate-500">
                            {new Date(buyer.purchasedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/dashboard/classes/${buyer.enrollmentId}`}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <span>View Class</span>
                              <ExternalLink size={11} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
