"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { Eye, EyeOff, Shield, GraduationCap, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "student",
      label: "Student",
      desc: "Book sessions & build skills",
      Icon: GraduationCap,
      color: "border-emerald-500 bg-emerald-50 text-emerald-950",
      testEmail: "student@trustlesson.com",
      testPass: "StudentPassword123!",
    },
    {
      id: "mentor",
      label: "Mentor",
      desc: "Offer 1-on-1 sessions & gigs",
      Icon: Shield,
      color: "border-indigo-600 bg-indigo-50 text-indigo-950",
      testEmail: "mentor@trustlesson.com",
      testPass: "MentorPassword123!",
    },
    {
      id: "admin",
      label: "Admin",
      desc: "Platform & dispute manager",
      Icon: KeyRound,
      color: "border-purple-600 bg-purple-50 text-purple-950",
      testEmail: "admin@trustlesson.com",
      testPass: "AdminPassword123!",
    },
  ];

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const fillCredentials = (roleId, email, pass) => {
    setForm({ email, password: pass, role: roleId });
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
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      if (data.token) {
        localStorage.setItem("tl_jwt", data.token);
      }

      login(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image: login.png */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login.png')" }}
      >
        {/* Soft atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-slate-900/15 to-indigo-950/45" />
      </div>

      {/* Ambient purple glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Monster left — the monster.png */}
      <img
        src="/monsters/the monster.png"
        alt="Lesson Monster"
        className="absolute bottom-0 left-0 w-44 sm:w-64 md:w-72 h-auto object-contain pointer-events-none animate-float-slow select-none opacity-95 drop-shadow-2xl z-0"
      />

      {/* Monster right — the monster 2.png */}
      <img
        src="/monsters/the monster 2.png"
        alt="Lesson Monster 2"
        className="absolute bottom-0 right-0 w-40 sm:w-60 md:w-68 h-auto object-contain pointer-events-none animate-float select-none opacity-95 drop-shadow-2xl z-0"
      />

      {/* Card */}
      <div className="w-full max-w-lg relative z-10 animate-fadeInUp">
        {/* Monster peeking from top */}
        <div className="flex justify-center -mb-6 relative z-20 pointer-events-none">
          <img
            src="/monsters/hello.png"
            alt="Hello Lesson Monster"
            className="w-20 sm:w-24 h-auto object-contain drop-shadow-lg animate-wiggle"
          />
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-9 pt-10 shadow-2xl border border-white/80">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
            <img
              src="/logo.png"
              alt="Trust Lesson Logo"
              className="w-11 h-11 rounded-2xl object-contain shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
              Trust Lesson
            </span>
          </Link>

          <h1 className="text-slate-900 font-extrabold text-2xl mb-1">Welcome Back</h1>
          <p className="text-slate-500 text-xs sm:text-sm mb-5">
            Sign in to your account with your email and password.
          </p>

          {/* Quick test credentials selector */}
          <div className="mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-700 block mb-2">
              Select Role / Quick Fill Credentials:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {roles.map(({ id, label, Icon, color, testEmail, testPass }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => fillCredentials(id, testEmail, testPass)}
                  className={`flex flex-col items-center text-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    form.role === id
                      ? `${color} font-bold shadow-xs scale-[1.02]`
                      : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Icon size={16} className="mb-1" />
                  <span className="text-xs font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-900 font-bold text-xs block mb-1" htmlFor="email">
                Email Address
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
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-900 font-bold text-xs" htmlFor="password">
                  Password
                </label>
                <span className="text-[11px] text-purple-600 cursor-pointer hover:underline">
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
                  className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
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

            {error && (
              <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium animate-fadeIn">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-xs mt-6">
            Do not have an account yet?{" "}
            <Link href="/register" className="text-purple-600 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
