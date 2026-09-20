import { Shield, Lock, Clock, Users, Star } from "lucide-react";
import { getIllustration } from "./illustrations/Illustrations";

const cardColors = {
  violet: {
    bg: "bg-gradient-to-br from-indigo-600 to-purple-700",
    text: "text-white",
    subText: "text-white/80",
    badgeBg: "bg-white/20",
    iconColor: "text-white",
  },
  sunshine: {
    bg: "bg-gradient-to-br from-amber-400 to-amber-500",
    text: "text-slate-950",
    subText: "text-slate-800",
    badgeBg: "bg-slate-900/15",
    iconColor: "text-slate-950",
  },
  coral: {
    bg: "bg-gradient-to-br from-rose-500 to-red-600",
    text: "text-white",
    subText: "text-white/85",
    badgeBg: "bg-white/20",
    iconColor: "text-white",
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-600 to-teal-700",
    text: "text-white",
    subText: "text-white/85",
    badgeBg: "bg-white/20",
    iconColor: "text-white",
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-600 to-blue-700",
    text: "text-white",
    subText: "text-white/85",
    badgeBg: "bg-white/20",
    iconColor: "text-white",
  },
  rose: {
    bg: "bg-gradient-to-br from-fuchsia-600 to-rose-600",
    text: "text-white",
    subText: "text-white/85",
    badgeBg: "bg-white/20",
    iconColor: "text-white",
  },
};

export default function MentorCard({ mentor, isSelected, onClick }) {
  const colors = cardColors[mentor.cardColor] || cardColors.violet;

  return (
    <button
      onClick={() => onClick(mentor)}
      className={`relative rounded-[24px] p-5 flex flex-col gap-3 w-full text-left transition-all duration-300 shadow-md ${colors.bg} ${
        isSelected
          ? "scale-[1.02] ring-4 ring-white/60 shadow-2xl"
          : "hover:scale-[1.02] hover:shadow-xl"
      }`}
      aria-label={`View ${mentor.skill} with ${mentor.name}`}
    >
      {/* Icons top-right */}
      <div className="absolute top-4 right-4 flex gap-1.5 z-10">
        {mentor.verified && (
          <span
            className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center"
            title="Verified Mentor"
          >
            <Shield size={13} className={colors.iconColor} />
          </span>
        )}
        {mentor.premium && (
          <span
            className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center"
            title="Premium Mentor"
          >
            <Lock size={13} className={colors.iconColor} />
          </span>
        )}
      </div>

      {/* Illustration */}
      <div className="h-20 flex items-center justify-center">
        {getIllustration(mentor.category)}
      </div>

      {/* Text Info */}
      <div>
        <h3 className={`font-bold text-lg leading-tight ${colors.text}`}>
          {mentor.skill}
        </h3>
        <p className={`text-xs mt-1 font-medium ${colors.subText}`}>By {mentor.name}</p>
      </div>

      {/* Bottom badges */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors.badgeBg} ${colors.text}`}
        >
          <Clock size={11} />
          {mentor.duration}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${colors.badgeBg} ${colors.text}`}
        >
          <Users size={11} />
          {mentor.level}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${colors.badgeBg} ${colors.text}`}
        >
          ${mentor.price}
        </span>
      </div>

      {/* Escrow badge */}
      <div className="flex items-center gap-1.5 pt-1">
        <Shield size={11} className={colors.iconColor} />
        <span className={`text-[11px] font-medium ${colors.subText}`}>Escrow Protected</span>
      </div>
    </button>
  );
}
