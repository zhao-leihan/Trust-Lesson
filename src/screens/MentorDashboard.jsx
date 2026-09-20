import { TrendingUp, CalendarDays, Lock, Shield, CheckCircle, ChevronRight } from "lucide-react";

const upcoming = [
  { student: "Alex M.", skill: "Frontend coding", date: "Sep 22", time: "10:00 AM", price: 24 },
  { student: "Tom R.", skill: "Frontend coding", date: "Sep 23", time: "2:00 PM", price: 24 },
  { student: "Priya K.", skill: "Frontend coding", date: "Sep 25", time: "11:00 AM", price: 24 },
];

export default function MentorDashboard() {
  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-navy font-bold text-3xl">Dashboard</h1>
          <p className="text-navy/50 text-sm mt-1">Welcome back, Maya 👋</p>
        </div>
        <div className="w-11 h-11 rounded-full bg-violet flex items-center justify-center text-white font-bold">
          M
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-violet rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-[-15px] right-[-15px] w-20 h-20 rounded-full bg-white/10" />
          <TrendingUp size={18} className="text-white/70 mb-2" />
          <p className="text-white/70 text-xs">This month</p>
          <p className="text-white font-bold text-2xl">$1,248</p>
          <p className="text-white/60 text-xs mt-0.5">+18% vs last month</p>
        </div>
        <div className="bg-sunshine rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-[-15px] right-[-15px] w-20 h-20 rounded-full bg-navy/5" />
          <Lock size={18} className="text-navy/60 mb-2" />
          <p className="text-navy/60 text-xs">In escrow</p>
          <p className="text-navy font-bold text-2xl">$312</p>
          <p className="text-navy/50 text-xs mt-0.5">3 sessions pending</p>
        </div>
        <div className="bg-lavender rounded-2xl p-4 col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy/60 text-xs">Reputation score</p>
              <p className="text-navy font-bold text-2xl">98 / 100</p>
            </div>
            <div className="text-right">
              <p className="text-navy/60 text-xs">Sessions done</p>
              <p className="text-navy font-bold text-2xl">1,200</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-white mt-3 overflow-hidden">
            <div className="h-full bg-violet rounded-full" style={{ width: "98%" }} />
          </div>
        </div>
      </div>

      {/* Upcoming sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-navy font-bold text-lg">Upcoming sessions</h2>
          <button className="text-violet text-sm font-medium flex items-center gap-1">
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {upcoming.map((s, i) => (
            <div key={i} className="flex items-center gap-4 bg-lavender rounded-2xl p-4">
              <div className="w-9 h-9 rounded-xl bg-violet/20 flex items-center justify-center text-violet font-bold text-sm flex-shrink-0">
                {s.student[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-navy font-semibold text-sm">{s.student}</p>
                <p className="text-navy/50 text-xs">{s.date} · {s.time}</p>
              </div>
              <span className="text-navy font-bold text-sm">${s.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification status */}
      <div className="border-2 border-violet rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-navy font-bold text-sm">Verified mentor</p>
            <p className="text-navy/50 text-xs">Active · Stake deposited</p>
          </div>
          <CheckCircle size={18} className="text-mint ml-auto" />
        </div>
        <p className="text-navy/60 text-sm">
          Your verified badge increases session bookings by <span className="text-violet font-semibold">3×</span> and unlocks premium pricing.
        </p>
        <button className="w-full py-2.5 rounded-xl bg-lavender text-violet font-semibold text-sm hover:bg-violet hover:text-white transition-all">
          Manage verification
        </button>
      </div>
    </div>
  );
}
