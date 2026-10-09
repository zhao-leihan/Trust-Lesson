"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { LogOut, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/Avatar";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Course" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/how-to-use", label: "How to Use" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout, activeRole, switchRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin =
    user &&
    (user.role === "admin" ||
      user.role === "ADMIN" ||
      user.roleType === "ADMIN" ||
      user.isAdmin === true);

  const isMentorUser =
    user &&
    !isAdmin &&
    (user.role === "mentor" ||
      user.role === "MENTOR" ||
      user.roleType === "MENTOR");

  const currentRole = activeRole || (isAdmin ? "admin" : user?.role?.toLowerCase() || "student");

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Track scroll for subtle backdrop transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Hide navbar on auth screens
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // ── Dual Theme: Transparent / dark-glass on Home & About, Frosted White on app & content pages ──
  const isWhiteTheme = pathname === "/" || pathname === "/about";
  const isLightPage = !isWhiteTheme;

  // Header background & border classes
  const headerBgClass = isWhiteTheme
    ? isScrolled
      ? "bg-slate-950/85 backdrop-blur-xl border-b border-purple-900/30 shadow-lg shadow-black/20"
      : "bg-transparent backdrop-blur-sm border-b border-white/10"
    : isScrolled
    ? "bg-white/95 backdrop-blur-xl border-b border-purple-100/90 shadow-xs"
    : "bg-white/85 backdrop-blur-md border-b border-purple-100/60";

  // Logo source: crisp white on transparent dark hero, purple/dark logo on light pages
  const logoSrc = isWhiteTheme ? "/logo-full-white.webp" : "/logo-full.webp";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2.5 sm:py-3 ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src={logoSrc}
            alt="Trust Lesson"
            width={168}
            height={48}
            fetchPriority="high"
            decoding="async"
            className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                className={`text-sm font-semibold tracking-wide transition-all relative py-1 ${
                  isWhiteTheme
                    ? isActive
                      ? "text-white font-bold after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-indigo-400 after:rounded-full"
                      : "text-white/75 hover:text-white"
                    : isActive
                    ? "text-purple-700 font-bold after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-purple-600 after:rounded-full"
                    : "text-slate-600 hover:text-purple-700"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Desktop Controls & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Role Switcher Pill (Admin: 3 modes, Mentor: 2 modes) */}
              {(isAdmin || isMentorUser) && (
                <div
                  className={`flex items-center p-1 rounded-full text-xs transition-all ${
                    isWhiteTheme
                      ? "bg-white/10 backdrop-blur-md border border-white/20"
                      : "bg-purple-50/90 border border-purple-200/80"
                  }`}
                >
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        switchRole("admin");
                        if (pathname !== "/dashboard") router.push("/dashboard");
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        currentRole === "admin"
                          ? "bg-purple-600 text-white shadow-xs"
                          : isWhiteTheme
                          ? "text-white/80 hover:text-white"
                          : "text-slate-600 hover:text-purple-700"
                      }`}
                    >
                      Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      switchRole("mentor");
                      if (pathname !== "/dashboard") router.push("/dashboard");
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentRole === "mentor"
                        ? "bg-purple-600 text-white shadow-xs"
                        : isWhiteTheme
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600 hover:text-purple-700"
                    }`}
                  >
                    Mentor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchRole("student");
                      if (pathname !== "/dashboard") router.push("/dashboard");
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentRole === "student"
                        ? "bg-purple-600 text-white shadow-xs"
                        : isWhiteTheme
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600 hover:text-purple-700"
                    }`}
                  >
                    Learner
                  </button>
                </div>
              )}

              {/* User Profile Avatar with Live Photo Sync */}
              <Link
                href="/dashboard?tab=profile"
                title="Account Dashboard"
              >
                <div className="relative">
                  <Avatar
                    className={`w-9 h-9 hover:scale-105 transition-transform cursor-pointer border-2 shadow-2xs ${
                      isWhiteTheme ? "border-white/30" : "border-purple-200/90"
                    }`}
                  >
                    <AvatarImage
                      src={
                        user.avatarUrl ||
                        (currentRole === "mentor"
                          ? "/mentor-profile.webp"
                          : currentRole === "admin"
                          ? "/admin-profile.webp"
                          : "/student-profile.webp")
                      }
                      alt={user.name || "User Profile"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Role indicator badge on avatar */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white bg-white overflow-hidden shadow-2xs">
                    <img
                      src={
                        currentRole === "admin"
                          ? "/admin-profile.webp"
                          : currentRole === "mentor"
                          ? "/mentor-profile.webp"
                          : "/student-profile.webp"
                      }
                      alt="Role"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isWhiteTheme
                    ? "text-white/60 hover:text-rose-400 hover:bg-white/10"
                    : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                }`}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  isWhiteTheme
                    ? "text-white/80 hover:text-white"
                    : "text-slate-700 hover:text-purple-700"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-600/25 transition-all hover:scale-105 flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle & Avatar */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link href="/dashboard?tab=profile" title="Account Dashboard">
              <div className="relative">
                <Avatar
                  className={`w-8 h-8 border-2 shadow-2xs ${
                    isWhiteTheme ? "border-white/30" : "border-purple-200/90"
                  }`}
                >
                  <AvatarImage
                    src={
                      user.avatarUrl ||
                      (currentRole === "mentor"
                        ? "/mentor-profile.webp"
                        : currentRole === "admin"
                        ? "/admin-profile.webp"
                        : "/student-profile.webp")
                    }
                    alt={user.name || "User Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors focus:outline-none cursor-pointer ${
              isWhiteTheme
                ? "text-white/90 hover:text-white hover:bg-white/10"
                : "text-slate-800 hover:text-purple-700 hover:bg-purple-50"
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-6 py-5 shadow-2xl transition-all animate-fadeIn ${
            isWhiteTheme
              ? "border-t border-purple-900/40 bg-slate-950/98 backdrop-blur-2xl text-white"
              : "border-t border-purple-100 bg-white/98 backdrop-blur-2xl text-slate-900"
          }`}
        >
          {/* Mobile User Overview if logged in */}
          {user && (
            <div
              className={`mb-4 pb-4 space-y-3 ${
                isWhiteTheme ? "border-b border-white/10" : "border-b border-purple-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar
                    className={`w-10 h-10 border-2 ${
                      isWhiteTheme ? "border-purple-400/40" : "border-purple-200"
                    }`}
                  >
                    <AvatarImage
                      src={
                        user.avatarUrl ||
                        (currentRole === "mentor"
                          ? "/mentor-profile.webp"
                          : currentRole === "admin"
                          ? "/admin-profile.webp"
                          : "/student-profile.webp")
                      }
                      alt={user.name || "User Profile"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-extrabold text-sm">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p
                      className={`font-bold text-sm leading-tight ${
                        isWhiteTheme ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {user.name}
                    </p>
                    <p
                      className={`text-xs capitalize flex items-center gap-1.5 mt-0.5 font-medium ${
                        isWhiteTheme ? "text-purple-300/80" : "text-purple-600"
                      }`}
                    >
                      {currentRole === "admin"
                        ? "Admin View"
                        : currentRole === "mentor"
                        ? "Mentor View"
                        : "Learner View"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard?tab=profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <LayoutDashboard size={12} />
                    <span>Profile</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Role Switcher (Admin: 3 modes, Mentor: 2 modes) */}
              {(isAdmin || isMentorUser) && (
                <div
                  className={`flex items-center justify-between p-1 rounded-2xl ${
                    isWhiteTheme
                      ? "bg-white/10 border border-white/20"
                      : "bg-purple-50 border border-purple-200"
                  }`}
                >
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        switchRole("admin");
                        setMobileMenuOpen(false);
                        if (pathname !== "/dashboard") router.push("/dashboard");
                      }}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                        currentRole === "admin"
                          ? "bg-purple-600 text-white shadow-xs"
                          : isWhiteTheme
                          ? "text-white/80 hover:text-white"
                          : "text-slate-600"
                      }`}
                    >
                      Admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      switchRole("mentor");
                      setMobileMenuOpen(false);
                      if (pathname !== "/dashboard") router.push("/dashboard");
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      currentRole === "mentor"
                        ? "bg-purple-600 text-white shadow-xs"
                        : isWhiteTheme
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Mentor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchRole("student");
                      setMobileMenuOpen(false);
                      if (pathname !== "/dashboard") router.push("/dashboard");
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      currentRole === "student"
                        ? "bg-purple-600 text-white shadow-xs"
                        : isWhiteTheme
                        ? "text-white/80 hover:text-white"
                        : "text-slate-600"
                    }`}
                  >
                    Learner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  href={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                    isWhiteTheme
                      ? isActive
                        ? "bg-purple-600/20 text-white font-bold border border-purple-500/30"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                      : isActive
                      ? "bg-purple-50 text-purple-700 font-bold border border-purple-200"
                      : "text-slate-700 hover:text-purple-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{label}</span>
                  {isActive && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isWhiteTheme ? "bg-purple-400" : "bg-purple-600"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Action Buttons */}
          <div
            className={`mt-4 pt-4 flex flex-col gap-2.5 ${
              isWhiteTheme ? "border-t border-white/10" : "border-t border-purple-100"
            }`}
          >
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isWhiteTheme
                    ? "bg-white/5 hover:bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                }`}
              >
                <LogOut size={15} />
                <span>Sign Out ({user.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 rounded-xl font-bold text-xs text-center border transition-all ${
                    isWhiteTheme
                      ? "bg-white/10 text-white border-white/15 hover:bg-white/20"
                      : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs text-center shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5 transition-all"
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
