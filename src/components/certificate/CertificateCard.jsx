"use client";

import React, { useState } from "react";
import CertificateFront from "./CertificateFront";
import CertificateBack from "./CertificateBack";
import {
  RotateCw,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
} from "lucide-react";

export default function CertificateCard({
  certificate,
  assignments = [],
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!certificate) return null;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(certificate.id)}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TrustLesson-Certificate-${certificate.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Unable to generate PDF at this moment. You can use Print as PDF instead.");
    } finally {
      setDownloading(false);
    }
  };

  const explorerUrl = certificate.txHash?.startsWith("0x")
    ? `https://sepolia.arbiscan.io/tx/${certificate.txHash}`
    : `https://sepolia.arbiscan.io/address/${certificate.contractAddress || "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D"}`;

  return (
    <div className="space-y-6">
      {/* Control Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            type="button"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-500/20"
          >
            <RotateCw size={14} className={isFlipped ? "rotate-180 transition-transform duration-300" : "transition-transform duration-300"} />
            <span>{isFlipped ? "Show Front Side" : "Show Back (Proof & Transcript)"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            type="button"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download official 2-page PDF"
          >
            <Download size={13} />
            <span>{downloading ? "Generating..." : "Download PDF"}</span>
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Print Certificate"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <button
            onClick={handleCopy}
            type="button"
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Copy Public Link"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? "Link Copied" : "Share"}</span>
          </button>

          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 border border-indigo-200"
          >
            <span>Arbiscan</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Render Active Face */}
      <div className="transition-all duration-300">
        {!isFlipped ? (
          <CertificateFront
            learnerName={certificate.learnerName}
            mentorName={certificate.mentorName}
            gigTitle={certificate.skillTitle}
            date={certificate.issuedAt ? new Date(certificate.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined}
            certificateId={certificate.id}
            numericScore={certificate.rating ? certificate.rating * 20 : 95}
            onFlip={() => setIsFlipped(true)}
          />
        ) : (
          <CertificateBack
            certificateId={certificate.id}
            txHash={certificate.txHash}
            blockNumber={certificate.blockNumber}
            contractAddress={certificate.contractAddress}
            learnerAddress={certificate.learnerAddress}
            mentorAddress={certificate.mentorAddress}
            numericScore={certificate.rating ? certificate.rating * 20 : 95}
            assignments={assignments}
            onFlip={() => setIsFlipped(false)}
          />
        )}
      </div>
    </div>
  );
}
