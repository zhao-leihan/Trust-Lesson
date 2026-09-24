"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import {
  Shield,
  Clock,
  ArrowLeft,
  Calendar,
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle2,
  Lock,
  ArrowRight,
  Layers,
  Wallet,
  Video,
  ExternalLink,
  Copy,
  Check,
  Building2,
  QrCode,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Footer from "@/src/components/Footer";
import { CurrencyBadge, formatPriceCurrency, UsdcIcon, UsdtIcon, ArbitrumIcon } from "@/src/components/CurrencyBadge";
import { getActiveNetwork } from "@/lib/networkConfig";

function GoogleMeetIcon({ className = "w-6 h-6" }) {
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

function ZoomIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#2D8CFF"/>
      <path d="M4.5 9C4.5 7.62 5.62 6.5 7 6.5H13C14.38 6.5 15.5 7.62 15.5 9V15C15.5 16.38 14.38 17.5 13 17.5H7C5.62 17.5 4.5 16.38 4.5 15V9Z" fill="white"/>
      <path d="M16.5 10.2L19.5 7.8C19.8 7.6 20.2 7.8 20.2 8.2V15.8C20.2 16.2 19.8 16.4 19.5 16.2L16.5 13.8V10.2Z" fill="white"/>
    </svg>
  );
}

function DiscordIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#5865F2"/>
      <path d="M18.1 7.15C17.07 6.67 15.96 6.32 14.81 6.13C14.67 6.38 14.51 6.72 14.4 6.98C13.18 6.8 11.96 6.8 10.76 6.98C10.65 6.72 10.49 6.38 10.35 6.13C9.2 6.32 8.09 6.67 7.06 7.15C5.03 10.15 4.47 13.07 4.74 15.95C6.09 16.95 7.4 17.55 8.68 17.95C9 17.52 9.28 17.05 9.51 16.55C9.05 16.38 8.61 16.16 8.2 15.9C8.31 15.82 8.42 15.74 8.52 15.65C11.14 16.85 13.99 16.85 16.59 15.65C16.69 15.74 16.8 15.82 16.91 15.9C16.5 16.16 16.06 16.38 15.6 16.55C15.83 17.05 16.11 17.52 16.43 17.95C17.71 17.55 19.03 16.95 20.37 15.95C20.69 12.61 19.82 9.72 18.1 7.15ZM9.68 14.28C8.94 14.28 8.33 13.6 8.33 12.77C8.33 11.94 8.92 11.26 9.68 11.26C10.44 11.26 11.05 11.94 11.03 12.77C11.03 13.6 10.44 14.28 9.68 14.28ZM15.44 14.28C14.7 14.28 14.09 13.6 14.09 12.77C14.09 11.94 14.68 11.26 15.44 11.26C16.2 11.26 16.81 11.94 16.79 12.77C16.79 13.6 16.2 14.28 15.44 14.28Z" fill="white"/>
    </svg>
  );
}

const timeSlots = [
  "09:00 AM",
  "10:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "07:30 PM",
];

const availableDates = [
  { day: "Today", date: "Sep 20" },
  { day: "Tomorrow", date: "Sep 21" },
  { day: "Monday", date: "Sep 22" },
  { day: "Tuesday", date: "Sep 23" },
  { day: "Wednesday", date: "Sep 24" },
];

