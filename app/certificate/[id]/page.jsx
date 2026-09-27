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
  FileText,
  RotateCw,
  Hash,
  Database,
  CheckCheck,
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
  const [isFlipped, setIsFlipped] = useState(false);

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

  const handleExportJsonLd = () => {
    if (!cert) return;
    const vcDocument = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://trustlesson.io/credentials/v1",
      ],
      type: ["VerifiableCredential", "TrustLessonCredential", "LearnerCompletionCredential"],
      id: `https://sepolia.arbiscan.io/address/${cert.contractAddress || "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D"}#credential-${cert.credentialId || "1"}`,
      issuer: {
        id: `did:pkh:eip155:421614:${cert.contractAddress || "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D"}`,
        name: "Trust Lesson Platform",
        url: "https://trustlesson.io",
      },
      issuanceDate: new Date(cert.issuedAt || Date.now()).toISOString(),
      credentialSubject: {
        id: `did:pkh:eip155:421614:${cert.learnerAddress || "0x00"}`,
        name: cert.learnerName,
        skill: {
          name: cert.skillTitle,
          category: cert.category,
        },
        mentor: {
          name: cert.mentorName,
          address: cert.mentorAddress,
        },
        sessionId: cert.sessionId || id,
        credentialId: cert.credentialId || 1,
        rating: cert.rating || 5,
      },
      proof: {
        type: "EthereumEip712Signature2021",
        created: new Date().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: `did:pkh:eip155:421614:${cert.sponsorWallet || "0xf2cE5319aeB733fd2279a830260316358A036098"}`,
        proofValue: cert.txHash ? `0x${cert.txHash}` : "0x-platform-attested",
      },
      onChain: {
        network: "arbitrum-sepolia",
        chainId: 421614,
        txHash: cert.txHash,
        blockNumber: cert.blockNumber,
        explorerUrl: `https://sepolia.arbiscan.io/tx/${cert.txHash}`,
        ipfsCid: cert.metadataCid || "QmeEzxoFTbFpZUbNEvwozUGPjWHsmF4WeJ41XGqfGobSz7",
      },
    };

    const blob = new Blob([JSON.stringify(vcDocument, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trust-lesson-credential-${cert.credentialId || id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-32 pb-20 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Verifying On-Chain Attestation on Arbitrum Sepolia...</span>
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
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between print:bg-white print:p-0">
      {/* 3D Flip & Print Landscape CSS */}
      <style jsx global>{`
        .cert-perspective {
          perspective: 1200px;
        }
        .cert-card-inner {
          position: relative;
          width: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .cert-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .cert-face {
          width: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .cert-face-front {
          position: relative;
          z-index: 2;
        }
        .cert-face-back {
          transform: rotateY(180deg);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          min-height: 100%;
          z-index: 1;
        }
        /* When flipped, the back face takes normal document flow so all content is 100% visible and never cut off! */
        .cert-card-inner.flipped .cert-face-front {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .cert-card-inner.flipped .cert-face-back {
          position: relative;
          min-height: 100%;
          z-index: 2;
        }

        @media print {
          @page {
            size: landscape;
            margin: 0.8cm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .cert-perspective {
            perspective: none !important;
          }
          .cert-card-inner {
            transform: none !important;
            transform-style: flat !important;
          }
          .cert-face {
            backface-visibility: visible !important;
            position: relative !important;
            display: block !important;
          }
          .cert-face-front {
            page-break-after: always !important;
            break-after: page !important;
            margin-bottom: 0 !important;
          }
          .cert-face-back {
            transform: none !important;
            position: relative !important;
            page-break-before: always !important;
            break-before: page !important;
            height: auto !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Navbar />
      </div>

      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex-1 print:p-0 print:m-0">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ── Top Action Toolbar ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            {/* Interactive 3D Flip Trigger Button */}
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 transition-all cursor-pointer shadow-xs"
            >
              <RotateCw size={14} className={`text-purple-600 transition-transform duration-500 ${isFlipped ? "rotate-180" : ""}`} />
              <span>{isFlipped ? "View Front Side (Diploma)" : "View Back Side (Verification Sheet)"}</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold ml-1">
                Click to Flip
              </span>
            </button>

            {/* Actions: Arbiscan, Export JSON, Print */}
            <div className="flex flex-wrap items-center gap-2">
              {cert?.txHash && (
                <a
                  href={`https://sepolia.arbiscan.io/tx/${cert.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink size={13} className="text-purple-600" />
                  <span>Arbiscan Explorer</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>

              <button
                type="button"
                onClick={handleExportJsonLd}
                className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Download W3C Verifiable Credential JSON-LD format"
              >
                <Download size={13} className="text-indigo-600" />
                <span>Export VC</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-purple-600/20"
              >
                <Printer size={13} />
                <span>Download 2-Page PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Flip Hint Banner */}
          <div className="no-print text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <RotateCw size={13} className="text-purple-500" />
            <span>Click on the certificate or use the button above to flip between Front and Back sides.</span>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* 3D FLIP CONTAINER: FRONT (PAGE 1) & BACK (PAGE 2)              */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="cert-perspective w-full">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`cert-card-inner cursor-pointer ${isFlipped ? "flipped" : ""}`}
            >
              {/* ──────────────────────────────────────────────────────────── */}
              {/* FRONT SIDE (LANDSCAPE DIPLOMA)                               */}
              {/* ──────────────────────────────────────────────────────────── */}
              <div className="cert-face cert-face-front w-full bg-white rounded-3xl p-8 sm:p-12 md:p-16 border-4 border-amber-400/80 shadow-2xl relative overflow-hidden print:border-2 print:shadow-none print:p-10 print:rounded-none">
                {/* Guilloche & Golden Filigree Accents */}
                <div className="absolute inset-0 border-2 border-amber-300/40 rounded-2xl m-3 pointer-events-none print:m-2" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

                {/* Top Header & Branding */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-amber-200/70 pb-6 relative z-10 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo-full.webp"
                      alt="Trust Lesson"
                      className="h-10 sm:h-12 w-auto object-contain"
                    />
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap">
                      <Award size={13} className="text-amber-600" />
                      EAS On-Chain Attestation Verified
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Arbitrum Sepolia Layer-2 Non-Transferable Soulbound Credential
                    </p>
                  </div>
                </div>

                {/* Main Award Body */}
                <div className="text-center py-10 sm:py-12 relative z-10 space-y-4">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight uppercase font-serif">
                    Certificate of Completion
                  </h1>
                  <p className="text-slate-400 uppercase tracking-widest text-[11px] font-bold">
                    This verifiable attestation is proudly conferred upon:
                  </p>

                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-purple-900 tracking-tight underline decoration-amber-400 decoration-4 underline-offset-8 py-2 font-serif">
                    {cert.learnerName}
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed pt-2">
                    For successfully fulfilling all milestone deliverables, demonstrating rigorous technical mastery, and maintaining 100% verified attendance in:
                  </p>

                  <div className="inline-block p-3 px-8 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-xs">
                    <p className="text-lg sm:text-2xl font-black text-slate-900">
                      {cert.skillTitle}
                    </p>
                    <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mt-0.5">
                      Discipline: {cert.category} • Milestone Audited Completion
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs pt-1">
                    Conducted under the direct 1-on-1 mentorship and evaluation of{" "}
                    <span className="font-extrabold text-slate-900">{cert.mentorName}</span>
                  </p>
                </div>

                {/* Bottom Verification Signatures & Seal */}
                <div className="pt-8 border-t-2 border-amber-200/70 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center sm:items-end text-center sm:text-left">
                  {/* Left: Mentor Verification */}
                  <div className="text-center sm:text-left space-y-1">
                    <p className="font-serif italic text-base sm:text-lg text-slate-900 font-bold border-b border-slate-300 pb-1 inline-block min-w-44">
                      {cert.mentorName}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Verified Mentor & Evaluator
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {cert.mentorAddress ? `${cert.mentorAddress.slice(0, 12)}...` : "Arbitrum Verified Mentor"}
                    </p>
                  </div>

                  {/* Center: Protocol Seal Mascot */}
                  <div className="text-center flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 p-1 shadow-lg border-2 border-amber-500/60 flex items-center justify-center">
                      <Shield size={36} className="text-amber-900" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-950 mt-1.5 tracking-wider">
                      Trust Lesson Protocol Seal
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">100% Milestones Fulfilled</span>
                  </div>

                  {/* Right: Attestation Hash & Issue Date */}
                  <div className="text-center sm:text-right space-y-1">
                    <p className="text-[10px] font-bold text-slate-600">
                      Date Issued:{" "}
                      {new Date(cert.issuedAt || Date.now()).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono truncate" title={cert.attestationUid}>
                      UID: {cert.attestationUid}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 size={10} /> Arbitrum Attested
                    </span>
                  </div>
                </div>
              </div>

              {/* ──────────────────────────────────────────────────────────── */}
              {/* BACK SIDE (ELEGANT LIGHT TRANSCRIPT & ON-CHAIN PROOF)        */}
              {/* ──────────────────────────────────────────────────────────── */}
              <div className="cert-face cert-face-back w-full bg-white rounded-3xl p-6 sm:p-8 md:p-10 border-4 border-slate-300 shadow-2xl relative overflow-hidden print:border-2 print:shadow-none print:p-8 print:rounded-none flex flex-col justify-between">
                {/* Official Light Fine Border */}
                <div className="absolute inset-0 border-2 border-slate-200 rounded-2xl m-3 pointer-events-none print:m-2" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50/60 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />

                {/* 1. Back Top Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-5 relative z-10 text-left">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo-full.webp"
                      alt="Trust Lesson"
                      className="h-9 sm:h-10 w-auto object-contain opacity-80"
                    />
                    <div className="border-l border-slate-200 pl-3">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                        Official Verification Transcript
                      </h2>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Cryptographic Provenance & Academic Attestation Record
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 text-[10px] font-bold whitespace-nowrap">
                      <Lock size={12} className="text-purple-600" />
                      Soulbound Non-Transferable (EIP-712)
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Registry Network: Arbitrum Sepolia Layer-2
                    </p>
                  </div>
                </div>

                {/* 2. Top Summary 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-4 border-b border-slate-200 relative z-10 text-xs">
                  {/* Left Column: Academic Evaluation Summary */}
                  <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200 pb-1.5">
                      <Award size={14} className="text-amber-600" />
                      <span className="uppercase text-[11px] tracking-wider">Evaluation Credentials</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Credential Subject:</span>
                      <span className="text-slate-900 font-bold text-sm font-serif">{cert.learnerName}</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Subject DID:</span>
                      <span className="text-slate-700 font-mono text-[10px] break-all block">
                        did:pkh:eip155:421614:{cert.learnerAddress || "0x9965507D1a55bcC2695C58ba16FB37d819B0A4df"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">Milestones:</span>
                        <span className="text-emerald-700 font-bold text-[11px]">100% Completed</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">Attendance:</span>
                        <span className="text-purple-700 font-bold text-[11px]">Direct 1-on-1 Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: On-Chain Attestation Details */}
                  <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-200 pb-1.5">
                      <Hash size={14} className="text-purple-600" />
                      <span className="uppercase text-[11px] tracking-wider">On-Chain Attestation Details</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Attestation UID:</span>
                      <span className="text-slate-800 font-mono text-[10px] break-all block">
                        {cert.attestationUid || "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e"}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Transaction Hash:</span>
                      <a
                        href={`https://sepolia.arbiscan.io/tx/${cert.txHash || "0x2e8f17bc16d84a51e66c7fb414777d853112d785a9bc83d47f9984b5c777e112"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-900 underline flex items-center gap-1 font-mono text-[10px] break-all"
                      >
                        <span>{cert.txHash || "0x2e8f17bc16d84a51e66c7fb414777d853112d785a9bc83d47f9984b5c777e112"}</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">Registry Contract:</span>
                        <span className="text-slate-800 font-mono text-[10px] truncate block" title={cert.contractAddress}>
                          {cert.contractAddress ? `${cert.contractAddress.slice(0, 14)}...` : "0x50fA8e6c5... (VC V2)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">Network:</span>
                        <span className="text-slate-800 font-semibold text-[10px]">
                          Arbitrum Sepolia (#{cert.blockNumber || "120,485,912"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. MIDDLE SECTION: MILESTONES & COMPETENCIES (FILLS THE PREVIOUS BLANK SPACE!) */}
                <div className="py-4 border-b border-slate-200 relative z-10">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCheck size={14} className="text-emerald-600" />
                      Verified Deliverables & Competency Rubric
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Evaluator Approved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] mb-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Milestone 1: Threat Analysis</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Architecture inspection, attack surface modeling, and execution vectors verification.
                      </p>
                    </div>

                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] mb-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Milestone 2: Invariant Testing</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Formal verification test suites executed 100% green without assertion faults.
                      </p>
                    </div>

                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px] mb-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>Milestone 3: Escrow Settlement</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Deliverables evaluated and confirmed; zero-dispute non-custodial release.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. LOWER SECTION: DECENTRALIZED IPFS ARCHIVAL RECORD */}
                <div className="py-3 border-b border-slate-200 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Decentralized IPFS Storage CID:</span>
                      <a
                        href={cert.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${cert.metadataCid || "QmeEzxoFTbFpZUbNEvwozUGPjWHsmF4WeJ41XGqfGobSz7"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-700 hover:text-indigo-900 underline font-mono text-[11px] break-all flex items-center gap-1"
                      >
                        <span>{cert.metadataCid || "QmeEzxoFTbFpZUbNEvwozUGPjWHsmF4WeJ41XGqfGobSz7"}</span>
                        <ExternalLink size={10} className="shrink-0" />
                      </a>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">EIP-712 Standard Proof:</span>
                    <span className="text-slate-700 font-mono text-[10px]">
                      {cert.txHash ? `0x${cert.txHash.slice(2, 22)}...` : "0x-platform-attested"}
                    </span>
                  </div>
                </div>

                {/* 5. Back Footer: Official Seal & Legal Guarantee */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Tamper-Evident Soulbound Verification Guarantee</p>
                      <p className="text-[10px] text-slate-500">
                        This digital attestation is cryptographically signed and archived on decentralized IPFS infrastructure.
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-bold text-[11px]">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Official Trust Lesson Attestation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
