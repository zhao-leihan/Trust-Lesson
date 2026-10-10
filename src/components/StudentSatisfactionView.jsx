"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquareQuote, CheckCircle2, ShieldCheck, Sparkles, Send, Layers } from "lucide-react";

const CATEGORIES = [
  "Mentorship Quality",
  "Escrow Security",
  "Platform Experience",
  "Learning Outcomes",
];

const RATING_LABELS = {
  5: "5 Stars - Outstanding Experience",
  4: "4 Stars - Great Mentorship",
  3: "3 Stars - Satisfactory Session",
  2: "2 Stars - Needs Improvement",
  1: "1 Star - Unsatisfactory",
};

export default function StudentSatisfactionView({ user }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("Mentorship Quality");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUserFeedbacks = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/feedbacks");
      if (res.ok) {
        const data = await res.json();
        const all = data.feedbacks || [];
        const mine = all.filter(
          (f) =>
            (user?.id && f.userId === user.id) ||
            (user?.email && f.userEmail === user.email) ||
            (user?.name && f.userName === user.name)
        );
        setUserFeedbacks(mine);
      }
    } catch (err) {
      console.warn("Failed to fetch user feedbacks:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchUserFeedbacks();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg("Please write your review comment before submitting.");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          category,
          comment: comment.trim(),
          userName: user?.name || "Verified Learner",
          userEmail: user?.email,
          userAvatar: user?.avatarUrl,
          userId: user?.id,
          userRole: user?.role === "MENTOR" ? "MENTOR" : "LEARNER",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setComment("");
        fetchUserFeedbacks();
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Failed to submit review.");
      }
    } catch (err) {
      setErrorMsg("Network error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white rounded-3xl border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} className="text-purple-600" />
            <span>Community Quality Assurance</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User Satisfaction & Verified Reviews
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Rate your mentorship experience, milestone deliverables, and escrow protection. Your authentic feedback powers public platform showcases and administrative quality reviews.
          </p>
        </div>

        <div className="px-4 py-3 rounded-2xl bg-white border border-purple-200 text-center shrink-0 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Reviews</p>
          <p className="text-2xl font-black text-purple-700 mt-0.5">{userFeedbacks.length}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">Verified on-chain</p>
        </div>
      </div>

      {submitted && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Thank You! Your Feedback Has Been Submitted</p>
            <p className="text-emerald-700 text-xs mt-0.5">
              Your verified review has been saved to the PostgreSQL database and sent to the Admin Dashboard. Featured reviews are dynamically showcased on the Trust Lesson homepage!
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Review Submission Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-purple-100 pb-4">
          <h4 className="font-extrabold text-slate-900 text-base">Rate Your Overall Experience</h4>
          <p className="text-slate-500 text-xs mt-0.5">Select a rating from 1 to 5 stars.</p>

          {/* Interactive Star Picker */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-2 bg-purple-50/70 rounded-2xl border border-purple-100">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-lg transition-transform active:scale-90 cursor-pointer"
                  title={`${s} Stars`}
                >
                  <Star
                    size={28}
                    className={
                      s <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                        : "text-slate-200 fill-slate-200"
                    }
                  />
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-800 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl">
              {RATING_LABELS[hoverRating || rating]}
            </span>
          </div>
        </div>

        {/* Feedback Category */}
        <div>
          <label className="block text-slate-700 font-bold text-xs mb-2">Review Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === cat
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                    : "bg-purple-50/70 text-slate-700 border border-purple-100 hover:bg-purple-100/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Textarea */}
        <div>
          <label className="block text-slate-700 font-bold text-xs mb-1.5">
            Your Review & Feedback Message
          </label>
          <textarea
            rows={4}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you loved about your mentorship, milestone deliveries, or platform experience (e.g. 'The milestone escrow gave me total confidence in my mentor's code reviews...')"
            className="w-full px-4 py-3 rounded-2xl bg-purple-50/40 border border-purple-100 text-slate-900 text-xs leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none transition-all"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Minimum 10 characters recommended</span>
            <span>{comment.length} characters</span>
          </div>
        </div>

        {/* Reviewer Identity Preview */}
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-purple-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || "S"}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-900">{user?.name || "Verified Learner"}</p>
              <p className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" />
                Verified Platform Member
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-600/25 active:scale-95 disabled:opacity-50"
          >
            <Send size={13} />
            <span>{submitting ? "Submitting..." : "Submit Satisfaction Review"}</span>
          </button>
        </div>
      </form>

      {/* User's Previous Feedback History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-base">Your Submitted Reviews</h4>
          <span className="text-xs text-slate-500">{userFeedbacks.length} Total</span>
        </div>

        {loadingHistory ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading review history...</div>
        ) : userFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userFeedbacks.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-purple-100 rounded-3xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < (item.rating || 5)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-slate-200"
                        }
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">{item.rating}.0</span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {item.category || "Platform Experience"}
                  </span>
                </div>

                <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs text-slate-800 leading-relaxed font-medium">
                  "{item.comment}"
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-purple-100">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 size={11} />
                    Verified & Public
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString("en-US")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-purple-50/40 rounded-3xl border border-purple-100 text-xs text-slate-500">
            You haven't submitted any feedback yet. Use the form above to share your experience!
          </div>
        )}
      </div>
    </div>
  );
}
