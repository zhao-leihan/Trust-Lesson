"use client";

import React, { useEffect, useState, useMemo } from "react";

/**
 * Lightweight, high-performance particle animation overlay and button effect
 * Runs directly on React without extra heavy bundles, 60fps hardware accelerated
 */
export function StakingParticles({ count = 28, active = false }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 40 + Math.random() * 95;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const size = 3 + Math.random() * 5;
      const duration = 0.7 + Math.random() * 0.6;
      const delay = Math.random() * 0.25;
      const colors = [
        "bg-purple-400",
        "bg-indigo-300",
        "bg-amber-300",
        "bg-emerald-400",
        "bg-cyan-300",
        "bg-purple-200",
      ];
      const color = colors[i % colors.length];
      return { id: i, tx, ty, size, duration, delay, color };
    });
  }, [count]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible flex items-center justify-center z-20">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full ${p.color} shadow-sm animate-particle-burst`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            "--tx": `${p.tx}px`,
            "--ty": `${p.ty}px`,
            "--dur": `${p.duration}s`,
            "--del": `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Ambient orbital particles floating around the staking vault card during loading
 */
export function StakingOrbitalAura({ active = false }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden z-10">
      {/* Dynamic sweeping radiant beam */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-indigo-400/20 to-purple-500/0 animate-shimmer-sweep" />
      {/* Pulsing ring aura */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 blur-md animate-pulse" />
      {/* Floating orbital spark points */}
      <span className="absolute top-2 left-6 w-2 h-2 rounded-full bg-purple-400 blur-xs animate-ping" />
      <span className="absolute bottom-3 right-8 w-2 h-2 rounded-full bg-emerald-400 blur-xs animate-ping" style={{ animationDelay: "0.5s" }} />
      <span className="absolute top-1/2 right-4 w-1.5 h-1.5 rounded-full bg-amber-300 blur-xs animate-ping" style={{ animationDelay: "0.8s" }} />
    </div>
  );
}

/**
 * Animated Loading State Bar with Step Progress and glowing particles
 */
export function StakingLoadingStep({ stepMessage = "Processing transaction..." }) {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 3);
    }, 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-4 text-white border border-purple-500/40 shadow-xl shadow-purple-950/40 animate-scaleIn">
      {/* Particle stars backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <span className="absolute top-3 left-10 w-1 h-1 bg-white rounded-full animate-ping" />
        <span className="absolute bottom-4 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse" />
        <span className="absolute top-4 right-1/4 w-1 h-1 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
        <span className="absolute bottom-3 right-8 w-1 h-1 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: "0.7s" }} />
      </div>

      <div className="relative z-10 flex items-center gap-3.5">
        {/* Animated glowing portal spinner */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-400 to-cyan-400 animate-spin" />
          <div className="absolute inset-0.5 rounded-full bg-slate-950 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-400 to-emerald-400 animate-ping opacity-80" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-md border border-purple-400/30">
              Arbitrum Smart Staking
            </span>
            <span className="flex gap-1">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    pulseIndex === idx ? "bg-emerald-400 scale-125" : "bg-purple-600/60"
                  }`}
                />
              ))}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-100 truncate mt-1">
            {stepMessage}
          </p>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden border border-purple-500/20">
            <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 animate-shimmer-sweep w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
