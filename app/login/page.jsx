"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login, user, authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Restore remembered credentials preference
  useEffect(() => {
    try {
      const savedRemember = localStorage.getItem("trust_lesson_remember");
      const savedEmail = localStorage.getItem("trust_lesson_remember_email");
      if (savedRemember !== null) {
        setRememberMe(savedRemember === "true");
      }
      if (savedEmail) {
        setForm((f) => ({ ...f, email: savedEmail }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      if (data.token) {
        localStorage.setItem("tl_jwt", data.token);
      }

      if (rememberMe) {
        localStorage.setItem("trust_lesson_remember", "true");
        localStorage.setItem("trust_lesson_remember_email", form.email);
      } else {
        localStorage.removeItem("trust_lesson_remember");
        localStorage.removeItem("trust_lesson_remember_email");
      }

      login(data.user, rememberMe);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative bg-slate-950 overflow-x-hidden">
      {/* ─── Mobile Background Backdrop (Only visible on < lg screens) ───── */}
      <div
        className="lg:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login.webp')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-950/20 to-indigo-950/50" />
      </div>

      <img
        src="/monsters/the monster.webp"
        alt="Lesson Monster"
        className="lg:hidden absolute bottom-0 left-0 w-36 sm:w-48 h-auto object-contain pointer-events-none animate-float-slow opacity-80 z-0"
      />
      <img
        src="/monsters/the monster 2.webp"
        alt="Lesson Monster 2"
        className="lg:hidden absolute bottom-0 right-0 w-32 sm:w-44 h-auto object-contain pointer-events-none animate-float opacity-80 z-0"
      />

      {/* ─── LEFT COLUMN: FULLY SIZED FORM ON PC ───────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-[48%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative z-10 bg-white/95 lg:bg-white backdrop-blur-xl lg:backdrop-blur-none shadow-2xl overflow-y-auto">
        <div className="max-w-xl w-full mx-auto my-auto py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8 group inline-flex">
            <img
              src="/logo.webp"
              alt="Trust Lesson Logo"
              width={44}
              height={44}
              className="w-11 h-11 rounded-2xl object-contain shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
              Trust Lesson
            </span>
          </Link>

          {user ? (
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 size={34} />
              </div>
              <h1 className="text-slate-900 font-extrabold text-2xl mb-1">Session Active</h1>
              <p className="text-slate-500 text-xs sm:text-sm mb-5">
                Welcome back, <span className="font-bold text-purple-700">{user.name || user.email}</span>! You are already signed in.
              </p>

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-purple-600 mb-6 bg-purple-50 py-2.5 px-4 rounded-xl border border-purple-100">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to your dashboard...</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Account Sign In
                </p>
                <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Enter your email address and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-900 font-bold text-xs" htmlFor="password">
                      Password *
                    </label>
                    <span className="text-[11px] text-indigo-600 cursor-pointer hover:underline font-medium">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer accent-indigo-600"
                    />
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                      Remember me on this device
                    </span>
                  </label>
                </div>

                {error && (
                  <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium animate-fadeIn">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    "Signing In..."
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-slate-500 text-xs mt-8">
                Do not have an account yet?{" "}
                <Link href="/register" className="text-indigo-600 font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: GRAPHICS & ARTWORK SHOWCASE (PC / DESKTOP ONLY) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] sticky top-0 h-screen flex-col justify-between p-10 xl:p-14 relative overflow-hidden bg-slate-950 text-white select-none border-l border-white/10">
        {/* Background Fantasy Island Image with Gradient */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/login.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/85 via-purple-950/80 to-slate-950/90" />
        </div>

        {/* Glowing atmospheric orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Center Visual Art & Platform Narrative (No Container Box) */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-lg mx-auto py-6">
          <div className="mb-6 flex justify-center">
            <img
              src="/monsters/Register.webp"
              alt="Trust Lesson Mascot"
              className="w-64 sm:w-72 xl:w-80 h-auto object-contain animate-float drop-shadow-2xl select-none"
            />
          </div>

          <h2 className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-tight">
            Decentralized P2P Learning Protocol
          </h2>

          <p className="text-purple-200/80 text-xs xl:text-sm mt-3 leading-relaxed">
            Bridging real-world mentorship with Web3 smart escrow, non-custodial payouts, and verifiable Soulbound SBT credentials on Arbitrum.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-left">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <p className="text-emerald-400 font-extrabold text-xs">EscrowRouter</p>
            <p className="text-white/60 text-[10px] mt-0.5 leading-snug">
              Locks deposit until you confirm completion
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <p className="text-purple-400 font-extrabold text-xs">Soulbound SBT</p>
            <p className="text-white/60 text-[10px] mt-0.5 leading-snug">
              Permanent non-transferable certificate credentials
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <p className="text-amber-400 font-extrabold text-xs">Mentor Staking</p>
            <p className="text-white/60 text-[10px] mt-0.5 leading-snug">
              100 USDC commitment & slashing protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
