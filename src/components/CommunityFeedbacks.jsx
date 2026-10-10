"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckCircle, MessageSquareQuote, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

export default function CommunityFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadFeedbacks() {
      try {
        const res = await fetch("/api/feedbacks");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.feedbacks && data.feedbacks.length > 0) {
            setFeedbacks(data.feedbacks);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch verified feedbacks:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeedbacks();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-purple-50/50 border-y border-purple-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        <Reveal direction="up" className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3.5 py-1.5 rounded-full border border-purple-200 shadow-xs mb-3">
            <Sparkles size={12} className="text-purple-600" />
            <span>Verified User Satisfaction</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 mt-1 tracking-tight">
            Why Learners & Mentors Love Trust lesson
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto mt-2">
            Real satisfaction ratings and authentic feedback collected directly from completed mentorship sessions and escrow settlements.
          </p>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white border border-purple-100 rounded-3xl p-6 h-64 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-purple-100 rounded-full w-24" />
                    <div className="h-2 bg-purple-50 rounded-full w-16" />
                  </div>
                </div>
                <div className="h-24 bg-purple-50/80 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {feedbacks.slice(0, 4).map((item, idx) => (
              <Reveal key={item.id || idx} delay={idx * 100} direction="up">
                <div className="bg-white border border-purple-200/90 rounded-3xl p-6 flex flex-col justify-between h-full shadow-xs hover:shadow-md hover:border-purple-300 transition-all group">
                  <div>
                    {/* User profile & role */}
                    <div className="flex items-center gap-3 mb-4">
                      {item.userAvatar ? (
                        <img
                          src={item.userAvatar}
                          alt={item.userName}
                          className="w-12 h-12 object-cover rounded-full bg-purple-50 p-0.5 border border-purple-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "/monsters/cool-pose.webp";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {item.userName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-slate-900 font-extrabold text-xs truncate">
                          {item.userName}
                        </p>
                        <span className="text-[10px] text-purple-700 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                          <span>
                            {item.userRole === "MENTOR" ? "Verified Mentor" : "Verified Learner"}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Star Rating & Category */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={
                              i < (item.rating || 5)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100 truncate max-w-[120px]">
                        {item.category || "Platform Experience"}
                      </span>
                    </div>

                    {/* Feedback Speech Bubble */}
                    <div className="relative bg-purple-50/80 rounded-2xl p-4 border border-purple-100/90 text-xs text-purple-950 leading-relaxed font-medium group-hover:bg-purple-50 transition-colors">
                      <MessageSquareQuote
                        size={16}
                        className="text-purple-300 mb-1 inline-block mr-1 opacity-75"
                      />
                      "{item.comment}"
                    </div>
                  </div>

                  {/* Escrow Protected Footnote */}
                  <div className="pt-4 border-t border-purple-100/70 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <ShieldCheck size={12} />
                      Verified Review
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {/* Bottom CTA to submit feedback in dashboard */}
        <Reveal direction="up" delay={200} className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-white/90 backdrop-blur-sm border border-purple-200 px-6 py-3.5 rounded-2xl shadow-xs">
            <span className="text-xs text-slate-700 font-semibold">
              Completed a mentorship session or project roadmap?
            </span>
            <Link
              href="/dashboard?tab=satisfaction"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200 hover:border-purple-300"
            >
              <span>Submit Your Satisfaction Review</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
