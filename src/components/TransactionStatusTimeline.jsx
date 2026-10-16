"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";

/**
 * Transaction Status Timeline
 * Visual on-chain progress tracker with real-time indexer sync, Arbiscan links, and estimated stage times.
 * Stages: [Deposited] -> [Locked] -> [In Session] -> [Completed / Released]
 */
export default function TransactionStatusTimeline({
  status = "FUNDED",
  txHashCreate = null,
  txHashRelease = null,
  onchainSessionId = null,
  contractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT || null,
  amount = null,
  createdAt = null,
  compact = false,
}) {
  const [copiedHash, setCopiedHash] = useState(null);

  const handleCopy = (hash, label) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Determine stage progress index
  // 0: Deposited, 1: Locked, 2: In Session, 3: Completed / Released
  let activeIndex = 0;
  if (status === "FUNDED") activeIndex = 1;
  else if (status === "IN_SESSION") activeIndex = 2;
  else if (status === "COMPLETED" || status === "RESOLVED") activeIndex = 3;
  else if (status === "DISPUTED") activeIndex = 2;

  const isDisputed = status === "DISPUTED";
  const isCancelled = status === "CANCELLED";

  const stages = [
    {
      id: "deposited",
      title: "Deposited",
      desc: "USDC escrow deposit confirmed on-chain",
      estTime: "~2-5s (Arbitrum L2)",
      txHash: txHashCreate,
      link: txHashCreate ? `https://sepolia.arbiscan.io/tx/${txHashCreate}` : null,
    },
    {
      id: "locked",
      title: "Locked",
      desc: "Collateral secured in EscrowRouter vault",
      estTime: "Instant on-chain",
      txHash: null,
      link: contractAddress ? `https://sepolia.arbiscan.io/address/${contractAddress}` : null,
    },
    {
      id: "in_session",
      title: "In Session",
      desc: "Live classes and task submissions active",
      estTime: "Course duration",
      txHash: null,
      link: null,
    },
    {
      id: "completed",
      title: "Completed",
      desc: "Funds settled & SBT certificate issued",
      estTime: "~2-5s confirmation",
      txHash: txHashRelease,
      link: txHashRelease ? `https://sepolia.arbiscan.io/tx/${txHashRelease}` : null,
    },
  ];

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${compact ? "p-4 space-y-3" : "p-5 sm:p-6 space-y-5"} shadow-xs`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center shrink-0">
            <Activity size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Transaction Status Timeline
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Indexer
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Real-time on-chain verification powered by Arbitrum Sepolia indexer.
            </p>
          </div>
        </div>

        {onchainSessionId !== null && onchainSessionId !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            <Layers size={13} className="text-cyan-600" />
            <span>Session #{onchainSessionId}</span>
          </div>
        )}
      </div>

      {/* Visual Progress Steps Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {stages.map((stage, idx) => {
          const isDone = idx < activeIndex || (idx === 3 && activeIndex === 3);
          const isCurrent = idx === activeIndex && activeIndex !== 3;
          const isPending = idx > activeIndex;

          return (
            <div
              key={stage.id}
              className={`relative p-3.5 rounded-2xl border transition-all ${
                isDone
                  ? "bg-emerald-50/50 border-emerald-200 text-slate-900 shadow-xs"
                  : isCurrent
                  ? isDisputed
                    ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-100"
                    : "bg-cyan-50/60 border-cyan-300 ring-2 ring-cyan-100"
                  : "bg-slate-50/60 border-slate-200 text-slate-400"
              }`}
            >
              {/* Connector line indicator (desktop only) */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight size={14} />
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-xs"
                        : isCurrent
                        ? isDisputed
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-cyan-600 text-white animate-pulse"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={14} />
                    ) : isCurrent ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Clock size={12} />
                    )}
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">
                    {stage.title}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    isDone
                      ? "bg-emerald-100 text-emerald-800"
                      : isCurrent
                      ? isDisputed
                        ? "bg-amber-100 text-amber-800"
                        : "bg-cyan-100 text-cyan-800"
                      : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {isDone ? "Done" : isCurrent ? (isDisputed ? "Disputed" : "Active") : "Queued"}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-tight mb-2">
                {stage.desc}
              </p>

              <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-[10px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-medium">Estimated Time:</span>
                  <span className="font-mono font-bold text-slate-700">{stage.estTime}</span>
                </div>

                {stage.link ? (
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-medium text-slate-500">Explorer:</span>
                    <div className="flex items-center gap-1.5">
                      {stage.txHash && (
                        <button
                          type="button"
                          onClick={() => handleCopy(stage.txHash, stage.id)}
                          className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-0.5 cursor-pointer"
                          title="Copy Hash"
                        >
                          {copiedHash === stage.id ? <Check size={10} /> : <Copy size={10} />}
                        </button>
                      )}
                      <a
                        href={stage.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-700 hover:text-cyan-900 font-extrabold underline flex items-center gap-0.5"
                      >
                        <span>Arbiscan</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-0.5 text-slate-400">
                    <span>Explorer:</span>
                    <span>State Monitored</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Notice */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <ShieldCheck size={16} className="text-cyan-600 shrink-0" />
          <span>
            {amount ? `${amount} USDC escrowed.` : ""} Funds are non-custodial and released strictly upon milestone verification.
          </span>
        </div>
        {contractAddress && (
          <a
            href={`https://sepolia.arbiscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-700 hover:text-cyan-900 font-extrabold flex items-center gap-1 shrink-0 text-[11px]"
          >
            <span>View Escrow Contract</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}
