"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useGoogleAuth } from "@/src/hooks/useGoogleAuth";
import {
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  CheckCircle2,
  Globe,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Lock,
  Sparkles,
  Plus,
  Trash2,
  Video,
  Award,
  AlertCircle,
  Calendar,
  Building,
  Clock,
  Coins,
  Check,
  ExternalLink,
  BookOpen,
  Code,
  Languages,
  Music,
  Palette,
  TrendingUp,
  FileCheck,
  X,
  Mail,
} from "lucide-react";
import { LinkedinIcon, TwitterIcon, GoogleIcon } from "@/src/components/SocialIcons";

// ─── Constant Lists ─────────────────────────────────────────────────────────
const COUNTRIES = [
  "Indonesia",
  "United States",
  "Singapore",
  "United Kingdom",
  "Germany",
  "Australia",
  "Canada",
  "Japan",
  "India",
  "Netherlands",
  "France",
  "South Korea",
  "Malaysia",
  "Vietnam",
  "Philippines",
  "Brazil",
  "United Arab Emirates",
  "Other",
];

const SKILL_CATEGORIES = [
  {
    id: "coding",
    name: "Coding & Tech",
    icon: Code,
    desc: "Smart Contracts, Web3, Fullstack, AI, Mobile",
    popularTags: ["Solidity", "React", "Next.js", "Python", "Rust", "TypeScript"],
  },
  {
    id: "languages",
    name: "Languages",
    icon: Languages,
    desc: "English, Japanese, IELTS, Mandarin, Spanish",
    popularTags: ["IELTS Prep", "Conversational English", "Japanese N2", "Mandarin HSK"],
  },
  {
    id: "career",
    name: "Career & Leadership",
    icon: Briefcase,
    desc: "Tech Interviews, Resume Review, Management",
    popularTags: ["FAANG Prep", "System Design", "Product Strategy", "Leadership"],
  },
  {
    id: "design",
    name: "Design & Creative",
    icon: Palette,
    desc: "UI/UX, Product Design, Figma, 3D Modeling",
    popularTags: ["Figma", "Design Systems", "User Research", "3D Blender"],
  },
  {
    id: "business",
    name: "Business & Finance",
    icon: TrendingUp,
    desc: "Startups, Tokenomics, Valuation, Venture Capital",
    popularTags: ["Tokenomics", "Startup Pitching", "Financial Modeling", "Crypto Valuation"],
  },
  {
    id: "music",
    name: "Music & Audio",
    icon: Music,
    desc: "Music Production, Mixing, Mastering, Instruments",
    popularTags: ["Ableton Live", "Mixing & Mastering", "Guitar", "Audio Engineering"],
  },
];

const LANGUAGE_OPTIONS = [
  "English",
  "Indonesian",
  "Spanish",
  "Mandarin Chinese",
  "Japanese",
  "German",
  "French",
  "Korean",
  "Arabic",
  "Portuguese",
];

