import { Shield, Globe, Users, Heart, Star, Sparkles } from "lucide-react";
import Reveal from "../components/Reveal";
import Footer from "../components/Footer";

const team = [
  {
    name: "Rayhan Young",
    role: "Founder",
    tagline: "Visionary & Product Architect",
    avatar: "RY",
    badge: "Founder",
    bio: "Pioneering decentralized peer-to-peer education, milestone escrow architecture, and tamper-proof on-chain mentor credentials.",
    color: "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25",
  },
  {
    name: "0xAnakMommy",
    role: "Developer",
    tagline: "Smart Contract & Fullstack Lead",
    avatar: "0x",
    badge: "Developer",
    bio: "Architecting Arbitrum escrow vaults, decentralized state management, and seamless real-time Web3 platform interfaces.",
    color: "bg-gradient-to-tr from-emerald-500 to-cyan-600 text-white shadow-lg shadow-emerald-500/25",
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
    desc: "Our platform fee remains capped at 5–8%, drastically lower than the 20–30% industry average. Mentors deserve to retain what they earn.",
  },
  {
    Icon: Star,
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    title: "Portable Reputation",
    desc: "Your verified ratings, completion track record, and credentials are transparently verifiable and belong permanently to your career portfolio.",
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
              The Trust lesson Story
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
              Trust lesson was founded to solve a pervasive problem: finding authentic mentors was challenging, upfront payments were risky, and learners lacked quality guarantees. We engineered an escrow-backed platform to make mentorship safe, fair, and reliable.
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

      {/* Leadership Team */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <Reveal direction="up" className="mb-14">
          <h2 className="text-slate-900 font-extrabold text-3xl sm:text-4xl">
            Meet the Founders
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            The cross-functional team driving Trust lesson forward.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {team.map((t, idx) => (
            <Reveal key={t.name} delay={idx * 150} direction="up" className="flex-1">
              <div className="bg-white rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                {/* Background decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />

                <div
                  className={`w-20 h-20 rounded-2xl ${t.color} flex items-center justify-center font-extrabold text-2xl tracking-wider`}
                >
                  {t.avatar}
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 bg-purple-50 text-purple-700 border border-purple-200">
                    <Sparkles size={11} />
                    <span>{t.badge}</span>
                  </div>
                  <h3 className="text-slate-900 font-extrabold text-xl">{t.name}</h3>
                  <p className="text-indigo-600 text-xs font-bold mt-0.5">
                    {t.tagline}
                  </p>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs">
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
