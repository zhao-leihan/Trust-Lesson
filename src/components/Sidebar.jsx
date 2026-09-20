import {
  LayoutDashboard,
  CalendarDays,
  Search,
  Clock,
  CreditCard,
  Star,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { id: "explore", label: "Explore mentors", Icon: Search },
  { id: "sessions", label: "My sessions", Icon: CalendarDays },
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", Icon: Clock },
  { id: "escrow", label: "Escrow & payments", Icon: CreditCard },
  { id: "reputation", label: "Reputation", Icon: Star },
  { id: "resources", label: "Resources", Icon: BookOpen },
];

export default function Sidebar({ activeScreen, setActiveScreen }) {
  return (
    <aside className="flex flex-col h-full bg-white rounded-3xl p-5 gap-4 min-w-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl bg-violet flex items-center justify-center flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V14C20 15.1 19.1 16 18 16H13L9 20V16H6C4.9 16 4 15.1 4 14V6Z"
              fill="white"
            />
          </svg>
        </div>
        <span className="text-navy font-semibold text-lg tracking-tight">
          Trust lesson
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ id, label, Icon }) => {
          const isActive = activeScreen === id;
          return (
            <button
              key={id}
              onClick={() => setActiveScreen(id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all text-left w-full ${
                isActive
                  ? "bg-lavender text-violet font-semibold"
                  : "text-navy/60 hover:bg-lavender/50 hover:text-navy"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={18}
                className={isActive ? "text-violet" : "text-navy/40"}
              />
              <span className="truncate">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto text-violet/60" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Promo Card */}
      <div className="rounded-3xl bg-violet p-5 flex flex-col gap-4 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute bottom-[-10px] left-[-10px] w-16 h-16 rounded-full bg-white/10" />

        {/* Illustration */}
        <div className="relative z-10">
          <svg viewBox="0 0 100 70" className="w-full">
            {/* Person sitting */}
            <circle cx="50" cy="20" r="12" fill="rgba(255,255,255,0.4)" />
            <rect
              x="38"
              y="30"
              width="24"
              height="20"
              rx="6"
              fill="rgba(255,255,255,0.3)"
            />
            {/* Laptop */}
            <rect
              x="28"
              y="45"
              width="44"
              height="28"
              rx="5"
              fill="rgba(255,255,255,0.2)"
            />
            <rect
              x="32"
              y="49"
              width="36"
              height="20"
              rx="3"
              fill="rgba(255,255,255,0.15)"
            />
            <rect
              x="35"
              y="52"
              width="10"
              height="3"
              rx="1.5"
              fill="#FFC83D"
            />
            <rect
              x="35"
              y="58"
              width="20"
              height="2"
              rx="1"
              fill="rgba(255,255,255,0.4)"
            />
          </svg>
        </div>

        <div className="relative z-10">
          <p className="text-white font-semibold text-sm leading-snug">
            Learn from people who show up.
          </p>
          <p className="text-white/70 text-xs mt-1">
            Find your perfect mentor today.
          </p>
        </div>

        <button
          onClick={() => setActiveScreen("explore")}
          className="relative z-10 self-start w-10 h-10 rounded-full bg-sunshine flex items-center justify-center font-bold text-navy text-sm shadow-md hover:scale-105 transition-transform"
          aria-label="Go to Explore mentors"
        >
          Go
        </button>
      </div>
    </aside>
  );
}
