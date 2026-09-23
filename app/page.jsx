import Link from "next/link";
import {
  Shield,
  Star,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Lock,
  Layers,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import Reveal from "../src/components/Reveal";
import EcosystemLogos from "../src/components/EcosystemLogos";
import Footer from "../src/components/Footer";

const monsterCards = [
  {
    image: "/monsters/mentor.png",
    name: "Archie the Mentor",
    tag: "1-on-1 Live Pairing",
    title: "Learn directly from senior practitioners",
    desc: "Book live code reviews, portfolio teardowns, and executive mock interviews with experts who actively work in industry.",
  },
  {
    image: "/monsters/knowledge.png",
    name: "Pixel the Scholar",
    tag: "Milestone Gigs",
    title: "Step-by-step escrow roadmaps",
    desc: "Your funds are deposited into smart escrow and released milestone-by-milestone only when code audits and objectives pass.",
  },
  {
    image: "/monsters/star.png",
    name: "Nova the Achiever",
    tag: "On-Chain Credentials",
    title: "Reputation that travels anywhere",
    desc: "Every completed session generates an on-chain verifiable credential that belongs to you and proves your verified skill gains.",
  },
  {
    image: "/monsters/oke pose.png",
    name: "Barnaby the Guardian",
    tag: "Escrow Protection",
    title: "100% dispute-safe payments",
    desc: "Zero upfront ghosting or withheld payments. If expectations aren't met, fair mediation protects both mentors and learners.",
  },
];

const monsterMoments = [
  {
    image: "/monsters/hello.png",
    bubble: "Hi there! Ready to build your dream app today?",
    author: "Frontend Guild",
  },
  {
    image: "/monsters/cool-pose.png",
    bubble: "Just passed my system design interview with 5 stars!",
    author: "Career Accelerator",
  },
  {
    image: "/monsters/suprized.png",
    bubble: "Whoa, platform fee is only 5%? Mentors keep the rest!",
    author: "Mentor Network",
  },
  {
    image: "/monsters/happy.png",
    bubble: "My escrow payment unlocked right after our pairing session!",
    author: "Verified Student",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-16 px-6 sm:px-12 lg:px-16 overflow-hidden bg-slate-950">
        {/* Background Image: landing-page.png */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-right-top bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/landing-page.png')" }}
        />

        {/* Gradient Overlay on Left to guarantee crisp text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent lg:w-[62%] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent h-40 bottom-0 top-auto pointer-events-none" />

        {/* Hero Left Content */}
        <div className="relative z-10 max-w-xl lg:max-w-2xl my-auto pt-10 sm:pt-14">
          <Reveal direction="down">
            {/* Pill Badge: ★ Learn • Grow • Earn */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold mb-6 shadow-sm">
              <span className="text-amber-300">★</span>
              <span>Learn</span>
              <span className="text-white/40">•</span>
              <span>Grow</span>
              <span className="text-white/40">•</span>
              <span>Earn</span>
            </div>
          </Reveal>

          <Reveal direction="up" delay={150}>
            {/* Main Headline */}
            <h1
              className="font-extrabold tracking-tight text-white mb-6"
              style={{ fontSize: "clamp(42px, 5.8vw, 72px)", lineHeight: 1.06 }}
            >
              Your Knowledge.<br />
              <span className="text-indigo-400 drop-shadow-[0_0_25px_rgba(129,140,248,0.45)]">
                On-Chain.
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={250}>
            {/* Descriptive Subheading */}
            <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 max-w-lg font-normal">
              A decentralized platform for booking mentors, tutors, and consultants with milestone-based escrow payments. On-chain reputation that is portable, permanent, and tamper-proof protecting both learners and knowledge providers.
            </p>
          </Reveal>

          <Reveal direction="up" delay={350}>
            {/* Call to action buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link
                href="/explore"
                className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={17} />
              </Link>
              <a
                href="#monsters"
                className="px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all hover:scale-105"
              >
                Learn More
              </a>
            </div>
          </Reveal>

          {/* Bottom Ecosystem Badges (USDT, USDC, ARBITRUM) */}
          <Reveal direction="up" delay={450}>
            <div className="pt-2">
              <EcosystemLogos />
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 2: MEET THE LESSON MONSTERS */}
      <section id="monsters" className="bg-white py-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <Reveal direction="up" className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 mb-3">
            <Sparkles size={13} className="text-purple-600" />
            Fun & Rewarding Mentorship
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Meet the Lesson Monsters
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mt-3">
            Learning complex skills shouldn't feel boring or intimidating. Our platform combines friendly guidance with rigorous smart contract milestones.
          </p>
        </Reveal>

        {/* Monster Cards Grid on Clean White Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {monsterCards.map((card, idx) => (
            <Reveal key={card.name} delay={idx * 120} direction="up">
              <div className="h-full rounded-3xl bg-white border-2 border-purple-100 p-6 flex flex-col justify-between hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 group shadow-sm">
                <div>
                  {/* Monster Mascot Image in Soft Lavender Pod */}
                  <div className="w-full h-44 flex items-center justify-center mb-4 relative bg-purple-50/70 rounded-2xl border border-purple-100/80">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="h-36 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {card.tag}
                  </span>

                  <h3 className="text-lg font-extrabold text-slate-950 mt-2.5 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-purple-100 mt-5 flex items-center justify-between text-xs">
                  <span className="text-purple-700 font-bold">{card.name}</span>
                  <Link
                    href="/explore"
                    className="text-purple-600 group-hover:text-purple-800 flex items-center gap-1 font-bold transition-colors"
                  >
                    <span>Explore</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 3: COMMUNITY TESTIMONIALS & MASCOTS */}
      <section className="py-20 bg-purple-50/50 border-y border-purple-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-12">
          <Reveal direction="up" className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              Community Vibes
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 mt-2">
              Why Learners & Mentors Love Trust lesson
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {monsterMoments.map((item, idx) => (
              <Reveal key={idx} delay={idx * 100} direction="up">
                <div className="bg-white border border-purple-200 rounded-3xl p-6 flex flex-col justify-between h-full shadow-sm hover:shadow-md hover:border-purple-300 transition-all">
                  {/* Mascot head */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={item.image}
                      alt={item.author}
                      className="w-12 h-12 object-contain rounded-full bg-purple-50 p-1 border border-purple-200"
                    />
                    <div>
                      <p className="text-slate-900 font-bold text-xs">{item.author}</p>
                      <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-500" />
                        Verified Member
                      </span>
                    </div>
                  </div>

                  {/* Speech bubble */}
                  <div className="relative bg-purple-50 rounded-2xl p-4 border border-purple-200 text-xs text-purple-950 leading-relaxed font-semibold">
                    "{item.bubble}"
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW TRUST ESCROW WORKS */}
      <section className="bg-white py-24 max-w-6xl mx-auto px-6 sm:px-12">
        <Reveal direction="up" className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Smart Contract Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2">
            The Trust lesson Escrow Engine
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mt-2">
            Automated milestone verification eliminates payment disputes entirely.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Deposit into Escrow",
              desc: "Choose a 1-on-1 session slot or multi-milestone gig. Payment is secured on-chain, not given directly to the mentor.",
            },
            {
              step: "02",
              title: "Pair & Execute Goals",
              desc: "Collaborate via live screen-share or review roadmap deliverables according to predefined milestones.",
            },
            {
              step: "03",
              title: "Authorize & Release",
              desc: "Once you verify the outcomes, release the escrow payout. Both sides receive portable reputation points.",
            },
          ].map((item, i) => (
            <Reveal key={item.step} delay={i * 120} direction="up">
              <div className="bg-slate-50 rounded-3xl p-7 border border-slate-200 h-full flex flex-col gap-3 shadow-xs">
                <span className="text-4xl font-extrabold text-purple-400">{item.step}</span>
                <h3 className="text-slate-950 font-bold text-lg">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SECTION 5: PLAYFUL PURPLE CTA BANNER */}
      <section className="bg-white pb-24 px-6 sm:px-12 max-w-6xl mx-auto">
        <Reveal direction="up">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white border border-purple-400/30 p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-purple-950/20">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-500/25 blur-3xl pointer-events-none" />

            <div className="max-w-xl text-center lg:text-left relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200 bg-white/10 px-3.5 py-1.5 rounded-full inline-block mb-3 border border-white/20">
                Ready to Level Up?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                Start Learning On-Chain with Verified Mentors
              </h2>
              <p className="text-purple-100/90 text-sm sm:text-base mb-6">
                Join thousands of learners building real skills with zero-risk escrow protection.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/explore"
                  className="px-7 py-3.5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 font-extrabold text-sm shadow-xl transition-all hover:scale-105"
                >
                  Explore Offerings
                </Link>
                <Link
                  href="/register"
                  className="px-7 py-3.5 rounded-2xl bg-purple-950/40 hover:bg-purple-950/60 text-white font-semibold text-sm border border-purple-300/40 transition-all"
                >
                  Become a Mentor
                </Link>
              </div>
            </div>

            {/* Cool Pose Monster Mascot */}
            <div className="flex-shrink-0 relative z-10">
              <img
                src="/monsters/cool-pose.png"
                alt="Cool Lesson Monster"
                className="w-48 sm:w-60 h-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] animate-float"
              />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
