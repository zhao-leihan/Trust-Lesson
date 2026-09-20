import { BookOpen, CheckSquare, Target, MessageSquare } from "lucide-react";

const iconMap = {
  BookOpen,
  CheckSquare,
  Target,
  MessageSquare,
};

export default function ResourcePill({ resource }) {
  const Icon = iconMap[resource.icon] || BookOpen;

  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ backgroundColor: resource.color }}
    >
      <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-navy" />
      </div>
      <div className="min-w-0">
        <p className="text-navy text-sm font-medium leading-tight truncate max-w-[160px]">
          {resource.title}
        </p>
        <p className="text-navy/60 text-xs mt-0.5">{resource.author}</p>
      </div>
    </div>
  );
}
