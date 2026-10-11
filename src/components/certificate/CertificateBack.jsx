"use client";

import React, { useState } from "react";
import { ExternalLink, CheckCircle2, Shield, Copy, Check, FileText } from "lucide-react";

export default function CertificateBack({
  certificateId = "TL-SBT-0001",
  txHash = "0x0000000000000000000000000000000000000000000000000000000000000000",
  blockNumber = 254821490,
  contractAddress = "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D",
  learnerAddress = "0x0000000000000000000000000000000000000000",
  mentorAddress = "0x0000000000000000000000000000000000000000",
  numericScore = 95,
  assignments = [],
  isFlipButtonVisible = true,
  onFlip = () => {},
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const explorerUrl = txHash?.startsWith("0x")
    ? `https://sepolia.arbiscan.io/tx/${txHash}`
    : `https://sepolia.arbiscan.io/address/${contractAddress}`;

  const defaultAssignments =
    assignments && assignments.length > 0
      ? assignments
      : [
          { title: "Core Milestone Deliverable #1", status: "APPROVED", score: numericScore },
          { title: "Practical Exercise & Code Review", status: "APPROVED", score: numericScore },
          { title: "Final Capstone Assessment", status: "APPROVED", score: numericScore },
        ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8 sm:p-12 text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Decorative Outer Border Lines */}
      <div className="absolute inset-3 rounded-2xl border border-indigo-200/80 pointer-events-none" />
      <div className="absolute inset-5 rounded-xl border border-slate-100 pointer-events-none" />

      {/* Header */}
      <div className="text-center relative z-10 pt-2 pb-6 border-b border-slate-100">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-2">
          <Shield size={14} className="text-indigo-600" />
          <span>Verifiable Credential Ledger & Academic Transcript</span>
        </div>
        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold font-mono">
          Serial ID: {certificateId}
        </p>
      </div>

      {/* Grid: Left = Blockchain Proof, Right = Transcript */}
      <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Left Column: Blockchain Verification Proof */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Blockchain Attestation Proof
            </h3>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Arbitrum Sepolia
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
            {/* Contract Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Registry Contract</span>
              <div className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono text-[11px]">
                <span className="truncate max-w-[200px] text-slate-700">{contractAddress}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(contractAddress, "contract")}
                  className="text-slate-400 hover:text-indigo-600 p-1"
                  title="Copy contract address"
                >
                  {copiedKey === "contract" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Transaction Hash */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Transaction Hash</span>
              <div className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono text-[11px]">
                <span className="truncate max-w-[200px] text-slate-700">{txHash}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(txHash, "tx")}
                  className="text-slate-400 hover:text-indigo-600 p-1"
                  title="Copy transaction hash"
                >
                  {copiedKey === "tx" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Learner Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Learner Wallet</span>
              <div className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono text-[11px]">
                <span className="truncate max-w-[200px] text-slate-700">{learnerAddress}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(learnerAddress, "learner")}
                  className="text-slate-400 hover:text-indigo-600 p-1"
                  title="Copy wallet address"
                >
                  {copiedKey === "learner" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Mentor Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Mentor Wallet</span>
              <div className="flex items-center justify-between bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono text-[11px]">
                <span className="truncate max-w-[200px] text-slate-700">{mentorAddress}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(mentorAddress, "mentor")}
                  className="text-slate-400 hover:text-indigo-600 p-1"
                  title="Copy wallet address"
                >
                  {copiedKey === "mentor" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Block Number & Explorer */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600">
              <span>Block: <strong>#{blockNumber}</strong></span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
              >
                <span>View on Arbiscan</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Evaluation Transcript */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Deliverables Evaluation Transcript
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Passed ({numericScore}%)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
            <div className="divide-y divide-slate-200/80">
              {defaultAssignments.slice(0, 4).map((task, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-[11px]">
                      {task.title || task.definition?.title || `Task #${idx + 1}`}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Passing Criteria: &ge;70%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={10} />
                      <span>{task.status || "APPROVED"}</span>
                    </span>
                    <p className="text-[10px] font-mono font-bold text-slate-700 mt-0.5">
                      {task.score !== undefined ? `${task.score}%` : `${numericScore}%`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Grade Summary */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/60">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Cumulative Result</p>
                <p className="text-xs font-bold text-slate-900">
                  Satisfied All Curriculum Tasks
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-indigo-700">{numericScore}%</span>
                <span className="text-[10px] block text-emerald-600 font-bold uppercase">Passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Guarantee Note */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center text-[11px] text-indigo-900 leading-relaxed relative z-10">
        Non-custodial milestone settlement issued via Trust Lesson on Arbitrum. Cryptographically signed, immutable, and soulbound to the recipient address.
      </div>

      {/* Flip Prompt Footer */}
      {isFlipButtonVisible && (
        <div className="mt-6 text-center pt-3 border-t border-slate-100/80">
          <button
            onClick={onFlip}
            type="button"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
          >
            Turn over to view Certificate Front
          </button>
        </div>
      )}
    </div>
  );
}
