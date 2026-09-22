"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { LogOut, Shield, GraduationCap, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/Avatar";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Course" },
  { to: "/how-to-use", label: "How to Use" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // ── Conditional Theme: White on Home & About, Non-White (Light/Purple) on Explore & Dashboard ──
  const isWhiteTheme = pathname === "/" || pathname === "/about";
  const isLightPage = pathname === "/explore" || pathname === "/how-to-use" || pathname.startsWith("/dashboard");

  // Header background & border classes
  const headerBgClass = isWhiteTheme
    ? isScrolled
      ? "bg-slate-950/80 backdrop-blur-xl border-b border-purple-900/30 shadow-lg shadow-black/20"
      : "bg-transparent backdrop-blur-sm border-b border-white/10"
    : isLightPage
    ? isScrolled
      ? "bg-white/85 backdrop-blur-xl border-b border-purple-100 shadow-sm"
      : "bg-white/60 backdrop-blur-md border-b border-purple-100/80"
    : "bg-slate-950/90 backdrop-blur-xl border-b border-purple-900/30";

  // Logo source
  const logoSrc = isWhiteTheme ? "/logo-full-white.png" : "/logo-full.png";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2.5 sm:py-3 ${headerBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-6">
        {/* Brand: Uses white logo on Home, dark logo on Explore */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <img
            src={logoSrc}
            alt="Trust Lesson"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm"
          />
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
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
                    : isLightPage
                    ? isActive
                      ? "text-purple-700 font-bold after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-0.5 after:bg-purple-600 after:rounded-full"
                      : "text-slate-600 hover:text-purple-700"
                    : isActive
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
              {/* User Profile Avatar (Only image, no text) with role indicator */}
              <Link
                href="/dashboard"
                title={
                  user.role === "admin" || user.roleType === "ADMIN"
                    ? "Admin Panel"
                    : user.role === "mentor" || user.roleType === "MENTOR"
                    ? "Mentor Hub"
                    : "Student Dashboard"
                }
              >
                <div className="relative">
                  <Avatar className="w-9 h-9 hover:scale-105 transition-transform cursor-pointer border border-purple-300/40 shadow-xs">
                    <AvatarImage
                      src={
                        user.avatarUrl ||
                        (user.role === "mentor" || user.roleType === "MENTOR"
                          ? "/mentor-profile.png"
                          : user.role === "admin" || user.roleType === "ADMIN"
                          ? "/admin-profile.png"
                          : "/student-profile.png")
                      }
                      alt={user.name || "User Profile"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Role indicator badge on avatar */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white bg-white overflow-hidden shadow-xs">
                    <img
                      src={
                        user.role === "admin" || user.roleType === "ADMIN"
                          ? "/admin-profile.png"
                          : user.role === "mentor" || user.roleType === "MENTOR"
                          ? "/mentor-profile.png"
                          : "/student-profile.png"
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
                    : "text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                }`}
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  isWhiteTheme
                    ? "text-white/80 hover:text-white"
                    : isLightPage
                    ? "text-slate-700 hover:text-purple-700"
                    : "text-white/80 hover:text-white"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
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
            <Link href="/dashboard" title="Account Dashboard">
              <div className="relative">
                <Avatar className="w-8 h-8 border border-purple-300/40 shadow-xs">
                  <AvatarImage
                    src={
                      user.avatarUrl ||
                      (user.role === "mentor" || user.roleType === "MENTOR"
                        ? "/mentor-profile.png"
                        : user.role === "admin" || user.roleType === "ADMIN"
                        ? "/admin-profile.png"
                        : "/student-profile.png")
                    }
                    alt={user.name || "User Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-extrabold text-xs">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {/* Subtle role indicator badge on corner */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-1.5 ring-white bg-white overflow-hidden shadow-2xs">
                  <img
                    src={
                      user.role === "admin" || user.roleType === "ADMIN"
                        ? "/admin-profile.png"
                        : user.role === "mentor" || user.roleType === "MENTOR"
                        ? "/mentor-profile.png"
                        : "/student-profile.png"
                    }
                    alt="Role"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer ${
              isWhiteTheme
                ? "text-white/90 hover:text-white hover:bg-white/10"
                : "text-slate-800 hover:text-purple-700 hover:bg-slate-100"
            }`}
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
                <Avatar className="w-10 h-10 border border-purple-400/30">
                  <AvatarImage
                    src={
                      user.avatarUrl ||
                      (user.role === "mentor" || user.roleType === "MENTOR"
                        ? "/mentor-profile.png"
                        : user.role === "admin" || user.roleType === "ADMIN"
                        ? "/admin-profile.png"
                        : "/student-profile.png")
                    }
                    alt={user.name || "User Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-extrabold text-sm">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
                  <p className="text-purple-300/80 text-xs capitalize flex items-center gap-1.5 mt-0.5">
                    {user.role === "admin" || user.roleType === "ADMIN" ? (
                      <img src="/admin-profile.png" alt="Admin" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    ) : user.role === "mentor" || user.roleType === "MENTOR" ? (
                      <img src="/mentor-profile.png" alt="Mentor" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    ) : (
                      <img src="/student-profile.png" alt="Student" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    )}
                    {user.role === "admin" || user.roleType === "ADMIN"
                      ? "Admin"
                      : user.role === "mentor" || user.roleType === "MENTOR"
                      ? "Mentor"
                      : "Student"}{" "}
                    Workspace
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard"
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
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  href={to}
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
                className="w-full py-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out ({user.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 rounded-2xl bg-white/10 text-white font-bold text-xs text-center border border-white/10 hover:bg-white/15 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
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
