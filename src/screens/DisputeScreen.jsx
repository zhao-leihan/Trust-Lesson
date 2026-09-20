import { useState } from "react";
import { AlertTriangle, Upload, CheckCircle } from "lucide-react";

const reasons = [
  "Mentor didn't show up",
  "Session quality was poor",
  "Wrong topic covered",
  "Technical issues from mentor side",
  "Other",
];

const disputeStages = [
  { label: "Auto-resolve", sub: "AI checks logs & attendance" },
  { label: "Mediation", sub: "Our team reviews the case" },
  { label: "Jury review", sub: "Community stake-holders vote" },
];

export default function DisputeScreen() {
  const [step, setStep] = useState("form"); // form | submitted
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [currentStage, setCurrentStage] = useState(0);

  const submit = () => {
    if (!reason) return;
    setStep("submitted");
    // Simulate auto-resolve after 2 seconds
    setTimeout(() => setCurrentStage(1), 3000);
  };

  if (step === "submitted") {
    return (
      <div className="bg-white rounded-3xl p-6 flex flex-col gap-6 h-full overflow-y-auto">
        <h1 className="text-navy font-bold text-3xl">Dispute under review</h1>
        <p className="text-navy/60 text-sm -mt-4">
          Session with Maya Chen · Frontend coding · $24
        </p>

        {/* Stage tracker */}
        <div className="flex flex-col gap-4 mt-2">
          {disputeStages.map((stage, i) => {
            const isDone = i < currentStage;
            const isActive = i === currentStage;
            return (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      isDone
                        ? "bg-mint text-white"
                        : isActive
                        ? "bg-violet text-white animate-pulse"
                        : "bg-lavender text-navy/30"
                    }`}
                  >
                    {isDone ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-0.5 h-8 rounded ${isDone ? "bg-mint" : "bg-lavender"}`} />
                  )}
                </div>
                <div className="pt-1">
                  <p className={`font-semibold text-sm ${isDone || isActive ? "text-navy" : "text-navy/30"}`}>
                    {stage.label}
                  </p>
                  <p className="text-navy/50 text-xs">{stage.sub}</p>
                  {isActive && (
                    <span className="inline-block mt-1 text-xs bg-sunshine text-navy px-2 py-0.5 rounded-full font-medium">
                      In progress…
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Evidence auto-collected */}
        <div className="bg-lavender rounded-2xl p-4">
          <p className="text-navy font-semibold text-sm mb-2">Auto-collected evidence</p>
          <div className="flex flex-col gap-2 text-sm text-navy/70">
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-mint" />
              Attendance log: Mentor connected 8 min late
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-mint" />
              Session duration: 22 min of 60 min
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={13} className="text-mint" />
              Chat transcript: 5 messages exchanged
            </div>
          </div>
        </div>

        <button
          onClick={() => { setStep("form"); setCurrentStage(0); setReason(""); setDetails(""); }}
          className="text-violet font-medium text-sm underline self-start"
        >
          View another session
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-5 h-full overflow-y-auto">
      <div>
        <h1 className="text-navy font-bold text-3xl">Report a problem</h1>
        <p className="text-navy/60 text-sm mt-1">Session with Maya Chen · Frontend coding · $24</p>
      </div>

      <div className="bg-coral/10 border border-coral/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-coral flex-shrink-0 mt-0.5" />
        <p className="text-navy/70 text-sm">
          Describe what went wrong. We'll auto-collect attendance logs and chat history to help resolve this faster.
        </p>
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-2">
        <label className="text-navy font-semibold text-sm">What went wrong?</label>
        <div className="flex flex-col gap-2">
          {reasons.map((r) => (
            <label key={r} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-violet"
              />
              <span className="text-navy/70 text-sm">{r}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2">
        <label className="text-navy font-semibold text-sm">Additional details</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe the issue clearly. Focus on what happened and what you expected."
          className="w-full rounded-2xl border-2 border-lavender px-4 py-3 text-sm text-navy/80 placeholder:text-navy/30 resize-none focus:outline-none focus:border-violet"
          rows={4}
        />
      </div>

      {/* Upload evidence */}
      <button className="flex items-center gap-3 border-2 border-dashed border-lavender rounded-2xl p-4 text-navy/50 hover:border-violet/40 transition-colors w-full">
        <Upload size={18} />
        <span className="text-sm">Upload screenshot or recording (optional)</span>
      </button>

      <button
        onClick={submit}
        disabled={!reason}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
          reason
            ? "bg-coral text-white hover:bg-coral/90"
            : "bg-navy/10 text-navy/30 cursor-not-allowed"
        }`}
      >
        Submit dispute
      </button>
    </div>
  );
}