export default function BookingPage() {
  const params = useParams();
  const type = params?.type;
  const id = params?.id;
  const { addSession, walletAddress, connectWallet } = useAuth();

  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState("Sep 21");
  const [selectedSlot, setSelectedSlot] = useState("10:30 AM");
  const [packageType, setPackageType] = useState("single"); // 'single' | 'pack'
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [studentNote, setStudentNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("crypto");
  const [copiedVault, setCopiedVault] = useState(false);
  const [showTransakModal, setShowTransakModal] = useState(false);

  // Processing & booking state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingItem(true);
    fetch(`/api/explore/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        if (data.offering) setItem(data.offering);
      })
      .catch(() => {
        fetch("/api/explore")
          .then((res) => res.json())
          .then((cat) => {
            const found = (cat.offerings || []).find((o) => String(o.id) === String(id));
            if (found) setItem(found);
          })
          .catch(() => {});
      })
      .finally(() => setLoadingItem(false));
  }, [id]);

  const isMentor = type === "mentor" || item?.offeringType === "mentor";

  if (loadingItem) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center p-4 pt-28">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm border border-slate-200 shadow-sm animate-pulse">
            <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center p-4 pt-28">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm border border-slate-200 shadow-sm">
            <h2 className="text-slate-900 font-extrabold text-xl mb-2">Offering Not Found</h2>
            <p className="text-slate-500 text-xs mb-6">
              The mentor session or gig you requested is unavailable or has expired.
            </p>
            <Link
              href="/explore"
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors inline-block"
            >
              Browse Offerings
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculations & Currency
  const currency = item?.currency || "USDC";
  const hasPackages = Boolean(item?.packages && item.packages.length > 0);
  const selectedPackage = hasPackages ? item.packages[selectedPkgIndex] : null;

  const basePrice = hasPackages
    ? Number(selectedPackage?.price) || Number(item.price) || 0
    : isMentor
    ? packageType === "pack"
      ? item.price * 5 * 0.9
      : item.price
    : item.price;
  const platformFee = Number((basePrice * 0.10).toFixed(2));
  const grandTotal = basePrice + platformFee;
  const activeNet = getActiveNetwork();
  const escrowVaultAddress = activeNet.contracts.escrowRouter;
  const transakApiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "4fcd6904-706b-4aa4-bd68-2495b452e805";
  const destinationWallet = (walletAddress && walletAddress.startsWith("0x") && walletAddress.length === 42)
    ? walletAddress
    : escrowVaultAddress;
  const safeTransakAmount = Math.max(30, Math.round(grandTotal));
  const transakTesterUrl = `https://global-stg.transak.com/?apiKey=${transakApiKey}&environment=${activeNet.transakEnv}&cryptoCurrencyCode=${currency === "USDT" ? "USDT" : "USDC"}&network=arbitrum&walletAddress=${destinationWallet}&fiatAmount=${safeTransakAmount}&fiatCurrency=USD&themeColor=7c3aed&disableWalletAddressForm=true`;

    {
      id: "crypto",
      label: `${currency} (Web3 Connected Wallet)`,
      sub: `Deposit directly from MetaMask, Coinbase, or Rabby with 100% Subsidized Gas`,
      Icon: Wallet,
      isWeb3: true,
    },
    {
      id: "transak",
      label: `Buy ${currency} via Transak (Credit Card / Apple Pay)`,
      sub: `Fiat-to-crypto on-ramp directly to your Arbitrum wallet via Visa, Mastercard, or Apple Pay`,
      Icon: CreditCard,
      isWeb3: false,
    },
  ];

  // Handle escrow deposit action
  const handleDepositEscrow = () => {
    setIsProcessing(true);

    const newSession = {
      id: Date.now(),
      mentor: isMentor ? item.name : item.mentorName,
      skill: isMentor ? item.skill : item.title,
      date: isMentor ? selectedDate : "Kickoff This Week",
      time: hasPackages ? selectedPackage?.duration : (isMentor ? selectedSlot : item.duration),
      price: grandTotal,
      currency,
      status: "locked",
      escrowStatus: "Locked",
      type: isMentor ? "session" : "course",
      note: studentNote,
    };

    setTimeout(() => {
      setIsProcessing(false);
      setIsBooked(true);
      addSession(newSession);
    }, 1400);
  };

  // If Booking is Completed
  if (isBooked) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="pt-28 pb-20 px-4 sm:px-6 flex-1 flex items-center justify-center">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 border border-purple-100 shadow-2xl text-center flex flex-col items-center gap-6 relative overflow-hidden">
            {/* Ambient celebration confetti / glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Mascot celebration */}
            <img
              src="/monsters/happy.png"
              alt="Happy Lesson Monster"
              className="w-24 h-auto object-contain animate-bounce drop-shadow-lg"
            />

            <div>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold mb-3">
                <Lock size={12} className="text-emerald-600" />
                <span>Arbitrum Smart Contract Vault Locked</span>
              </span>
              <h1 className="text-slate-900 font-extrabold text-2xl sm:text-3xl">
                Escrow Deposit Secured!
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Your deposit of <span className="font-extrabold text-purple-700">{formatPriceCurrency(grandTotal, currency)}</span> is now safely locked in escrow. The mentor cannot claim payment until you confirm completion.
              </p>
            </div>

            <div className="w-full bg-slate-50 rounded-2xl p-4 text-left flex flex-col gap-2.5 text-xs text-slate-700 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Offering:</span>
                <span className="font-bold text-slate-900">{isMentor ? item.skill : item.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Mentor:</span>
                <span className="font-bold text-purple-700">{isMentor ? item.name : item.mentorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Schedule:</span>
                <span className="font-bold text-slate-900">
                  {isMentor ? `${selectedDate}, ${selectedSlot}` : item.duration}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-400 font-medium">Escrow Security:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>100% Protected on Arbitrum</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link
                href="/dashboard"
                className="flex-1 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-500/25"
              >
                <span>View in Dashboard</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/explore"
                className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Explore More
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="pt-28 pb-16 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Back Link */}
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-700 text-xs font-bold mb-6 group transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Explore Catalog</span>
          </Link>

          {/* 2-Column Dedicated Checkout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Configuration */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              {/* Offering Cover Banner */}
              {(() => {
                const galleryList = Array.isArray(item.galleryImages) && item.galleryImages.length > 0
                  ? item.galleryImages
                  : [item.coverImage || item.image || item.mentorPhoto || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"];
                const currentBannerImg = galleryList[activeImageIndex] || galleryList[0];

                return (
                  <div>
                    <div className="relative w-full h-48 sm:h-60 rounded-2xl overflow-hidden bg-slate-900 border border-purple-100 shadow-xs">
                      <img
                        src={currentBannerImg}
                        alt={isMentor ? item.skill : item.title}
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-bold text-white bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                          {isMentor ? "Mentorship Session" : "Milestone Offering"}
                        </span>
                        {item.category && (
                          <span className="text-[11px] font-bold text-purple-200 bg-purple-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-purple-400/30">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Gallery Thumbnails (If offering has multiple images) */}
                    {galleryList.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
                        {galleryList.map((imgUrl, gIdx) => (
                          <button
                            key={gIdx}
                            type="button"
                            onClick={() => setActiveImageIndex(gIdx)}
                            className={`w-14 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              activeImageIndex === gIdx
                                ? "border-purple-600 scale-105 shadow-sm"
                                : "border-slate-200 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={imgUrl} alt={`Thumb ${gIdx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Header overview with Mentor Profile Link */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                <Link
                  href={`/mentor/${encodeURIComponent(item.mentorId || item.mentorName || item.name || "verified-mentor")}`}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-md border-2 border-purple-200/80 bg-slate-100 group relative cursor-pointer"
                  title="View Mentor Profile"
                >
                  <img
                    src={item.mentorPhoto || item.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                    alt={isMentor ? item.name : item.mentorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-purple-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                    View
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Shield size={11} /> 100% Verified Escrow
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {isMentor ? item.skill : item.title}
                  </h1>
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>Guided by</span>
                    <Link
                      href={`/mentor/${encodeURIComponent(item.mentorId || item.mentorName || item.name || "verified-mentor")}`}
                      className="font-bold text-purple-700 hover:text-purple-900 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isMentor ? item.name : item.mentorName}</span>
                      <ExternalLink size={11} className="text-purple-500" />
                    </Link>
                    <span>• {item.rating || 4.9} ★ Rating</span>
                  </p>
                </div>
              </div>

              {/* Online Meeting Platform Indicator (Clean SVG Icons, No Emoji) */}
              {item.meetingPlatform && (
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs border border-purple-100 flex items-center justify-center shrink-0">
                      {item.meetingPlatform.toLowerCase().includes("zoom") ? (
                        <ZoomIcon className="w-5 h-5 text-blue-500" />
                      ) : item.meetingPlatform.toLowerCase().includes("discord") ? (
                        <DiscordIcon className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <GoogleMeetIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">Online Meeting Platform</span>
                      <span className="font-extrabold text-slate-900">{item.meetingPlatform}</span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-[11px] bg-white px-2.5 py-1 rounded-full border border-purple-200">
                    Live Sessions
                  </span>
                </div>
              )}

              {/* Package Tiers Selection (If Offering Has Packages) */}
              {hasPackages ? (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-slate-900 font-extrabold text-xs block">
                      Select Package Tier ({item.packages.length} Available):
                    </label>
                    <CurrencyBadge currency={currency} size="sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {item.packages.map((pkg, pIdx) => {
                      const isSelected = selectedPkgIndex === pIdx;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setSelectedPkgIndex(pIdx)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-purple-600 bg-purple-50/70 text-purple-950 font-bold shadow-md shadow-purple-600/15 scale-[1.02]"
                              : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                                {pkg.tier || `Tier ${pIdx + 1}`}
                              </span>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                            </div>
                            <p className="text-xs font-black text-slate-950">{pkg.name}</p>
                            <p className="text-[11px] text-slate-500 font-normal mt-1 line-clamp-2">{pkg.description}</p>
                          </div>
                          <div className="pt-3 mt-3 border-t border-purple-100/60">
                            <p className="text-purple-700 font-black text-base">
                              {formatPriceCurrency(pkg.price, currency)}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-purple-800 font-semibold mt-1">
                              <Video size={11} className="text-purple-600 shrink-0" />
                              <span className="truncate">{pkg.duration || "1 Live Meeting"}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : isMentor ? (
                <div>
                  <label className="text-slate-900 font-extrabold text-xs mb-2.5 block">
                    Select Mentorship Package:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPackageType("single")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        packageType === "single"
                          ? "border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <p className="text-xs font-bold">Single 1-on-1 Session</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-normal">60 minutes live screen-share call</p>
                      <p className="text-slate-900 font-black text-lg mt-2">
                        {formatPriceCurrency(item.price, currency)}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPackageType("pack")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                        packageType === "pack"
                          ? "border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-sm"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Save 10%
                      </span>
                      <p className="text-xs font-bold">5-Session Accelerator</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Multi-week structured mentorship</p>
                      <p className="text-slate-900 font-black text-lg mt-2">
                        {formatPriceCurrency(item.price * 5 * 0.9, currency)}
                      </p>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Date & Time (for mentors) */}
              {isMentor && (
                <div>
                  <label className="text-slate-900 font-extrabold text-xs mb-2 block flex items-center gap-1.5">
                    <Calendar size={13} className="text-purple-600" />
                    <span>Select Preferred Session Date:</span>
                  </label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
                    {availableDates.map((d) => (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDate(d.date)}
                        className={`px-4 py-2.5 rounded-2xl text-center flex-shrink-0 transition-all cursor-pointer ${
                          selectedDate === d.date
                            ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-500/25 scale-102"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                        }`}
                      >
                        <p className="text-[10px] opacity-80 uppercase tracking-wider">{d.day}</p>
                        <p className="text-xs font-bold mt-0.5">{d.date}</p>
                      </button>
                    ))}
                  </div>

                  <label className="text-slate-900 font-extrabold text-xs mb-2 block flex items-center gap-1.5">
                    <Clock size={13} className="text-purple-600" />
                    <span>Select Time Slot:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                            : "border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone Details (for gigs) */}
              {!isMentor && item.milestones && (
                <div>
                  <label className="text-slate-900 font-extrabold text-xs mb-2 block flex items-center gap-1.5">
                    <Layers size={13} className="text-purple-600" />
                    <span>Escrow Milestone Deliverables ({item.milestones.length} Stages):</span>
                  </label>
                  <div className="space-y-2">
                    {item.milestones.map((m, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{m.title}</span>
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">${m.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussion Notes */}
              <div>
                <label className="text-slate-900 font-extrabold text-xs mb-1.5 block">
                  Session Agenda & Topics to Cover (Optional):
                </label>
                <textarea
                  rows={2}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Describe your current project, blockers, codebase links, or goals for this session..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="text-slate-900 font-extrabold text-xs mb-2 block">
                  Select Settlement Method:
                </label>
                <div className="space-y-2">
                  {paymentMethods.map(({ id: pid, label, sub, Icon, isWeb3 }) => (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setPaymentMethod(pid)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentMethod === pid
                          ? "border-purple-600 bg-purple-50/50 text-slate-950 font-bold shadow-xs"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          paymentMethod === pid
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-slate-900">{label}</p>
                          {isWeb3 && (
                            <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                              Arbitrum Native
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal mt-0.5">{sub}</p>
                      </div>
                      {paymentMethod === pid && (
                        <CheckCircle2 size={18} className="text-purple-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Method 1: Web3 Connected Wallet */}
                {paymentMethod === "crypto" && (
                  <div className="mt-3 p-4 bg-purple-50/80 rounded-2xl border border-purple-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-purple-600" />
                        <span className="font-extrabold text-xs text-purple-950">
                          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Web3 Browser Wallet"}
                        </span>
                      </div>
                      {!walletAddress ? (
                        <button
                          type="button"
                          onClick={connectWallet}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          Connect Wallet
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} /> Ready to Escrow
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Compatible with MetaMask, Coinbase Wallet, Rabby, and OKX Wallet on Arbitrum One. When you click deposit, all gas fees are 100% subsidized by the platform sponsor vault.
                    </p>
                  </div>
                )}

                {/* Method 2: Transak Fiat On-Ramp */}
                {paymentMethod === "transak" && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 rounded-2xl border border-blue-200/90 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <CreditCard size={18} />
                      </div>
                      <div className="text-xs">
                        <p className="font-extrabold text-slate-900">Transak Fiat On-Ramp Gateway</p>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                          Purchase {currency} directly into your Arbitrum wallet using Visa, Mastercard, Apple Pay, or Local Bank Transfer.
                        </p>
                      </div>
                    </div>

                    {/* Regional Availability Notice */}
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2.5">
                      <Shield size={14} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <p className="font-bold text-amber-950">Regional Availability Notice:</p>
                        <p className="text-amber-800 text-[10px] mt-0.5">
                          Please note that Transak fiat on-ramp services may be restricted or unavailable in certain countries due to local financial regulations and compliance policies. If unavailable in your region, please use Web3 Wallet or Direct Transfer.
                        </p>
                      </div>
                    </div>

                    {/* Auto-filled Summary snippet */}
                    <div className="p-2.5 bg-white/90 rounded-xl border border-blue-200 text-[11px] flex items-center justify-between text-slate-700 shadow-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Auto-Filled Payment:</span>
                        <span className="font-extrabold text-blue-900">{formatPriceCurrency(grandTotal, currency)}</span>
                        <span className="text-[10px] text-slate-500 ml-1">on Arbitrum One</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles size={11} /> Sandbox Tester
                      </span>
                    </div>

                    {/* Ready Indicator: Click Deposit button on the right */}
                    <div className="p-3 bg-blue-100/70 rounded-xl border border-blue-200 text-blue-900 text-xs flex items-center gap-2.5">
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                      <span className="text-[11px] leading-snug">
                        Ready for checkout. Click <strong className="text-blue-950 font-bold">&quot;Proceed to Transak Payment&quot;</strong> in the summary panel on the right to open the payment widget.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: REVAMPED CHECKOUT SUMMARY WITH MASCOT */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              {/* Monster Escrow Guardian Perched on Top */}
              <div className="flex items-end justify-between px-3 -mb-6 relative z-20 pointer-events-none">
                <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white text-[10px] sm:text-[11px] font-bold py-1 px-3 rounded-2xl rounded-bl-none shadow-xl border border-purple-500/40 flex items-center gap-1.5 animate-bounce mb-3">
                  <Shield size={13} className="text-emerald-400" />
                  <span>100% Escrow Guarded!</span>
                </div>
                <img
                  src="/monsters/oke pose.png"
                  alt="Barnaby the Escrow Guardian"
                  className="w-24 sm:w-28 h-auto object-contain drop-shadow-2xl animate-float"
                />
              </div>

              {/* Main Checkout Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-200/80 shadow-xl shadow-purple-950/5 space-y-5 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 block">
                      Arbitrum Escrow Checkout
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                      Deposit to Escrow Vault
                    </h2>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Vault Ready
                  </span>
                </div>

                {/* Smart Escrow Protection Banner */}
                <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-white p-4 sm:p-5 rounded-2xl relative overflow-hidden border border-purple-500/30 shadow-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-3.5 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                      <Shield size={20} />
                    </div>
                    <div className="text-xs">
                      <p className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        <span>Trust Lesson Escrow Shield</span>
                      </p>
                      <p className="text-purple-200/80 text-[11px] mt-1 leading-relaxed">
                        Your funds stay locked in an audited Arbitrum smart contract vault. The mentor cannot withdraw payment until you approve the completed session or deliverables.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Offering Summary snippet */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 line-clamp-1">{isMentor ? item.skill : item.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {hasPackages
                        ? `${selectedPackage?.name} • ${selectedPackage?.duration || "1 Live Meeting"}`
                        : isMentor
                        ? `Session: ${selectedDate} • ${selectedSlot}`
                        : `${item.duration || "1 Live Meeting"}`}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 text-sm">
                    {formatPriceCurrency(basePrice, currency)}
                  </span>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Offering Base Price</span>
                    <span className="font-bold text-slate-900">{formatPriceCurrency(basePrice, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Platform Protocol Cut</span>
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">10%</span>
                    </span>
                    <span className="font-bold text-slate-900">{formatPriceCurrency(platformFee, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 text-xs">
                    <span>Arbitrum Gas Fee</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px]">
                      FREE (100% Subsidized)
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex items-baseline justify-between text-slate-950">
                    <div>
                      <span className="font-extrabold text-base block">Total Due</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Settled in {currency}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-purple-600 font-black text-xl sm:text-2xl leading-none">
                        {formatPriceCurrency(grandTotal, currency)}
                      </span>
                      <CurrencyBadge currency={currency} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Deposit / Transak CTA Button */}
                <button
                  type="button"
                  onClick={paymentMethod === "transak" ? () => setShowTransakModal(true) : handleDepositEscrow}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-900/30 hover:shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Lock size={16} className="animate-bounce text-emerald-300" />
                      <span>Deploying Escrow Smart Lock...</span>
                    </span>
                  ) : paymentMethod === "transak" ? (
                    <>
                      <CreditCard size={16} />
                      <span>Proceed to Transak Payment ({formatPriceCurrency(grandTotal, currency)})</span>
                      <ArrowRight size={15} />
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Deposit {formatPriceCurrency(grandTotal, currency)} to Escrow</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Reassurance points with check icons */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>100% money-back guarantee if session is cancelled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Non-custodial smart escrow verified on Arbitrum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Zero gas fee • Platform sponsor covers 100% of Arbitrum network costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Session link & mentor contact added to your dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* IN-APP TRANSAK SANDBOX TESTER MODAL (AUTO-FILLED ESCROW FUNDS)   */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {showTransakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-purple-200 shadow-2xl overflow-hidden flex flex-col relative animate-scaleUp max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs flex items-center gap-1.5">
                    <span>Transak Sandbox Tester</span>
                    <span className="text-[9px] bg-blue-500/30 text-blue-200 px-2 py-0.2 rounded-full font-mono uppercase font-bold">
                      Staging Mode
                    </span>
                  </h3>
                  <p className="text-[10px] text-purple-200/80">
                    Auto-filled: {formatPriceCurrency(grandTotal, currency)} on Arbitrum One
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTransakModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Diagnostic Notice for T-INF-002 & Regional ISP blocks */}
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <Shield size={13} className="text-amber-600 shrink-0" />
                <span className="text-[10px] leading-tight text-amber-900">
                  <strong>Staging Gateway Notice:</strong> If Transak displays <em>&quot;Error code: T-INF-002&quot;</em> or regional ISP block, you can open in a new tab or click instant simulation below.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const iframe = document.getElementById("transakIframe");
                  if (iframe) iframe.src = transakTesterUrl;
                }}
                className="text-[10px] font-bold text-purple-700 hover:text-purple-900 shrink-0 flex items-center gap-0.5 cursor-pointer px-2 py-1 rounded-md hover:bg-purple-100"
              >
                <RefreshCw size={10} /> Reload
              </button>
            </div>

            {/* Embedded Transak Widget Iframe */}
            <div className="relative w-full h-[480px] bg-slate-100 flex items-center justify-center">
              <iframe
                id="transakIframe"
                src={transakTesterUrl}
                allow="camera;microphone;fullscreen;payment"
                className="w-full h-full border-0"
                title="Transak Sandbox Tester"
              />
            </div>

            {/* Footer with testing actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <span className="text-[10px] text-slate-500 font-medium">
                Sandbox Mode (Simulated deposit for testing)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={transakTesterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                >
                  <span>Open Tab</span>
                  <ExternalLink size={11} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransakModal(false);
                    handleDepositEscrow();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <Check size={13} />
                  <span>Simulate Payment & Lock Escrow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
