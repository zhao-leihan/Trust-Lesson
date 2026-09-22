"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  CURRENCY_OPTIONS,
  CurrencyBadge,
  formatPriceCurrency,
  UsdcIcon,
  UsdtIcon,
  ArbitrumIcon,
} from "@/src/components/CurrencyBadge";
import Footer from "@/src/components/Footer";
import ExploreCard from "@/src/components/ExploreCard";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Video,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  Radio,
  FileText,
  Shield,
  Upload,
  ExternalLink,
  Check,
  ChevronRight,
  Info,
  DollarSign,
  Monitor,
} from "lucide-react";

// Curated high quality presets for mentors to choose quickly
const COVER_PRESETS = [
  {
    label: "Web3 & Smart Contracts",
    url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
    category: "Coding",
  },
  {
    label: "Fullstack Web Development",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    category: "Coding",
  },
  {
    label: "UI/UX & Product Design",
    url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80",
    category: "Design",
  },
  {
    label: "Career & Tech Interview Prep",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
    category: "Career",
  },
  {
    label: "AI, Python & Machine Learning",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    category: "Coding",
  },
  {
    label: "Security & Smart Contract Auditing",
    url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    category: "Coding",
  },
];

// Official SVG Icons for Gig Models
function MilestoneGigIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function SubscriptionCycleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

// Official Platform Logos (Google Meet, Zoom, Discord)
function GoogleMeetIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.5 24V14.5C29.5 12.57 27.93 11 26 11H8.5C6.57 11 5 12.57 5 14.5V33.5C5 35.43 6.57 37 8.5 37H26C27.93 37 29.5 35.43 29.5 33.5V24Z" fill="#00832D"/>
      <path d="M29.5 19.5L39.84 12.61C40.94 11.88 42.5 12.67 42.5 14V34C42.5 35.33 40.94 36.12 39.84 35.39L29.5 28.5V19.5Z" fill="#00AA47"/>
      <path d="M8.5 11H26C27.93 11 29.5 12.57 29.5 14.5V17.5H5V14.5C5 12.57 6.57 11 8.5 11Z" fill="#EA4335"/>
      <path d="M29.5 30.5V33.5C29.5 35.43 27.93 37 26 37H8.5C6.57 37 5 35.43 5 33.5V30.5H29.5Z" fill="#2684FC"/>
      <path d="M5 17.5H29.5V30.5H5V17.5Z" fill="#FFBA00"/>
    </svg>
  );
}

function ZoomIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#2D8CFF"/>
      <path d="M4.5 9C4.5 7.62 5.62 6.5 7 6.5H13C14.38 6.5 15.5 7.62 15.5 9V15C15.5 16.38 14.38 17.5 13 17.5H7C5.62 17.5 4.5 16.38 4.5 15V9Z" fill="white"/>
      <path d="M16.5 10.2L19.5 7.8C19.8 7.6 20.2 7.8 20.2 8.2V15.8C20.2 16.2 19.8 16.4 19.5 16.2L16.5 13.8V10.2Z" fill="white"/>
    </svg>
  );
}

function DiscordIcon({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#5865F2"/>
      <path d="M18.1 7.15C17.07 6.67 15.96 6.32 14.81 6.13C14.67 6.38 14.51 6.72 14.4 6.98C13.18 6.8 11.96 6.8 10.76 6.98C10.65 6.72 10.49 6.38 10.35 6.13C9.2 6.32 8.09 6.67 7.06 7.15C5.03 10.15 4.47 13.07 4.74 15.95C6.09 16.95 7.4 17.55 8.68 17.95C9 17.52 9.28 17.05 9.51 16.55C9.05 16.38 8.61 16.16 8.2 15.9C8.31 15.82 8.42 15.74 8.52 15.65C11.14 16.85 13.99 16.85 16.59 15.65C16.69 15.74 16.8 15.82 16.91 15.9C16.5 16.16 16.06 16.38 15.6 16.55C15.83 17.05 16.11 17.52 16.43 17.95C17.71 17.55 19.03 16.95 20.37 15.95C20.69 12.61 19.82 9.72 18.1 7.15ZM9.68 14.28C8.94 14.28 8.33 13.6 8.33 12.77C8.33 11.94 8.92 11.26 9.68 11.26C10.44 11.26 11.05 11.94 11.03 12.77C11.03 13.6 10.44 14.28 9.68 14.28ZM15.44 14.28C14.7 14.28 14.09 13.6 14.09 12.77C14.09 11.94 14.68 11.26 15.44 11.26C16.2 11.26 16.81 11.94 16.79 12.77C16.79 13.6 16.2 14.28 15.44 14.28Z" fill="white"/>
    </svg>
  );
}

