import { useState } from "react";
import { milestones } from "../data/mentors";
import { CheckCircle, Lock, AlertCircle, Target, FileText, Mic, ChevronDown, ChevronUp } from "lucide-react";

const iconMap = { target: Target, file: FileText, mic: Mic, handshake: Target };
const statusColors = {
  released: { bg: "bg-mint", text: "text-white", borderColor: "border-mint" },
  "in-session": { bg: "bg-sunshine", text: "text-navy", borderColor: "border-sunshine" },
  locked: { bg: "bg-lavender", text: "text-navy/40", borderColor: "border-lavender" },
  disputed: { bg: "bg-coral", text: "text-white", borderColor: "border-coral" },
};

export default function MilestoneScreen() {
  const [items, setItems] = useState(milestones);
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const release = (id) => {
    setItems((prev) => prev.map((m) => m.id === id ? { ...m, status: "released" } : m));
    showToast("Milestone released — payment sent!");
  };

  const totalLocked = items.filter((m) => m.status !== "released").reduce((s, m) => s + m.amount, 0);
  const releasedCount = items.filter((m) => m.status === "released").length;

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-5 h-full overflow-y-auto relative">
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-navy font-bold text-3xl">Milestones</h1>
          <p className="text-navy/50 text-sm mt-1">Career coaching · 3-month plan with Daniel Okafor</p>
        </div>
        <div className="text-right">
          <p className="text-navy font-bold text-2xl">${totalLocked}</p>
          <p className="text-navy/50 text-xs">in escrow</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-navy/60">
          <span>{releasedCount} of {items.length} completed</span>
          <span>{Math.round((releasedCount / items.length) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-lavender overflow-hidden">
          <div
            className="h-full bg-violet rounded-full transition-all duration-500"
            style={{ width: `${(releasedCount / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Milestones list */}
      <div className="flex flex-col gap-3">
        {items.map((m, idx) => {
          const Icon = iconMap[m.icon] || Target;
          const colors = statusColors[m.status];
          const isExpanded = expanded === m.id;
          const isPast = idx < items.findIndex(i => i.status !== "released");

          return (
            <div
              key={m.id}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${colors.borderColor}`}
            >
              <button
                className="w-full flex items-center gap-4 p-4 text-left"
                onClick={() => setExpanded(isExpanded ? null : m.id)}
                aria-expanded={isExpanded}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
                  <Icon size={16} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${m.status === "locked" ? "text-navy/40" : "text-navy"}`}>
                    {m.title}
                  </p>
                  <p className="text-navy/40 text-xs truncate">{m.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-navy font-bold text-sm">${m.amount}</span>
                  {m.status === "released" && <CheckCircle size={16} className="text-mint" />}
                  {m.status === "locked" && <Lock size={16} className="text-navy/30" />}
                  {m.status === "disputed" && <AlertCircle size={16} className="text-coral" />}
                  {isExpanded ? <ChevronUp size={14} className="text-navy/40" /> : <ChevronDown size={14} className="text-navy/40" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-lavender/50 pt-3">
                  <p className="text-navy/60 text-sm">{m.description}</p>
                  {/* Checklist */}
                  <div className="flex flex-col gap-1.5">
                    {["Session completed", "Notes reviewed", "Action items set"].map((item, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={m.status === "released"}
                          className="accent-violet rounded"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                  {m.status === "in-session" && (
                    <button
                      onClick={() => release(m.id)}
                      className="w-full py-2.5 rounded-xl bg-mint text-white font-semibold text-sm hover:bg-mint/90 transition-colors"
                    >
                      Release milestone — ${m.amount}
                    </button>
                  )}
                  {m.status === "released" && (
                    <p className="text-mint text-sm font-medium flex items-center gap-2">
                      <CheckCircle size={14} /> Payment released
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
