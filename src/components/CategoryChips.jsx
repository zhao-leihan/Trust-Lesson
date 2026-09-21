import { Code, Compass, Palette, Briefcase, Globe2, Music, Sparkles } from "lucide-react";

const categories = ["All", "Coding", "Career", "Design", "Business", "Languages", "Music"];

const categoryIcons = {
  All: Sparkles,
  Coding: Code,
  Career: Compass,
  Design: Palette,
  Business: Briefcase,
  Languages: Globe2,
  Music: Music,
};

export default function CategoryChips({ active, onChange }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 pt-1">
      {categories.map((cat) => {
        const Icon = categoryIcons[cat] || Sparkles;
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isActive
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]"
                : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-transparent"
            }`}
            aria-pressed={isActive}
          >
            <Icon size={14} className={isActive ? "text-white" : "text-purple-500"} />
            <span>{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
