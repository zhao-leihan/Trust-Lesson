"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/Dialog";
import {
  Star,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import { TwitterIcon, LinkedinIcon, InstagramIcon } from "./SocialIcons";

/**
 * Course Completion Feedback & Social Share Modal
 * Step 1: Course Feedback Form (for both Learner and Mentor)
 * Step 2: Multi-Platform Social Media Share (X, LinkedIn, Instagram) with customized captions & character bounds.
 */
export default function CourseCompletionFeedbackModal({
  open = false,
  onClose = () => {},
  role = "learner", // "learner" | "mentor"
  courseTitle = "Web3 Smart Contract Mentorship",
  counterpartyName = "Alex Rivera",
  enrollmentId = null,
  certificateId = null,
  onComplete = () => {},
}) {
  const [step, setStep] = useState(1); // 1: Feedback Form, 2: Social Share
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(
    role === "mentor" ? "Student Engagement & Delivery" : "Mentorship & Practical Depth"
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("x"); // "x" | "linkedin" | "instagram"
  const [copiedKey, setCopiedKey] = useState(null);

  // Platform-tailored captions & character counts
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://trustlesson.io";

  const captions = {
    x:
      role === "learner"
        ? `Just completed my Web3 mentorship in "${courseTitle}" on @TrustLesson! Verified milestone completion on @Arbitrum with on-chain Soulbound credentials. Huge thanks to @${counterpartyName}! #Web3 #Arbitrum #LearnWeb3 #TrustLesson`
        : `Proud to wrap up another successful mentorship cohort in "${courseTitle}" on @TrustLesson! Guided talented builders on smart contracts & @Arbitrum. #Web3Mentorship #Arbitrum #Buidl #TrustLesson`,

    linkedin:
      role === "learner"
        ? `I am pleased to share that I have completed the "${courseTitle}" mentorship program on Trust Lesson, verified non-custodially on Arbitrum.\n\nKey Milestones Achieved:\n- Production Smart Contract Architecture\n- Escrow Milestone Delivery\n- Security & Audit Preparedness\n\nVerified on-chain credentials issued on Arbitrum Sepolia.\n\n#Web3 #BlockchainEngineering #ContinuousLearning #Arbitrum #TrustLesson`
        : `Proud to have concluded the "${courseTitle}" mentorship cycle on Trust Lesson. Guided builders through decentralized escrow architecture and production-grade smart contracts on Arbitrum.\n\nMentorship Focus:\n- Protocol Security & Standards\n- Non-Custodial Architecture\n- Hands-on Code Review\n\n#Web3Mentorship #Arbitrum #BlockchainLeadership #TrustLesson`,

    instagram:
      role === "learner"
        ? `Milestone achieved! Completed the "${courseTitle}" mentorship on Trust Lesson, verified on-chain on Arbitrum Sepolia. Excited for what is next in Web3.\n\n#TrustLesson #Web3Education #SmartContracts #Arbitrum #BlockchainDeveloper #CodingLife #LearnWeb3`
        : `Another cohort completed! Mentored dedicated builders in "${courseTitle}" on Trust Lesson. Milestone delivered on Arbitrum.\n\n#TrustLesson #Web3Mentor #SmartContracts #Arbitrum #DevCommunity #Web3Builders`,
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShareClick = (platform) => {
    const text = captions[platform];
    if (platform === "x") {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (platform === "linkedin") {
      navigator.clipboard.writeText(text);
      setCopiedKey("linkedin-btn");
      setTimeout(() => setCopiedKey(null), 2500);
      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (platform === "instagram") {
      navigator.clipboard.writeText(text);
      setCopiedKey("instagram-btn");
      setTimeout(() => setCopiedKey(null), 2500);
      window.open("https://www.instagram.com", "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Please provide a brief feedback comment.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          comment: comment.trim(),
          userRole: role.toUpperCase(),
          userName: role === "mentor" ? "Mentor" : "Learner",
        }),
      }).catch(() => {});

      if (enrollmentId) {
        try {
          localStorage.setItem(`tl_course_feedback_${enrollmentId}`, JSON.stringify({ rating, category, comment, submittedAt: Date.now() }));
        } catch (err) {}
      }

      setStep(2);
      onComplete();
    } catch (err) {
      console.warn("Feedback save note:", err);
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-xl p-6 sm:p-8 rounded-3xl space-y-6">
        {step === 1 ? (
          /* ── STEP 1: FEEDBACK FORM ── */
          <div className="space-y-5 animate-fadeIn">
            <DialogHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-bold shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Course Completion Feedback</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                      Step 1 of 2
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    {role === "mentor"
                      ? `Share your evaluation of ${counterpartyName}'s work and session delivery.`
                      : `Rate your experience learning from ${counterpartyName}.`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              {/* Star Rating Select */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-extrabold uppercase tracking-wider text-slate-700 block">
                  Overall Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        size={28}
                        className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                      />
                    </button>
                  ))}
                  <span className="ml-3 font-mono font-black text-slate-900 text-base">
                    {rating}.0 / 5.0
                  </span>
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Evaluation Dimension
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                >
                  {role === "mentor" ? (
                    <>
                      <option value="Student Engagement & Delivery">Student Engagement & Delivery</option>
                      <option value="Technical Homework Execution">Technical Homework Execution</option>
                      <option value="Communication & Timeliness">Communication & Timeliness</option>
                      <option value="Overall Mentorship Experience">Overall Mentorship Experience</option>
                    </>
                  ) : (
                    <>
                      <option value="Mentorship & Practical Depth">Mentorship & Practical Depth</option>
                      <option value="Curriculum & Technical Guidance">Curriculum & Technical Guidance</option>
                      <option value="Code Review & Feedback Clarity">Code Review & Feedback Clarity</option>
                      <option value="Platform & Escrow Reliability">Platform & Escrow Reliability</option>
                    </>
                  )}
                </select>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Detailed Review & Feedback Comments
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    role === "mentor"
                      ? "Describe the learner's technical growth, project deliverables, and future recommendations..."
                      : "Describe your key takeaways, mentor responsiveness, and how this session accelerated your Web3 skills..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold flex items-center gap-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? "Submitting..." : "Submit & Continue"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ── STEP 2: MULTI-PLATFORM SOCIAL MEDIA SHARE ── */
          <div className="space-y-5 animate-fadeIn">
            <DialogHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Feedback Saved! Share Your Achievement</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Step 2 of 2
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Celebrate your verified milestone on X, LinkedIn, or Instagram with ready-to-publish captions.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Platform Selector Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSelectedPlatform("x")}
                className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === "x"
                    ? "bg-black text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TwitterIcon size={14} />
                <span>X (Twitter)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform("linkedin")}
                className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === "linkedin"
                    ? "bg-blue-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LinkedinIcon size={14} />
                <span>LinkedIn</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform("instagram")}
                className={`flex-1 py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedPlatform === "instagram"
                    ? "bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <InstagramIcon size={14} />
                <span>Instagram</span>
              </button>
            </div>

            {/* Platform Caption Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                  Generated {selectedPlatform === "x" ? "X / Twitter Post" : selectedPlatform === "linkedin" ? "LinkedIn Update" : "Instagram Caption"}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {captions[selectedPlatform].length} chars
                    {selectedPlatform === "x" && " / 280 max"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(captions[selectedPlatform], "active-caption")}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Copy Caption"
                  >
                    {copiedKey === "active-caption" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedKey === "active-caption" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                {captions[selectedPlatform]}
              </div>

              {selectedPlatform === "instagram" && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <Sparkles size={14} className="shrink-0 text-amber-600" />
                  <span>Clicking below copies this caption and directly opens Instagram in your browser.</span>
                </div>
              )}

              {selectedPlatform === "linkedin" && (
                <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0 text-blue-600" />
                  <span>Clicking below copies the full formatted announcement and launches the LinkedIn share window.</span>
                </div>
              )}
            </div>

            {/* Main Action Share Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close & Return
              </button>

              <button
                type="button"
                onClick={() => handleShareClick(selectedPlatform)}
                className={`w-full sm:w-auto px-7 py-3 rounded-xl font-extrabold text-xs text-white flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  selectedPlatform === "x"
                    ? "bg-black hover:bg-slate-900 shadow-black/20"
                    : selectedPlatform === "linkedin"
                    ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                    : "bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:opacity-95 shadow-rose-600/20"
                }`}
              >
                {selectedPlatform === "x" && <TwitterIcon size={14} />}
                {selectedPlatform === "linkedin" && <LinkedinIcon size={14} />}
                {selectedPlatform === "instagram" && <InstagramIcon size={14} />}
                <span>
                  {selectedPlatform === "x"
                    ? "Post on X (Twitter)"
                    : selectedPlatform === "linkedin"
                    ? "Copy & Open LinkedIn"
                    : "Copy Caption & Open Instagram"}
                </span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
