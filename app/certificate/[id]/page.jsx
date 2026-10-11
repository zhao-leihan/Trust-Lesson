"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";
import CertificateCard from "@/src/components/certificate/CertificateCard";

export default function CertificatePage() {
  const params = useParams();
  const id = params?.id;

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-32 pb-20 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500 text-xs font-semibold">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
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

      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex-1 print:p-0 print:m-0">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-4 print:hidden">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-xs text-slate-400 font-mono">
              Arbitrum Sepolia • Contract 0x50fA...847D
            </span>
          </div>

          {/* Certificate 2-Sided White Card */}
          <CertificateCard certificate={cert} assignments={cert.assignments || []} />
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
