import { Link } from "react-router-dom";
import { Shield, Sparkles, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-purple-900/30 pt-14 pb-10 relative overflow-hidden">
      {/* Soft purple ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-48 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Top Multi-Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-900">
          {/* Column 1: Brand & Tagline (span 2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src="/logo-full-white.png"
                alt="Trust lesson"
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
              />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Global decentralized skill exchange connecting ambitious learners with verified mentors. Powered by Arbitrum milestone escrow smart contracts.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-[11px] font-bold text-purple-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Arbitrum One Escrow</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400">
                <Lock size={11} className="text-indigo-400" />
                <span>Non-Custodial</span>
              </span>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="hover:text-purple-300 transition-colors">
                  Explore Mentors
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-purple-300 transition-colors">
                  Milestone Gigs
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-purple-300 transition-colors">
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-purple-300 transition-colors">
                  About Trust lesson
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Escrow Engine
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 size={12} />
                <span>100% Escrow Protection</span>
              </li>
              <li className="text-slate-400">
                Milestone Vault Verification
              </li>
              <li className="text-slate-400">
                Decentralized Community Jury
              </li>
              <li className="text-slate-400">
                Instant USDC Settlement
              </li>
            </ul>
          </div>

          {/* Column 4: Leadership & Mascot */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-wider">
              Leadership
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-slate-300">
                Founder: <span className="font-bold text-white">Rayhan Young</span>
              </p>
              <p className="text-slate-300">
                Developer: <span className="font-bold text-emerald-400">0xAnakMommy</span>
              </p>
            </div>

            {/* Playful mini mascot peek */}
            <div className="pt-2 flex items-center gap-2.5">
              <img
                src="/monsters/star.png"
                alt="Lesson Monster Star"
                className="w-10 h-10 object-contain drop-shadow animate-float"
              />
              <p className="text-[11px] text-purple-300/90 font-bold leading-tight">
                Learn • Grow • Earn
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Security Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500">
            © 2026 Trust lesson. Built by <span className="text-slate-300 font-bold">Rayhan Young</span> & <span className="text-slate-300 font-bold">0xAnakMommy</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
              <Shield size={14} className="text-emerald-400" />
              <span>Escrow Guarantee Active</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
