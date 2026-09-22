"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/src/components/Footer";
import {
  UsdcIcon,
  UsdtIcon,
  ArbitrumIcon,
} from "@/src/components/CurrencyBadge";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Zap,
  BookOpen,
  Sparkles,
  Layers,
  Video,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Award,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function HowToUsePage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What blockchain network does Trust Lesson operate on?",
      a: "Trust Lesson is deployed on Arbitrum One (Ethereum Layer-2). This delivers lightning-fast transaction finality (less than 1 second) and ultra-low gas fees (~$0.01 - $0.03 per escrow deposit or release), making micro-mentorship and milestone payments friction-free.",
    },
    {
      q: "Why does Trust Lesson settle payments in USDC and USDT?",
      a: "Both USDC and USDT are regulated, 1:1 USD-backed stablecoins. Settling in stablecoins protects both mentors and students from cryptocurrency market volatility. A $50 mentorship gig remains exactly $50 whether ETH rises or falls.",
    },
    {
      q: "How does the smart contract escrow protect my funds?",
      a: "When a student books a session or gig, their USDC/USDT is locked directly inside the non-custodial Arbitrum escrow smart contract. The mentor cannot prematurely withdraw the money, and the student cannot withdraw without approval. Funds are only disbursed once the learner signs off on the completed milestone deliverable.",
    },
    {
      q: "What happens if a mentor does not deliver or cancels?",
      a: "If a session is missed or deliverables fail to meet agreed specifications, the learner or mentor can initiate a dispute. The Trust Lesson dispute arbitration protocol reviews on-chain timestamp proofs and meeting attendance logs, granting full refunds directly back to the learner's wallet if obligations were unfulfilled.",
    },
    {
      q: "How do mentors get paid?",
      a: "Mentors connect and lock their payout wallet address (via MetaMask, Coinbase Wallet, or manual address input). Upon milestone sign-off by the learner, the smart contract automatically transfers 100% of the milestone funds straight to the mentor's wallet with zero wait times.",
    },
    {
      q: "Do I need ETH in my wallet to use the DApp?",
      a: "Yes, you need a nominal amount of ETH on the Arbitrum network (e.g. $1 to $2 worth) to cover network gas fees for signing escrow deposits, milestone releases, or gig creation transactions.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* ── 1. HERO SECTION WITH BACKGROUND-GIGS.PNG (BRIGHT / LIGHT THEME) ── */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden bg-white border-b border-purple-100">
        {/* Visual Hero Backdrop using background-gigs.png */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url('/background-gigs.png')`,
          }}
        />

        {/* Ambient Soft Lighting Overlays */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-purple-200/50 via-indigo-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-black shadow-xs">
            <ArbitrumIcon size={14} />
            <span className="tracking-wide uppercase">Arbitrum One Escrow Protocol</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            How to Use the{" "}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
              Trust Lesson
            </span>{" "}
            DApp
          </h1>

          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            The beginner-friendly, non-custodial guide to booking top Web3 mentors, locking payments safely in escrow, and earning on-chain.
          </p>

          {/* Quick CTA Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#student-flow"
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <BookOpen size={16} />
              <span>Learner Guide</span>
            </a>

            <a
              href="#mentor-flow"
              className="px-6 py-3 rounded-full bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-200 font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles size={16} />
              <span>Mentor Guide</span>
            </a>

            <a
              href="#payment-section"
              className="px-6 py-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200 font-extrabold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <DollarSign size={16} />
              <span>USDC & USDT Payments</span>
            </a>
          </div>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Lock size={16} />
              </div>
              <h4 className="text-slate-900 text-xs font-black">100% Escrow</h4>
              <p className="text-slate-500 text-[11px] leading-tight">Zero upfront risk. Funds release only on approval.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <Zap size={16} />
              </div>
              <h4 className="text-slate-900 text-xs font-black">Arbitrum Speed</h4>
              <p className="text-slate-500 text-[11px] leading-tight">&lt;1s confirmations with ~$0.02 network fees.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <UsdcIcon size={16} />
              </div>
              <h4 className="text-slate-900 text-xs font-black">USDC & USDT</h4>
              <p className="text-slate-500 text-[11px] leading-tight">Stable, volatility-free pricing and payouts.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs text-left space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-slate-900 text-xs font-black">LinkedIn Verified</h4>
              <p className="text-slate-500 text-[11px] leading-tight">Vetted mentors with authenticated career history.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2A. STUDENT WORKFLOW SECTION ── */}
      <section id="student-flow" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <img src="/student-profile.png" alt="Student" className="w-4 h-4 rounded-full object-cover" />
            <span>Learner & Student Guide</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
            How to Learn & Book Gigs Safely
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Step-by-step walkthrough for students looking to hire verified mentors, attend live coding sessions, and release escrow upon deliverable approval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/30">
                1
              </div>
              <h3 className="text-slate-950 font-extrabold text-base">Connect Web3 Wallet</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Connect your MetaMask, Coinbase Wallet, or Rabby on Arbitrum One. No sign-up paperwork or KYC is required to explore and learn.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-purple-700 text-[11px] font-bold">
              <ArbitrumIcon size={13} />
              <span>Arbitrum One Layer-2</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-slate-950 font-extrabold text-base">Explore Gigs & Mentors</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Browse verified mentors, inspect their LinkedIn career track records, and compare Starter, Pro, or Enterprise gig packages.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-indigo-700 text-[11px] font-bold">
              <ShieldCheck size={13} />
              <span>Verified Credentials</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-slate-950 font-extrabold text-base">Lock Escrow in USDC / USDT</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Approve and deposit your payment into the Arbitrum Escrow smart contract. Your funds stay strictly locked and 100% safe.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-700 text-[11px] font-bold">
              <Lock size={13} />
              <span>Safe Smart Contract Vault</span>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/30">
                4
              </div>
              <h3 className="text-slate-950 font-extrabold text-base">Attend Live Pairing & Learn</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Join online sessions via Google Meet, Zoom, or Discord. Review project audits, smart contract reviews, and structured modules.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-purple-700 text-[11px] font-bold">
              <Video size={13} />
              <span>Google Meet, Zoom, Discord</span>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                5
              </div>
              <h3 className="text-slate-950 font-extrabold text-base">Authorize Milestone Release</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Once satisfied with the milestone deliverable, click &quot;Release Escrow&quot; in your Student Dashboard to disburse funds to your mentor.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-700 text-[11px] font-bold">
              <CheckCircle2 size={13} />
              <span>Direct On-Chain Settlement</span>
            </div>
          </div>

          {/* Step 6 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-amber-600/30">
                6
              </div>
              <h3 className="text-slate-950 font-extrabold text-base">Dispute Guarantee</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                If deliverables aren&apos;t provided or a session is missed, request revisions or initiate a dispute for a full escrow refund.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-amber-700 text-[11px] font-bold">
              <AlertCircle size={13} />
              <span>Zero Chargeback Scams</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer active:scale-95"
          >
            <span>Browse Available Gigs Now</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── 2B. MENTOR WORKFLOW SECTION ── */}
      <section id="mentor-flow" className="py-20 px-4 sm:px-6 bg-purple-50/50 border-y border-purple-100 relative">
        <div className="max-w-6xl mx-auto w-full space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase tracking-wider">
              <img src="/mentor-profile.png" alt="Mentor" className="w-4 h-4 rounded-full object-cover" />
              <span>Mentor & Teacher Guide</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
              How to Teach, Publish Gigs & Earn
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Set up your verified mentor profile, create multi-tier packages with custom USDC/USDT pricing, and get paid directly on-chain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/30">
                  1
                </div>
                <h3 className="text-slate-950 font-extrabold text-base">Build Profile & Sync LinkedIn</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Set your display name, specialty domain, hourly rate, and sync your verified LinkedIn career history to earn trust badges.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-purple-700 text-[11px] font-bold">
                <Award size={13} />
                <span>Verified Mentor Badge</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                  2
                </div>
                <h3 className="text-slate-950 font-extrabold text-base">Lock Payout Wallet</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Connect your Arbitrum wallet or input your address. Lock it to guarantee all future student milestone funds reach your custody safely.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-indigo-700 text-[11px] font-bold">
                <Lock size={13} />
                <span>Immutable Payout Locking</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                  3
                </div>
                <h3 className="text-slate-950 font-extrabold text-base">Create Gigs in 4 Steps</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Use our step-by-step Gig Builder. Set up to 3 tier packages (Starter, Pro, Enterprise), pick settlement currency (USDC or USDT), and add modules.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-700 text-[11px] font-bold">
                <Layers size={13} />
                <span>Up to 3 Pricing Tiers</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-purple-600/30">
                  4
                </div>
                <h3 className="text-slate-950 font-extrabold text-base">Deliver Sessions & Code</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Teach live on Google Meet, Zoom, or Discord. Send code review pull requests, architecture diagrams, or learning materials to the student.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-purple-700 text-[11px] font-bold">
                <Video size={13} />
                <span>Flexible Meeting Integrations</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                  5
                </div>
                <h3 className="text-slate-950 font-extrabold text-base">Instant On-Chain Payout</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  No 14-day clearance delays or high banking interchange fees. As soon as a milestone is approved, USDC or USDT transfers instantly to your wallet.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-emerald-700 text-[11px] font-bold">
                <Zap size={13} />
                <span>Instant Settlement</span>
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-6 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-300 shadow-xs transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-amber-600/30">
                  6
                </div>
                <h3 className="text-slate-950 font-extrabold text-base">Earn Reputation & Badges</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Successful completions increase your on-chain mentor level, unlocking higher visibility on the Explore catalog and premium student gigs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 text-amber-700 text-[11px] font-bold">
                <Sparkles size={13} />
                <span>On-Chain Credibility</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/dashboard/gigs/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer active:scale-95"
            >
              <span>Launch Your First Gig</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. PAYMENT & ESCROW DEEP-DIVE (FEATURING MONSTERS/PAYMENT.PNG) ── */}
      <section id="payment-section" className="py-20 px-4 sm:px-6 bg-white border-b border-purple-100 relative overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
              <DollarSign size={13} />
              <span>Smart Contract Escrow & Settlement</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Paying with USDC & USDT on Arbitrum
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              No price volatility, no chargeback fraud, and no credit card middlemen. Experience pure non-custodial Web3 financial security.
            </p>
          </div>

          {/* Core Feature Grid with Official 3D Monsters Payment Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Graphic: monsters/Payment.png */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-200 to-emerald-200 rounded-3xl blur-xl opacity-60 group-hover:opacity-90 transition duration-500" />
                <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-purple-200 p-2 shadow-xl">
                  <img
                    src="/monsters/Payment.png"
                    alt="Trust Monsters holding USDC and USDT stablecoins"
                    className="w-full h-auto object-contain rounded-2xl transform group-hover:scale-[1.02] transition-transform duration-500 drop-shadow-md"
                  />
                  <div className="p-4 bg-slate-50 rounded-xl mt-2 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UsdcIcon size={20} />
                      <UsdtIcon size={20} />
                      <span className="text-slate-900 font-extrabold text-xs">USDC & USDT Supported</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-black border border-emerald-200">
                      Arbitrum One
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-colors shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <UsdcIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-slate-950 font-extrabold text-sm">USDC (USD Coin)</h4>
                    <p className="text-slate-500 text-xs">Regulated by Circle, verified 100% US Dollar cash & treasury reserves.</p>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed pt-1 pl-10">
                  Ideal for international corporate clients, US developers, and transparent business accounting. Contract address on Arbitrum One: <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono text-[11px]">0xaf88...5831</code>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-colors shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <UsdtIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-slate-950 font-extrabold text-sm">USDT (Tether USD)</h4>
                    <p className="text-slate-500 text-xs">The world&apos;s most widely traded and liquid digital dollar token.</p>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed pt-1 pl-10">
                  The preferred settlement asset across Southeast Asia, Europe, and Latin America with instant Arbitrum Layer-2 bridging.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-colors shadow-2xs space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 className="text-slate-950 font-extrabold text-sm">Autonomous Escrow Vaults</h4>
                    <p className="text-slate-500 text-xs">Zero custody by platform admins or unauthorized third parties.</p>
                  </div>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed pt-1 pl-10">
                  Funds sit securely locked in the smart contract until milestones are satisfied. Neither Trust Lesson nor hackers can arbitrarily drain escrow funds.
                </p>
              </div>
            </div>
          </div>

          {/* 3-Step Escrow Lifecyle Graphic */}
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-center text-slate-950 font-extrabold text-lg sm:text-xl mb-8">
              How the Escrow Lifecycle Protects Both Parties
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Stage 1 */}
              <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 text-center space-y-3 relative shadow-2xs">
                <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center font-black text-xs mx-auto">
                  01
                </span>
                <h4 className="text-slate-950 font-extrabold text-sm">Deposit & Lock</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Student authorizes deposit in USDC/USDT. The smart contract holds funds securely in an isolated milestone vault.
                </p>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-bold">
                  Status: LOCKED IN ESCROW
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 text-center space-y-3 relative shadow-2xs">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-black text-xs mx-auto">
                  02
                </span>
                <h4 className="text-slate-950 font-extrabold text-sm">Delivery & Review</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Mentor delivers the 1-on-1 mentorship session or code milestone. Student verifies the deliverable in their dashboard.
                </p>
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-800 font-bold">
                  Status: IN PROGRESS / REVIEW
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 text-center space-y-3 relative shadow-2xs">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-black text-xs mx-auto">
                  03
                </span>
                <h4 className="text-slate-950 font-extrabold text-sm">Release & Payout</h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Student confirms completion. The smart contract automatically transfers 100% of the funds to the mentor&apos;s locked wallet.
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
                  Status: ESCROW RELEASED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10 space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Everything you need to know about transacting, learning, and mentoring safely on Trust Lesson.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-300 overflow-hidden transition-all shadow-2xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-900 font-bold text-sm sm:text-base leading-snug">
                  {faq.q}
                </span>
                <span className="p-1 rounded-full bg-purple-50 text-purple-700 shrink-0">
                  {openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. BOTTOM CTA BANNER (LIGHT THEME) ── */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-100 border-t border-purple-200 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-600/30">
            <ArbitrumIcon size={26} />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
            Ready to Start Learning or Mentoring?
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium">
            Connect your wallet to experience the future of Web3 education powered by Arbitrum smart contracts and stablecoins.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/explore"
              className="px-7 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer active:scale-95"
            >
              Explore Mentors & Gigs
            </Link>
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-purple-800 border-2 border-purple-200 font-extrabold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Open My Dashboard
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
