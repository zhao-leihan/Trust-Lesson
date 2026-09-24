import { Shield, Globe, Users, Heart, Star, Sparkles } from "lucide-react";
import Reveal from "../../src/components/Reveal";
import Footer from "../../src/components/Footer";

const team = [
  {
    name: "Rayhan Young",
    handle: "@0xAnakMommy",
    role: "Chief Technology Officer (CTO)",
    tagline: "CTO & Protocol Architect",
    badge: "CTO",
    image: "/team/Ray.jpeg",
    bio: "Pioneering Arbitrum smart contract escrow vaults, decentralized milestone settlement, and secure on-chain reputation attestation.",
    glowColor: "from-purple-600/20 to-indigo-600/20",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    name: "Janetiloy",
    handle: "@Janetiloy",
    role: "Chief Marketing Officer (CMO)",
    tagline: "CMO & Global Growth Lead",
    badge: "CMO",
    image: "/team/janet.jpeg",
    bio: "Spearheading international brand strategy, mentor community engagement, creator partnerships, and global Web3 education growth.",
    glowColor: "from-pink-500/20 to-rose-600/20",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
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

      {/* Our Team Section */}
      <section id="team" className="py-24 max-w-5xl mx-auto px-6 text-center">
        <Reveal direction="up" className="mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-purple-200">
            Our Team
          </span>
          <h2 className="text-slate-900 font-extrabold text-3xl sm:text-4xl">
            Meet Our Leadership Team
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            The visionary leaders driving Trust Lesson forward to build transparent, decentralized education.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
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
