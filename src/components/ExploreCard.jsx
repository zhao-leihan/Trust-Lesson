import { Shield, Star, Clock, ArrowRight, CheckCircle2, Layers, Sparkles, Award } from "lucide-react";
import { Link } from "react-router-dom";

const categoryStyles = {
  Coding: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    gradient: "from-purple-500/20 via-indigo-500/5 to-transparent",
    avatarBg: "from-purple-600 to-indigo-600",
  },
  Career: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    gradient: "from-amber-500/20 via-orange-500/5 to-transparent",
    avatarBg: "from-amber-500 to-orange-600",
  },
  Design: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    gradient: "from-rose-500/20 via-pink-500/5 to-transparent",
    avatarBg: "from-rose-500 to-pink-600",
  },
  Business: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    gradient: "from-blue-500/20 via-cyan-500/5 to-transparent",
    avatarBg: "from-blue-600 to-cyan-600",
  },
  Languages: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gradient: "from-emerald-500/20 via-teal-500/5 to-transparent",
    avatarBg: "from-emerald-600 to-teal-600",
  },
  Music: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    gradient: "from-violet-500/20 via-purple-500/5 to-transparent",
    avatarBg: "from-violet-600 to-purple-600",
  },
};

export default function ExploreCard({ item }) {
  // item can be a mentor or a gig/course
  const isCourse = Boolean(item.milestones || item.deliverables || item.offeringType === "course");
  const type = isCourse ? "course" : "mentor";
  const title = item.skill || item.title;
  const name = item.name || item.mentorName;
  const avatar = item.avatar || item.mentorAvatar || name?.[0] || "M";
  const price = item.price;
  const rating = item.rating || 4.9;
  const duration = item.duration || (isCourse ? "4 Weeks" : "1 hour");
  const category = item.category || "General";
  const description = item.description || "Personalized 1-on-1 guidance, milestone deliverables, and code architecture.";
  const level = item.level || "All levels";
  const milestonesCount = item.milestones?.length || (isCourse ? 3 : null);
  const reputation = item.reputationScore || 98;

  const style = categoryStyles[category] || categoryStyles.Coding;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 flex flex-col justify-between hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
      {/* Top subtle category gradient sheen */}
      <div className={`h-2.5 w-full bg-gradient-to-r ${style.avatarBg}`} />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Escrow Badge Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                {category}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isCourse
                  ? "bg-purple-100 text-purple-800"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {isCourse ? "Milestone Gig" : "1-on-1 Call"}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Escrow</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-purple-900 transition-colors">
            {title}
          </h3>

          {/* Description snippet */}
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          {/* Milestone or Level indicator */}
          {isCourse && milestonesCount ? (
            <div className="mb-4 py-1.5 px-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-[11px] font-medium text-purple-900">
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

          {/* Mentor Profile Details */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mb-4">
            <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-tr ${style.avatarBg} text-white font-extrabold text-xs flex items-center justify-center shadow-sm shrink-0`}>
              {avatar}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white" title="Verified Mentor">
                <CheckCircle2 size={9} />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-slate-900 text-xs font-bold truncate group-hover:text-indigo-600 transition-colors">
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

        {/* Price & Action Button */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
              {isCourse ? "Gig Total" : "Hourly Rate"}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-950 font-black text-xl leading-tight">
                ${price}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">USDC</span>
            </div>
          </div>

          <Link
            to={`/book/${type}/${item.id}`}
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
