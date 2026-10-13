import { Shield, Globe, Users, Heart, Star, Sparkles, CheckCircle2, Clock, Rocket, ShieldCheck, Scale, Coins, Smartphone, Zap, ArrowRight, Layers, Check, Trophy, Flag, MapPin, Route } from "lucide-react";
import Reveal from "../../src/components/Reveal";
import Footer from "../../src/components/Footer";
import { ArbitrumIcon } from "../../src/components/CurrencyBadge";

export const metadata = {
  title: "About Us",
  description: "Learn about the mission, protocol architecture, and leadership team behind Trust Lesson.",
};

const team = [
  {
    name: "Rayhan Young",
    handle: "@0xAnakMommy",
    role: "Founder & Lead Protocol Architect",
    tagline: "Founder & Full-Stack Architect",
    badge: "FOUNDER & CTO",
    image: "/team/Ray.webp",
    bio: "Pioneering Arbitrum smart contract escrow vaults, decentralized milestone settlement, and secure on-chain reputation attestation.",
    glowColor: "from-purple-600/20 to-indigo-600/20",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

const values = [
  {
    Icon: Shield,
    color: "bg-indigo-50 text-indigo-600 border border-indigo-200",
    title: "Trust by Design",
    desc: "Every transaction is safeguarded by independent escrow smart locks. We engineered security into the platform infrastructure, not just our marketing copy.",
  },
  {
    Icon: Globe,
    color: "bg-cyan-50 text-cyan-700 border border-cyan-200",
    title: "Borderless Opportunity",
    desc: "Mentors and students collaborate across 40+ countries. True mastery knows no geographic boundaries.",
  },
  {
    Icon: Heart,
    color: "bg-rose-50 text-rose-600 border border-rose-200",
    title: "Mentors First",
    desc: "Our platform fee remains capped at 10%, drastically lower than the 20–30% industry average. Mentors retain 90% of what they earn.",
  },
  {
    Icon: Star,
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    title: "Portable Reputation",
    desc: "Your verified ratings, completion track record, and credentials are transparently verifiable and belong permanently to your career portfolio.",
  },
];

const roadmapPhases = [
  {
    number: "01",
    phase: "Phase 1",
    title: "Foundation & Colosseum Hackathon Alpha",
    status: "Completed",
    statusColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
    nodeColor: "bg-emerald-500 ring-emerald-200 text-white",
    description: "Architected core decentralized escrow engine with gas-sponsored execution, and completed official submission to the Colosseum Hackathon.",
    hasColosseumBadge: true,
    colosseumBadge: "Submit Hackathon Colosseum (Completed)",
    items: [
      "Submit Hackathon Colosseum — Official entry submitted",
      "Arbitrum Sepolia EscrowRouter smart contract deployment",
      "100% platform gas fee subsidy for zero-friction learner checkout",
      "Mentor collateral staking vault (100 USDC) & verified status",
      "Non-custodial milestone releases & student satisfaction rating system",
    ],
  },
  {
    phase: "Phase 2",
    number: "02",
    title: "Security Audit & Arbitrum One Mainnet",
    status: "In Progress",
    statusColor: "bg-purple-50 text-purple-800 border-purple-300",
    nodeColor: "bg-purple-600 ring-purple-200 text-white animate-pulse",
    description: "Securing smart contracts through rigorous formal audits and launching production deployments on Arbitrum One mainnet.",
    hasArbitrumLogo: true,
    items: [
      "Comprehensive Smart Contract Security Audit with leading Web3 audit firms",
      "Mainnet production deployment on Arbitrum One",
      "First Mentorship Cohort: Onboarding elite Web3 practitioners & students",
      "Product-Market Fit (PMF) validation & satisfaction rating tracking",
    ],
  },
  {
    phase: "Phase 3",
    number: "03",
    title: "Global Scale & Decentralization",
    status: "Upcoming",
    statusColor: "bg-blue-50 text-blue-800 border-blue-300",
    nodeColor: "bg-blue-600 ring-blue-200 text-white",
    description: "Expanding protocol throughput, multi-chain rollups, and decentralized dispute arbitration governance.",
    items: [
      "Multi-chain rollup support across Arbitrum Nova, Base, and Optimism",
      "Decentralized DAO Governance & Dispute Council sortition",
      "$500,000 GMV Protocol Escrow Volume milestone",
      "Series Seed Institutional Round to scale global developer mentorship",
    ],
  },
  {
    phase: "Phase 4",
    number: "04",
    title: "Technical Excellence, UX & Mobile-First Execution",
    status: "Active Track",
    statusColor: "bg-indigo-50 text-indigo-800 border-indigo-300",
    nodeColor: "bg-indigo-600 ring-indigo-200 text-white",
    description: "Continuous formal verification, sub-second indexing, and full Progressive Web App (PWA) with native-level mobile experience.",
    items: [
      "Smart contract formal verification & automated continuous security testing",
      "UX Performance: Sub-second transaction indexing & zero-latency Web3 peer pairing",
      "Full Progressive Web App (PWA) standalone home-screen installation & offline sync",
      "Mobile-First Experience: Responsive touch navigation, gesture scheduling, & Web3 mobile wallet deep linking",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-32 pb-24 text-center px-6 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-emerald-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <Reveal direction="down">
            <span className="inline-flex items-center gap-2 bg-white/10 text-emerald-300 text-xs sm:text-sm px-4 py-1.5 rounded-full mb-6 border border-white/15 backdrop-blur-md">
              <Users size={14} className="text-emerald-400" />
              The Trust Lesson Story
            </span>
          </Reveal>

          <Reveal direction="up" delay={150}>
            <h1
              className="font-extrabold tracking-tight text-white mb-6"
              style={{ fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.1 }}
            >
              Building the Future of<br />Peer-to-Peer Skill Exchange
            </h1>
          </Reveal>

          <Reveal direction="up" delay={250}>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Trust Lesson was founded to solve a pervasive problem: finding authentic mentors was challenging, upfront payments were risky, and learners lacked quality guarantees. We engineered an escrow-backed platform to make mentorship safe, fair, and reliable.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <Reveal direction="up">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-indigo-200">
            Our Mission
          </span>
          <h2 className="text-slate-900 font-extrabold text-3xl sm:text-4xl mb-6 tracking-tight">
            Democratizing World-Class 1-on-1 Mentorship
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            We empower students to upskill with verified industry practitioners while guaranteeing that payment is only transferred when milestones and sessions are successfully fulfilled.
          </p>
        </Reveal>
      </section>

      {/* Values Grid */}
      <section className="bg-slate-100/70 py-24 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal direction="up" className="text-center mb-16">
            <h2 className="text-slate-900 font-extrabold text-3xl sm:text-4xl">
              Core Principles
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              The foundational values guiding our platform design and ecosystem.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map(({ Icon, color, title, desc }, i) => (
              <Reveal key={title} delay={i * 100} direction="up">
                <div className="bg-white rounded-3xl p-7 flex gap-4 h-full shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold text-base mb-1.5">{title}</h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Roadmap & Milestones Section (Visual Highway / Road Format) */}
      <section className="py-24 max-w-6xl mx-auto px-6 relative">
        <Reveal direction="up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-4 py-1.5 rounded-full mb-3 border border-purple-200 shadow-2xs">
            <Route size={14} className="text-purple-600" />
            <span>Protocol Highway Roadmap</span>
          </div>
          <h2 className="text-slate-900 font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            The Trust Lesson <span className="text-purple-600 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">Journey & Milestones</span>
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-2xl mx-auto">
            A clear execution path from hackathon submission to production Arbitrum One smart contracts, formal audits, and mobile-first ecosystem scale.
          </p>
        </Reveal>

        {/* ── Highway Road Track Container ── */}
        <div className="relative">
          {/* Top Road Start Banner */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-amber-300 font-extrabold text-[11px] tracking-widest uppercase border border-slate-700 shadow-md">
              <Flag size={13} className="text-amber-400" />
              <span>Genesis Mile: Hackathon Launch</span>
            </span>
          </div>

          {/* Center Roadway Path on Desktop (Asphalt Highway with Lane Divider Dashes) */}
          <div className="hidden md:block absolute top-16 bottom-16 left-1/2 -translate-x-1/2 w-20 bg-slate-900 border-x-4 border-purple-300/40 rounded-3xl shadow-2xl overflow-hidden z-0 pointer-events-none">
            {/* Center Dashed Lane Divider */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-r-2 border-dashed border-amber-300/70" />
            {/* Roadside Glow Highlights */}
            <div className="absolute inset-y-0 left-0 w-1 bg-white/20" />
            <div className="absolute inset-y-0 right-0 w-1 bg-white/20" />
          </div>

          {/* Roadway Path on Mobile (Left-aligned strip) */}
          <div className="md:hidden absolute top-16 bottom-16 left-6 -translate-x-1/2 w-10 bg-slate-900 border-x-2 border-purple-300/40 rounded-2xl shadow-xl z-0 pointer-events-none">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0 border-r border-dashed border-amber-300/70" />
          </div>

          {/* 4 Phases along the Highway */}
          <div className="space-y-12 sm:space-y-16 relative z-10">
            {roadmapPhases.map((phase, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={phase.number}
                  className="relative flex items-center min-h-[140px]"
                >
                  {/* Road Center Checkpoint Mile Marker — Exactly in the middle of the road on desktop and mobile */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${phase.nodeColor} flex items-center justify-center font-black text-base sm:text-lg shadow-2xl ring-4 ring-white/90 transition-transform hover:scale-110 cursor-pointer`}
                    >
                      {phase.number}
                    </div>
                  </div>

                  {/* Card Container: Alternating left and right on Desktop, offset right on mobile */}
                  <div
                    className={`w-full pl-16 md:pl-0 ${
                      isEven
                        ? "md:w-[calc(50%-3.5rem)] md:mr-auto"
                        : "md:w-[calc(50%-3.5rem)] md:ml-auto"
                    }`}
                  >
                    <Reveal direction={isEven ? "left" : "right"} delay={idx * 100}>
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-100/90 shadow-md hover:shadow-xl hover:border-purple-300 transition-all text-left group relative overflow-hidden">
                        {/* Phase & Status Header */}
                        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                              {phase.phase}
                            </span>
                            <span className="font-mono text-xs font-black text-slate-400">
                              #{phase.number}
                            </span>
                          </div>

                          <span className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border ${phase.statusColor} flex items-center gap-1.5 shadow-2xs`}>
                            {phase.status === "Completed" && <Check size={11} className="text-emerald-700" />}
                            {phase.status === "In Progress" && <Clock size={11} className="text-purple-700 animate-spin" />}
                            {phase.status === "Upcoming" && <Rocket size={11} className="text-blue-700" />}
                            {phase.status === "Active Track" && <Zap size={11} className="text-indigo-700" />}
                            <span>{phase.status}</span>
                          </span>
                        </div>

                        {/* Colosseum Hackathon Special Highlight Badge */}
                        {phase.hasColosseumBadge && (
                          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-300 flex items-center gap-2.5 shadow-xs">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Trophy size={16} />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                                Verified Milestone
                              </span>
                              <strong className="text-xs text-slate-900 font-extrabold block">
                                {phase.colosseumBadge}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Title with Arbitrum Logo if Phase 2 */}
                        <h3 className="text-slate-900 font-black text-xl sm:text-2xl mb-2 flex items-center gap-2 flex-wrap">
                          <span>{phase.title}</span>
                          {phase.hasArbitrumLogo && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-extrabold shadow-sm shrink-0">
                              <ArbitrumIcon size={14} />
                              <span>Arbitrum One</span>
                            </span>
                          )}
                        </h3>

                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                          {phase.description}
                        </p>

                        {/* Checklist items */}
                        <ul className="space-y-2.5 pt-4 border-t border-purple-50">
                          {phase.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                              <div className="w-4 h-4 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                                <Check size={10} />
                              </div>
                              <span className="font-medium">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Road Destination Banner */}
          <div className="flex justify-center mt-12">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-purple-600/30">
              <Rocket size={14} />
              <span>Destination: Global Decentralized Mentorship Standard</span>
            </span>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section id="team" className="py-24 max-w-5xl mx-auto px-6 text-center">
        <Reveal direction="up" className="mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-purple-200">
            Founder & Architect
          </span>
          <h2 className="text-slate-900 font-extrabold text-3xl sm:text-4xl">
            Meet the Creator
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            The visionary engineer driving Trust Lesson forward to build transparent, decentralized education.
          </p>
        </Reveal>

        <div className="flex justify-center max-w-md mx-auto">
          {team.map((t, idx) => (
            <Reveal key={t.name} delay={idx * 150} direction="up" className="flex-1">
              <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-slate-200/80 shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
                {/* Background decorative glow */}
                <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${t.glowColor} rounded-full blur-2xl group-hover:scale-125 transition-transform`} />

                {/* Profile Photo with Badge */}
                <div className="relative mb-2">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-purple-100 shadow-xl group-hover:ring-purple-300 transition-all duration-300 bg-slate-100 mx-auto">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md border-2 border-white flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Sparkles size={10} className="text-yellow-300" />
                    <span>{t.badge}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-900 font-extrabold text-xl sm:text-2xl">{t.name}</h3>
                  <p className="text-purple-600 font-bold text-xs sm:text-sm mt-1">{t.role}</p>
                  <div className="mt-2 flex justify-center">
                    <span className="text-slate-500 font-mono text-xs font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-0.5 rounded-full border border-slate-200 transition-colors">
                      {t.handle}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs mt-1">
                  {t.bio}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
