import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Shield, GraduationCap, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "For Learners" },
  { to: "/register", label: "For Mentors" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-950/90 backdrop-blur-xl border-b border-purple-900/30 shadow-lg shadow-black/20 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-6">
        {/* Brand: Uses logo-full-white.png enlarged for clear visibility */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <img
            src="/logo-full-white.png"
            alt="Trust Lesson"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-md"
          />
        </Link>

        {/* Center Navigation Links - Guaranteed High Contrast on Dark Header */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold tracking-wide transition-all relative py-1 ${
                  isActive
                    ? "text-white font-bold after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-indigo-400 after:rounded-full"
                    : "text-white/75 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Desktop Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Role badge */}
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 ${
                  user.role === "mentor"
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                    : "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {user.role === "mentor" ? (
                  <>
                    <Shield size={12} />
                    <span>Mentor Hub</span>
                  </>
                ) : (
                  <>
                    <GraduationCap size={12} />
                    <span>Dashboard</span>
                  </>
                )}
              </Link>

              {/* Avatar circle */}
              <Link
                to="/dashboard"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                title="Account Dashboard"
              >
                {user.avatar || user.name?.[0]?.toUpperCase() || "U"}
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-white/60 hover:text-rose-400 p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 transition-all hover:scale-105 flex items-center gap-1"
              >
                <span>Get Started</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Android Hamburger Toggle & Quick Avatar */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to="/dashboard"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md"
            >
              {user.avatar || user.name?.[0]?.toUpperCase() || "U"}
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Android & Mobile Screens) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-900/40 bg-slate-950/98 backdrop-blur-2xl px-6 py-5 shadow-2xl transition-all animate-fadeIn">
          {/* Mobile User Overview if logged in */}
          {user && (
            <div className="mb-5 pb-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-inner">
                  {user.avatar || user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
                  <p className="text-purple-300/80 text-xs capitalize flex items-center gap-1 mt-0.5">
                    {user.role === "mentor" ? <Shield size={11} /> : <GraduationCap size={11} />}
                    {user.role} Workspace
                  </p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1"
              >
                <LayoutDashboard size={12} />
                <span>Dashboard</span>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-between ${
                    isActive
                      ? "bg-purple-600/20 text-white font-bold border border-purple-500/30"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Action Buttons */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut size={15} />
                <span>Sign Out ({user.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 rounded-2xl bg-white/10 text-white font-bold text-xs text-center border border-white/10 hover:bg-white/15 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs text-center shadow-lg shadow-purple-900/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
