"use client";

import { useState, useEffect } from "react";
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
import { MetaMaskIcon, CoinbaseWalletIcon } from "@/src/components/WalletIcons";
import { YouTubeIcon, GoogleDriveIcon } from "@/src/components/PlatformIcons";
import Footer from "@/src/components/Footer";
import ExploreCard from "@/src/components/ExploreCard";
import GatedModulePlayer from "@/src/components/GatedModulePlayer";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Video,
  Clock,
  CheckCircle2,
  Plus,
  X,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  Radio,
  FileText,
  Shield,
  ShieldCheck,
  Upload,
  ExternalLink,
  Check,
  ChevronRight,
  Info,
  DollarSign,
  Monitor,
  Lock,
  Unlock,
  AlertTriangle,
  Wallet,
  Eye,
  Download,
  Loader2,
  Paperclip,
  FileCode,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
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


// Official Platform Logos (Google Meet, Zoom)
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

const PLATFORMS = [
  { id: "Google Meet", label: "Google Meet", Icon: GoogleMeetIcon, desc: "Auto-generated GMeet room on session acceptance" },
  { id: "Zoom", label: "Zoom Meetings", Icon: ZoomIcon, desc: "Auto-generated Zoom room on session acceptance" },
];

const STEPS = [
  { id: 1, title: "General Info", subtitle: "Currency & details" },
  { id: 2, title: "Packages", subtitle: "Tiers, pricing & scope" },
  { id: 3, title: "Live & Modules", subtitle: "Meeting & video lessons" },
  { id: 4, title: "Cover & Publish", subtitle: "Review & deploy" },
];

