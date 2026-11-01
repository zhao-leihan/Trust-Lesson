"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, User, Sparkles, ArrowRight } from "lucide-react";

const PURPOSE_OPTIONS = [
  "Mentorship & Pairing Inquiry",
  "Partnership & Business Proposal",
  "Smart Contract & Security Query",
  "Platform Feedback & Suggestions",
  "Other / General Inquiry",
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    purpose: PURPOSE_OPTIONS[0],
    message: "",
  });
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please complete all required fields before submitting.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message. Please try again.");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        purpose: PURPOSE_OPTIONS[0],
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. You can also contact directly via email.");
    }
  };

  const mailtoFallback = `mailto:rayhanabbrar233@gmail.com?subject=${encodeURIComponent(
    `[Trust Lesson] ${formData.purpose}`
  )}&body=${encodeURIComponent(
    `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
  )}`;

  return (
    <div id="contact" className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Left info banner */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-300 text-xs font-bold border border-white/15 backdrop-blur-md">
                <Sparkles size={12} className="text-purple-300" />
                <span>Direct Contact</span>
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Let's Build Something Together
              </h3>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Whether you have questions regarding Arbitrum escrow mechanisms, want to propose a partnership, or seek pairing mentorship, reach out directly to Rayhan.
              </p>

              <div className="space-y-4 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300">
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Direct Inbox</p>
                    <a
                      href="mailto:rayhanabbrar233@gmail.com"
                      className="text-white font-bold hover:text-purple-300 transition-colors"
                    >
                      rayhanabbrar233@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300">
                    <User size={15} />
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Lead Architect</p>
                    <p className="text-white font-bold">
                      Rayhan Aziel Abbrar{" "}
                      <span className="text-purple-300 font-medium text-[11px]">(Rayhan Young)</span>
                    </p>
                    <span className="text-purple-400 text-[11px] font-mono">@0xAnakMommy</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-6 border-t border-white/10">
              <p className="text-[11px] text-slate-400 leading-normal">
                Messages submitted here are routed automatically to Rayhan's inbox without third-party email campaign loggers.
              </p>
            </div>
          </div>

          {/* Right interactive form */}
          <div className="lg:col-span-3 p-8 sm:p-10 bg-white">
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Message Dispatched Successfully
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
                  Thank you for reaching out. Your message has been sent to <span className="font-bold text-slate-900">rayhanabbrar233@gmail.com</span>. Rayhan will review and reply to your provided email address shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">Send a Direct Message</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill out the form below to initiate communication with the founder.
                  </p>
                </div>

                {status === "error" && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{errorMessage}</p>
                      <a
                        href={mailtoFallback}
                        className="underline text-[11px] text-rose-800 font-bold block mt-1 hover:text-rose-950"
                      >
                        Click here to open your native email app instead
                      </a>
                    </div>
                  </div>
                )}

                {/* Name & Email Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Purpose Option Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Purpose <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-slate-50/50 cursor-pointer"
                  >
                    {PURPOSE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, proposal, or feedback..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all bg-slate-50/50 resize-y"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <a
                    href={mailtoFallback}
                    className="text-[11px] font-semibold text-slate-500 hover:text-purple-600 transition-colors"
                  >
                    Prefer your email client? Open Mail &rarr;
                  </a>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {status === "loading" ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
