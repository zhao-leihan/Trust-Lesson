import { milestones } from "../data/mentors";
import { Lock, CheckCircle, AlertCircle, Play, Target, FileText, Mic } from "lucide-react";

const statusIcon = {
  released: <CheckCircle size={16} className="text-mint" />,
  disputed: <AlertCircle size={16} className="text-coral" />,
  locked: <Lock size={16} className="text-navy/30" />,
  "in-session": <Play size={16} className="text-sunshine fill-sunshine" />,
};

const playColors = {
  released: "bg-mint",
  "in-session": "bg-sunshine",
  locked: "bg-lavender",
  disputed: "bg-coral",
};

const iconMap = {
  target: Target,
  file: FileText,
  mic: Mic,
  handshake: Target,
};

const released = milestones.filter((m) => m.status === "released").length;
const total = milestones.length;

export default function MilestoneList() {
  const locked = milestones.filter((m) => m.status === "locked" || m.status === "in-session").length;
  const lockedAmount = milestones
    .filter((m) => m.status === "locked" || m.status === "in-session")
    .reduce((s, m) => s + m.amount, 0);

  return (
    <div className="bg-white rounded-3xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-navy font-bold text-lg">Milestones</h3>
        <span className="text-navy/50 text-sm">${lockedAmount} in escrow</span>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="h-1.5 rounded-full bg-lavender overflow-hidden">
          <div
            className="h-full bg-violet rounded-full transition-all"
            style={{ width: `${(released / total) * 100}%` }}
          />
        </div>
        <p className="text-navy/50 text-xs">
          {released} of {total} milestones completed
        </p>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {milestones.map((m) => {
          const Icon = iconMap[m.icon] || Target;
          return (
            <div key={m.id} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${playColors[m.status]}`}
              >
                <Icon size={15} className={m.status === "in-session" ? "text-navy" : "text-white"} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium leading-tight truncate ${
                    m.status === "locked" ? "text-navy/40" : "text-navy"
                  }`}
                >
                  {m.title}
                </p>
                <p className="text-navy/40 text-xs truncate">{m.description}</p>
              </div>
              <div className="flex-shrink-0">{statusIcon[m.status]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
