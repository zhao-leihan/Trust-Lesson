import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  CheckCircle,
  Globe,
  Briefcase,
  DollarSign,
  Sparkles,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { LinkedinIcon, InstagramIcon, TwitterIcon } from "../components/SocialIcons";

const domains = [
  "Frontend & Web Engineering",
  "Career & Leadership Coaching",
  "UI/UX & Product Design",
  "Product Management",
  "Cloud & DevOps Architecture",
  "Mobile App Development",
  "AI & Machine Learning",
  "Languages & Linguistics",
  "Music Production & Performance",
];

export default function RegisterPage() {
  const { login, walletAddress, connectWallet } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("student");

  // Common credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // In-depth Mentor Onboarding Fields
  const [domain, setDomain] = useState("Frontend & Web Engineering");
  const [customDomain, setCustomDomain] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("35");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in your full name, email address, and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (selectedRole === "mentor" && !linkedin && !portfolio) {
      setError("Please provide at least your LinkedIn profile or portfolio URL for credential verification.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login({
        name,
        email,
        role: selectedRole,
        domain: customDomain || domain,
        bio,
        linkedin,
        instagram,
        twitter,
        portfolio,
        hourlyRate,
      });
      setLoading(false);
      navigate("/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Image: login.png */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/login.png')",
        }}
      >
        {/* Soft atmospheric overlay: keeps fantasy floating islands visible with purple tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-slate-900/15 to-indigo-950/45" />
      </div>

      {/* Ambient purple glows */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Monster left — sitting at bottom-left */}
      <img
        src="/monsters/the monster.png"
        alt="Lesson Monster"
        className="absolute bottom-0 left-0 w-44 sm:w-64 md:w-72 h-auto object-contain pointer-events-none animate-float-slow select-none opacity-95 drop-shadow-2xl z-0"
      />
      {/* Monster right — sitting at bottom-right */}
      <img
        src="/monsters/the monster 2.png"
        alt="Lesson Monster 2"
        className="absolute bottom-0 right-0 w-40 sm:w-60 md:w-68 h-auto object-contain pointer-events-none animate-float select-none opacity-95 drop-shadow-2xl z-0"
      />

      <div className={`w-full ${selectedRole === "mentor" && step === 2 ? "max-w-2xl" : "max-w-lg"} relative z-10 transition-all duration-300 animate-fadeInUp`}>
        {/* Playful Monster Peeking */}
        <div className="flex justify-center -mb-6 relative z-20 pointer-events-none">
          <img
            src="/monsters/happy.png"
            alt="Happy Lesson Monster"
            className="w-20 sm:w-24 h-auto object-contain drop-shadow-lg animate-wiggle"
          />
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-9 pt-10 shadow-2xl border border-white/80">
          {/* Logo with logo.png */}
          <Link to="/" className="flex items-center gap-3 mb-6 group inline-flex">
            <img
              src="/logo.png"
              alt="Trust lesson Logo"
              className="w-11 h-11 rounded-2xl object-contain shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
              Trust lesson
            </span>
          </Link>

          {/* Stepper Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Step {step} of 2
              </p>
              <h1 className="text-slate-900 font-extrabold text-xl sm:text-2xl mt-0.5">
                {step === 1
                  ? "Select Your Platform Role"
                  : selectedRole === "mentor"
                  ? "Configure Your Mentor Profile"
                  : "Complete Student Registration"}
              </h1>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                1
              </span>
              <div className={`w-5 h-0.5 rounded ${step === 2 ? "bg-slate-900" : "bg-slate-200"}`} />
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                2
              </span>
            </div>
          </div>

          {step === 1 ? (
            /* STEP 1: Role Selection */
            <div className="space-y-4">
              <p className="text-slate-500 text-xs sm:text-sm">
                Choose how you plan to use Trust lesson:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                {/* Option: Student */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all relative ${
                    selectedRole === "student"
                      ? "border-emerald-500 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {selectedRole === "student" && (
                    <CheckCircle size={18} className="absolute top-4 right-4 text-emerald-600" />
                  )}
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <GraduationCap size={20} />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base">Student</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Book 1-on-1 mentorship sessions or enroll in structured gigs with 100% escrow protection.
                  </p>
                </button>

                {/* Option: Mentor */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("mentor")}
                  className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all relative ${
                    selectedRole === "mentor"
                      ? "border-indigo-600 bg-indigo-50/60 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {selectedRole === "mentor" && (
                    <CheckCircle size={18} className="absolute top-4 right-4 text-indigo-600" />
                  )}
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                    <Shield size={20} />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base">Mentor</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Offer 1-on-1 advice or host multi-week gigs, set your custom rates, and build portable reputation.
                  </p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Continue as {selectedRole === "mentor" ? "Mentor" : "Student"}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            /* STEP 2: Detail Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mb-1"
              >
                <span>Back to Role Selection</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* MENTOR-SPECIFIC DEEP PROFILE ONBOARDING */}
              {selectedRole === "mentor" && (
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 mt-2">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Briefcase size={16} />
                    <h3 className="font-bold text-xs text-slate-900">
                      Mentorship Focus & Online Presence
                    </h3>
                  </div>

                  {/* Domain Selector */}
                  <div>
                    <label className="text-slate-700 font-bold text-[11px] block mb-1.5">
                      Primary Domain of Expertise:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {domains.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDomain(d);
                            setCustomDomain("");
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            domain === d && !customDomain
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="Or specify custom domain (e.g. Prompt Engineering, Solana Security)..."
                      className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Bio / Mentoring Style */}
                  <div>
                    <label className="text-slate-700 font-bold text-[11px] block mb-1">
                      Mentorship Style & Summary:
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Pragmatic and hands-on. I review real PRs, guide architecture decisions, and conduct mock panels..."
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none resize-none"
                    />
                  </div>

                  {/* Social & Portfolio Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-700 font-bold text-[11px] flex items-center gap-1.5 mb-1">
                        <LinkedinIcon size={12} className="text-[#0A66C2]" />
                        <span>LinkedIn Profile URL:</span>
                      </label>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold text-[11px] flex items-center gap-1.5 mb-1">
                        <InstagramIcon size={12} className="text-[#E4405F]" />
                        <span>Instagram Handle:</span>
                      </label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@username"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold text-[11px] flex items-center gap-1.5 mb-1">
                        <TwitterIcon size={12} className="text-[#1DA1F2]" />
                        <span>X / Twitter Handle:</span>
                      </label>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="@handle"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold text-[11px] flex items-center gap-1.5 mb-1">
                        <Globe size={12} className="text-emerald-600" />
                        <span>Portfolio or GitHub URL:</span>
                      </label>
                      <input
                        type="url"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="https://github.com/yourname"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-slate-900 font-bold text-xs">Default Hourly Rate ($USD)</p>
                      <p className="text-slate-400 text-[10px]">Editable at any time in your dashboard</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg">
                      <span className="text-slate-500 font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-12 bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none"
                      />
                      <span className="text-slate-400 text-[11px]">/hr</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Web3 Escrow Wallet Connection (After Role Selected) */}
              <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 font-bold text-xs">Web3 Escrow Wallet</p>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.2 rounded-full">
                        Optional
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 leading-tight">
                      Link your wallet for smart escrow payouts on Arbitrum. Can also be connected later in your dashboard.
                    </p>
                  </div>
                </div>

                {walletAddress ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 font-mono text-xs font-bold shrink-0 self-end sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-sm self-end sm:self-auto cursor-pointer"
                  >
                    <Wallet size={13} />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>

              {error && (
                <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {loading
                  ? "Setting Up Account..."
                  : selectedRole === "mentor"
                  ? "Launch Mentor Profile"
                  : "Complete Student Account"}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-xs mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
