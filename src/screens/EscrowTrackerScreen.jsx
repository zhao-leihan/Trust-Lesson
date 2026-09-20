import { useState } from "react";
import { mySessions } from "../data/mentors";
import EscrowBadge from "../components/EscrowBadge";
import { CheckCircle, AlertTriangle, Calendar, Clock } from "lucide-react";

export default function EscrowTrackerScreen() {
  const [sessions, setSessions] = useState(mySessions);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const confirm = (id) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "released", escrowStatus: "Released" } : s))
    );
    showToast("Session confirmed — payment released!");
  };

  const report = (id) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "disputed", escrowStatus: "Disputed" } : s))
    );
    showToast("Problem reported — under review.");
  };

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-5 h-full overflow-y-auto relative">
      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}

      <h1 className="text-navy font-bold text-3xl">My sessions</h1>
      <p className="text-navy/50 text-sm -mt-3">
        Track your escrow status and confirm completed sessions.
      </p>

      <div className="flex flex-col gap-4">
        {sessions.map((s) => (
          <div key={s.id} className="bg-lavender rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-navy font-bold text-lg">{s.skill}</p>
                <p className="text-navy/60 text-sm">with {s.mentor}</p>
              </div>
              <EscrowBadge status={s.status} />
            </div>

            <div className="flex items-center gap-4 text-sm text-navy/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {s.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {s.time}
              </span>
              <span className="font-semibold text-navy">${s.price}</span>
            </div>

            {/* Escrow flow visual */}
            <div className="flex items-center gap-1 mt-1">
              {["Locked", "In session", "Released"].map((step, i) => {
                const stepStatus =
                  step === "Locked"
                    ? "locked"
                    : step === "In session"
                    ? "in-session"
                    : "released";
                const steps = ["locked", "in-session", "released", "disputed"];
                const currentIdx = steps.indexOf(s.status);
                const stepIdx = i;
                const isActive = stepIdx <= (currentIdx === 3 ? 2 : currentIdx);
                return (
                  <div key={step} className="flex items-center gap-1 flex-1">
                    <div className={`flex-1 h-1.5 rounded-full ${isActive ? "bg-violet" : "bg-navy/10"}`} />
                    {i < 2 && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? "bg-violet" : "bg-navy/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-navy/40">
              <span>Locked</span>
              <span>In session</span>
              <span>Released</span>
            </div>

            {/* Action buttons */}
            {(s.status === "locked" || s.status === "in-session") && (
              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => confirm(s.id)}
                  className="flex-1 py-2.5 rounded-xl bg-mint text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-mint/90 transition-colors"
                >
                  <CheckCircle size={15} />
                  Confirm session done
                </button>
                <button
                  onClick={() => report(s.id)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-coral font-semibold text-sm border-2 border-coral/20 flex items-center justify-center gap-2 hover:bg-coral/5 transition-colors"
                >
                  <AlertTriangle size={15} />
                  Report a problem
                </button>
              </div>
            )}

            {s.status === "released" && (
              <div className="flex items-center gap-2 text-mint text-sm font-medium">
                <CheckCircle size={15} />
                Payment released — session complete!
              </div>
            )}

            {s.status === "disputed" && (
              <div className="flex items-center gap-2 text-coral text-sm font-medium">
                <AlertTriangle size={15} />
                Under review — our team will contact you.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
