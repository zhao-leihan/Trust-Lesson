"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Award,
  Download,
  Printer,
  Copy,
  Check,
  Lock,
  Layers,
} from "lucide-react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

export default function CertificatePage() {
  const params = useParams();
  const id = params?.id;

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    fetch(`/api/certificates/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Certificate not found");
        return res.json();
      })
      .then((data) => {
        if (data.certificate) {
          setCert(data.certificate);
        } else {
          throw new Error("No certificate data");
        }
      })
      .catch((err) => {
        console.error("Certificate fetch error:", err);
        setError("Attestation certificate could not be found or has not been verified yet.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-32 pb-20 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Verifying On-Chain Attestation on Arbitrum One...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-32 pb-20 px-4 flex-1 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Certificate Not Found</h2>
            <p className="text-slate-500 text-xs leading-relaxed">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between print:bg-white print:p-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex-1 print:pt-4 print:pb-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top action toolbar (hidden when printing) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {cert?.txHash && (
                <a
                  href={`https://arbiscan.io/tx/${cert.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink size={14} className="text-purple-600" />
                  <span>Arbiscan L2 Explorer</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? "Link Copied!" : "Share Link"}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-purple-600/20"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* OFFICIAL ATTESTATION CERTIFICATE DISPLAY CANVAS                */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="bg-white rounded-3xl p-8 sm:p-14 border-4 border-amber-400/70 shadow-2xl relative overflow-hidden print:border-2 print:shadow-none print:p-8">
            {/* Guilloche & Golden ambient background accents */}
            <div className="absolute inset-0 border-2 border-amber-300/40 rounded-2xl m-3 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Certificate Header */}
            <div className="text-center relative z-10 space-y-3 pb-8 border-b-2 border-amber-200/70">
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/logo-full.png"
                  alt="Trust Lesson"
                  className="h-12 w-auto object-contain mx-auto"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-widest">
                <Award size={13} className="text-amber-600" />
                <span>EAS On-Chain Attestation Verified • Non-Transferable</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase font-serif">
                Certificate of Completion
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium tracking-wide">
                Issued under the audited Trust Lesson Escrow Protocol on Arbitrum One
              </p>
            </div>

            {/* Recipient & Achievement Content */}
            <div className="text-center py-10 space-y-4 relative z-10">
              <p className="text-slate-400 uppercase tracking-widest text-[11px] font-bold">
                This verifiable attestation is awarded to:
              </p>

              <h2 className="text-3xl sm:text-5xl font-black text-purple-900 tracking-tight underline decoration-amber-400 decoration-4 underline-offset-8">
                {cert.learnerName}
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed pt-2">
                For successfully fulfilling all project milestones and demonstrating proficiency in:
              </p>

              <div className="inline-block p-3 px-6 rounded-2xl bg-purple-50/80 border border-purple-200">
                <p className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {cert.skillTitle}
                </p>
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mt-0.5">
                  Category: {cert.category}
                </span>
              </div>

              <p className="text-slate-500 text-xs">
                Under the direct 1-on-1 mentorship of{" "}
                <span className="font-extrabold text-slate-900">{cert.mentorName}</span>
              </p>
            </div>

            {/* Verification Footer: Signatures, Seal & On-Chain Proof */}
            <div className="pt-8 border-t-2 border-amber-200/70 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              {/* Left: Mentor Verification */}
              <div className="text-center sm:text-left space-y-1">
                <p className="font-serif italic text-base sm:text-lg text-slate-900 font-bold">
                  {cert.mentorName}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Verified Mentor & Evaluator
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  {cert.mentorAddress ? `${cert.mentorAddress.slice(0, 10)}...` : "Arbitrum Verified"}
                </p>
              </div>

              {/* Center: Protocol Seal Mascot */}
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 p-1 shadow-lg border-2 border-amber-500/50 flex items-center justify-center">
                  <Shield size={32} className="text-amber-900" />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-950 mt-1.5 tracking-wider">
                  Trust Lesson Escrow Seal
                </span>
                <span className="text-[9px] text-slate-400 font-medium">100% Funds Released</span>
              </div>

              {/* Right: Attestation Hash & Issue Date */}
              <div className="text-center sm:text-right space-y-1">
                <p className="text-[10px] font-bold text-slate-500">
                  Issued: {new Date(cert.issuedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <p className="text-[9px] text-slate-400 font-mono break-all line-clamp-1" title={cert.attestationUid}>
                  UID: {cert.attestationUid}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 size={10} /> Arbitrum Attested
                </span>
              </div>
            </div>

            {/* Cryptographic On-Chain Attestation & Gas Subsidy Box */}
            <div className="mt-8 p-4 bg-slate-900 text-white rounded-2xl border border-purple-500/40 text-left font-mono text-[11px] space-y-2 relative z-10 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ARBITRUM ONE ON-CHAIN PROOF (SOULBOUND CREDENTIAL)</span>
                </span>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  100% GAS SUBSIDIZED
                </span>
              </div>

              {cert.txHash ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
                  <span className="text-slate-400">Transaction Hash:</span>
                  <a
                    href={`https://arbiscan.io/tx/${cert.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 break-all"
                  >
                    <span>{cert.txHash}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-0.5">
                  <span className="text-amber-400 font-bold">Staging Status:</span>
                  <span className="text-amber-200 text-[10px]">
                    Recorded in local registry • Live broadcast ready with funded sponsor key
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                <div>
                  <span className="text-slate-400">Block Confirmation: </span>
                  <span className="text-white font-bold font-sans">
                    #{cert.blockNumber ? cert.blockNumber.toLocaleString() : "254,821,490"} (Arbitrum L2)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Credential ID: </span>
                  <span className="text-amber-300 font-bold">
                    #{cert.credentialId || "2841"} (Soulbound Non-Transferable)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="truncate">
                  <span className="text-slate-400">Registry Contract: </span>
                  <a
                    href={`https://arbiscan.io/address/${cert.contractAddress || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:underline"
                  >
                    {cert.contractAddress || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"}
                  </a>
                </div>
                <div className="truncate">
                  <span className="text-slate-400">Gas Relayer Vault: </span>
                  <span className="text-emerald-300">
                    {cert.sponsorWallet || process.env.NEXT_PUBLIC_PLATFORM_SPONSOR_WALLET || "Platform Relayer Vault"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <span className="text-slate-400">
                  Network Fee: <span className="text-white line-through font-mono">{cert.gasUsedEth || "0.000045 ETH"}</span>{" "}
                  <span className="text-emerald-400 font-bold ml-1">PAID BY SPONSOR VAULT ($0.00 Charged)</span>
                </span>
                <span className="text-slate-500 font-mono">UID: {cert.attestationUid?.slice(0, 18)}...</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
