"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "@/src/components/Footer";
import Reveal from "@/src/components/Reveal";
import {
  UsdcIcon,
  UsdtIcon,
  ArbitrumIcon,
} from "@/src/components/CurrencyBadge";
import {
  MetaMaskIcon,
  RabbyIcon,
  CoinbaseWalletIcon,
} from "@/src/components/WalletIcons";
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
  Check,
  Compass,
  Briefcase,
  Star,
  Wallet,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function HowToUsePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeGuideTab, setActiveGuideTab] = useState("student"); // "student" | "mentor"

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* ── 1. HERO SECTION WITH BACKGROUND-GIGS.PNG & ANIMATED REVEAL ── */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden bg-white border-b border-purple-100">
        {/* Visual Hero Backdrop using background-gigs.webp with smooth entrance */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('/background-gigs.webp')`,
          }}
        />

        {/* Ambient Soft Lighting Overlays */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-purple-200/50 via-indigo-100/30 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          {/* Pill Badge with Reveal down */}
          <Reveal direction="down" delay={50}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50/90 border border-purple-200 text-purple-800 text-xs font-black shadow-xs backdrop-blur-xs">
              <ArbitrumIcon size={14} />
              <span className="tracking-wide uppercase">Arbitrum One Escrow Protocol</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </Reveal>

          {/* Main Headline with Reveal up */}
          <Reveal direction="up" delay={150}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
              How to Use the{" "}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 bg-clip-text text-transparent">
                Trust Lesson
              </span>{" "}
              DApp
            </h1>
          </Reveal>

          {/* Subheading with Reveal up */}
          <Reveal direction="up" delay={250}>
            <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
              The beginner-friendly, non-custodial guide to booking top Web3 mentors, locking payments safely in escrow, and earning on-chain.
            </p>
          </Reveal>

          {/* Quick CTA Anchors with Reveal up */}
          <Reveal direction="up" delay={350}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="#guide-tabs"
                onClick={() => setActiveGuideTab("student")}
                className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <BookOpen size={16} />
                <span>Learner Guide</span>
              </a>

              <a
                href="#guide-tabs"
                onClick={() => setActiveGuideTab("mentor")}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles size={16} />
                <span>Mentor Guide</span>
              </a>

              <a
                href="#payment-section"
                className="px-6 py-3 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-purple-200 font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-sm hover:scale-105 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <DollarSign size={16} />
                <span>USDC & USDT Payments</span>
              </a>
            </div>
          </Reveal>

          {/* Core Feature Badges with staggered animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <Reveal direction="up" delay={400}>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs hover:border-purple-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left space-y-1 group">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Lock size={16} />
                </div>
                <h4 className="text-slate-900 text-xs font-black">100% Escrow</h4>
                <p className="text-slate-500 text-[11px] leading-tight">Zero upfront risk. Funds release only on approval.</p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={480}>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left space-y-1 group">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Zap size={16} />
                </div>
                <h4 className="text-slate-900 text-xs font-black">Arbitrum Speed</h4>
                <p className="text-slate-500 text-[11px] leading-tight">&lt;1s confirmations with ~$0.02 network fees.</p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={560}>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left space-y-1 group">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <UsdcIcon size={16} />
                </div>
                <h4 className="text-slate-900 text-xs font-black">USDC & USDT</h4>
                <p className="text-slate-500 text-[11px] leading-tight">Stable, volatility-free pricing and payouts.</p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={640}>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left space-y-1 group">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <ShieldCheck size={16} />
                </div>
                <h4 className="text-slate-900 text-xs font-black">LinkedIn Verified</h4>
                <p className="text-slate-500 text-[11px] leading-tight">Vetted mentors with authenticated career history.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 2-OPTION SWITCH FOR LEARNER / MENTOR (NO SHOW ALL, 100% ENGLISH) ── */}
      <section id="guide-tabs" className="pt-8 pb-4 px-4 sm:px-6 max-w-5xl mx-auto w-full relative z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 sm:p-4 rounded-3xl bg-white border-2 border-purple-100 shadow-sm backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider pl-1">
              Select Guide:
            </span>
            {/* 2-Option Switch / Segmented Pill (No Show All) */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
              <button
                onClick={() => setActiveGuideTab("student")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeGuideTab === "student"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-102"
                    : "text-slate-600 hover:text-purple-700 hover:bg-slate-200/50"
                }`}
              >
                <BookOpen size={15} />
                <span>Learner Guide</span>
                {activeGuideTab === "student" && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveGuideTab("mentor")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeGuideTab === "mentor"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-102"
                    : "text-slate-600 hover:text-purple-700 hover:bg-slate-200/50"
                }`}
              >
                <Sparkles size={15} />
                <span>Mentor Guide</span>
                {activeGuideTab === "mentor" && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Current Active Indicator Hint */}
          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span className="text-slate-400">Active View:</span>
            {activeGuideTab === "student" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-extrabold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Student & Learner Roadmap (6 Steps)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-extrabold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Teacher & Mentor Roadmap (6 Steps)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── 2A. STUDENT WORKFLOW SECTION (LIGHT-THEMED PURPLE STEP-BY-STEP ROADMAP TIMELINE) ── */}
      {activeGuideTab === "student" && (
        <section
          id="student-flow"
          className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-white text-slate-900 relative overflow-hidden scroll-mt-20 border-y border-purple-200/80 shadow-xs"
        >
          {/* Subtle Soft Ambient Light Accents */}
          <div className="absolute top-10 left-1/3 w-[500px] h-[300px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto w-full relative z-10 space-y-12">
            {/* Top Learner Banner with Official Mascot */}
            <div className="rounded-3xl bg-white border-2 border-purple-200/90 p-6 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-black uppercase tracking-wider shadow-2xs">
                    <Compass size={14} className="text-purple-700" />
                    <span>Learner & Student Roadmap</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    How to Learn, Book Gigs & Release Escrow Safely
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                    A clear, step-by-step roadmap for students and developers. Connect your Web3 wallet, explore vetted mentors, lock escrow safely in USDC/USDT, and release funds only upon satisfactory milestone delivery.
                  </p>

                  {/* Highlights Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-bold shadow-2xs">
                      <ShieldCheck size={13} className="text-purple-600" />
                      100% Escrow Refund Guarantee
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold shadow-2xs">
                      <Zap size={13} className="text-indigo-600" />
                      Zero Sign-up Paperwork (No KYC)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-bold shadow-2xs">
                      <Award size={13} className="text-purple-600" />
                      Earn Soulbound SBT Credentials
                    </span>
                  </div>
                </div>

                {/* Learner Mascot Spotlight */}
                <div className="lg:col-span-4 flex justify-center lg:justify-end items-center">
                  <img
                    src="/monsters/knowledge.webp"
                    alt="Student Learning Mascot"
                    className="w-36 h-36 sm:w-44 sm:h-44 object-contain animate-float drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Step Roadmap Breadcrumb / Quick Steps */}
              <div className="mt-8 pt-6 border-t border-purple-100 hidden sm:block">
                <div className="flex items-center justify-between text-xs font-black text-purple-900">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Connect Wallet</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Find Mentor</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Lock Escrow</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Live Pairing</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">5</span>
                    <span>Release Funds</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">6</span>
                    <span>Claim SBT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── VERTICAL STEP-BY-STEP ROADMAP TIMELINE ── */}
            <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-purple-500 before:via-indigo-500 before:to-purple-600 before:rounded-full">
              {/* ── STEP 1 ── */}
              <Reveal direction="up" delay={100}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-purple-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    01
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] uppercase tracking-wider">
                          Step 01 • Web3 Onboarding
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 1 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1">
                        <ArbitrumIcon size={12} />
                        Arbitrum One L2
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-purple-700 transition-colors">
                      Connect Your Web3 Wallet
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Connect your MetaMask, Rabby, Coinbase Wallet, or Rainbow on Arbitrum One. No sign-up paperwork, email confirmations, or KYC identity verification is required to start exploring.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wide">
                          Supported Wallet Providers
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-purple-200 shadow-2xs hover:border-purple-300 transition-colors">
                            <MetaMaskIcon size={16} />
                            <span>MetaMask</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-purple-200 shadow-2xs hover:border-purple-300 transition-colors">
                            <RabbyIcon size={16} />
                            <span>Rabby</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-purple-200 shadow-2xs hover:border-purple-300 transition-colors">
                            <CoinbaseWalletIcon size={16} />
                            <span>Coinbase</span>
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center gap-1 shadow-2xs">
                        <Zap size={11} />
                        EIP-4361 SIWE SIGN-IN
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 2 ── */}
              <Reveal direction="up" delay={150}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-indigo-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    02
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-[11px] uppercase tracking-wider">
                          Step 02 • Discovery & Vetting
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 2 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 flex items-center gap-1">
                        <ShieldCheck size={12} />
                        LinkedIn Vetted
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-indigo-700 transition-colors">
                      Explore Gigs & Verified Mentors
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Browse top Web3 developers and mentors filtered by skills (Solidity, React, AI, Security). Inspect verified career track records and choose transparent Starter, Pro, or Enterprise gig packages.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full border-2 border-purple-500 p-0.5 relative shrink-0">
                          <img src="/mentor-profile.webp" alt="Mentor" className="w-full h-full rounded-full object-cover" />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-purple-600 border border-white flex items-center justify-center text-[8px] text-white font-black">✓</span>
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                            Alex Rivera
                            <span className="text-purple-700 font-bold text-[11px] bg-purple-100 px-2 py-0.2 rounded-full">Verified Mentor</span>
                          </div>
                          <div className="text-slate-500 text-xs">Packages: Starter ($35) • Pro ($75) • Enterprise ($150)</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-[11px]">
                        <span className="text-slate-400 font-medium">Vetting Standard:</span>
                        <div className="text-indigo-700 font-extrabold">Authenticated Work History</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 3 ── */}
              <Reveal direction="up" delay={200}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-purple-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    03
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] uppercase tracking-wider">
                          Step 03 • Escrow Protection
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 3 of 6</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                        <UsdcIcon size={13} />
                        <UsdtIcon size={13} />
                        <span>USDC & USDT Supported</span>
                      </div>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-purple-700 transition-colors">
                      Lock Payment in Smart Contract Escrow
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Approve and deposit your payment into the Arbitrum Escrow contract. Your funds remain safely locked in an isolated escrow vault. The mentor cannot claim the funds until you verify and sign off on deliverables.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wide">
                          Smart Contract Escrow Vault #4812
                        </span>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <UsdcIcon size={14} />
                          <span>$75.00 USDC</span>
                          <span className="text-purple-700 text-xs font-black bg-purple-100 px-2 py-0.5 rounded-md">LOCKED IN CONTRACT</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        Gas: &lt; $0.02 ETH
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 4 ── */}
              <Reveal direction="up" delay={250}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-indigo-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    04
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-[11px] uppercase tracking-wider">
                          Step 04 • Live Session
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 4 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200 flex items-center gap-1">
                        <Video size={12} />
                        1-on-1 Pairing
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-indigo-700 transition-colors">
                      Attend Live Video & Pairing Sessions
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Join your mentor on Google Meet, Zoom, or Discord. Pair program in real time, review smart contract code, inspect architecture diagrams, and receive personalized learning feedback.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-slate-700">Supported Meeting Channels:</div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">📹 Google Meet</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">🎥 Zoom Video</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">💬 Discord Voice</span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 shadow-2xs">🐙 GitHub PRs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 5 ── */}
              <Reveal direction="up" delay={300}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-purple-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    05
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] uppercase tracking-wider">
                          Step 05 • Approval & Release
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 5 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200 flex items-center gap-1">
                        <Zap size={12} />
                        You Control Release
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-purple-700 transition-colors">
                      Authorize Milestone Escrow Release
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Once you review and confirm the deliverable meets your agreed standard, click &quot;Release Escrow&quot; in your student portal. The smart contract instantly transfers funds directly to the mentor&apos;s locked payout wallet.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-black shadow-xs">
                          <Check size={18} />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            Deliverable Approved by Student
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">Status: 100% Escrow Released to Mentor</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-purple-600 text-white text-[11px] font-black flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 size={12} />
                        Release Escrow
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 6 ── */}
              <Reveal direction="up" delay={350}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-indigo-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    06
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-[11px] uppercase tracking-wider">
                          Step 06 • Credential & Safety
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 6 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                        <ShieldCheck size={12} />
                        100% Refund Policy
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-indigo-700 transition-colors">
                      Earn Soulbound SBT & Dispute Guarantee
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Receive an immutable Soulbound SBT certificate verifying your skills on Arbitrum. And if deliverables are unfulfilled or a session is missed, our Schelling consensus jury guarantees a full escrow refund.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                          <Award size={18} />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            🎓 Solidity Apprentice SBT Issued
                          </div>
                          <div className="text-[11px] text-slate-500">Non-Transferable On-Chain Learning Proof</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-[11px]">
                        <span className="text-slate-400 font-medium">Dispute Guarantee:</span>
                        <div className="text-purple-700 font-extrabold">100% Escrow Protection</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Student Action CTA */}
            <Reveal direction="up" delay={300} className="text-center pt-6">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 hover:scale-105 transition-all cursor-pointer active:scale-95"
              >
                <span>Browse Available Gigs Now</span>
                <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 2B. MENTOR WORKFLOW SECTION (LIGHT-THEMED STEP-BY-STEP ROADMAP TIMELINE) ── */}
      {activeGuideTab === "mentor" && (
        <section
          id="mentor-flow"
          className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-purple-50/80 via-indigo-50/40 to-white text-slate-900 relative overflow-hidden scroll-mt-20 border-y border-purple-200/80 shadow-xs"
        >
          {/* Subtle Soft Ambient Light Accents */}
          <div className="absolute top-10 left-1/3 w-[500px] h-[300px] bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto w-full relative z-10 space-y-12">
            {/* Top Mentor Banner with Official Mascot */}
            <div className="rounded-3xl bg-white border-2 border-purple-200/90 p-6 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300 text-xs font-black uppercase tracking-wider shadow-2xs">
                    <Briefcase size={14} className="text-purple-700" />
                    <span>Mentor & Teacher Creator Roadmap</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    How to Teach, Publish Gigs & Earn On-Chain
                  </h2>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                    A clear, step-by-step roadmap for Web3 educators and developers. Set up your profile, lock your Arbitrum payout wallet, create gigs, and receive 100% of your earnings directly into your custody.
                  </p>

                  {/* Highlights Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-bold shadow-2xs">
                      <Zap size={13} className="text-purple-600" />
                      Keep 93% Revenue (Low 7% Fee)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold shadow-2xs">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      0-Day Clearance (Instant Payout)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-bold shadow-2xs">
                      <Lock size={13} className="text-indigo-600" />
                      Locked Payout Wallet Protection
                    </span>
                  </div>
                </div>

                {/* Mentor Mascot Spotlight */}
                <div className="lg:col-span-4 flex justify-center lg:justify-end">
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-3xl blur-lg opacity-40 group-hover:opacity-70 transition duration-500" />
                    <div className="relative rounded-2xl bg-purple-50/80 border-2 border-purple-200 p-4 shadow-md text-center space-y-2">
                      <img
                        src="/monsters/mentor.webp"
                        alt="Mentor Teacher Mascot"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto animate-float drop-shadow-sm"
                      />
                      <div className="space-y-0.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                          Verified Mentor Pro
                        </span>
                        <div className="text-slate-900 text-xs font-black">
                          Earn in USDC & USDT
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Roadmap Breadcrumb / Quick Steps */}
              <div className="mt-8 pt-6 border-t border-purple-100 hidden sm:block">
                <div className="flex items-center justify-between text-xs font-black text-purple-900">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Sync Profile</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Lock Wallet</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Build Gigs</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Live Pairing</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">5</span>
                    <span>Instant Payout</span>
                  </div>
                  <div className="h-0.5 w-6 bg-purple-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">6</span>
                    <span>Rank Up</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── VERTICAL STEP-BY-STEP ROADMAP TIMELINE ── */}
            <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-purple-500 before:via-indigo-500 before:to-emerald-500 before:rounded-full">
              {/* ── STEP 1 ── */}
              <Reveal direction="up" delay={100}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-purple-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    01
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] uppercase tracking-wider">
                          Step 01 • Identity & Profile
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 1 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200 flex items-center gap-1">
                        <ShieldCheck size={12} />
                        LinkedIn OAuth
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-purple-700 transition-colors">
                      Build Profile & Connect Verified LinkedIn
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Set up your mentor display name, hourly rate, and engineering domains (Solidity, Frontend, AI, Security). Connect your verified LinkedIn profile to automatically earn the trusted green border and verified teacher checkmark badge.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full border-2 border-emerald-500 p-0.5 relative shrink-0">
                          <img src="/mentor-profile.webp" alt="Avatar" className="w-full h-full rounded-full object-cover" />
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] text-white font-black">✓</span>
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                            Alex Rivera
                            <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.2 rounded-full">LinkedIn Verified</span>
                          </div>
                          <div className="text-slate-500 text-xs">Senior Web3 Engineer • $65 USDC/hr</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-[11px]">
                        <span className="text-slate-400 font-medium">Profile Badge:</span>
                        <div className="text-emerald-700 font-extrabold">Active & Verified</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 2 ── */}
              <Reveal direction="up" delay={150}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-indigo-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    02
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-[11px] uppercase tracking-wider">
                          Step 02 • Mandatory Payout Lock
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 2 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Lock size={12} />
                        Non-Custodial
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-indigo-700 transition-colors">
                      Lock Your Arbitrum Payout Wallet
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Before publishing gigs, lock your Arbitrum payout address. This mandatory security step prevents unauthorized wallet changes and ensures all student escrow funds disburse directly to your intended custody.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wide">
                          Locked Payout Destination Address
                        </span>
                        <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                          <ArbitrumIcon size={14} />
                          <span>0x71C...392B</span>
                          <span className="text-slate-500 text-[11px] font-normal">(Arbitrum One)</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center gap-1 shadow-2xs">
                        <Lock size={11} />
                        WALLET LOCKED
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 3 ── */}
              <Reveal direction="up" delay={200}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-purple-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-purple-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    03
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-purple-100 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-[11px] uppercase tracking-wider">
                          Step 03 • Gig Builder
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 3 of 6</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                        <UsdcIcon size={13} />
                        <UsdtIcon size={13} />
                        <span>USDC & USDT Pricing</span>
                      </div>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-purple-700 transition-colors">
                      Create Gigs with 3 Pricing Tiers
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Use our intuitive 4-step Gig Builder. Set up to 3 package tiers (Starter, Pro, and Enterprise) with custom deliverables, milestone breakdowns, and stable pricing in USDC or USDT to avoid crypto volatility.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">Starter Tier</span>
                        <div className="text-sm font-black text-slate-900">$35 USDC</div>
                        <p className="text-[10px] text-slate-500">1-hr Live Pairing & Intro</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50 border-2 border-purple-300 text-center space-y-1 shadow-2xs">
                        <span className="text-[10px] font-black uppercase text-purple-700">Pro Tier (Popular)</span>
                        <div className="text-sm font-black text-purple-900">$75 USDC</div>
                        <p className="text-[10px] text-purple-600">Full Code Audit & Architecture</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">Enterprise Tier</span>
                        <div className="text-sm font-black text-slate-900">$150 USDC</div>
                        <p className="text-[10px] text-slate-500">End-to-End Production Sprint</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 4 ── */}
              <Reveal direction="up" delay={250}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-indigo-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    04
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-[11px] uppercase tracking-wider">
                          Step 04 • Mentoring Delivery
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 4 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200 flex items-center gap-1">
                        <Video size={12} />
                        Flexible Meetings
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-indigo-700 transition-colors">
                      Deliver Live Sessions & Submit Code
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Host sessions via Google Meet, Zoom, or Discord. Share your screen for live debugging, review smart contract code, or send GitHub PRs and architecture diagrams for the student to verify.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-slate-700">Supported Meeting & Delivery Integrations:</div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">📹 Google Meet</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">🎥 Zoom Video</span>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">💬 Discord Voice</span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 shadow-2xs">🐙 GitHub PRs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 5 ── */}
              <Reveal direction="up" delay={300}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-emerald-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    05
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-emerald-100 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] uppercase tracking-wider">
                          Step 05 • Instant Settlement
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 5 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Zap size={12} />
                        0-Day Hold
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-emerald-700 transition-colors">
                      Instant On-Chain Milestone Payout
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      As soon as the learner approves the deliverable, the Arbitrum Escrow smart contract releases 100% of the milestone funds automatically into your locked wallet with zero clearance delay or withdrawal limits.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
                          <Check size={18} />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            +$75.00 USDC Transferred to Locked Wallet
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">Arbitrum Tx Hash: 0x9a82...c10f</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-[11px] font-black">
                        Confirmed (&lt;1s)
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ── STEP 6 ── */}
              <Reveal direction="up" delay={350}>
                <div className="relative group">
                  {/* Timeline Node Icon */}
                  <div className="absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md shadow-amber-600/30 border-2 border-white -translate-x-1/2 group-hover:scale-110 transition-transform">
                    06
                  </div>

                  {/* Card Content */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-amber-100 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 shadow-2xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-[11px] uppercase tracking-wider">
                          Step 06 • Reputation & Level Up
                        </span>
                        <span className="text-slate-400 text-xs font-bold">• Step 6 of 6</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                        <Star size={12} />
                        Soulbound SBT
                      </span>
                    </div>

                    <h3 className="text-slate-950 font-black text-lg sm:text-xl group-hover:text-amber-700 transition-colors">
                      Level Up On-Chain Rank & Schelling Jury Protection
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Every successfully completed gig mints a permanent Soulbound credential to your wallet, boosting your rank on the Explore page. In the rare event of a dispute, our Schelling consensus jury protects honest mentors from bad-faith chargebacks.
                    </p>

                    {/* Simulation Box */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                          <Award size={18} />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Level 3 Master Mentor Badge
                          </div>
                          <div className="text-[11px] text-slate-500">100% On-Time Completion • 4.98 Rating</div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-[11px]">
                        <span className="text-slate-400 font-medium">Dispute Protection:</span>
                        <div className="text-emerald-700 font-extrabold">Active (Schelling Jury)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Mentor Action CTA */}
            <Reveal direction="up" delay={300} className="text-center pt-6">
              <Link
                href="/dashboard/gigs/create"
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 hover:scale-105 transition-all cursor-pointer active:scale-95"
              >
                <span>Launch Your First Gig in 4 Steps</span>
                <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 3. PAYMENT & ESCROW DEEP-DIVE (FEATURING MONSTERS/PAYMENT.PNG) ── */}
      <section id="payment-section" className="py-20 px-4 sm:px-6 bg-white border-b border-purple-100 relative overflow-hidden">
        {/* Soft Radial Ambient Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-12">
          {/* Header */}
          <Reveal direction="up" className="text-center space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs">
              <DollarSign size={13} />
              <span>Smart Contract Escrow & Settlement</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
              Paying with USDC & USDT on Arbitrum
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
              No price volatility, no chargeback fraud, and no credit card middlemen. Experience pure non-custodial Web3 financial security.
            </p>
          </Reveal>

          {/* Core Feature Grid with Official 3D Monsters Payment Graphic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Graphic: monsters/Payment.webp with gentle float animation */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <Reveal direction="right" delay={150}>
                <img
                  src="/monsters/Payment.webp"
                  alt="Trust Monsters holding USDC and USDT stablecoins"
                  className="w-full max-w-md h-auto object-contain animate-float-slow drop-shadow-2xl"
                />
              </Reveal>
            </div>

            {/* Explanation Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <Reveal direction="left" delay={100}>
                <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 shadow-2xs space-y-2 group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
              </Reveal>

              <Reveal direction="left" delay={200}>
                <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 shadow-2xs space-y-2 group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
              </Reveal>

              <Reveal direction="left" delay={300}>
                <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 shadow-2xs space-y-2 group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
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
              </Reveal>
            </div>
          </div>

          {/* 3-Step Escrow Lifecyle Graphic */}
          <div className="pt-8 border-t border-slate-200">
            <Reveal direction="up" className="text-center mb-8">
              <h3 className="text-slate-950 font-extrabold text-lg sm:text-xl">
                How the Escrow Lifecycle Protects Both Parties
              </h3>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Stage 1 */}
              <Reveal direction="up" delay={100}>
                <div className="h-full p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-purple-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-3 relative shadow-2xs group">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center font-black text-xs mx-auto group-hover:scale-110 transition-transform">
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
              </Reveal>

              {/* Stage 2 */}
              <Reveal direction="up" delay={200}>
                <div className="h-full p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-3 relative shadow-2xs group">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center font-black text-xs mx-auto group-hover:scale-110 transition-transform">
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
              </Reveal>

              {/* Stage 3 */}
              <Reveal direction="up" delay={300}>
                <div className="h-full p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-3 relative shadow-2xs group">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-black text-xs mx-auto group-hover:scale-110 transition-transform">
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
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FREQUENTLY ASKED QUESTIONS (FAQ) ── */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full relative z-10 space-y-8">
        <Reveal direction="up" className="text-center space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-black uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Everything you need to know about transacting, learning, and mentoring safely on Trust Lesson.
          </p>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} direction="up" delay={idx * 60}>
              <div
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
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 5. BOTTOM CTA BANNER (LIGHT THEME WITH REVEAL) ── */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-purple-100 via-indigo-50 to-purple-100 border-t border-purple-200 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Reveal direction="down">
            <div className="flex items-center justify-center mx-auto animate-float">
              <ArbitrumIcon size={48} className="drop-shadow-md" />
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
              Ready to Start Learning or Mentoring?
            </h2>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-medium">
              Connect your wallet to experience the future of Web3 education powered by Arbitrum smart contracts and stablecoins.
            </p>
          </Reveal>

          <Reveal direction="up" delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/explore"
                className="px-7 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 hover:shadow-lg hover:shadow-purple-600/30 hover:scale-105 transition-all cursor-pointer active:scale-95"
              >
                Explore Mentors & Gigs
              </Link>
              <Link
                href="/dashboard"
                className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-purple-800 border-2 border-purple-200 font-extrabold text-xs shadow-xs hover:shadow-sm hover:scale-105 transition-all cursor-pointer active:scale-95"
              >
                Open My Dashboard
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