export default function RegisterPage() {
  const { login, walletAddress, connectWallet, user, authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard?tab=profile");
    }
  }, [user, authLoading, router]);

  // Official Google Authentication
  const { signInWithGoogle, googleLoading, googleError } = useGoogleAuth();

  // ─── Flow State ─────────────────────────────────────────────────────────────
  // 0: Role Selection, 1+: Steps for Student or Mentor
  const [selectedRole, setSelectedRole] = useState(null); // 'student' | 'mentor'
  const [step, setStep] = useState(0);

  // ─── Shared Step 1: Personal Details & Early Email Capture ──────────────────
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [domicileCountry, setDomicileCountry] = useState("Indonesia");
  const [ageError, setAgeError] = useState("");

  // ─── Student State ──────────────────────────────────────────────────────────
  // Step 2: Education History (max 5)
  const [educationList, setEducationList] = useState([
    { degree: "Bachelor's Degree", institution: "", major: "", startYear: "2021", endYear: "2025" },
  ]);

  // Step 4: Current Education
  const [isNotActiveStudent, setIsNotActiveStudent] = useState(false);
  const [currentCampus, setCurrentCampus] = useState("");
  const [currentMajor, setCurrentMajor] = useState("");
  const [gradYear, setGradYear] = useState("2026");

  // Step 5: Learning Interests
  const [selectedInterests, setSelectedInterests] = useState(["coding"]);
  const [customTags, setCustomTags] = useState(["Solidity", "Next.js"]);
  const [newTagInput, setNewTagInput] = useState("");

  // ─── Mentor State ───────────────────────────────────────────────────────────
  // Step 2: Categories, Skills, Languages
  const [mentorCategories, setMentorCategories] = useState(["coding"]);
  const [mentorSkillTags, setMentorSkillTags] = useState(["React", "Solidity", "Arbitrum Escrow"]);
  const [newSkillTagInput, setNewSkillTagInput] = useState("");
  const [mentorLanguages, setMentorLanguages] = useState(["English", "Indonesian"]);

  // Step 3: Portfolio & Credentials
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [personalWebsite, setPersonalWebsite] = useState("");
  const [certificationsText, setCertificationsText] = useState("");
  const [videoIntroUrl, setVideoIntroUrl] = useState("");

  // Step 4: Identity Verification
  const [verificationType, setVerificationType] = useState("linkedin"); // 'linkedin' | 'work_email' | 'id_badge'
  const [workEmail, setWorkEmail] = useState("");
  const [idFileUploaded, setIdFileUploaded] = useState(false);

  // Step 5: Rates & Availability
  const [hourlyRate, setHourlyRate] = useState("45");
  const [sessionDuration, setSessionDuration] = useState("60");
  const [availableDays, setAvailableDays] = useState(["Mon", "Wed", "Fri", "Sat"]);
  const [preferredTime, setPreferredTime] = useState("Evening (18:00 - 22:00)");

  // Step 6: Mentor Staking (MentorStaking.sol)
  const [stakeChoice, setStakeChoice] = useState("stake"); // 'stake' | 'skip'
  const [isStakingProcessing, setIsStakingProcessing] = useState(false);
  const [hasStakedSuccess, setHasStakedSuccess] = useState(false);

  // ─── Security & Final Step State ────────────────────────────────────────────
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // ─── Execution State ────────────────────────────────────────────────────────
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Validation Helpers ─────────────────────────────────────────────────────
  const calculateAge = (dateString) => {
    if (!dateString) return 0;
    const today = new Date();
    const birth = new Date(dateString);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateAge = (dateString) => {
    const age = calculateAge(dateString);
    if (age < 18) {
      setAgeError("You must be at least 18 years old to access escrow-backed learning services.");
      return false;
    }
    setAgeError("");
    return true;
  };

  // Add / Remove Education Item
  const handleAddEducation = () => {
    if (educationList.length >= 5) return;
    setEducationList([
      ...educationList,
      { degree: "Bachelor's Degree", institution: "", major: "", startYear: "2020", endYear: "2024" },
    ]);
  };

  const handleRemoveEducation = (index) => {
    if (educationList.length === 1) return;
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  // Tag helper
  const handleAddTag = (tag, list, setList) => {
    const clean = tag.trim();
    if (clean && !list.includes(clean)) {
      setList([...list, clean]);
    }
  };

  const handleRemoveTag = (tagToRemove, list, setList) => {
    setList(list.filter((t) => t !== tagToRemove));
  };

  // Staking simulation handler
  const handleSimulateStake = () => {
    setIsStakingProcessing(true);
    setTimeout(() => {
      setIsStakingProcessing(false);
      setHasStakedSuccess(true);
    }, 1200);
  };

  // ─── Submit Registration ────────────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      setError("Please accept the Terms of Service & Privacy Policy to proceed.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const isMentor = selectedRole === "mentor";
      const hasStaked = isMentor && stakeChoice === "stake" && hasStakedSuccess;

      const payload = {
        name: fullName,
        email,
        password,
        role: isMentor ? "MENTOR" : "LEARNER",
        birthDate,
        domicileCountry,
        walletAddress: walletAddress || null,
        // Student specific
        university: isMentor ? null : isNotActiveStudent ? "Non-Student / Professional" : currentCampus,
        educationHistory: isMentor ? null : educationList,
        learningInterests: isMentor ? null : { categories: selectedInterests, tags: customTags },
        // Mentor specific
        domain: isMentor ? mentorCategories.join(", ") : null,
        bio: isMentor ? `Mentoring in ${mentorCategories.join(", ")}. Languages: ${mentorLanguages.join(", ")}` : null,
        hourlyRate: isMentor ? Number(hourlyRate) || 45 : 0,
        linkedin: isMentor ? linkedinUrl : null,
        portfolio: isMentor ? portfolioUrl : null,
        skills: isMentor ? mentorSkillTags : null,
        languages: isMentor ? mentorLanguages : null,
        videoIntroUrl: isMentor ? videoIntroUrl : null,
        verificationType: isMentor ? verificationType : null,
        availability: isMentor ? { days: availableDays, duration: sessionDuration, time: preferredTime } : null,
        stakeAmount: hasStaked ? 100 : 0,
        isVerified: hasStaked,
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed. Please check your information.");
      }

      if (data.token) {
        localStorage.setItem("tl_jwt", data.token);
      }

      localStorage.setItem("trust_lesson_remember", "true");
      localStorage.setItem("trust_lesson_remember_email", email);

      login(data.user, true);
      router.push("/dashboard?tab=profile");
    } catch (err) {
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // Total steps computation
  const totalSteps = selectedRole === "mentor" ? 7 : 6;

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
          <Link href="/" className="flex items-center gap-3 mb-6 group inline-flex">
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

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEP 0: ROLE SELECTION                                          */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Welcome to Trust Lesson
                </p>
                <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl mt-0.5 tracking-tight">
                  Choose Your Account Type
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Select how you want to participate in our decentralized mentorship ecosystem.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Student Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all relative cursor-pointer ${
                    selectedRole === "student"
                      ? "border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {selectedRole === "student" && (
                    <CheckCircle2 size={20} className="absolute top-4 right-4 text-purple-600" />
                  )}
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 shadow-xs">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-slate-900 font-extrabold text-lg">Student / Learner</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Learn high-impact skills 1-on-1 with mentors. Your funds stay safe in escrow until lessons are delivered.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-purple-700">
                    <Sparkles size={13} />
                    <span>Soulbound NFT Credentials</span>
                  </div>
                </button>

                {/* Mentor Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("mentor")}
                  className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all relative cursor-pointer ${
                    selectedRole === "mentor"
                      ? "border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {selectedRole === "mentor" && (
                    <CheckCircle2 size={20} className="absolute top-4 right-4 text-indigo-600" />
                  )}
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 shadow-xs">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-slate-900 font-extrabold text-lg">Verified Mentor</h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Monetize your expertise. Receive 100% of your listed price in USDC, backed by on-chain stake reputation.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-bold text-indigo-700">
                    <Coins size={13} />
                    <span>100% Guaranteed Payout</span>
                  </div>
                </button>
              </div>

              <button
                type="button"
                disabled={!selectedRole}
                onClick={() => setStep(1)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue as {selectedRole === "mentor" ? "Mentor" : selectedRole === "student" ? "Student" : "Selected Role"}</span>
                <ArrowRight size={16} />
              </button>

              {/* Google Sign-In Quick Action */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
                    or instant access with google
                  </span>
                </div>

                <button
                  type="button"
                  onClick={signInWithGoogle}
                  disabled={googleLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
                >
                  <GoogleIcon size={18} />
                  <span>{googleLoading ? "Connecting with Google..." : "Continue with Google"}</span>
                </button>

                {googleError && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold leading-relaxed">
                    {googleError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STEPPER HEADER (When inside steps)                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {step > 0 && (
            <div className="mb-6 pb-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer transition-colors w-fit"
                >
                  <ArrowLeft size={14} />
                  <span>{step === 1 ? "Back to Role Selection" : "Previous Step"}</span>
                </button>

                {/* Numbered Stepper Circles connected by lines (Original Style) */}
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
                  {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s, idx) => {
                    const isActive = s === step;
                    const isCompleted = s < step;
                    return (
                      <div key={s} className="flex items-center">
                        <button
                          type="button"
                          disabled={s > step}
                          onClick={() => {
                            if (s < step) setStep(s);
                          }}
                          title={`Go to Step ${s}`}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isActive
                              ? "bg-slate-900 text-white ring-4 ring-slate-200 shadow-sm scale-105"
                              : isCompleted
                              ? "bg-purple-600 text-white cursor-pointer hover:bg-purple-700 hover:scale-105"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          }`}
                        >
                          {s}
                        </button>
                        {idx < totalSteps - 1 && (
                          <div
                            className={`w-2.5 sm:w-4 h-0.5 mx-0.5 rounded transition-colors ${
                              s < step ? "bg-purple-500" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                  Step {step} of {totalSteps}
                </p>
                <h2 className="text-slate-900 font-extrabold text-xl sm:text-2xl mt-0.5 tracking-tight">
                  {selectedRole === "student" ? (
                    step === 1 ? "Personal Profile & Age Verification" :
                    step === 2 ? "Education History" :
                    step === 3 ? "Country of Residence" :
                    step === 4 ? "Current Educational Institution" :
                    step === 5 ? "Learning Interests & Desired Skills" :
                    "Account Security & Terms"
                  ) : (
                    step === 1 ? "Mentor Personal Details & Age Verification" :
                    step === 2 ? "Expertise Categories, Skills & Languages" :
                    step === 3 ? "Portfolio, Credentials & Video Intro" :
                    step === 4 ? "Identity Verification" :
                    step === 5 ? "Rates & Weekly Availability" :
                    step === 6 ? "Stake to Become a Verified Mentor" :
                    "Account Password & Terms"
                  )}
                </h2>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* STUDENT STEPS                                                   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {selectedRole === "student" && step === 1 && (
            /* Student Step 1: Personal Details, DOB (18+), Email */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-950">
                <Sparkles size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Early Email Capture:</strong> Your verification code is dispatched in the background while you complete your profile.
                </p>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">
                  Date of Birth (Must be 18+ years old) *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      validateAge(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  />
                  <Calendar size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {ageError ? (
                  <p className="text-rose-600 text-[11px] font-semibold flex items-center gap-1 mt-1.5">
                    <AlertCircle size={12} />
                    <span>{ageError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Escrow protocols handle financial assets directly. Users must be 18 or older to hold smart contract escrow contracts.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={!fullName || !email || !birthDate || Boolean(ageError)}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Education History</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "student" && step === 2 && (
            /* Student Step 2: Education History (max 5) */
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Provide your academic background (up to 5 institutions, high school, university, or bootcamps).
              </p>

              <div className="space-y-3">
                {educationList.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        Education #{idx + 1}
                      </span>
                      {educationList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Degree / Level</label>
                        <select
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(idx, "degree", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                        >
                          <option>High School Diploma</option>
                          <option>Associate Degree</option>
                          <option>Bachelor's Degree</option>
                          <option>Master's Degree</option>
                          <option>Doctorate (Ph.D.)</option>
                          <option>Coding Bootcamp / Intensive</option>
                          <option>Self-Taught / Independent</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Institution Name</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(idx, "institution", e.target.value)}
                          placeholder="e.g. University of California, Berkeley"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Major / Field</label>
                        <input
                          type="text"
                          value={edu.major}
                          onChange={(e) => handleUpdateEducation(idx, "major", e.target.value)}
                          placeholder="e.g. Computer Science, Economics"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Start Year</label>
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => handleUpdateEducation(idx, "startYear", e.target.value)}
                            placeholder="2020"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">End / Expected</label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => handleUpdateEducation(idx, "endYear", e.target.value)}
                            placeholder="2024"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {educationList.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Another Institution ({educationList.length}/5)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Country of Residence</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "student" && step === 3 && (
            /* Student Step 3: Country of Residence */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Globe size={18} />
                  <h3 className="font-extrabold text-sm text-slate-900">Country of Domicile</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Used for automated timezone alignment when scheduling mentorship sessions, as well as localized fiat pricing.
                </p>

                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1.5">Select Country *</label>
                  <select
                    value={domicileCountry}
                    onChange={(e) => setDomicileCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Current Institution</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "student" && step === 4 && (
            /* Student Step 4: Current Educational Institution (Optional for working pros) */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Building size={18} />
                    <h3 className="font-extrabold text-sm text-slate-900">Current Educational Status</h3>
                  </div>
                </div>

                {/* Non-student checkbox */}
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNotActiveStudent}
                    onChange={(e) => setIsNotActiveStudent(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      I am not currently an active student
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Check this if you are a fresh graduate, working professional, or career switcher.
                    </span>
                  </div>
                </label>

                {!isNotActiveStudent && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-slate-900 font-bold text-xs block mb-1">
                        Current Campus / School Name
                      </label>
                      <input
                        type="text"
                        value={currentCampus}
                        onChange={(e) => setCurrentCampus(e.target.value)}
                        placeholder="e.g. University of Indonesia, ITB, Stanford..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-900 font-bold text-xs block mb-1">
                          Current Major / Department
                        </label>
                        <input
                          type="text"
                          value={currentMajor}
                          onChange={(e) => setCurrentMajor(e.target.value)}
                          placeholder="e.g. Informatics, Business"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                      <div>
                        <label className="text-slate-900 font-bold text-xs block mb-1">
                          Expected Graduation Year
                        </label>
                        <input
                          type="text"
                          value={gradYear}
                          onChange={(e) => setGradYear(e.target.value)}
                          placeholder="2026"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Learning Interests</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "student" && step === 5 && (
            /* Student Step 5: Learning Interests & Skills (Vital for Dashboard Recommendation!) */
            <div className="space-y-4">
              <div className="bg-purple-50/70 border border-purple-200/80 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-purple-950">
                <Sparkles size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Personalized Mentor Curation:</strong> These categories power your personalized mentor feed and recommendations upon opening your dashboard.
                </p>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-2">
                  Select Topics of Interest (Pick 1 or more) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SKILL_CATEGORIES.map((cat) => {
                    const isSelected = selectedInterests.includes(cat.id);
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedInterests.length > 1) {
                              setSelectedInterests(selectedInterests.filter((id) => id !== cat.id));
                            }
                          } else {
                            setSelectedInterests([...selectedInterests, cat.id]);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-purple-600 bg-purple-50/80 shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                          <IconComp size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{cat.name}</p>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1.5">
                  Specific Skills You Want to Learn (Tags):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {customTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag, customTags, setCustomTags)}
                        className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newTagInput, customTags, setCustomTags);
                        setNewTagInput("");
                      }
                    }}
                    placeholder="Type skill & press enter (e.g. Solidity, IELTS, Figma)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddTag(newTagInput, customTags, setCustomTags);
                      setNewTagInput("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Security & Password</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "student" && step === 6 && (
            /* Student Step 6: Security, Password & TOS */
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="bg-purple-50/70 border border-purple-200/80 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-purple-950">
                <FileCheck size={16} className="text-purple-600 shrink-0" />
                <p>
                  A confirmation dispatch has been prepared for <strong>{email}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Set Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Confirm Password *</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Web3 Wallet Connection Optional */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Wallet size={14} className="text-purple-600" />
                    <span>Link Web3 Escrow Wallet (Optional)</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    For direct USDC milestone deposits on Arbitrum. Can also be connected later in your dashboard.
                  </p>
                </div>
                {walletAddress ? (
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono text-[11px] font-bold border border-purple-200">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Terms Checkbox (Mandatory) */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/about" target="_blank" className="text-indigo-600 font-bold hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/about" target="_blank" className="text-indigo-600 font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand that escrow milestones are settled on the Arbitrum network.
                </span>
              </label>

              {error && (
                <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creating Student Workspace..." : "Complete Registration & Launch Dashboard"}
              </button>
            </form>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MENTOR STEPS                                                    */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {selectedRole === "mentor" && step === 1 && (
            /* Mentor Step 1: Personal Details, DOB (18+), Email, Country */
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-950">
                <Shield size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Verified Mentor Onboarding:</strong> Mentors manage escrow settlements and client trust. We capture email and country of domicile early for verification.
                </p>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rayhan Young"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mentor@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Date of Birth (18+) *</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      validateAge(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  />
                  {ageError && <p className="text-rose-600 text-[10px] font-semibold mt-1">{ageError}</p>}
                </div>

                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Country of Domicile *</label>
                  <select
                    value={domicileCountry}
                    onChange={(e) => setDomicileCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={!fullName || !email || !birthDate || Boolean(ageError)}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                <span>Continue to Expertise & Skills</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "mentor" && step === 2 && (
            /* Mentor Step 2: Expertise Categories, Specific Skills, Languages */
            <div className="space-y-4">
              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1">
                  Primary Expertise Categories (Choose 1 to 3) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SKILL_CATEGORIES.map((cat) => {
                    const isSelected = mentorCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (mentorCategories.length > 1) {
                              setMentorCategories(mentorCategories.filter((id) => id !== cat.id));
                            }
                          } else {
                            if (mentorCategories.length < 3) {
                              setMentorCategories([...mentorCategories, cat.id]);
                            }
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold"
                            : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        <span className="text-xs">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1.5">
                  Specific Skill Tags (Powers Explore Search) *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {mentorSkillTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag, mentorSkillTags, setMentorSkillTags)}
                        className="text-purple-400 hover:text-purple-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillTagInput}
                    onChange={(e) => setNewSkillTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag(newSkillTagInput, mentorSkillTags, setMentorSkillTags);
                        setNewSkillTagInput("");
                      }
                    }}
                    placeholder="e.g. React, Smart Contracts, IELTS, System Design..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddTag(newSkillTagInput, mentorSkillTags, setMentorSkillTags);
                      setNewSkillTagInput("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-900 font-bold text-xs block mb-1.5">
                  Languages Spoken during Mentoring Sessions *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const isSelected = mentorLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (mentorLanguages.length > 1) {
                              setMentorLanguages(mentorLanguages.filter((l) => l !== lang));
                            }
                          } else {
                            setMentorLanguages([...mentorLanguages, lang]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Portfolio & Video Intro</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "mentor" && step === 3 && (
            /* Mentor Step 3: Portfolio, Credentials & Intro Video */
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-slate-900 font-bold text-xs flex items-center gap-1.5 mb-1">
                    <LinkedinIcon size={13} className="text-[#0A66C2]" />
                    <span>LinkedIn Profile URL *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-900 font-bold text-xs block mb-1">GitHub or Portfolio URL</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://github.com/yourhandle"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-slate-900 font-bold text-xs block mb-1">Personal Website</label>
                    <input
                      type="url"
                      value={personalWebsite}
                      onChange={(e) => setPersonalWebsite(e.target.value)}
                      placeholder="https://yourname.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">
                    Relevant Certifications & Career Highlights
                  </label>
                  <textarea
                    rows={2}
                    value={certificationsText}
                    onChange={(e) => setCertificationsText(e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect, Ex-Googler, Certified Scrum Master..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                  />
                </div>

                {/* Short Video Intro */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Video size={16} />
                    <span className="font-extrabold text-xs text-slate-900">
                      Short Video Introduction (30–60 Seconds)
                    </span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-auto">
                      High Trust
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Mentors with video greetings receive up to <strong>3x more bookings</strong>. Provide a link to your Loom, YouTube, or Drive video:
                  </p>
                  <input
                    type="url"
                    value={videoIntroUrl}
                    onChange={(e) => setVideoIntroUrl(e.target.value)}
                    placeholder="https://loom.com/share/... or https://youtube.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Identity Verification</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "mentor" && step === 4 && (
            /* Mentor Step 4: Lightweight Identity Verification (No Heavy KYC Drop-off) */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700">
                  <Shield size={18} />
                  <h3 className="font-extrabold text-sm text-slate-900">Tiered Identity Verification</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We use lightweight verification for MVP onboarding. Choose your preferred verification method to begin offering mentorship:
                </p>

                <div className="space-y-2.5 pt-1">
                  {/* Option 1: LinkedIn Verification */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${verificationType === "linkedin" ? "border-indigo-600 bg-indigo-50/70" : "border-slate-200 bg-white"}`}>
                    <input
                      type="radio"
                      name="verificationType"
                      value="linkedin"
                      checked={verificationType === "linkedin"}
                      onChange={() => setVerificationType("linkedin")}
                      className="mt-1 text-indigo-600"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <LinkedinIcon size={12} className="text-[#0A66C2]" />
                        <span>Public LinkedIn Verification (Standard)</span>
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Matches your declared experience against your public professional profile.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Work Email */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${verificationType === "work_email" ? "border-indigo-600 bg-indigo-50/70" : "border-slate-200 bg-white"}`}>
                    <input
                      type="radio"
                      name="verificationType"
                      value="work_email"
                      checked={verificationType === "work_email"}
                      onChange={() => setVerificationType("work_email")}
                      className="mt-1 text-indigo-600"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900">Corporate / Work Domain Email</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Verify using an active company address (e.g. name@microsoft.com, name@stripe.com).
                      </p>
                      {verificationType === "work_email" && (
                        <input
                          type="email"
                          value={workEmail}
                          onChange={(e) => setWorkEmail(e.target.value)}
                          placeholder="yourname@company.com"
                          className="w-full mt-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none"
                        />
                      )}
                    </div>
                  </label>

                  {/* Option 3: Optional ID Badge */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${verificationType === "id_badge" ? "border-indigo-600 bg-indigo-50/70" : "border-slate-200 bg-white"}`}>
                    <input
                      type="radio"
                      name="verificationType"
                      value="id_badge"
                      checked={verificationType === "id_badge"}
                      onChange={() => setVerificationType("id_badge")}
                      className="mt-1 text-indigo-600"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Government ID + Selfie Upload</span>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.2 rounded-full">Optional Top-Tier Badge</span>
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Unlocks the prestigious "ID Verified" checkmark for enterprise and high-rate consulting.
                      </p>
                      {verificationType === "id_badge" && (
                        <div className="mt-2.5 p-3 border border-dashed border-purple-300 rounded-lg text-center bg-purple-50/40">
                          <input
                            type="file"
                            onChange={() => setIdFileUploaded(true)}
                            className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                          />
                          {idFileUploaded && <p className="text-emerald-600 font-bold text-[10px] mt-1">✓ ID Document Attached</p>}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Rates & Availability</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "mentor" && step === 5 && (
            /* Mentor Step 5: Rates & Availability */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Coins size={18} />
                    <h3 className="font-extrabold text-sm text-slate-900">Pricing & Session Configuration</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    100% Payout to You
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-900 font-bold text-xs block mb-1">
                      Base Hourly Rate ($USDC) *
                    </label>
                    <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-bold text-xs">$</span>
                      <input
                        type="number"
                        min="15"
                        max="500"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full bg-transparent text-slate-900 font-extrabold text-xs focus:outline-none"
                      />
                      <span className="text-slate-400 text-xs">USDC</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Platform protocol cut (10%) is paid by student on top.</p>
                  </div>

                  <div>
                    <label className="text-slate-900 font-bold text-xs block mb-1">
                      Standard Session Duration
                    </label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                    >
                      <option value="30">30 Minutes (Quick Advisory)</option>
                      <option value="45">45 Minutes (Standard Review)</option>
                      <option value="60">60 Minutes (In-depth 1-on-1)</option>
                      <option value="90">90 Minutes (Deep Architecture)</option>
                    </select>
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1.5">
                    Weekly Available Days *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isSelected = availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (availableDays.length > 1) {
                                setAvailableDays(availableDays.filter((d) => d !== day));
                              }
                            } else {
                              setAvailableDays([...availableDays, day]);
                            }
                          }}
                          className={`w-10 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Time Window */}
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">
                    Preferred Time Window
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none"
                  >
                    <option>Morning (08:00 - 12:00 Local)</option>
                    <option>Afternoon (13:00 - 17:00 Local)</option>
                    <option>Evening (18:00 - 22:00 Local)</option>
                    <option>Flexible / Open Schedule</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Mentor Staking (Smart Contract)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "mentor" && step === 6 && (
            /* Mentor Step 6: ⚠️ Stake to Become Verified Mentor (MentorStaking.sol Connection) */
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg border border-purple-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Shield size={20} />
                    <span className="font-extrabold text-sm uppercase tracking-wide">
                      Arbitrum L2 Protocol Staking
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                    MentorStaking.sol
                  </span>
                </div>

                <h3 className="font-black text-lg text-white">
                  Stake 100 USDC to Earn Verified Mentor Status
                </h3>
                <p className="text-xs text-purple-200 leading-relaxed">
                  To protect learners from sybil fraud, verified mentors stake <strong>100 USDC</strong> in our non-custodial smart contract. Your capital remains yours and can be unstaked anytime (7-day security cooldown), but can be slashed by the protocol arbiter if you commit fraud or lose a valid dispute.
                </p>

                {/* Staking Selection Options */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStakeChoice("stake")}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      stakeChoice === "stake"
                        ? "bg-white/15 border-amber-400 text-white"
                        : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs flex items-center gap-2">
                        <span>Stake 100 USDC (Verified Mentor Badge)</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Recommended
                        </span>
                      </p>
                      <p className="text-[11px] text-purple-300 mt-0.5">
                        Priority search placement, Verified badge, and student trust guarantees.
                      </p>
                    </div>
                    {stakeChoice === "stake" && <CheckCircle2 size={18} className="text-amber-300" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStakeChoice("skip")}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      stakeChoice === "skip"
                        ? "bg-white/15 border-amber-400 text-white"
                        : "bg-white/5 border-white/10 text-purple-200 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs">Skip for Now & Start as Unverified</p>
                      <p className="text-[11px] text-purple-300 mt-0.5">
                        Your profile will be created with unverified status. You can stake later from your dashboard.
                      </p>
                    </div>
                    {stakeChoice === "skip" && <CheckCircle2 size={18} className="text-amber-300" />}
                  </button>
                </div>
              </div>

              {/* Stake Interactive Action if selected */}
              {stakeChoice === "stake" && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Arbitrum Sepolia Wallet</span>
                    {walletAddress ? (
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </div>

                  {hasStakedSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Stake Commitment Initialized: 100 USDC Locked in Staking Vault!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isStakingProcessing}
                      onClick={handleSimulateStake}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isStakingProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Interacting with MentorStaking.sol...</span>
                        </>
                      ) : (
                        <>
                          <Coins size={14} />
                          <span>Lock 100 USDC in MentorStaking Vault</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(7)}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Continue to Security & Password</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {selectedRole === "mentor" && step === 7 && (
            /* Mentor Step 7: Password, Security & Mentor Code of Conduct */
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-950">
                <FileCheck size={16} className="text-indigo-600 shrink-0" />
                <p>
                  A confirmation dispatch has been prepared for <strong>{email}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Set Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-900 font-bold text-xs block mb-1">Confirm Password *</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status summary banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                <div className="flex items-center justify-between font-bold">
                  <span>Initial Mentor Status:</span>
                  {hasStakedSuccess ? (
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                      Verified Mentor (100 USDC Staked)
                    </span>
                  ) : (
                    <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                      Profile Submitted — Unverified (Pending Stake)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {hasStakedSuccess
                    ? "Your profile will be activated with the Verified Mentor badge and priority listing."
                    : "Your account will be created. Complete your 100 USDC stake from your dashboard at any time to unlock the Verified badge."}
                </p>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/about" target="_blank" className="text-indigo-600 font-bold hover:underline">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link href="/about" target="_blank" className="text-indigo-600 font-bold hover:underline">
                    Mentor Code of Conduct
                  </Link>
                  , and Arbitrum Smart Escrow settlement rules.
                </span>
              </label>

              {error && (
                <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Registering Mentor Profile..." : "Submit Mentor Profile & Launch Dashboard"}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-xs mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Sign in
            </Link>
          </p>
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

        {/* Center Visual Art & Role-Specific Narrative */}
        <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-lg mx-auto py-6">
          <div className="mb-6 flex justify-center">
            <img
              src={
                selectedRole === "student"
                  ? "/monsters/student-profile.webp"
                  : selectedRole === "mentor"
                  ? "/monsters/mentor-profile.webp"
                  : "/monsters/Register.webp"
              }
              alt={selectedRole ? `${selectedRole} illustration` : "Trust Lesson Register Mascot"}
              className="w-full max-w-sm xl:max-w-md h-auto object-contain animate-float drop-shadow-2xl select-none"
            />
          </div>

          <h2 className="text-2xl xl:text-3xl font-black text-white tracking-tight leading-tight">
            {selectedRole === "student"
              ? "Supercharge Your Learning with Zero Risk"
              : selectedRole === "mentor"
              ? "Share Mastery & Earn Directly on Arbitrum"
              : "Decentralized P2P Learning Protocol"}
          </h2>

          <p className="text-purple-200/80 text-xs xl:text-sm mt-3 leading-relaxed">
            {selectedRole === "student"
              ? "Book 1-on-1 mentorship sessions where your USDC is locked securely in smart escrow until you confirm deliverable completion."
              : selectedRole === "mentor"
              ? "Keep 100% of your hourly rates with instant smart contract settlements and build an immutable on-chain reputation."
              : "Bridging real-world mentorship with Web3 smart escrow, non-custodial payouts, and verifiable Soulbound SBT credentials."}
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