export default function CreateGigPage() {
  const router = useRouter();
  const { user, walletAddress, connectWallet, updateUserProfile } = useAuth();

  // Wizard Step State (1 to 4)
  const [currentStep, setCurrentStep] = useState(1);

  // ─── Mandatory Payout Wallet Lock State ──────────────────────────────
  const [isWalletLocked, setIsWalletLocked] = useState(Boolean(user?.walletLocked));
  const [lockedAddress, setLockedAddress] = useState(user?.walletAddress || "");
  const [checkingWalletLock, setCheckingWalletLock] = useState(true);
  const [inputAddress, setInputAddress] = useState(user?.walletAddress || walletAddress || "");
  const [isLockingWallet, setIsLockingWallet] = useState(false);
  const [walletLockError, setWalletLockError] = useState("");
  const [walletLockSuccess, setWalletLockSuccess] = useState(false);

  // Check live lock status from database
  useEffect(() => {
    let isMounted = true;
    async function checkLockStatus() {
      if (!user) {
        if (isMounted) setCheckingWalletLock(false);
        return;
      }
      try {
        const q = new URLSearchParams();
        if (user.id) q.set("mentorId", user.id);
        if (user.email) q.set("email", user.email);
        const res = await fetch(`/api/mentor/stats?${q.toString()}`);
        if (res.ok) {
          const stats = await res.json();
          if (isMounted) {
            if (stats.walletLocked && stats.walletAddress) {
              setIsWalletLocked(true);
              setLockedAddress(stats.walletAddress);
              setInputAddress(stats.walletAddress);
            } else if (user.walletLocked && user.walletAddress) {
              setIsWalletLocked(true);
              setLockedAddress(user.walletAddress);
              setInputAddress(user.walletAddress);
            } else {
              setIsWalletLocked(false);
              if (walletAddress || user.walletAddress) {
                setInputAddress(walletAddress || user.walletAddress);
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to check wallet lock status:", e);
        if (isMounted && user.walletLocked && user.walletAddress) {
          setIsWalletLocked(true);
          setLockedAddress(user.walletAddress);
        }
      } finally {
        if (isMounted) setCheckingWalletLock(false);
      }
    }
    checkLockStatus();
    return () => {
      isMounted = false;
    };
  }, [user, walletAddress]);

  // Lock Wallet Handler
  const handleLockWallet = async (addrToLock) => {
    setWalletLockError("");
    const cleanAddr = (addrToLock || inputAddress || walletAddress || "").trim().toLowerCase();

    if (!cleanAddr) {
      setWalletLockError("Please connect your wallet or enter an Arbitrum 0x address.");
      return false;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
      setWalletLockError("Invalid Arbitrum wallet address. Must be 0x followed by 40 hex characters.");
      return false;
    }

    setIsLockingWallet(true);
    try {
      const res = await fetch("/api/mentor/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: cleanAddr,
          userId: user?.id,
          email: user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to lock wallet");
      }

      const confirmedAddr = data.walletAddress || cleanAddr;
      setIsWalletLocked(true);
      setLockedAddress(confirmedAddr);
      setInputAddress(confirmedAddr);
      if (updateUserProfile) {
        updateUserProfile({ walletAddress: confirmedAddr, walletLocked: true });
      }
      setWalletLockSuccess(true);
      setStepErrorMsg("");
      setTimeout(() => setWalletLockSuccess(false), 5000);
      return true;
    } catch (err) {
      setWalletLockError(err.message || "Failed to lock payout wallet.");
      return false;
    } finally {
      setIsLockingWallet(false);
    }
  };

  const handleConnectAndQuickLock = async (provider = "metamask") => {
    setWalletLockError("");
    setIsLockingWallet(true);
    try {
      if (connectWallet) {
        const addr = await connectWallet(provider);
        if (addr) {
          setInputAddress(addr);
          await handleLockWallet(addr);
        }
      }
    } catch (err) {
      setWalletLockError(err.message || "Failed to connect wallet.");
    } finally {
      setIsLockingWallet(false);
    }
  };

  // Model & Currency State (Milestone Gig model only; USDC & USDT settlement)
  const modelType = "GIG";
  const [currency, setCurrency] = useState("USDC"); // "USDC" | "USDT"

  // Gig Details & Category (Preset or Custom)
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Coding");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [level, setLevel] = useState("All levels");
  const [description, setDescription] = useState("");

  // Cover & Gallery Images (Max 5)
  const [galleryImages, setGalleryImages] = useState([COVER_PRESETS[0].url]);
  const [coverIndex, setCoverIndex] = useState(0);
  const coverImage = galleryImages[coverIndex] || galleryImages[0] || COVER_PRESETS[0].url;
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
      name: "",
      price: "",
      duration: "1 Live Meeting",
      description: "",
      deliverables: [""],
    },
    {
      tier: "Standard",
      name: "",
      price: "",
      duration: "3 Live Meetings",
      description: "",
      deliverables: [""],
    },
    {
      tier: "Premium",
      name: "",
      price: "",
      duration: "8 Live Meetings",
      description: "",
      deliverables: [""],
    },
  ]);

  // Curriculum Modules (Supporting YouTube & Google Drive for Cost Savings)
  const [modules, setModules] = useState([
    {
      id: "mod-1",
      title: "",
      description: "",
      videoSourceType: "youtube", // "youtube" | "cloudflare"
      videoUrl: "", // YouTube Unlisted URL
      videoUid: "", // Cloudflare Stream UID
      videoFileName: "",
      videoSize: null,
      videoUploading: false,
      videoProgress: 0,
      resourceSourceType: "gdrive", // "gdrive" | "r2"
      gdriveUrl: "", // Google Drive Restricted URL
      resources: [], // Cloudflare R2 files
      resourceUploading: false,
      githubUrl: "", // Optional starter repository URL
    },
  ]);

  // Upload Tutorial Guide State
  const [showUploadTutorial, setShowUploadTutorial] = useState(false);
  const [activeTutorialTab, setActiveTutorialTab] = useState("youtube"); // "youtube" | "gdrive"

  // Student Curriculum Preview Modal State (Part 4)
  const [showStudentPreview, setShowStudentPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState("unpaid"); // "unpaid" | "paid"

  // Format bytes helper
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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
          ? { ...pkg, deliverables: [...pkg.deliverables, ""] }
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
        id: `mod-${Date.now()}`,
        title: "",
        description: "",
        videoSourceType: "youtube",
        videoUrl: "",
        videoUid: "",
        videoFileName: "",
        videoSize: null,
        videoUploading: false,
        videoProgress: 0,
        resourceSourceType: "gdrive",
        gdriveUrl: "",
        resources: [],
        resourceUploading: false,
        githubUrl: "",
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

  // Native Gated Video Upload to Cloudflare Stream
  const handleUploadModuleVideo = async (mIdx, file) => {
    if (!file) return;
    handleUpdateModule(mIdx, "videoUploading", true);
    handleUpdateModule(mIdx, "videoProgress", 15);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", modules[mIdx]?.title || `Lesson Module ${mIdx + 1}`);
      formData.append("moduleId", modules[mIdx]?.id || `mod-${mIdx + 1}`);

      const token = localStorage.getItem("tl_jwt");
      const res = await fetch("/api/modules/upload-video", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video upload failed");

      setModules((prev) =>
        prev.map((mod, i) =>
          i === mIdx
            ? {
                ...mod,
                videoUid: data.uid,
                videoFileName: file.name,
                videoSize: file.size,
                videoUploading: false,
                videoProgress: 100,
              }
            : mod
        )
      );
    } catch (err) {
      alert(`Video upload failed: ${err.message}`);
      handleUpdateModule(mIdx, "videoUploading", false);
      handleUpdateModule(mIdx, "videoProgress", 0);
    }
  };

  const handleRemoveModuleVideo = (mIdx) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === mIdx
          ? {
              ...mod,
              videoUid: "",
              videoFileName: "",
              videoSize: null,
              videoUploading: false,
              videoProgress: 0,
            }
          : mod
      )
    );
  };

  // Native Gated Document Upload to Cloudflare R2
  const handleUploadModuleResource = async (mIdx, file) => {
    if (!file) return;
    handleUpdateModule(mIdx, "resourceUploading", true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("moduleId", modules[mIdx]?.id || `mod-${mIdx + 1}`);

      const token = localStorage.getItem("tl_jwt");
      const res = await fetch("/api/modules/upload-resource", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Document upload failed");

      const newRes = data.resource || {
        id: `res-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setModules((prev) =>
        prev.map((mod, i) =>
          i === mIdx
            ? {
                ...mod,
                resources: [...(mod.resources || []), newRes],
                resourceUploading: false,
              }
            : mod
        )
      );
    } catch (err) {
      alert(`Document upload failed: ${err.message}`);
      handleUpdateModule(mIdx, "resourceUploading", false);
    }
  };

  const handleRemoveModuleResource = (mIdx, resId) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === mIdx
          ? {
              ...mod,
              resources: (mod.resources || []).filter(
                (r) => r.id !== resId && r.resourceId !== resId
              ),
            }
          : mod
      )
    );
  };

  // Compress single image file using HTML5 canvas
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const resultUrl = uploadEvent.target?.result;
        if (!resultUrl) return resolve(null);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxW = 1200;
          const maxH = 675;
          let w = img.width;
          let h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => resolve(null);
        img.src = resultUrl;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Multiple image file upload handler (Max 5 total)
  const handleMultipleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 5 - galleryImages.length;
    if (remainingSlots <= 0) {
      alert("You can upload a maximum of 5 images.");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const compressedList = [];
    for (const f of filesToProcess) {
      if (f.size > 12 * 1024 * 1024) continue;
      const res = await compressImage(f);
      if (res) compressedList.push(res);
    }

    if (compressedList.length > 0) {
      setGalleryImages((prev) => [...prev, ...compressedList].slice(0, 5));
    }
  };

  const handleAddImageUrl = () => {
    if (!customCoverUrl.trim()) return;
    if (galleryImages.length >= 5) {
      alert("Maximum of 5 images allowed.");
      return;
    }
    setGalleryImages((prev) => [...prev, customCoverUrl.trim()].slice(0, 5));
    setCustomCoverUrl("");
  };

  const handleRemoveImage = (index) => {
    setGalleryImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (coverIndex >= filtered.length) {
        setCoverIndex(Math.max(0, filtered.length - 1));
      }
      return filtered.length > 0 ? filtered : [COVER_PRESETS[0].url];
    });
  };

  const handleSetCover = (index) => {
    setCoverIndex(index);
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    setStepErrorMsg("");

    if (currentStep === 1) {
      if (!isWalletLocked || !lockedAddress) {
        setStepErrorMsg("Payout Wallet Required: You must lock your Arbitrum payout wallet above before proceeding. Escrow contracts need a permanent recipient address for student payments.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (!title.trim()) {
        setStepErrorMsg("Please enter a clear, descriptive gig title.");
        return;
      }
      if (isCustomCategory && !customCategory.trim()) {
        setStepErrorMsg("Please enter a custom category name, or switch back to presets.");
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
          setStepErrorMsg(`Please enter a name for your ${p.tier} package tier.`);
          return;
        }
        if (!p.price || Number(p.price) <= 0) {
          setStepErrorMsg(`Please enter a valid price for your ${p.tier} package tier.`);
          return;
        }
        const validDels = (p.deliverables || []).filter((d) => d.trim().length > 0);
        if (validDels.length === 0) {
          setStepErrorMsg(`Please add at least 1 deliverable for your ${p.tier} package tier.`);
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

  // Resolved Category (preset vs custom typed)
  const effectiveCategory = isCustomCategory && customCategory.trim()
    ? customCategory.trim()
    : category;

  // Final Publish Handler
  const handlePublishGig = async () => {
    setStepErrorMsg("");

    if (!isWalletLocked || !lockedAddress) {
      setStepErrorMsg("Payout Wallet Not Locked: Please lock your Arbitrum payout wallet before publishing this gig. Where should student payments go when milestones are released?");
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!title.trim() || !description.trim()) {
      setStepErrorMsg("Please fill in the gig title and description in Step 1.");
      setCurrentStep(1);
      return;
    }

    const effectivePackages = packages.slice(0, activeTierCount).map((p) => ({
      ...p,
      name: p.name.trim(),
      price: Number(p.price) || 0,
      duration: p.duration.trim() || "1 Live Meeting",
      description: p.description.trim(),
      deliverables: (p.deliverables || []).filter((d) => d.trim().length > 0),
    }));

    if (effectivePackages.length === 0) {
      setStepErrorMsg("At least 1 package tier is required.");
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category: effectiveCategory,
        modelType: "GIG",
        currency,
        level,
        description: description.trim(),
        coverImage,
        galleryImages: galleryImages.slice(0, 5),
        meetingPlatform: meetingPlatform || "Google Meet",
        meetingLink: "AUTO_GENERATED",
        packages: effectivePackages,
        modules,
        duration: effectivePackages[0]?.duration || "1 Live Meeting",
        price: Number(effectivePackages[0]?.price) || 0,
        mentorName: user?.name || "Verified Mentor",
        mentorPhoto: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        mentorAddress: lockedAddress || user?.walletAddress || walletAddress,
        mentorId: user?.id || null,
        email: user?.email || null,
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
    category: effectiveCategory,
    modelType: "GIG",
    currency,
    price: Number(packages[0]?.price) || 0,
    duration: packages[0]?.duration || "1 Live Meeting",
    rating: 5.0,
    sessionsCount: 0,
    level,
    description: description || "Detailed milestone description and mentor deliverable overview.",
    coverImage: coverImage,
    mentorName: user?.name || "Verified Mentor",
    mentorPhoto: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    packages: packages.slice(0, activeTierCount),
    meetingPlatform: meetingPlatform || "Google Meet",
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

              {/* ── MANDATORY ESCROW PAYOUT WALLET LOCK CARD ── */}
              {isWalletLocked ? (
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 border-2 border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
                      <Lock size={18} className="text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-950 text-sm">
                          Escrow Payout Destination Locked
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Verified Recipient
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>Student milestone payments will disburse non-custodially to:</span>
                        <code className="bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border border-emerald-200">
                          {lockedAddress}
                        </code>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs shrink-0 self-start sm:self-auto">
                    <ArbitrumIcon size={14} />
                    <span>Arbitrum One Active</span>
                  </span>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50/40 border-2 border-amber-300 shadow-xs space-y-4 animate-fadeIn">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200 shadow-xs">
                      <Lock size={22} className="text-amber-800" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-950 text-sm sm:text-base">
                          Mandatory: Lock Your Arbitrum Payout Wallet
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                          Required Before Creating Gig
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                        In Trust Lesson, student gig payments are deposited into an Arbitrum One smart contract escrow. When milestones are approved, funds are automatically released on-chain. <span className="font-bold text-slate-900">You must lock your payout wallet now so the smart contract knows where to send payments when students purchase your gig.</span>
                      </p>
                    </div>
                  </div>

                  {walletLockError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle size={15} className="shrink-0 text-rose-600" />
                      <span>{walletLockError}</span>
                    </div>
                  )}

                  {walletLockSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                      <span>Payout wallet successfully locked and synchronized with your mentor profile!</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                        placeholder="0x... (Enter Arbitrum One wallet address)"
                        className="w-full px-4 py-2.5 rounded-xl border border-amber-300 font-mono text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      <button
                        type="button"
                        onClick={() => handleConnectAndQuickLock("metamask")}
                        disabled={isLockingWallet}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Connect with MetaMask"
                      >
                        <MetaMaskIcon size={16} />
                        <span>MetaMask</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConnectAndQuickLock("coinbase")}
                        disabled={isLockingWallet}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Connect with Coinbase Wallet"
                      >
                        <CoinbaseWalletIcon size={16} />
                        <span>Coinbase</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLockWallet(inputAddress)}
                        disabled={isLockingWallet || !inputAddress.trim()}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-600/20 active:scale-95"
                      >
                        <Lock size={14} />
                        <span>{isLockingWallet ? "Locking..." : "Lock Payout Wallet"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Error Banner */}
              {stepErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>{stepErrorMsg}</span>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════════ */}
              {/* STEP 1: GENERAL INFO, CURRENCY & CUSTOM CATEGORY                */}
              {/* ════════════════════════════════════════════════════════════════ */}
              {currentStep === 1 && (
                <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                  <div className="pb-4 border-b border-purple-50">
                    <h2 className="text-slate-950 font-black text-xl tracking-tight">
                      Step 1: General Info & Pricing Currency
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Configure your milestone escrow gig offering, select your settlement currency, and specify your category and details.
                    </p>
                  </div>

                  {/* Milestone Escrow Gig Banner */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
                        <MilestoneGigIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-950 text-sm">
                            Milestone Escrow Gig Model
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wide border border-emerald-200">
                            Escrow Protected
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">
                          Students fund project milestones into Arbitrum smart contract escrow, releasing payment upon verified deliverables.
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white text-purple-700 border border-purple-200 text-xs font-bold shadow-2xs self-start sm:self-auto shrink-0">
                      <Shield size={13} />
                      Arbitrum Escrow
                    </span>
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
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-slate-800 font-extrabold text-xs">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isCustomCategory;
                            setIsCustomCategory(next);
                            if (next && !customCategory) {
                              setCustomCategory("");
                            }
                          }}
                          className="text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {isCustomCategory ? (
                            <span className="inline-flex items-center gap-1">
                              <ArrowLeft size={12} />
                              <span>Choose presets</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Plus size={12} />
                              <span>Custom category</span>
                            </span>
                          )}
                        </button>
                      </div>

                      {!isCustomCategory ? (
                        <select
                          value={category}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setIsCustomCategory(true);
                            } else {
                              setCategory(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 bg-white"
                        >
                          <option value="Coding">Coding & Smart Contracts</option>
                          <option value="Career">Career & Tech Interview</option>
                          <option value="Design">UI/UX & Product Design</option>
                          <option value="Business">Web3 Business & Tokenomics</option>
                          <option value="Languages">Languages & Communication</option>
                          <option value="Music">Audio & Creative Production</option>
                          <option value="__custom__">+ Enter Custom Category...</option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              value={customCategory}
                              onChange={(e) => setCustomCategory(e.target.value)}
                              placeholder="e.g. AI Prompting, Security Auditing, ZK Proofs..."
                              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-purple-400 bg-purple-50/20 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-600 transition-all placeholder:text-slate-400"
                              autoFocus
                            />
                            {customCategory && (
                              <button
                                type="button"
                                onClick={() => setCustomCategory("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-bold">Suggestions:</span>
                            {["AI & ML", "Zero Knowledge", "DeFi Security", "Game Development"].map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setCustomCategory(item)}
                                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 text-[10px] font-semibold transition-colors cursor-pointer"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-800 font-extrabold text-xs mb-1.5">Target Skill Level</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 bg-white"
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
                        Configure pricing, deliverables, and mentorship meetings in {currency}.
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
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
                    {packages.slice(0, activeTierCount).map((pkg, idx) => (
                      <button
                        key={pkg.tier}
                        type="button"
                        onClick={() => setSelectedTierTab(idx)}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                          selectedTierTab === idx
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                        }`}
                      >
                        <span>{pkg.name.trim() || `${pkg.tier} Tier`}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedTierTab === idx ? "bg-white/20 text-white" : "bg-white text-slate-700 border"
                        }`}>
                          {pkg.price ? `$${pkg.price} ${currency}` : `Set price`}
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
                            <h3 className="font-black text-slate-950 text-base">
                              {pkg.name.trim() ? `${pkg.name} (${pkg.tier})` : `${pkg.tier} Tier Configuration`}
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold text-[10px]">
                            {idx === 0 ? "Tier 1" : idx === 1 ? "Tier 2" : "Tier 3"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-slate-700 font-bold text-xs mb-1">
                              Package Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => handleUpdatePackage(idx, "name", e.target.value)}
                              placeholder="e.g. Starter Milestone, Consultation Sprint, Full Mastery..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center gap-1">
                              <span>Price ({currency})</span> <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">$</span>
                              <input
                                type="number"
                                min="1"
                                max="100000"
                                value={pkg.price}
                                onChange={(e) => handleUpdatePackage(idx, "price", e.target.value ? Number(e.target.value) : "")}
                                placeholder="50"
                                className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-700 font-bold text-xs mb-1">
                              Mentorship Meetings / Sessions <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={pkg.duration}
                              onChange={(e) => handleUpdatePackage(idx, "duration", e.target.value)}
                              placeholder="e.g. 1 Live Meeting, 3 Live Sessions, 8 Meetings"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold text-xs mb-1">Package Summary & Scope</label>
                          <textarea
                            rows={3}
                            value={pkg.description}
                            onChange={(e) => handleUpdatePackage(idx, "description", e.target.value)}
                            placeholder="Describe what's included in this milestone and what students will achieve..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400 resize-y"
                          />
                        </div>

                        {/* Deliverables Checklist */}
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                            <div>
                              <label className="block text-slate-700 font-bold text-xs">
                                Deliverable Checklist (Milestone Scope) <span className="text-rose-500">*</span>
                              </label>
                              <p className="text-[11px] text-slate-400">
                                Add the tangible outcomes students receive before milestone escrow funds release.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddDeliverable(idx)}
                              className="text-purple-700 hover:text-purple-800 text-xs font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto hover:underline"
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
                                  placeholder={`e.g. Deliverable ${dIdx + 1}: 1-hour live pairing call, code review comments, roadmap review...`}
                                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                                />
                                {pkg.deliverables.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDeliverable(idx, dIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                                    title="Remove item"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
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

                  {/* Live Video Call Platform Selector (Always Included) */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-slate-800 font-extrabold text-xs">
                          Select Live Video Call Platform
                        </label>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Always Included
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                    {/* Automatic Smart Room Generator Notice */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200 flex items-start gap-3 shadow-2xs">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <Sparkles size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                          <span>Automatic Smart Meeting Room Generation</span>
                          <span className="px-2 py-0.2 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">Zero Setup</span>
                        </h4>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                          You do not need to create or paste any meeting links manually. As soon as a student books this gig and you click <strong className="text-purple-700">Accept</strong> in your Requests inbox, Trust Lesson will instantly generate a dedicated, secure <strong className="text-slate-900">{meetingPlatform}</strong> meeting room for you and your student!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Curriculum Modules & Video Lessons */}
                  <div className="pt-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-sm">
                          Curriculum Modules & Video Lessons ({modules.length})
                        </h3>
                        <p className="text-slate-500 text-xs">
                          Provide pre-recorded video tutorials, lesson documents, or practice code repositories.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddModule}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200 self-start sm:self-auto"
                      >
                        <Plus size={13} />
                        <span>Add Module</span>
                      </button>
                    </div>

                    {/* UPLOAD GUIDE CARD (YOUTUBE UNLISTED & GOOGLE DRIVE RESTRICTED) */}
                    <div className="rounded-2xl border-2 border-purple-200/90 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/60 p-4 sm:p-5 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <BookOpen size={18} />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                              Upload Guide: YouTube (Unlisted) & Google Drive (Restricted Access)
                            </h4>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                              Use these free hosting alternatives to avoid cloud storage fees. Videos and documents remain access-gated and accessible only by learners with confirmed milestone escrow payments.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowUploadTutorial(!showUploadTutorial)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                        >
                          <HelpCircle size={14} className="text-purple-600" />
                          <span>{showUploadTutorial ? "Hide Guide" : "View Step-by-Step Guide"}</span>
                          {showUploadTutorial ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {/* Interactive Guide Content */}
                      {showUploadTutorial && (
                        <div className="mt-4 pt-4 border-t border-purple-100 space-y-4">
                          {/* Guide Selector Tabs */}
                          <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
                            <button
                              type="button"
                              onClick={() => setActiveTutorialTab("youtube")}
                              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTutorialTab === "youtube"
                                  ? "bg-red-600 text-white shadow-2xs"
                                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                              }`}
                            >
                              <YouTubeIcon size={14} />
                              <span>YouTube Video Guide</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTutorialTab("gdrive")}
                              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeTutorialTab === "gdrive"
                                  ? "bg-blue-600 text-white shadow-2xs"
                                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                              }`}
                            >
                              <GoogleDriveIcon size={14} />
                              <span>Google Drive Document Guide</span>
                            </button>
                          </div>

                          {/* Guide Content: YouTube */}
                          {activeTutorialTab === "youtube" ? (
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-red-100">
                              <div className="flex items-center gap-2 text-red-700 font-extrabold text-xs">
                                <YouTubeIcon size={16} />
                                <span>Steps to Upload Video to YouTube (Unlisted Mode)</span>
                              </div>
                              <ol className="space-y-2 text-slate-700 text-xs leading-relaxed list-decimal list-inside pl-1">
                                <li>
                                  <strong>Open YouTube Studio:</strong> Open your browser and navigate to <code>studio.youtube.com</code> using your Google account.
                                </li>
                                <li>
                                  <strong>Click Create:</strong> In the upper-right corner of the dashboard, click <strong>Create</strong> and select <strong>Upload videos</strong>.
                                </li>
                                <li>
                                  <strong>Select Your Video File:</strong> Upload the recorded lecture video file from your computer.
                                </li>
                                <li>
                                  <strong>Enter Module Details:</strong> Add the module title and a concise description of learning objectives.
                                </li>
                                <li>
                                  <strong>Set Visibility to Unlisted:</strong> Under the <strong>Visibility</strong> tab, select <strong>Unlisted</strong>.
                                  <div className="mt-1 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                                    <strong>Important:</strong> Do not choose <em>Public</em> so your content does not leak to public search. Do not choose <em>Private</em> either, or enrolled students will not be able to view it. <strong>Unlisted</strong> mode ensures only students who possess the verified link can view your lecture.
                                  </div>
                                </li>
                                <li>
                                  <strong>Save and Copy Link:</strong> Click <strong>Save</strong>, copy the video URL (e.g. <code>https://youtu.be/xxxx</code> or <code>https://www.youtube.com/watch?v=xxxx</code>), and paste it into the YouTube link field in the module form below.
                                </li>
                              </ol>
                            </div>
                          ) : (
                            /* Guide Content: Google Drive */
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-100">
                              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-xs">
                                <GoogleDriveIcon size={16} />
                                <span>Steps to Upload Documents to Google Drive (Restricted Access Mode)</span>
                              </div>
                              <ol className="space-y-2 text-slate-700 text-xs leading-relaxed list-decimal list-inside pl-1">
                                <li>
                                  <strong>Open Google Drive:</strong> Go to <code>drive.google.com</code> and create a dedicated folder for your course materials.
                                </li>
                                <li>
                                  <strong>Upload Materials:</strong> Upload your module document files (PDF guides, lecture slides, companion summaries, or project ZIP archives).
                                </li>
                                <li>
                                  <strong>Open Sharing Settings:</strong> Right-click on the uploaded file or folder and click <strong>Share</strong>.
                                </li>
                                <li>
                                  <strong>Configure General Access:</strong> Choose one of the following two options:
                                  <div className="mt-1 space-y-1.5 pl-2 text-[11px]">
                                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                                      <strong>Option 1 (Recommended for Seamless Access):</strong> Set General access to <strong>Anyone with the link</strong> with the role set to <strong>Viewer</strong>. This link is secure because it is only delivered inside the authenticated course portal after the student confirms escrow payment on Arbitrum.
                                    </div>
                                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                                      <strong>Option 2 (Strict Manual Access):</strong> Keep the setting as <strong>Restricted</strong>, and manually add the student's email address once their on-chain escrow payment is confirmed.
                                    </div>
                                  </div>
                                </li>
                                <li>
                                  <strong>Copy Link:</strong> Click <strong>Copy link</strong>.
                                </li>
                                <li>
                                  <strong>Paste into Form:</strong> Paste the copied link into the Google Drive field in the module form below.
                                </li>
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* CURRICULUM MODULES LIST */}
                    <div className="space-y-4">
                      {modules.map((mod, mIdx) => (
                        <div key={mIdx} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
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

                          {/* Module Title & Description */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">
                                Module Title <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={mod.title}
                                onChange={(e) => handleUpdateModule(mIdx, "title", e.target.value)}
                                placeholder="e.g. Module 1: Solidity Storage Layout & Reentrancy Security"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-700 font-bold text-xs mb-1">
                                Module Description & Learning Outcomes
                              </label>
                              <textarea
                                rows={2}
                                value={mod.description}
                                onChange={(e) => handleUpdateModule(mIdx, "description", e.target.value)}
                                placeholder="Detail concepts, code exercises, or architecture patterns students master in this lesson..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 placeholder:text-slate-400 resize-y"
                              />
                            </div>
                          </div>

                          {/* ── PART 1: VIDEO SOURCE (YOUTUBE / CLOUDFLARE) ── */}
                          <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="block text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                                <Video size={14} className="text-purple-600" />
                                <span>Lesson Video Lecture</span>
                              </label>

                              {/* Video Method Switcher */}
                              <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/80 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateModule(mIdx, "videoSourceType", "youtube")}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    mod.videoSourceType !== "cloudflare"
                                      ? "bg-white text-slate-900 shadow-2xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  <YouTubeIcon size={13} />
                                  <span>YouTube Link (Cost-Effective)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateModule(mIdx, "videoSourceType", "cloudflare")}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    mod.videoSourceType === "cloudflare"
                                      ? "bg-white text-purple-700 shadow-2xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  <Video size={13} />
                                  <span>Cloudflare Stream</span>
                                </button>
                              </div>
                            </div>

                            {/* Option 1: YouTube Link (Unlisted) */}
                            {mod.videoSourceType !== "cloudflare" ? (
                              <div className="space-y-1.5">
                                <input
                                  type="url"
                                  value={mod.videoUrl || ""}
                                  onChange={(e) => handleUpdateModule(mIdx, "videoUrl", e.target.value)}
                                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-red-500/30 focus:border-red-500 placeholder:text-slate-400 font-mono"
                                />
                                <p className="text-[11px] text-slate-500">
                                  Make sure video visibility is set to <strong>Unlisted</strong> in YouTube Studio. Only enrolled learners with confirmed escrow payment will unlock access to this lecture.
                                </p>
                              </div>
                            ) : (
                              /* Option 2: Cloudflare Stream Native Upload */
                              <div className="space-y-2">
                                <p className="text-[11px] text-slate-500">
                                  Upload lesson video directly to encrypted Cloudflare Stream storage.
                                </p>

                                {mod.videoUploading ? (
                                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex flex-col items-center justify-center gap-2 text-center">
                                    <Loader2 size={24} className="animate-spin text-purple-600" />
                                    <span className="text-xs font-bold text-purple-900">
                                      Uploading video to Cloudflare Stream... {mod.videoProgress}%
                                    </span>
                                    <div className="w-48 h-1.5 rounded-full bg-purple-200 overflow-hidden">
                                      <div
                                        className="h-full bg-purple-600 transition-all duration-300"
                                        style={{ width: `${mod.videoProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                ) : mod.videoUid ? (
                                  <div className="p-3.5 rounded-xl bg-white border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                        <Video size={18} />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-extrabold text-slate-900 truncate">
                                          {mod.videoFileName || "Lesson Video File"}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                          <span className="text-purple-700 font-bold">UID:</span>
                                          <span>{mod.videoUid.slice(0, 16)}...</span>
                                          {mod.videoSize && (
                                            <span>• {formatFileSize(mod.videoSize)}</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 size={12} className="text-emerald-600" />
                                        <span>Gated on Cloudflare</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveModuleVideo(mIdx)}
                                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                                      >
                                        Replace
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <input
                                      type="file"
                                      id={`video-upload-${mIdx}`}
                                      accept="video/mp4,video/quicktime,video/webm"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadModuleVideo(mIdx, file);
                                      }}
                                      className="hidden"
                                    />
                                    <label
                                      htmlFor={`video-upload-${mIdx}`}
                                      className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50/40 transition-all cursor-pointer group text-center"
                                    >
                                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                        <Upload size={18} />
                                      </div>
                                      <p className="text-xs font-black text-slate-800">
                                        Click to Upload Native Video File (MP4, MOV, WebM)
                                      </p>
                                      <p className="text-[11px] text-slate-400 mt-0.5">
                                        Direct upload to Cloudflare Stream storage server
                                      </p>
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* ── PART 2: DOCUMENT SOURCE (GOOGLE DRIVE / CLOUDFLARE R2) ── */}
                          <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label className="block text-slate-800 font-extrabold text-xs flex items-center gap-1.5">
                                <FileText size={14} className="text-purple-600" />
                                <span>Curriculum Documents & Companion Files</span>
                              </label>

                              {/* Document Method Switcher */}
                              <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/80 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateModule(mIdx, "resourceSourceType", "gdrive")}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    mod.resourceSourceType !== "r2"
                                      ? "bg-white text-slate-900 shadow-2xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  <GoogleDriveIcon size={13} />
                                  <span>Google Drive Link (Cost-Effective)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateModule(mIdx, "resourceSourceType", "r2")}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    mod.resourceSourceType === "r2"
                                      ? "bg-white text-purple-700 shadow-2xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  <FileText size={13} />
                                  <span>Cloudflare R2</span>
                                </button>
                              </div>
                            </div>

                            {/* Option 1: Google Drive Link (Restricted Access) */}
                            {mod.resourceSourceType !== "r2" ? (
                              <div className="space-y-1.5">
                                <input
                                  type="url"
                                  value={mod.gdriveUrl || ""}
                                  onChange={(e) => handleUpdateModule(mIdx, "gdriveUrl", e.target.value)}
                                  placeholder="https://drive.google.com/file/d/... or https://drive.google.com/drive/folders/..."
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder:text-slate-400 font-mono"
                                />
                                <p className="text-[11px] text-slate-500">
                                  Ensure access is set to <strong>Viewer</strong> for Anyone with the link, or <strong>Restricted</strong> to enrolled student email addresses.
                                </p>
                              </div>
                            ) : (
                              /* Option 2: Cloudflare R2 Multi-File Upload */
                              <div className="space-y-2">
                                <p className="text-[11px] text-slate-500">
                                  Upload PDF slides, code walkthrough guides, or project archives to Cloudflare R2.
                                </p>

                                {mod.resources && mod.resources.length > 0 && (
                                  <div className="space-y-1.5">
                                    {mod.resources.map((resItem, rIdx) => {
                                      const resId = resItem.id || resItem.resourceId || `res-${rIdx}`;
                                      return (
                                        <div
                                          key={resId}
                                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs gap-2 shadow-2xs"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <FileText size={14} className="text-purple-600 shrink-0" />
                                            <span className="font-bold text-slate-800 truncate">
                                              {resItem.name}
                                            </span>
                                            {resItem.size && (
                                              <span className="text-[10px] text-slate-400 shrink-0">
                                                ({formatFileSize(resItem.size)})
                                              </span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[9px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-mono font-bold">
                                              R2 Gated
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveModuleResource(mIdx, resId)}
                                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                              title="Remove file"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                <div>
                                  <input
                                    type="file"
                                    id={`resource-upload-${mIdx}`}
                                    multiple
                                    accept=".pdf,.ppt,.pptx,.doc,.docx,.zip,.txt"
                                    onChange={(e) => {
                                      const files = e.target.files;
                                      if (files && files.length > 0) {
                                        Array.from(files).forEach((f) => handleUploadModuleResource(mIdx, f));
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <label
                                    htmlFor={`resource-upload-${mIdx}`}
                                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-purple-700 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                                      mod.resourceUploading ? "opacity-60 pointer-events-none" : ""
                                    }`}
                                  >
                                    {mod.resourceUploading ? (
                                      <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                      <Plus size={13} />
                                    )}
                                    <span>
                                      {mod.resourceUploading
                                        ? "Uploading Document to R2..."
                                        : "+ Upload Document (PDF, Slides, PPT, ZIP)"}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* ── PART 3: GITHUB PRACTICE REPOSITORY (OPTIONAL) ── */}
                          <div className="pt-3 border-t border-slate-200/80">
                            <label className="block text-slate-700 font-bold text-xs mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <FileCode size={13} className="text-slate-700" />
                                <span>Practice Code Repository (GitHub - Optional)</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                Open-source starter templates only
                              </span>
                            </label>
                            <input
                              type="url"
                              value={mod.githubUrl || ""}
                              onChange={(e) => handleUpdateModule(mIdx, "githubUrl", e.target.value)}
                              placeholder="https://github.com/your-username/course-repo"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-mono placeholder:text-slate-400"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Notice: Proprietary course materials and paid PDFs should be linked via Google Drive or Cloudflare R2 above.
                            </p>
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
                  {/* Gallery & Cover Selection Card */}
                  <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-50">
                      <div>
                        <h2 className="text-slate-950 font-black text-xl tracking-tight">
                          Step 4: Gig Gallery & Cover Images
                        </h2>
                        <p className="text-slate-500 text-xs mt-1">
                          Upload up to 5 images showcasing your work or curriculum. Choose one as the primary cover.
                        </p>
                      </div>
                      <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                        {galleryImages.length} / 5 Images Added
                      </span>
                    </div>

                    {/* Active Uploaded Gallery Grid (Up to 5 images) */}
                    <div>
                      <label className="block text-slate-800 font-extrabold text-xs mb-2">
                        Uploaded Showcase Gallery ({galleryImages.length}/5)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {galleryImages.map((imgUrl, idx) => {
                          const isCover = coverIndex === idx;
                          return (
                            <div
                              key={idx}
                              className={`relative rounded-2xl overflow-hidden border-2 transition-all flex flex-col justify-between bg-slate-900 group ${
                                isCover
                                  ? "border-purple-600 ring-3 ring-purple-500/25 shadow-md"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="h-24 w-full overflow-hidden relative">
                                <img
                                  src={imgUrl}
                                  alt={`Gig Image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {isCover && (
                                  <span className="absolute top-1.5 left-1.5 bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                                    Primary Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-950/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <div className="p-2 bg-white flex items-center justify-between border-t border-slate-100">
                                <span className="text-[10px] font-bold text-slate-500">Image {idx + 1}</span>
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCover(idx)}
                                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                                  >
                                    Set as Cover
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Add image slot button if less than 5 */}
                        {galleryImages.length < 5 && (
                          <label className="h-32 rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group">
                            <Upload size={20} className="text-purple-600 group-hover:scale-110 transition-transform mb-1" />
                            <span className="text-[11px] font-bold text-purple-800">Add More</span>
                            <span className="text-[10px] text-purple-600/70">(Up to 5)</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleMultipleFileUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Presets */}
                    <div>
                      <label className="block text-slate-800 font-extrabold text-xs mb-2">
                        Add from Curated Presets:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {COVER_PRESETS.map((preset) => {
                          const isAlreadyInGallery = galleryImages.includes(preset.url);
                          return (
                            <button
                              key={preset.url}
                              type="button"
                              onClick={() => {
                                if (isAlreadyInGallery) {
                                  const idx = galleryImages.indexOf(preset.url);
                                  handleSetCover(idx);
                                } else if (galleryImages.length < 5) {
                                  setGalleryImages((prev) => [...prev, preset.url]);
                                } else {
                                  alert("Maximum of 5 images allowed. Remove an image first.");
                                }
                              }}
                              className="relative rounded-xl overflow-hidden border border-slate-200 hover:border-purple-400 text-left transition-all group cursor-pointer"
                            >
                              <div className="h-14 w-full overflow-hidden bg-slate-900">
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="p-1.5 bg-white flex items-center justify-between text-[10px] font-bold text-slate-700">
                                <span className="truncate">{preset.label}</span>
                                {isAlreadyInGallery && <CheckCircle2 size={12} className="text-purple-600 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Image URL Upload */}
                    <div className="pt-2">
                      <label className="block text-slate-800 font-extrabold text-xs mb-1">
                        Or Add Image by URL (Web link)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={customCoverUrl}
                          onChange={(e) => setCustomCoverUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/... or hosted screenshot"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          disabled={!customCoverUrl.trim() || galleryImages.length >= 5}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          + Add Image
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Smart Contract Settlement & Payout Destination Check */}
                  <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-purple-50">
                      <div>
                        <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                          <ShieldCheck size={18} className="text-emerald-600" />
                          <span>Smart Contract Escrow Payout Binding</span>
                        </h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Verification of on-chain payout destination before publishing to explore catalog.
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-200">
                        Arbitrum One
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Settlement Currency
                        </span>
                        <div className="flex items-center gap-1.5 font-black text-slate-900 text-sm">
                          {currency === "USDC" ? <UsdcIcon size={18} /> : <UsdtIcon size={18} />}
                          <span>{currency} (Arbitrum)</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Escrow Protection
                        </span>
                        <div className="flex items-center gap-1.5 font-black text-emerald-700 text-sm">
                          <Shield size={16} />
                          <span>EscrowRouter.sol</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                          Payout Recipient Wallet
                        </span>
                        {isWalletLocked ? (
                          <div className="flex items-center gap-1 font-mono text-xs font-black text-emerald-700 truncate">
                            <Lock size={12} className="shrink-0" />
                            <span className="truncate">{lockedAddress?.slice(0, 8)}...{lockedAddress?.slice(-6)}</span>
                          </div>
                        ) : (
                          <span className="text-rose-600 font-extrabold text-xs flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Not Locked
                          </span>
                        )}
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

                  {/* ── Step 4: Curriculum Gating Check Box (Part 4) ── */}
                  <div className="bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-white rounded-3xl border-2 border-purple-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                        <ShieldCheck size={12} className="text-purple-600" />
                        <span>Pre-Publish Escrow Gating Verification</span>
                      </div>
                      <h3 className="text-slate-950 font-black text-base">
                        Preview Gated Learner Experience Before Deploying
                      </h3>
                      <p className="text-slate-600 text-xs max-w-xl leading-relaxed">
                        Verify that non-paying learners see locked video placeholders and restricted documents, while confirmed escrow deposits unlock signed Cloudflare Stream & R2 links.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowStudentPreview(true)}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      <Eye size={15} />
                      <span>Preview Gated View</span>
                    </button>
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

                  {currentStep === 4 && (
                    <button
                      type="button"
                      onClick={() => setShowStudentPreview(true)}
                      className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>Preview as Student</span>
                    </button>
                  )}

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
                      className={`px-7 py-3 rounded-xl text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 ${
                        !isWalletLocked
                          ? "bg-slate-500 hover:bg-slate-600 shadow-slate-500/20"
                          : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/25"
                      }`}
                    >
                      {!isWalletLocked ? (
                        <>
                          <Lock size={16} />
                          <span>Lock Payout Wallet to Publish</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>{isSubmitting ? "Deploying Offering to Arbitrum..." : "Publish Gig to Explore"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* ── PART 4: STUDENT PREVIEW MODAL (UNPAID VS PAID) ── */}
              {showStudentPreview && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                  <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-purple-100 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider">
                          <Eye size={12} className="text-purple-600" />
                          <span>Student View Verification</span>
                        </div>
                        <h3 className="text-slate-950 font-black text-lg sm:text-xl">
                          Curriculum Gating Experience Preview
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowStudentPreview(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* View Mode Switcher: Unpaid vs Paid */}
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-700">
                        Simulate Student Account Status:
                      </span>
                      <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setPreviewMode("unpaid")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            previewMode === "unpaid"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <Lock size={12} />
                          <span>Unpaid Learner (Before Escrow)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode("paid")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            previewMode === "paid"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <CheckCircle2 size={12} />
                          <span>Paid Learner (Escrow Confirmed)</span>
                        </button>
                      </div>
                    </div>

                    {/* Explanation Banner */}
                    {previewMode === "unpaid" ? (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2.5">
                        <Lock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Unpaid Learner View Active:</strong>
                          <p className="text-amber-800 text-[11px] mt-0.5">
                            This is what prospective students see before funding escrow on Arbitrum. Video streams are locked with no public URLs leaked; documents are disabled until smart contract escrow confirms.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-900 text-xs flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Paid Learner View Active:</strong>
                          <p className="text-emerald-800 text-[11px] mt-0.5">
                            This is what enrolled students see once their Arbitrum milestone escrow is confirmed. Cloudflare Stream generates a 1-hour signed playback token; document downloads issue a 15-minute presigned R2 link.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Modules Render List */}
                    <div className="space-y-4">
                      {modules.map((mod, i) => (
                        <GatedModulePlayer
                          key={mod.id || i}
                          module={mod}
                          forceUnpaidPreview={previewMode === "unpaid"}
                          isPaidPreview={previewMode === "paid"}
                        />
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowStudentPreview(false)}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 cursor-pointer"
                      >
                        Done Previewing
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
