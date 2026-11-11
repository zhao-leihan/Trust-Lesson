"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, X, Info } from "lucide-react";

function ArbitrumLogo({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.987 2.003L4.996 7.424V18.267L13.987 23.688L22.978 18.267V7.424L13.987 2.003Z"
        fill="#1B2438"
      />
      <path
        d="M19.143 16.793L13.987 20.098L11.517 18.513L15.485 14.545C15.875 14.155 16.508 14.155 16.898 14.545L19.143 16.793Z"
        fill="#28A0F0"
      />
      <path
        d="M8.831 16.793L13.987 13.488L16.457 15.073L12.489 19.041C12.099 19.431 11.466 19.431 11.076 19.041L8.831 16.793Z"
        fill="#96BEDC"
      />
      <path
        d="M13.987 5.592L19.143 9.098V14.545L16.898 12.3C16.508 11.91 15.875 11.91 15.485 12.3L13.987 13.798V5.592Z"
        fill="#28A0F0"
      />
    </svg>
  );
}

export default function FloatingNetworkSwitch() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowNotice(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <aside
      ref={containerRef}
      aria-label="Network Switcher"
      className="fixed bottom-5 right-5 z-50 select-none"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute bottom-14 right-0 mb-2 w-72 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-slate-950/60 text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
                  Network Switch
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowNotice(false);
                }}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded-md cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Network Options */}
            <div className="space-y-1.5">
              {/* Option 1: Testnet (Active) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.06] border border-emerald-500/30 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#213147] border border-white/10 flex items-center justify-center shrink-0">
                    <ArbitrumLogo className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-white text-xs leading-none">Arbitrum Sepolia</p>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-medium mt-1 leading-none">
                      Testnet Connected
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
              </div>

              {/* Option 2: Mainnet (Coming Soon) */}
              <button
                type="button"
                onClick={() => setShowNotice(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#1a2333] border border-white/5 flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <ArbitrumLogo className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-300 group-hover:text-white text-xs leading-none transition-colors">
                      Arbitrum One
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-none">
                      Production Mainnet
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 flex items-center gap-1">
                  <Sparkles size={9} />
                  <span>Soon</span>
                </span>
              </button>
            </div>

            {/* Coming Soon Notice inside Popover */}
            <AnimatePresence>
              {showNotice && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-purple-200/90 flex items-start gap-1.5 leading-snug px-1"
                >
                  <Info size={13} className="text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    Arbitrum One Mainnet contract deployment is pending final audits. Currently running live on Sepolia Testnet.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circular Toggle Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setShowNotice(false);
        }}
        aria-label="Toggle network switch"
        title="Network: Arbitrum Sepolia Testnet"
        className="w-11 h-11 rounded-full bg-slate-950/90 hover:bg-slate-900 text-white backdrop-blur-xl border border-white/15 hover:border-purple-500/50 shadow-lg shadow-slate-950/40 flex items-center justify-center cursor-pointer relative transition-all"
      >
        <ArbitrumLogo className="w-5 h-5" />
        
        {/* Seamless Docked Status Dot */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 border border-slate-900">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        </span>
      </motion.button>
    </aside>
  );
}
