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
} from "lucide-react";
import Footer from "@/src/components/Footer";
import { CurrencyBadge, formatPriceCurrency } from "@/src/components/CurrencyBadge";

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
  const [paymentMethod, setPaymentMethod] = useState("usdc");

  // Processing & booking state
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
  const platformFee = Number((basePrice * 0.05).toFixed(2));
  const grandTotal = basePrice + platformFee;

  // Payment methods with dynamic currency support
  const paymentMethods = [
    {
      id: "crypto",
      label: `${currency} (Arbitrum One)`,
      sub: `Native smart contract escrow settlement in ${currency}`,
      isWeb3: true,
    },
    {
      id: "card",
      label: "Credit or Debit Card",
      sub: "Visa, Mastercard, Amex (Auto-settled)",
      isWeb3: false,
    },
    {
      id: "mobile",
      label: "Instant Mobile Checkout",
      sub: "Apple Pay, Google Pay, or QRIS",
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
              {/* Header overview */}
              <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-md border-2 border-purple-200/80 bg-slate-100">
                  <img
                    src={item.mentorPhoto || item.coverImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                    alt={isMentor ? item.name : item.mentorName}
                    className="w-full h-full object-cover"
                  />
                </div>
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
                  <p className="text-slate-500 text-xs mt-1">
                    Guided by <span className="font-bold text-purple-700">{isMentor ? item.name : item.mentorName}</span> • {item.rating || 4.9} ★ Rating
                  </p>
                </div>
              </div>

              {/* Online Meeting Platform Indicator */}
              {item.meetingPlatform && (
                <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📹</span>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">Online Meeting Platform</span>
                      <span className="font-extrabold text-slate-900">{item.meetingPlatform}</span>
                    </div>
                  </div>
                  <span className="text-purple-700 font-bold text-[11px] bg-white px-2.5 py-1 rounded-full border border-purple-200">
                    Live Session
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
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              {pkg.duration}
                            </span>
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

                {/* Web3 Connected Info if USDC is chosen */}
                {paymentMethod === "usdc" && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-purple-600" />
                      <span className="font-semibold text-purple-900">
                        {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Web3 Escrow Ready"}
                      </span>
                    </div>
                    {!walletAddress && (
                      <button
                        type="button"
                        onClick={connectWallet}
                        className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
                      >
                        Connect Wallet
                      </button>
                    )}
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
                        ? `${selectedPackage?.name} • ${selectedPackage?.duration}`
                        : isMentor
                        ? `Session: ${selectedDate} • ${selectedSlot}`
                        : `${item.duration}`}
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
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">5%</span>
                    </span>
                    <span className="font-bold text-slate-900">{formatPriceCurrency(platformFee, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Arbitrum Gas Subsidies</span>
                    <span className="font-bold text-emerald-600">FREE (Zero Gas)</span>
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

                {/* Deposit CTA Button */}
                <button
                  type="button"
                  onClick={handleDepositEscrow}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-purple-900/30 hover:shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Lock size={16} className="animate-bounce text-emerald-300" />
                      <span>Deploying Escrow Smart Lock...</span>
                    </span>
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
                    <span>Session link & mentor contact added to your dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
