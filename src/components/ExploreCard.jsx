"use client";

import { Shield, Star, Clock, ArrowRight, CheckCircle2, Layers } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categoryStyles = {
  Coding: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    gradient: "from-purple-500/20 via-indigo-500/5 to-transparent",
    avatarBg: "from-purple-600 to-indigo-600",
    defaultCover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
  },
  Career: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    gradient: "from-amber-500/20 via-orange-500/5 to-transparent",
    avatarBg: "from-amber-500 to-orange-600",
    defaultCover: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
  },
  Design: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    gradient: "from-rose-500/20 via-pink-500/5 to-transparent",
    avatarBg: "from-rose-500 to-pink-600",
    defaultCover: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80",
  },
  Business: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    gradient: "from-blue-500/20 via-cyan-500/5 to-transparent",
    avatarBg: "from-blue-600 to-cyan-600",
    defaultCover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
  },
  Languages: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gradient: "from-emerald-500/20 via-teal-500/5 to-transparent",
    avatarBg: "from-emerald-600 to-teal-600",
    defaultCover: "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?w=600&auto=format&fit=crop&q=80",
  },
  Music: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    gradient: "from-violet-500/20 via-purple-500/5 to-transparent",
    avatarBg: "from-violet-600 to-purple-600",
    defaultCover: "https://images.unsplash.com/photo-1520523839898-507127054976?w=600&auto=format&fit=crop&q=80",
  },
};

export default function ExploreCard({ item }) {
  const isCourse = Boolean(item.milestones || item.deliverables || item.offeringType === "course");
  const type = isCourse ? "course" : "mentor";
  const title = item.skill || item.title;
  const name = item.name || item.mentorName;
  const price = item.price;
  const rating = item.rating || 4.9;
  const duration = item.duration || (isCourse ? "4 Weeks" : "1 hour");
  const category = item.category || "Coding";
  const description = item.description || "Personalized 1-on-1 guidance, milestone deliverables, and code architecture.";
  const level = item.level || "All levels";
  const milestonesCount = item.milestones?.length || (isCourse ? 3 : null);
  const reputation = item.reputationScore || 98;

  const style = categoryStyles[category] || categoryStyles.Coding;

  const coverImage = item.coverImage || item.image || style.defaultCover;
  const mentorPhoto =
    item.mentorPhoto ||
    item.avatarUrl ||
    `https://images.unsplash.com/photo-${
      category === "Coding"
        ? "1573496359142-b8d87734a5a2"
        : category === "Career"
        ? "1534528741775-53994a69daeb"
        : category === "Languages"
        ? "1580489944761-15a19d654956"
        : category === "Music"
        ? "1507003211169-0a1dd7228f2d"
        : category === "Business"
        ? "1531746020798-e6953c6e8e04"
        : "1500648767791-00dcc994a43e"
    }?w=150&auto=format&fit=crop&q=80`;

  const [imgError, setImgError] = useState(false);
  return (
    <div className="group bg-white rounded-3xl border-2 border-purple-100 p-5 sm:p-6 flex flex-col justify-between hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 relative shadow-sm">
      {/* ── 1. Top Cover / Banner Image ── */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-purple-100">
        {!imgError ? (
          <img
            src={coverImage}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-tr ${style.avatarBg} flex items-center justify-center`}>
            <span className="text-white font-extrabold text-2xl">{category}</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/95 text-slate-900 shadow-sm border border-slate-200/60 backdrop-blur-xs">
            {category}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Escrow Protected</span>
          </span>
        </div>

        {/* Bottom Price Tag */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 text-white px-3 py-1 rounded-xl border border-white/10 text-right shadow-sm backdrop-blur-xs">
          <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider block leading-none">
            {isCourse ? "Gig Total" : "Hourly Rate"}
          </span>
          <span className="text-white font-black text-sm leading-tight">
            ${price} <span className="text-[9px] text-purple-300 font-bold">USDC</span>
          </span>
        </div>
      </div>

      {/* ── 2. Card Content Body ── */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-purple-700 transition-colors">
            {title}
          </h3>

          {/* Description snippet */}
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          {/* Milestone or Level indicator */}
          {isCourse && milestonesCount ? (
            <div className="mb-4 py-1.5 px-3 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between text-[11px] font-medium text-purple-900">
              <span className="flex items-center gap-1.5 font-bold">
                <Layers size={13} className="text-purple-600" />
                <span>{milestonesCount} Escrow Milestones</span>
              </span>
              <span className="text-purple-700 font-semibold">{duration}</span>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-medium text-slate-600">
                {level}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-slate-400" />
                <span>{duration}</span>
              </span>
            </div>
          )}

          {/* ── 3. Mentor Profile with Real Photo Avatar ── */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mb-4">
            <div className="relative shrink-0">
              {!avatarError ? (
                <img
                  src={mentorPhoto}
                  alt={name}
                  onError={() => setAvatarError(true)}
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${style.avatarBg} text-white font-extrabold text-sm flex items-center justify-center`}>
                  {name?.[0] || "M"}
                </div>
              )}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-xs"
                title="Verified Mentor"
              >
                <CheckCircle2 size={9} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-slate-900 text-xs font-bold truncate group-hover:text-purple-700 transition-colors">
                {name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-0.5 font-bold text-slate-700">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {rating}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-medium text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded">
                  {reputation}% Score
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Card Bottom Action ── */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
              {isCourse ? "Settlement" : "Rate"}
            </span>
            <span className="text-slate-900 font-bold text-xs">
              ${price} USDC {isCourse ? "total" : "/ hr"}
            </span>
          </div>

          <Link
            href={`/book/${type}/${item.id}`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Book Now</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
