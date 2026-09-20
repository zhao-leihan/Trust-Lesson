import { Star, Shield, Share2, ExternalLink, CheckCircle } from "lucide-react";

const reviews = [
  {
    id: 1,
    reviewer: "Alex M.",
    rating: 5,
    text: "Maya's React explanations finally made hooks click for me. Booked 5 more sessions!",
    skill: "Frontend coding",
    date: "Sep 2026",
    verified: true,
  },
  {
    id: 2,
    reviewer: "Priya K.",
    rating: 5,
    text: "Super patient, very detailed. My portfolio went from 0 to landing me 3 interviews.",
    skill: "Frontend coding",
    date: "Aug 2026",
    verified: true,
  },
  {
    id: 3,
    reviewer: "Tom R.",
    rating: 4,
    text: "Great content, very practical. Would have loved more time on TypeScript.",
    skill: "Frontend coding",
    date: "Jul 2026",
    verified: true,
  },
];

const credentials = [
  { title: "Top Mentor — Coding", issuer: "Trust lesson", date: "Sep 2026", icon: "🏆" },
  { title: "1,000+ sessions completed", issuer: "Trust lesson", date: "Aug 2026", icon: "🎯" },
  { title: "Meta Frontend Professional", issuer: "Meta Certifications", date: "2024", icon: "🎓" },
];

export default function ReputationScreen() {
  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-navy font-bold text-3xl">Reputation</h1>
          <p className="text-navy/50 text-sm mt-1">Maya Chen · Frontend coding mentor</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-violet text-violet font-semibold text-sm hover:bg-lavender transition-all">
          <Share2 size={14} />
          Share
        </button>
      </div>

      {/* Score card */}
      <div className="bg-violet rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute bottom-[-15px] left-0 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Reputation score</p>
            <p className="text-white font-bold" style={{ fontSize: 56, lineHeight: 1 }}>98</p>
            <p className="text-white/60 text-xs mt-1">Top 2% of all mentors</p>
          </div>
          <div className="flex flex-col gap-3 text-right">
            <div>
              <p className="text-white font-bold text-xl">4.9</p>
              <div className="flex gap-0.5 justify-end">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={12} className="text-sunshine fill-sunshine" />
                ))}
              </div>
              <p className="text-white/60 text-xs">1,200 sessions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-navy font-bold text-lg">Verified reviews</h2>
          <span className="text-navy/50 text-xs flex items-center gap-1">
            <Shield size={11} className="text-violet" />
            Only from paid sessions
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-lavender rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-navy font-semibold text-sm">{r.reviewer}</p>
                  <p className="text-navy/50 text-xs">{r.skill} · {r.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={11} className="text-sunshine fill-sunshine" />
                    ))}
                  </div>
                  {r.verified && (
                    <span className="inline-flex items-center gap-0.5 text-mint text-xs font-medium">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
              </div>
              <p className="text-navy/70 text-sm leading-relaxed">"{r.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div>
        <h2 className="text-navy font-bold text-lg mb-3">Credentials</h2>
        <div className="flex flex-col gap-2">
          {credentials.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-lavender rounded-2xl p-4">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-semibold text-sm">{c.title}</p>
                <p className="text-navy/50 text-xs">{c.issuer} · {c.date}</p>
              </div>
              <button aria-label="View credential" className="text-violet">
                <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="bg-lavender rounded-2xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-navy font-semibold text-sm">Export your reputation</p>
          <p className="text-navy/50 text-xs mt-0.5">Share a public link or download a verifiable credential</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet text-white font-semibold text-sm hover:bg-violet/90 transition-all">
          <Share2 size={14} />
          Export
        </button>
      </div>
    </div>
  );
}
