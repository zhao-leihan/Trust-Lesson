"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Receipt,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  RotateCcw,
  Scale,
  ExternalLink,
  Coins,
  TrendingUp,
  Sparkles,
  Calendar,
  User,
  Copy,
  Check,
  Download,
  BarChart3,
  RefreshCw,
  Clock,
  ShieldCheck,
  Layers,
  ArrowDownRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/Dialog";

export default function TransactionHistorySection({
  role = "admin", // "admin" | "mentor" | "learner"
  userId = null,
  walletAddress = null,
  email = null,
  compact = false,
}) {
  const [transactions, setTransactions] = useState([]);
  const [recap, setRecap] = useState({
    totalGmv: 0,
    totalRevenue: 0,
    totalDisbursed: 0,
    totalInEscrow: 0,
    totalRefunded: 0,
    totalCount: 0,
    disbursedCount: 0,
    pendingCount: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("role", role);
      if (userId) q.set("userId", userId);
      if (walletAddress) q.set("wallet", walletAddress);
      if (email) q.set("email", email);
      if (statusFilter !== "ALL") q.set("status", statusFilter);

      const res = await fetch(`/api/transactions?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.recap) setRecap(data.recap);
        if (data.chartData) setChartData(data.chartData);
      }
    } catch (err) {
      console.warn("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [role, userId, walletAddress, email, statusFilter]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(key || text);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      tx.title?.toLowerCase().includes(q) ||
      tx.category?.toLowerCase().includes(q) ||
      tx.txHash?.toLowerCase().includes(q) ||
      tx.learner?.name?.toLowerCase().includes(q) ||
      tx.learner?.walletAddress?.toLowerCase().includes(q) ||
      tx.mentor?.name?.toLowerCase().includes(q) ||
      tx.mentor?.walletAddress?.toLowerCase().includes(q) ||
      (tx.onchainSessionId && String(tx.onchainSessionId).includes(q))
    );
  });

  // Calculate highest GMV month for scaling chart
  const maxChartGmv = Math.max(10, ...chartData.map((c) => c.gmv || 0));

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* ── 1. Financial & Volume Recap Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV Card */}
        <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs hover:border-purple-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
            <Coins size={20} />
          </div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {role === "learner"
              ? "Total Deposited Escrow"
              : role === "mentor"
              ? "Total Mentorship Volume"
              : "Total Protocol GMV"}
          </p>
          <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
            ${recap.totalGmv?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
          </p>
          <p className="text-purple-700 text-[11px] mt-1 font-semibold">
            {role === "learner"
              ? "Across all enrolled mentorship sessions"
              : role === "mentor"
              ? "Gross value of sessions booked with you"
              : "Gross Merchandise Value on Arbitrum"}
          </p>
        </div>

        {/* Disbursed / Selesai Cair Card */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {role === "learner"
              ? "Completed & Released"
              : role === "mentor"
              ? "Net Earnings Cleared (90%)"
              : "Disbursed Payouts (90%)"}
          </p>
          <p className="text-emerald-700 font-black text-2xl mt-1 tracking-tight">
            ${recap.totalDisbursed?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
          </p>
          <p className="text-emerald-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Successfully cleared to mentor wallets ({recap.disbursedCount} txs)</span>
          </p>
        </div>

        {/* Held in Escrow Card */}
        <div className="bg-white border-2 border-amber-100 rounded-3xl p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-2.5">
            <Lock size={20} />
          </div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {role === "learner"
              ? "Protected in Escrow"
              : role === "mentor"
              ? "Pending Milestone Escrow"
              : "Active In Escrow Pool"}
          </p>
          <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
            ${recap.totalInEscrow?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
          </p>
          <p className="text-amber-700 text-[11px] mt-1 font-semibold">
            Locked in smart contract vault ({recap.pendingCount} active)
          </p>
        </div>

        {/* Protocol Fee or Gas Savings Card */}
        <div className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs hover:border-purple-300 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5">
            {role === "learner" ? <ShieldCheck size={20} /> : <TrendingUp size={20} />}
          </div>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            {role === "learner"
              ? "100% Gas Fee Subsidy"
              : role === "mentor"
              ? "Protocol Fee Deductions (10%)"
              : "Protocol Revenue (10%)"}
          </p>
          <p className="text-slate-950 font-black text-2xl mt-1 tracking-tight">
            {role === "learner"
              ? "Zero Gas Fee"
              : `$${recap.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC`}
          </p>
          <p className="text-purple-700 text-[11px] mt-1 font-semibold">
            {role === "learner"
              ? "100% Arbitrum costs covered by Sponsor Wallet"
              : "10% platform protocol cut allocated to Treasury"}
          </p>
        </div>
      </div>

      {/* ── 2. Interactive Financial Chart (Admin & High-Level Overview) ── */}
      {role === "admin" && chartData.length > 0 && (
        <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BarChart3 size={15} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Protocol Escrow & Revenue Trajectory (GMV Analytics)
                </h3>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                Monthly throughput distribution showing Gross Merchandise Volume (GMV), net mentor disbursements, and protocol treasury fees.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-purple-700">
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> GMV Volume
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Cleared Payouts (90%)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700">
                <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" /> Protocol Fees (10%)
              </span>
            </div>
          </div>

          {/* SVG Interactive Multi-Bar Chart */}
          <div className="pt-2">
            <div className="h-56 sm:h-64 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-200">
              {chartData.map((cd, idx) => {
                const gmvHeight = Math.max(8, Math.round((cd.gmv / maxChartGmv) * 100));
                const disbHeight = Math.max(6, Math.round((cd.disbursed / maxChartGmv) * 100));
                const revHeight = Math.max(4, Math.round((cd.revenue / maxChartGmv) * 100));

                return (
                  <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group relative">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-14 bg-slate-950 text-white text-[11px] rounded-xl py-1.5 px-3 whitespace-nowrap z-20 shadow-xl border border-purple-500/30">
                      <p className="font-bold text-purple-300">{cd.period}</p>
                      <p>GMV: <strong className="text-white">${cd.gmv} USDC</strong></p>
                      <p>Disbursed: <strong className="text-emerald-400">${cd.disbursed} USDC</strong></p>
                      <p>Protocol Fee: <strong className="text-indigo-300">${cd.revenue} USDC</strong></p>
                    </div>

                    {/* Bars Cluster */}
                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                      {/* GMV Bar */}
                      <div
                        style={{ height: `${gmvHeight}%` }}
                        className="w-1/3 bg-gradient-to-t from-purple-700 to-purple-500 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                      />
                      {/* Disbursed Bar */}
                      <div
                        style={{ height: `${disbHeight}%` }}
                        className="w-1/3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                      />
                      {/* Revenue Bar */}
                      <div
                        style={{ height: `${revHeight}%` }}
                        className="w-1/3 bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg transition-all group-hover:brightness-110 shadow-xs"
                      />
                    </div>

                    <span className="text-[11px] font-bold text-slate-500 mt-2 block">
                      {cd.period}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Filters, Search Bar & Status Pills ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-3xl border-2 border-purple-100 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by gig, mentor, learner, or tx hash..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-purple-50/50 border border-purple-100 text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "ALL", label: "All Txs" },
            { id: "DISBURSED", label: "Disbursed to Mentor" },
            { id: "IN_ESCROW", label: "Held in Escrow" },
            { id: "REFUNDED", label: "Refunded" },
            { id: "DISPUTED", label: "Disputed" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st.id
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/25"
                  : "bg-purple-50/70 text-slate-700 border border-purple-100 hover:bg-purple-100"
              }`}
            >
              {st.label}
            </button>
          ))}
          <button
            onClick={fetchTransactions}
            title="Refresh Transactions"
            className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── 4. Comprehensive Transaction History Table ── */}
      <div className="bg-white border-2 border-purple-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-purple-50/60 border-b border-purple-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Session / Offering</th>
                <th className="py-3.5 px-4">
                  {role === "mentor" ? "Student" : role === "learner" ? "Mentor" : "Parties"}
                </th>
                <th className="py-3.5 px-4">
                  {role === "learner"
                    ? "Amount Paid (Escrow)"
                    : role === "mentor"
                    ? "Gross Session Value"
                    : "Gross Escrow (GMV)"}
                </th>
                <th className="py-3.5 px-4">
                  {role === "learner" ? "Gas Subsidy" : "Net Mentor (90%)"}
                </th>
                <th className="py-3.5 px-4">Disbursement Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5 text-right">Recap & Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-purple-600" />
                      <span>Loading on-chain verified transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <Receipt size={28} className="mx-auto text-purple-300" />
                    <p className="font-bold text-slate-700">No transactions recorded matching criteria.</p>
                    <p className="text-xs text-slate-400">Transactions appear automatically upon Arbitrum escrow deposit.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-purple-50/40 transition-colors">
                    {/* Session Title & On-Chain ID */}
                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{tx.title}</span>
                          {tx.onchainSessionId && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono text-[10px] font-extrabold border border-purple-200">
                              #{tx.onchainSessionId}
                            </span>
                          )}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{tx.category}</p>
                      </div>
                    </td>

                    {/* Parties */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        {role === "mentor" ? (
                          <div className="text-slate-700">
                            <span className="font-medium text-slate-400">Student: </span>
                            <strong className="text-slate-900">{tx.learner?.name || "Learner"}</strong>
                            {tx.learner?.walletAddress && (
                              <span className="text-slate-400 font-mono ml-1">
                                ({tx.learner.walletAddress.slice(0, 6)}...{tx.learner.walletAddress.slice(-4)})
                              </span>
                            )}
                          </div>
                        ) : role === "learner" ? (
                          <div className="text-slate-700">
                            <span className="font-medium text-slate-400">Mentor: </span>
                            <strong className="text-slate-900">{tx.mentor?.name || "Mentor"}</strong>
                            {tx.mentor?.walletAddress && (
                              <span className="text-slate-400 font-mono ml-1">
                                ({tx.mentor.walletAddress.slice(0, 6)}...{tx.mentor.walletAddress.slice(-4)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="text-slate-700">
                              <span className="font-medium text-slate-400">Student: </span>
                              <strong className="text-slate-900">{tx.learner?.name || "Learner"}</strong>
                              {tx.learner?.walletAddress && (
                                <span className="text-slate-400 font-mono ml-1">
                                  ({tx.learner.walletAddress.slice(0, 6)}...{tx.learner.walletAddress.slice(-4)})
                                </span>
                              )}
                            </div>
                            <div className="text-slate-700">
                              <span className="font-medium text-slate-400">Mentor: </span>
                              <strong className="text-slate-900">{tx.mentor?.name || "Mentor"}</strong>
                              {tx.mentor?.walletAddress && (
                                <span className="text-slate-400 font-mono ml-1">
                                  ({tx.mentor.walletAddress.slice(0, 6)}...{tx.mentor.walletAddress.slice(-4)})
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Gross Escrow Amount */}
                    <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                      ${tx.grossAmount.toFixed(2)} {tx.currency}
                    </td>

                    {/* Net / Fee Breakdown */}
                    <td className="py-3.5 px-4">
                      {role === "learner" ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold shadow-2xs">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>100% Sponsored</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">Zero Gas Fee</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-emerald-700 font-black">${tx.mentorPayout.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 block">(10% fee: ${tx.platformFee.toFixed(2)})</span>
                        </div>
                      )}
                    </td>

                    {/* Disbursement Status */}
                    <td className="py-3.5 px-4">
                      {tx.isDisbursed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-[11px] shadow-xs">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>Disbursed to Mentor</span>
                        </span>
                      ) : tx.status === "IN_ESCROW" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[11px]">
                          <Lock size={13} className="text-amber-600 shrink-0" />
                          <span>Held in Escrow Vault</span>
                        </span>
                      ) : tx.status === "REFUNDED" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px]">
                          <RotateCcw size={13} className="text-slate-500 shrink-0" />
                          <span>Refunded to Learner</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px]">
                          <Scale size={13} className="text-rose-600 shrink-0" />
                          <span>In Arbitration Dispute</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions: Always show Recap AND Explorer button */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer border border-purple-200"
                        >
                          Recap
                        </button>
                        <a
                          href={
                            tx.txHash
                              ? `https://sepolia.arbiscan.io/tx/${tx.txHash}`
                              : "https://sepolia.arbiscan.io/address/0x22f3aa08A15d24f7D274b33A234d96EDC5A98E88"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Arbitrum Sepolia Explorer"
                          className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                        >
                          <span>Explorer</span>
                          <ExternalLink size={11} className="text-slate-500" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Detailed Transaction Recap Modal ── */}
      <Dialog open={Boolean(selectedTx)} onOpenChange={(open) => !open && setSelectedTx(null)}>
        {selectedTx && (
          <DialogContent className="max-w-lg p-6 sm:p-7 rounded-3xl space-y-5">
            <DialogHeader className="pb-3 border-b border-purple-100">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <DialogTitle className="text-base font-extrabold text-slate-900">
                      Escrow Settlement Recap
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      On-chain non-custodial milestone record verified on Arbitrum.
                    </DialogDescription>
                  </div>
                </div>

                {selectedTx.isDisbursed ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[10px] uppercase tracking-wider">
                    Disbursed
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-black text-[10px] uppercase tracking-wider">
                    In Escrow
                  </span>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              {/* Financial Calculation Breakdown Box */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Offering Base Rate:</span>
                  <span className="font-bold text-slate-900 font-mono">${(selectedTx.grossAmount / 1.10).toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">Protocol Fee Cut (10%):</span>
                  <span className="font-bold text-purple-700 font-mono">${selectedTx.platformFee.toFixed(2)} USDC</span>
                </div>
                <div className="pt-2 border-t border-purple-200 flex justify-between items-center font-black text-sm">
                  <span className="text-slate-900">Gross Learner Deposit (GMV):</span>
                  <span className="text-slate-950 font-mono">${selectedTx.grossAmount.toFixed(2)} USDC</span>
                </div>
                <div className="pt-1 flex justify-between items-center font-black text-xs text-emerald-700">
                  <span>Net Mentor Settlement (90%):</span>
                  <span className="font-mono">${selectedTx.mentorPayout.toFixed(2)} USDC</span>
                </div>
              </div>

              {/* Status & Disbursement Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Payout Status:</span>
                  <strong className={selectedTx.isDisbursed ? "text-emerald-700 font-extrabold" : "text-amber-700 font-extrabold"}>
                    {selectedTx.statusLabel}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">On-Chain Session ID:</span>
                  <span className="font-mono font-bold text-purple-700">
                    {selectedTx.onchainSessionId ? `#${selectedTx.onchainSessionId}` : "Escrow Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Created Timestamp:</span>
                  <span className="text-slate-700">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Addresses */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Learner / Student:</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedTx.learner?.name || "Anonymous Learner"}</p>
                  <p className="font-mono text-[11px] text-slate-500 break-all">{selectedTx.learner?.walletAddress || "—"}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Mentor:</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedTx.mentor?.name || "Verified Mentor"}</p>
                  <p className="font-mono text-[11px] text-slate-500 break-all">{selectedTx.mentor?.walletAddress || "—"}</p>
                </div>
              </div>

              {/* Tx Hash */}
              {selectedTx.txHash && (
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <span className="text-purple-700 text-[10px] uppercase font-extrabold block">Arbitrum Transaction Hash:</span>
                    <span className="font-mono text-[11px] text-slate-700 truncate block">
                      {selectedTx.txHash}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(selectedTx.txHash, "modal-hash")}
                      className="p-1.5 rounded-lg bg-white text-purple-700 border border-purple-200 hover:bg-purple-100 cursor-pointer"
                      title="Copy Tx Hash"
                    >
                      {copiedHash === "modal-hash" ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${selectedTx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                      title="View on Arbiscan"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
