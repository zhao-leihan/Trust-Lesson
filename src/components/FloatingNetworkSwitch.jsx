"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, AlertCircle } from "lucide-react";

export default function FloatingNetworkSwitch() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  return (
    <aside aria-label="Network Switcher" className="fixed bottom-5 right-5 z-50 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mb-3 w-64 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl text-white text-xs"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                Network Environment
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Option 1: Testnet (Active) */}
              <button
                type="button"
                onClick={() => setShowNotice(false)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <div>
                    <p className="font-bold text-white text-xs">Arbitrum Sepolia</p>
                    <p className="text-[10px] text-slate-400">Testnet (Current)</p>
                  </div>
                </div>
                <Check size={14} className="text-emerald-400" />
              </button>

              {/* Option 2: Mainnet (Coming Soon) */}
              <button
                type="button"
                onClick={() => setShowNotice(true)}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-200 text-xs">Arbitrum One</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-purple-500 text-white leading-tight">
                        Soon
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Production Mainnet</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-purple-300 group-hover:text-purple-200">
                  Switch
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
                  className="mt-2.5 pt-2 border-t border-white/10 text-[11px] text-amber-200/90 flex items-start gap-1.5 leading-snug"
                >
                  <AlertCircle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Mainnet deployment is currently in final testing and audit stages. It will be live soon!
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
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setShowNotice(false);
        }}
        aria-label="Toggle network switch"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-600 text-white shadow-xl shadow-purple-900/40 border border-purple-400/30 flex items-center justify-center cursor-pointer relative hover:shadow-purple-600/50 transition-shadow"
      >
        <Globe size={20} className={isOpen ? "text-purple-200" : "text-white"} />
        {/* Pulsing Green Indicator for Testnet Active */}
        <span className="absolute top-1 right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900" />
        </span>
      </motion.button>
    </aside>
  );
}