const PLATFORMS = [
  { id: "Google Meet", label: "Google Meet", Icon: GoogleMeetIcon, desc: "Instant GMeet video room link" },
  { id: "Zoom", label: "Zoom Meetings", Icon: ZoomIcon, desc: "Interactive Zoom meeting or webinar" },
  { id: "Discord", label: "Discord Voice & Screen", Icon: DiscordIcon, desc: "Community server channel" },
];

const STEPS = [
  { id: 1, title: "General Info", subtitle: "Model, currency & details" },
  { id: 2, title: "Packages", subtitle: "Tiers, pricing & scope" },
  { id: 3, title: "Live & Modules", subtitle: "Meeting & video lessons" },
  { id: 4, title: "Cover & Publish", subtitle: "Review & deploy" },
];

export default function CreateGigPage() {
  const router = useRouter();
  const { user, walletAddress } = useAuth();

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // Model & Currency State (Only USDC and USDT)
  const [modelType, setModelType] = useState("GIG"); // "GIG" | "SUBSCRIPTION"
  const [currency, setCurrency] = useState("USDC"); // "USDC" | "USDT"

  // Gig Details
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Coding");
  const [level, setLevel] = useState("All levels");
  const [description, setDescription] = useState("");

  // Cover Image
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState("");

  // Online Collaboration (Live meeting is optional)
  const [hasOnlineMeeting, setHasOnlineMeeting] = useState(true);
  const [meetingPlatform, setMeetingPlatform] = useState("Google Meet");
  const [meetingLink, setMeetingLink] = useState("");

  // 3-Tier Packages (Max 3: Basic, Standard, Premium)
  const [activeTierCount, setActiveTierCount] = useState(3);
  const [selectedTierTab, setSelectedTierTab] = useState(0); // 0: Basic, 1: Standard, 2: Premium
  const [packages, setPackages] = useState([
    {
      tier: "Basic",
      name: "Starter Milestone",
      price: 50,
      duration: "3 Days Delivery",
      description: "Initial code architecture review, roadmap alignment, and 1-on-1 strategy call.",
      deliverables: ["1-hour 1-on-1 live session", "Code audit report", "Milestone roadmap"],
    },
    {
      tier: "Standard",
      name: "Accelerator Sprint",
      price: 120,
      duration: "7 Days Delivery",
      description: "Comprehensive hands-on pairing, full pull-request reviews, and architecture debugging.",
      deliverables: [
        "3 hours live pairing calls",
        "Direct code review & PR comments",
        "Step-by-step curriculum modules",
        "Direct Discord / Telegram support",
      ],
    },
    {
      tier: "Premium",
      name: "Full Mentorship Mastery",
      price: 250,
      duration: "1 Month Delivery",
      description: "End-to-end mentorship bootcamp: complete smart contract audit, production deploy, and lifetime access.",
      deliverables: [
        "Weekly 1-on-1 milestone calls",
        "Complete production codebase audit",
        "Full video lesson access & resources",
        "Job referral & portfolio certification",
      ],
    },
  ]);

  // Curriculum Modules & Video Uploads
  const [modules, setModules] = useState([
    {
      title: "Module 1: Orientation & System Architecture",
      description: "Overview of tech stack, repository setup, and development environment.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      resources: "https://github.com/example/trust-lesson-starter",
    },
    {
      title: "Module 2: Smart Contract Implementation & Testing",
      description: "Writing unit tests, fuzzing with Foundry/Hardhat, and testnet deployments.",
      videoUrl: "",
      resources: "",
    },
  ]);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrorMsg, setStepErrorMsg] = useState("");
  const [createdGigId, setCreatedGigId] = useState(null);

  // Helper to update package field
  const handleUpdatePackage = (index, field, value) => {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg))
    );
  };

  const handleAddDeliverable = (pkgIndex) => {
    setPackages((prev) =>
      prev.map((pkg, i) =>
        i === pkgIndex
          ? { ...pkg, deliverables: [...pkg.deliverables, "New deliverable item"] }
          : pkg
      )
    );
  };

  const handleUpdateDeliverable = (pkgIndex, dIndex, value) => {
    setPackages((prev) =>
      prev.map((pkg, i) => {
        if (i !== pkgIndex) return pkg;
        const newDels = [...pkg.deliverables];
        newDels[dIndex] = value;
        return { ...pkg, deliverables: newDels };
      })
    );
  };

  const handleDeleteDeliverable = (pkgIndex, dIndex) => {
    setPackages((prev) =>
      prev.map((pkg, i) => {
        if (i !== pkgIndex) return pkg;
        return {
          ...pkg,
          deliverables: pkg.deliverables.filter((_, idx) => idx !== dIndex),
        };
      })
    );
  };

  // Module helpers
  const handleAddModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}: Advanced Topics`,
        description: "",
        videoUrl: "",
        resources: "",
      },
    ]);
  };

  const handleUpdateModule = (index, field, value) => {
    setModules((prev) =>
      prev.map((mod, i) => (i === index ? { ...mod, [field]: value } : mod))
    );
  };

  const handleDeleteModule = (index) => {
    setModules((prev) => prev.filter((_, i) => i !== index));
  };

  // Cover image upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Cover image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result;
        if (resultUrl) {
          setCoverImage(resultUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setStepErrorMsg("");

    if (currentStep === 1) {
      if (!title.trim()) {
        setStepErrorMsg("Please enter a clear, descriptive gig title.");
        return;
      }
      if (!description.trim()) {
        setStepErrorMsg("Please write a summary description for this offering.");
        return;
      }
    }

    if (currentStep === 2) {
      const effective = packages.slice(0, activeTierCount);
      for (let i = 0; i < effective.length; i++) {
        const p = effective[i];
        if (!p.name.trim()) {
          setStepErrorMsg(`Please enter a name for the ${p.tier} package tier.`);
          return;
        }
        if (!p.price || Number(p.price) <= 0) {
          setStepErrorMsg(`Please enter a valid price for the ${p.tier} package tier.`);
          return;
        }
        if (!p.deliverables || p.deliverables.length === 0) {
          setStepErrorMsg(`Please include at least 1 deliverable for the ${p.tier} package tier.`);
          return;
        }
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setStepErrorMsg("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Publish Handler
  const handlePublishGig = async () => {
    setStepErrorMsg("");

    if (!title.trim() || !description.trim()) {
      setStepErrorMsg("Please fill in the gig title and description in Step 1.");
      setCurrentStep(1);
      return;
    }

    const effectivePackages = packages.slice(0, activeTierCount);
    if (effectivePackages.length === 0) {
      setStepErrorMsg("At least 1 package tier is required.");
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        modelType,
        currency,
        level,
        description: description.trim(),
        coverImage,
        meetingPlatform: hasOnlineMeeting ? meetingPlatform : "None (Asynchronous)",
        meetingLink: hasOnlineMeeting ? (meetingLink.trim() || null) : null,
        packages: effectivePackages,
        modules,
        duration: effectivePackages[0]?.duration || "4 Weeks",
        price: Number(effectivePackages[0]?.price) || 0,
        mentorName: user?.name || "Verified Mentor",
        mentorPhoto: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        mentorAddress: user?.walletAddress || walletAddress || null,
        mentorId: user?.id || null,
      };

      const res = await fetch("/api/mentor/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create gig");
      }

      setCreatedGigId(data.gig?.id || "success");
    } catch (err) {
      setStepErrorMsg(err.message || "An error occurred while publishing your gig.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview Object
  const previewItem = {
    id: "preview-card",
    title: title || "Your Gig Title will appear here",
    category,
    modelType,
    currency,
    price: packages[0]?.price || 50,
    duration: packages[0]?.duration || "3 Days Delivery",
    rating: 5.0,
    sessionsCount: 0,
    level,
    description: description || "Detailed milestone description and mentor deliverable overview.",
    coverImage: coverImage,
    mentorName: user?.name || "Verified Mentor",
    mentorPhoto: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    packages: packages.slice(0, activeTierCount),
    meetingPlatform: hasOnlineMeeting ? meetingPlatform : "Asynchronous",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between relative overflow-hidden selection:bg-purple-500 selection:text-white">
      <main className="pt-24 sm:pt-28 pb-16 px-4 sm:px-6 relative z-10 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Breadcrumb & Network Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100/80">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold group transition-colors"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Mentor Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-100/80 text-purple-800 font-extrabold text-[11px] uppercase tracking-wider border border-purple-200 shadow-2xs">
                Step-by-Step Gig Builder
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-slate-700 font-bold text-[11px] border border-slate-200 shadow-2xs flex items-center gap-1.5">
                <ArbitrumIcon size={13} />
                <span>Arbitrum One</span>
              </span>
            </div>
          </div>

          {/* Success Dialog Overlay */}
          {createdGigId && (
            <div className="p-8 bg-white border-2 border-emerald-300 rounded-3xl shadow-xl space-y-5 text-center animate-scaleIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-slate-950 font-black text-2xl tracking-tight">
                  Gig Successfully Published!
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                  Your offering is now stored in the database and visible to students across the Course / Explore catalog with smart contract escrow protection.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/explore"
                  className="px-6 py-2.5 rounded-full bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-md shadow-purple-600/20"
                >
                  View on Explore
                </Link>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}

          {!createdGigId && (
            <>
              {/* ── Modern Step-by-Step Wizard Header ── */}
              <div className="bg-white rounded-3xl border-2 border-purple-100 p-4 sm:p-5 shadow-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {STEPS.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          if (step.id < currentStep) setCurrentStep(step.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                          isActive
                            ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/20 shadow-xs"
                            : isCompleted
                            ? "bg-emerald-50/50 border-emerald-200 cursor-pointer hover:bg-emerald-50"
                            : "bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isActive
                              ? "bg-purple-600 text-white shadow-xs"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                            Step {step.id}
                          </p>
                          <p className={`text-xs font-black truncate ${isActive ? "text-purple-950" : "text-slate-800"}`}>
                            {step.title}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Error Banner */}
              {stepErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>{stepErrorMsg}</span>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* STEP 1: BUSINESS MODEL, CURRENCY & BASIC INFO                   */}
              {/* ════════════════════════════════════════════════════════════════ */}
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                  <div className="pb-4 border-b border-purple-50">
                    <h2 className="text-slate-950 font-black text-xl tracking-tight">
                      Step 1: General Info & Business Model
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Choose whether you want to offer milestone gigs or monthly recurring subscriptions, and choose your settlement currency.
                    </p>
                  </div>

                  {/* Model Selector: GIG vs SUBSCRIPTION */}
                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-2">
                      Mentorship Business Model
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <button
                        type="button"
                        onClick={() => setModelType("GIG")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          modelType === "GIG"
                            ? "bg-purple-50/60 border-purple-600 ring-2 ring-purple-400/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-950 text-sm flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs border border-purple-200">
                              <MilestoneGigIcon className="w-4 h-4" />
                            </div>
                            <span>One-Time Milestone Gig</span>
                          </span>
                          {modelType === "GIG" && <CheckCircle2 size={16} className="text-purple-600" />}
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Students fund milestones in Arbitrum escrow. Funds disburse progressively upon milestone deliverable approval.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModelType("SUBSCRIPTION")}
                        className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          modelType === "SUBSCRIPTION"
                            ? "bg-purple-50/60 border-purple-600 ring-2 ring-purple-400/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-slate-950 text-sm flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs border border-indigo-200">
                              <SubscriptionCycleIcon className="w-4 h-4" />
                            </div>
                            <span>Monthly Mentorship Subscription</span>
                          </span>
                          {modelType === "SUBSCRIPTION" && <CheckCircle2 size={16} className="text-purple-600" />}
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed">
                          Recurring monthly mentorship and ongoing pairing access. Displays a &quot;Monthly Sub&quot; badge in the catalog.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Currency Selector: USDC vs USDT on Arbitrum */}
                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-2">
                      Pricing Settlement Stablecoin (Arbitrum Network)
                    </label>
                    <div className="grid grid-cols-2 gap-3.5">
                      {CURRENCY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = currency === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setCurrency(opt.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-purple-50/60 border-purple-600 ring-2 ring-purple-400/20 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center p-1 border border-slate-200">
                                <Icon size={28} />
                              </div>
                              <div>
                                <span className="font-black text-slate-950 text-sm flex items-center gap-1.5">
                                  {opt.label}
                                </span>
                                <p className="text-[11px] text-slate-500">{opt.fullName}</p>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 size={18} className="text-purple-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gig Title */}
                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">
                      Gig Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Master Solidity & Arbitrum Smart Contract Auditing"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
                      required
                    />
                  </div>

                  {/* Category & Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-800 font-extrabold text-xs mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                      >
                        <option value="Coding">Coding & Smart Contracts</option>
                        <option value="Career">Career & Tech Interview</option>
                        <option value="Design">UI/UX & Product Design</option>
                        <option value="Business">Web3 Business & Tokenomics</option>
                        <option value="Languages">Languages & Communication</option>
                        <option value="Music">Audio & Creative Production</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-800 font-extrabold text-xs mb-1">Target Skill Level</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                      >
                        <option value="All levels">All Levels</option>
                        <option value="Beginner">Beginner Friendly</option>
                        <option value="Intermediate">Intermediate Developers</option>
                        <option value="Advanced">Advanced / Production</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-slate-800 font-extrabold text-xs mb-1">
                      Offering Summary & What Students Learn <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Outline the curriculum focus, who this mentorship is for, and how you guide students through hands-on code reviews and milestone completion..."
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all leading-relaxed"
                      required
                    />
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* STEP 2: 3-TIER PACKAGES BUILDER                                 */}
              {/* ════════════════════════════════════════════════════════════════ */}
              {currentStep === 2 && (
                <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-50">
                    <div>
                      <h2 className="text-slate-950 font-black text-xl tracking-tight">
                        Step 2: Package Tiers (Max 3: Basic, Standard, Premium)
                      </h2>
                      <p className="text-slate-500 text-xs mt-1">
                        Configure pricing, deliverables, and delivery timeline in {currency}.
                      </p>
                    </div>

                    {/* Tier Count Picker */}
                    <div className="flex items-center gap-1.5 p-1 bg-purple-50 rounded-2xl border border-purple-100 self-start sm:self-auto">
                      {[1, 2, 3].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            setActiveTierCount(count);
                            if (selectedTierTab >= count) setSelectedTierTab(count - 1);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            activeTierCount === count
                              ? "bg-purple-600 text-white shadow-2xs"
                              : "text-slate-600 hover:text-purple-700"
                          }`}
                        >
                          {count} {count === 1 ? "Tier" : "Tiers"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tier Navigation Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    {packages.slice(0, activeTierCount).map((pkg, idx) => (
                      <button
                        key={pkg.tier}
                        type="button"
                        onClick={() => setSelectedTierTab(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                          selectedTierTab === idx
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        <span>{pkg.tier} Tier</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedTierTab === idx ? "bg-white/20 text-white" : "bg-white text-slate-700 border"
                        }`}>
                          ${pkg.price} {currency}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active Tier Editor Card */}
                  {(() => {
                    const idx = selectedTierTab;
                    const pkg = packages[idx];
                    if (!pkg) return null;

                    return (
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50/40 via-white to-indigo-50/20 border-2 border-purple-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            <h3 className="font-black text-slate-950 text-base">{pkg.tier} Package Configuration</h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px]">
                            {idx === 0 ? "Starter Tier" : idx === 1 ? "Popular Sprint" : "Mastery Bootcamp"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-slate-700 font-bold text-xs mb-1">Package Name</label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => handleUpdatePackage(idx, "name", e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center gap-1">
                              <span>Price ({currency})</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">$</span>
                              <input
                                type="number"
                                min="5"
                                max="100000"
                                value={pkg.price}
                                onChange={(e) => handleUpdatePackage(idx, "price", Number(e.target.value))}
                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold text-xs mb-1">Estimated Delivery Time</label>
                            <input
                              type="text"
                              value={pkg.duration}
                              onChange={(e) => handleUpdatePackage(idx, "duration", e.target.value)}
                              placeholder="e.g. 3 Days Delivery, 2 Weeks"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold text-xs mb-1">Package Summary</label>
                          <input
                            type="text"
                            value={pkg.description}
                            onChange={(e) => handleUpdatePackage(idx, "description", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                          />
                        </div>

                        {/* Deliverables Checklist */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-slate-700 font-bold text-xs">
                              Deliverable Checklist (Milestone Scope)
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddDeliverable(idx)}
                              className="text-purple-700 hover:text-purple-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>Add Deliverable</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {pkg.deliverables.map((item, dIdx) => (
                              <div key={dIdx} className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => handleUpdateDeliverable(idx, dIdx, e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDeliverable(idx, dIdx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* STEP 3: ONLINE VIDEO COLLABORATION & CURRICULUM MODULES         */}
              {/* ════════════════════════════════════════════════════════════════ */}
              {currentStep === 3 && (
                <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                  <div className="pb-4 border-b border-purple-50">
                    <h2 className="text-slate-950 font-black text-xl tracking-tight">
                      Step 3: Online Live Meeting & Curriculum Modules
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Choose your preferred video call tool and upload structured curriculum modules for self-paced learning.
                    </p>
                  </div>

                  {/* Online Live Meeting Toggle (Optional) */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm block">
                        Sediakan Sesi Live 1-on-1 Online? (Opsional)
                      </span>
                      <span className="text-slate-500 text-xs">
                        Aktifkan jika gig ini menyediakan panggilan tatap muka live. Jika tidak, gig bersifat modul mandiri.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setHasOnlineMeeting(true);
                          if (!meetingPlatform || meetingPlatform === "None (Asynchronous)") {
                            setMeetingPlatform("Google Meet");
                          }
                        }}
                        className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          hasOnlineMeeting
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Sediakan Sesi Live
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHasOnlineMeeting(false);
                          setMeetingPlatform("None (Asynchronous)");
                          setMeetingLink("");
                        }}
                        className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                          !hasOnlineMeeting
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        Tanpa Sesi Live (Async)
                      </button>
                    </div>
                  </div>

                  {/* Online Collaboration Platform Selector (Active only when live session enabled) */}
                  {hasOnlineMeeting ? (
                    <>
                      <div>
                        <label className="block text-slate-800 font-extrabold text-xs mb-2">
                          Pilih Platform Live Video Call (Google Meet, Zoom, Discord)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {PLATFORMS.map((plat) => {
                            const isSelected = meetingPlatform === plat.id;
                            const IconComp = plat.Icon;
                            return (
                              <button
                                key={plat.id}
                                type="button"
                                onClick={() => setMeetingPlatform(plat.id)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? "bg-purple-50/70 border-purple-600 ring-2 ring-purple-400/20 shadow-xs"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
                                    <IconComp className="w-7 h-7" />
                                  </div>
                                  {isSelected && <CheckCircle2 size={16} className="text-purple-600" />}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-950 text-xs sm:text-sm block">{plat.label}</span>
                                  <span className="text-[11px] text-slate-500">{plat.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Meeting Invite Link */}
                      <div>
                        <label className="block text-slate-800 font-extrabold text-xs mb-1">
                          Meeting Room / Invite Link (Opsional)
                        </label>
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => setMeetingLink(e.target.value)}
                          placeholder="https://meet.google.com/xyz-abc-def or https://calendly.com/your-name"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Link ini akan otomatis terbuka untuk siswa setelah deposit escrow Arbitrum mereka terkonfirmasi.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                      <span>
                        <strong>Mode Mandiri / Asinkron Aktif:</strong> Siswa akan belajar melalui modul video, tugas praktek, dan repositori di bawah tanpa jadwal tatap muka langsung.
                      </span>
                    </div>
                  )}

                  {/* Curriculum Video Modules Builder */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-50">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-sm">
                          Curriculum Modules & Video Lessons ({modules.length})
                        </h3>
                        <p className="text-slate-500 text-xs">
                          Provide pre-recorded video tutorials, code repositories, or homework assignments.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddModule}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200"
                      >
                        <Plus size={13} />
                        <span>Add Module</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {modules.map((mod, mIdx) => (
                        <div key={mIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                              Lesson Module {mIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteModule(mIdx)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                              title="Delete module"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">Module Title</label>
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => handleUpdateModule(mIdx, "title", e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">Video Stream URL</label>
                              <input
                                type="url"
                                value={mod.videoUrl}
                                onChange={(e) => handleUpdateModule(mIdx, "videoUrl", e.target.value)}
                                placeholder="https://youtube.com/... or Cloudflare Stream"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">Module Description</label>
                              <input
                                type="text"
                                value={mod.description}
                                onChange={(e) => handleUpdateModule(mIdx, "description", e.target.value)}
                                placeholder="What will be learned in this module"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">Resources / GitHub URL</label>
                              <input
                                type="url"
                                value={mod.resources}
                                onChange={(e) => handleUpdateModule(mIdx, "resources", e.target.value)}
                                placeholder="https://github.com/..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* STEP 4: COVER IMAGE & LIVE EXPLORE CARD PREVIEW / PUBLISH       */}
              {/* ════════════════════════════════════════════════════════════════ */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Cover Selection Card */}
                  <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="pb-3 border-b border-purple-50">
                      <h2 className="text-slate-950 font-black text-xl tracking-tight">
                        Step 4: Cover Image & Final Review
                      </h2>
                      <p className="text-slate-500 text-xs mt-1">
                        Select a curated cover image or upload your own to showcase on the Course catalog.
                      </p>
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="block text-slate-800 font-extrabold text-xs mb-2">
                        Curated Preset Covers
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {COVER_PRESETS.map((preset) => {
                          const isSelected = coverImage === preset.url;
                          return (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => {
                                setCoverImage(preset.url);
                                setCustomCoverUrl("");
                              }}
                              className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all group cursor-pointer ${
                                isSelected
                                  ? "border-purple-600 ring-3 ring-purple-500/20 shadow-md"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="h-20 w-full overflow-hidden bg-slate-900">
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="p-2 bg-white flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-800 truncate">
                                  {preset.label}
                                </span>
                                {isSelected && <CheckCircle2 size={14} className="text-purple-600 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom URL or File Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-slate-800 font-extrabold text-xs mb-1">
                          Custom Image URL
                        </label>
                        <input
                          type="url"
                          value={customCoverUrl}
                          onChange={(e) => {
                            setCustomCoverUrl(e.target.value);
                            if (e.target.value.trim()) setCoverImage(e.target.value.trim());
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-800 font-extrabold text-xs mb-1">
                          Or Upload Local File
                        </label>
                        <label className="w-full px-3.5 py-2.5 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100/50 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                          <Upload size={14} />
                          <span>Choose Cover Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Live Explore Card Preview */}
                  <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                          <Sparkles size={16} className="text-purple-600" />
                          <span>Live Explore Catalog Preview</span>
                        </h3>
                        <p className="text-slate-500 text-xs">
                          This is exactly how your card appears to students searching for mentorship on /explore.
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                        Dynamic Preview
                      </span>
                    </div>

                    <div className="max-w-md mx-auto">
                      <ExploreCard item={previewItem} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Sticky Bottom Step Navigation Controls ── */}
              <div className="bg-white rounded-2xl border-2 border-purple-100 p-4 shadow-sm flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Step {currentStep} of 4: {STEPS[currentStep - 1]?.title}
                  </span>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                    >
                      <span>Continue to {STEPS[currentStep]?.title}</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handlePublishGig}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles size={16} />
                      <span>{isSubmitting ? "Deploying Offering to Arbitrum..." : "Publish Gig to Explore"}</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
