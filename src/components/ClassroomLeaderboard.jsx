"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Award, Medal, CheckCircle2, Flame, User } from "lucide-react";

export default function ClassroomLeaderboard({ gigId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gigId) return;
    let isMounted = true;

    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch(`/api/gigs/${gigId}/leaderboard`);
        if (!res.ok) throw new Error("Failed to load class leaderboard");
        const data = await res.json();
        if (isMounted) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLeaderboard();
    return () => {
      isMounted = false;
    };
  }, [gigId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
        <div className="h-5 w-44 bg-slate-200 rounded-md" />
        <div className="space-y-3">
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
        <Trophy size={28} className="mx-auto text-slate-300" />
        <h4 className="text-sm font-bold text-slate-800">Class Leaderboard</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          No ranked participants yet. Complete assignments and roadmap modules to climb to the top of this gig leaderboard.
        </p>
      </div>
    );
  }

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-extrabold text-xs border border-amber-300 shadow-xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-300 shadow-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/10 text-amber-800 font-extrabold text-xs border border-amber-700/20 shadow-xs">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Trophy size={18} className="text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Classroom Leaderboard</h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time rankings based on assignment scores, completed deliverables, and roadmap velocity.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Flame size={14} className="text-indigo-600" />
          <span>{leaderboard.length} Enrolled Student{leaderboard.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Roster Table */}
      <div className="divide-y divide-slate-100">
        {leaderboard.map((item, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;
          return (
            <div
              key={item.learnerId || index}
              className={`py-3.5 px-3 rounded-2xl flex items-center justify-between gap-4 transition-colors ${
                isTopThree ? "bg-slate-50/70 hover:bg-slate-50" : "hover:bg-slate-50/50"
              }`}
            >
              {/* Rank & Learner Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                {getRankBadge(rank)}
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {item.learnerName ? item.learnerName.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.learnerName || "Learner"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {item.learnerAddress ? `${item.learnerAddress.slice(0, 6)}...${item.learnerAddress.slice(-4)}` : "Verified Student"}
                  </p>
                </div>
              </div>

              {/* Score & Achievements Metrics */}
              <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Deliverables</span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{item.completedTasks} completed</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Grade</span>
                  <span className="text-xs font-extrabold text-indigo-700">
                    {item.averageScore}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-400 block">Class Points</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {item.points} pts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
