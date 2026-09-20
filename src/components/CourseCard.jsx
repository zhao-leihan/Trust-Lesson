import { Shield, Star, Clock, Layers, CheckCircle, ArrowRight } from "lucide-react";

const accentStyles = {
  indigo: {
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    headerBg: "bg-gradient-to-br from-indigo-600 to-blue-700 text-white",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25",
  },
  amber: {
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    headerBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
    btn: "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/25",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    headerBg: "bg-gradient-to-br from-rose-500 to-pink-600 text-white",
    btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    headerBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25",
  },
  cyan: {
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
    headerBg: "bg-gradient-to-br from-cyan-600 to-blue-600 text-white",
    btn: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/25",
  },
};

export default function CourseCard({ course, onSelect }) {
  const style = accentStyles[course.accentColor] || accentStyles.indigo;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
      {/* Top Banner */}
      <div className={`p-6 ${style.headerBg} relative`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full">
            {course.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/25 backdrop-blur-md px-2.5 py-0.5 rounded-full">
            <Shield size={12} />
            Escrow Protected
          </span>
        </div>

        <h3 className="font-bold text-lg leading-snug">{course.title}</h3>
        <p className="text-white/80 text-xs mt-1">By {course.mentorName}</p>

        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            <Star size={13} className="fill-amber-300 text-amber-300" />
            {course.rating} ({course.enrolledCount} enrolled)
          </span>
          <span className="font-extrabold text-base">${course.price}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
            {course.description}
          </p>

          {/* Quick specs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-medium">
              <Clock size={12} />
              {course.duration}
            </span>
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-xl text-xs font-medium">
              <Layers size={12} />
              {course.milestones?.length || 3} Milestone Payouts
            </span>
          </div>

          {/* Deliverables snippet */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {course.deliverables?.slice(0, 2).map((deliv, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-600 text-xs">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                <span className="truncate">{deliv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onSelect(course)}
          className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${style.btn}`}
        >
          <span>View Gig & Enroll</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
