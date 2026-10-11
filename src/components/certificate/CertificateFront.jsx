"use client";

import React from "react";
import { ShieldCheck, Award } from "lucide-react";

export default function CertificateFront({
  learnerName = "Verified Learner",
  mentorName = "Verified Mentor",
  gigTitle = "Decentralized Mentorship & Engineering",
  date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  certificateId = "TL-SBT-0001",
  numericScore = 95,
  isFlipButtonVisible = true,
  onFlip = () => {},
}) {
  let gradeLabel = "Good";
  let gradeBg = "bg-emerald-50 text-emerald-700 border-emerald-300";
  if (numericScore >= 90) {
    gradeLabel = "Amazing";
    gradeBg = "bg-purple-50 text-purple-700 border-purple-300";
  } else if (numericScore >= 80) {
    gradeLabel = "Great";
    gradeBg = "bg-blue-50 text-blue-700 border-blue-300";
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-8 sm:p-12 text-slate-800 relative overflow-hidden font-sans select-none">
      {/* Decorative Outer Border Lines */}
      <div className="absolute inset-3 rounded-2xl border border-indigo-200/80 pointer-events-none" />
      <div className="absolute inset-5 rounded-xl border border-slate-100 pointer-events-none" />

      {/* Corner Ornaments */}
      <div className="absolute top-5 left-5 w-4 h-4 bg-indigo-600 rounded-xs" />
      <div className="absolute top-5 right-5 w-4 h-4 bg-indigo-600 rounded-xs" />
      <div className="absolute bottom-5 left-5 w-4 h-4 bg-indigo-600 rounded-xs" />
      <div className="absolute bottom-5 right-5 w-4 h-4 bg-indigo-600 rounded-xs" />

      {/* Top Header */}
      <div className="text-center relative z-10 pt-2 pb-6 border-b border-slate-100">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck size={14} className="text-indigo-600" />
          <span>Trust Lesson Protocol Attestation</span>
        </div>
        <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
          Arbitrum Non-Custodial Smart Escrow Network
        </p>
      </div>

      {/* Main Certificate Title */}
      <div className="text-center my-8 relative z-10 space-y-3">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-serif">
          CERTIFICATE OF COMPLETION
        </h1>
        <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">
          This credential officially recognizes that
        </p>

        {/* Learner Name */}
        <div className="py-2">
          <div className="text-2xl sm:text-4xl font-extrabold text-indigo-950 font-serif border-b-2 border-indigo-500/30 inline-block px-8 pb-1">
            {learnerName}
          </div>
        </div>

        <p className="text-xs text-slate-600 max-w-xl mx-auto pt-1 leading-relaxed">
          has successfully fulfilled all curriculum requirements, milestone deliverables, and hands-on assessments for
        </p>

        {/* Course / Gig Title */}
        <h2 className="text-lg sm:text-2xl font-bold text-indigo-700 px-4">
          &ldquo;{gigTitle}&rdquo;
        </h2>

        {/* Achievement Grade Badge */}
        <div className="pt-2 flex justify-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide shadow-xs ${gradeBg}`}>
            <Award size={15} />
            <span>Achievement Grade: {gradeLabel} ({numericScore}%)</span>
          </div>
        </div>
      </div>

      {/* Signatures & Certification Details Grid */}
      <div className="pt-8 mt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center items-end relative z-10">
        {/* Mentor Signature (Left) */}
        <div className="space-y-1">
          <div className="font-serif italic text-lg sm:text-xl text-indigo-900 h-9 flex items-center justify-center border-b border-slate-300 pb-1 mx-4 sm:mx-6">
            {mentorName}
          </div>
          <p className="text-xs font-bold text-slate-900">{mentorName}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Verified Instructor</p>
        </div>

        {/* Certificate Serial & Date (Center) */}
        <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-slate-100 py-3 sm:py-0">
          <p className="text-[10px] uppercase font-bold text-slate-400">Credential Identifier</p>
          <p className="text-xs font-mono font-bold text-indigo-700">{certificateId}</p>
          <p className="text-[10px] text-slate-500 font-medium">Issued on {date}</p>
        </div>

        {/* CEO Signature (Right: Rayhan Young) */}
        <div className="space-y-1">
          <div className="font-serif italic text-lg sm:text-xl text-indigo-900 h-9 flex items-center justify-center border-b border-slate-300 pb-1 mx-4 sm:mx-6">
            Rayhan Young
          </div>
          <p className="text-xs font-bold text-slate-900">Rayhan Young</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Founder & CEO, Trust Lesson</p>
        </div>
      </div>

      {/* Flip Prompt Footer */}
      {isFlipButtonVisible && (
        <div className="mt-8 text-center pt-4 border-t border-slate-100/80">
          <button
            onClick={onFlip}
            type="button"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
          >
            Turn over to view On-Chain Blockchain Proof & Transcript
          </button>
        </div>
      )}
    </div>
  );
}
