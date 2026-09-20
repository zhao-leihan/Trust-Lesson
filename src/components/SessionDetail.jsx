import { useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Star,
  Shield,
  MessageCircle,
  CreditCard,
  Smartphone,
  DollarSign,
  ChevronDown,
  Check,
  Lock,
} from "lucide-react";

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
];

const paymentMethods = [
  { id: "card", label: "Credit / Debit card", Icon: CreditCard },
  { id: "apple", label: "Apple Pay", Icon: Smartphone },
  { id: "google", label: "Google Pay", Icon: Smartphone },
  { id: "usdc", label: "USDC stablecoin", Icon: DollarSign },
];

export default function SessionDetail({ mentor, onBack, onBook }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [packageType, setPackageType] = useState("single");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [booked, setBooked] = useState(false);
  const [showLock, setShowLock] = useState(false);

  if (!mentor) {
    return (
      <div className="flex flex-col h-full bg-white rounded-3xl items-center justify-center text-center p-8 gap-4">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" fill="#ECE9FF" />
          <rect x="24" y="32" width="32" height="24" rx="6" fill="#8B7CF6" opacity="0.3" />
          <circle cx="40" cy="28" r="8" fill="#8B7CF6" opacity="0.4" />
        </svg>
        <p className="text-navy font-semibold text-lg">Select a mentor</p>
        <p className="text-navy/50 text-sm">Click any mentor card to view session details</p>
      </div>
    );
  }

  const basePrice = packageType === "pack" ? mentor.price * 5 * 0.9 : mentor.price;
  const fee = basePrice * 0.07;
  const total = basePrice + fee;

  const handleBook = () => {
    if (!selectedSlot) return;
    setShowLock(true);
    setTimeout(() => {
      setShowLock(false);
      setBooked(true);
      onBook && onBook(mentor);
    }, 1500);
  };

  if (booked) {
    return (
      <div className="flex flex-col h-full bg-white rounded-3xl items-center justify-center text-center p-8 gap-5">
        <div className="w-20 h-20 rounded-full bg-mint flex items-center justify-center">
          <Check size={36} className="text-white" />
        </div>
        <div>
          <p className="text-navy font-bold text-xl">Session booked!</p>
          <p className="text-navy/60 text-sm mt-1">
            Your payment is held in escrow and will be released after your session with {mentor.name}.
          </p>
        </div>
        <button
          onClick={() => setBooked(false)}
          className="px-6 py-2.5 rounded-full bg-lavender text-violet font-semibold text-sm"
        >
          Back to details
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden">
      {/* Header coral */}
      <div className="bg-coral relative p-5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center"
            aria-label="Bookmark mentor"
          >
            <Bookmark size={16} className="text-white" />
          </button>
        </div>

        {/* Illustration */}
        <div className="h-24 flex items-center justify-center">
          <svg viewBox="0 0 140 90" className="w-full max-w-[180px]">
            <circle cx="70" cy="28" r="20" fill="rgba(255,255,255,0.3)" />
            <circle cx="70" cy="26" r="10" fill="rgba(255,255,255,0.5)" />
            <rect x="50" y="48" width="40" height="24" rx="8" fill="rgba(255,255,255,0.2)" />
            <rect x="30" y="62" width="80" height="18" rx="8" fill="rgba(255,255,255,0.15)" />
          </svg>
        </div>

        <div className="flex items-start justify-between mt-2">
          <h2 className="text-white font-bold text-xl leading-tight">
            {mentor.skill}
          </h2>
          <div className="text-right">
            <p className="text-white font-bold text-2xl">${mentor.price}</p>
            <p className="text-white/70 text-xs">/ session</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        {/* Mentor info */}
        <div>
          <p className="text-navy/70 text-sm">By {mentor.name}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {mentor.verified && (
              <span className="inline-flex items-center gap-1 bg-lavender text-violet rounded-full px-2.5 py-1 text-xs font-medium">
                <Shield size={10} />
                Verified mentor
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-lavender text-navy/70 rounded-full px-2.5 py-1 text-xs">
              <Star size={10} className="text-sunshine fill-sunshine" />
              {mentor.rating}
            </span>
            <span className="text-navy/50 text-xs">
              {(mentor.sessions / 1000).toFixed(1)}k sessions
            </span>
            <span className="text-navy/50 text-xs">
              Score {mentor.reputationScore}/100
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-navy/70 text-sm leading-relaxed">{mentor.description}</p>
        </div>

        {/* Package selector */}
        <div>
          <p className="text-navy font-semibold text-sm mb-2">Package</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPackageType("single")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                packageType === "single"
                  ? "border-violet bg-lavender text-violet"
                  : "border-lavender text-navy/60"
              }`}
            >
              Single session
            </button>
            <button
              onClick={() => setPackageType("pack")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all relative ${
                packageType === "pack"
                  ? "border-violet bg-lavender text-violet"
                  : "border-lavender text-navy/60"
              }`}
            >
              5-session pack
              <span className="absolute -top-2 -right-1 bg-mint text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                −10%
              </span>
            </button>
          </div>
        </div>

        {/* Time slots */}
        <div>
          <p className="text-navy font-semibold text-sm mb-2">Pick a time</p>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                  selectedSlot === slot
                    ? "border-violet bg-lavender text-violet"
                    : "border-lavender text-navy/60 hover:border-violet/40"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Escrow explanation */}
        <div className="bg-lavender rounded-2xl p-4">
          <p className="text-navy font-semibold text-sm mb-3">
            How your payment is protected
          </p>
          <div className="flex flex-col gap-2">
            {[
              { step: "Pay now", sub: "Payment held securely" },
              { step: "Held in escrow", sub: "Released only after session" },
              { step: "Released", sub: "After you confirm completion" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-violet flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="text-navy text-xs font-semibold">{item.step}</p>
                  <p className="text-navy/50 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-navy font-semibold text-sm mb-2">Payment method</p>
          <div className="flex flex-col gap-2">
            {paymentMethods.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setPaymentMethod(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  paymentMethod === id
                    ? "border-violet bg-lavender text-violet"
                    : "border-lavender text-navy/60 hover:border-violet/30"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Price summary */}
        <div className="bg-lavender rounded-2xl p-4">
          <p className="text-navy font-semibold text-sm mb-3">Price summary</p>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-navy/70">
              <span>{packageType === "pack" ? "5 sessions" : "1 session"}</span>
              <span>${(packageType === "pack" ? mentor.price * 5 * 0.9 : mentor.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-navy/60 text-xs">
              <span>Platform fee (7%)</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-navy/10 my-1" />
            <div className="flex justify-between text-navy font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 pb-2">
          <button
            onClick={handleBook}
            disabled={!selectedSlot}
            className={`w-full py-3.5 rounded-2xl font-semibold text-white transition-all relative overflow-hidden ${
              selectedSlot
                ? "bg-violet hover:bg-violet/90 shadow-lg shadow-violet/30"
                : "bg-navy/20 cursor-not-allowed"
            }`}
          >
            {showLock ? (
              <span className="flex items-center justify-center gap-2">
                <Lock size={16} className="animate-bounce" />
                Securing escrow…
              </span>
            ) : (
              "Book session"
            )}
          </button>
          <button className="w-full py-3 rounded-2xl border-2 border-lavender text-navy font-medium text-sm hover:bg-lavender transition-all flex items-center justify-center gap-2">
            <MessageCircle size={15} />
            Message mentor
          </button>
        </div>
      </div>
    </div>
  );
}
