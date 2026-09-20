import { useState } from "react";
import { mentors, resources } from "../data/mentors";
import CategoryChips from "../components/CategoryChips";
import ExploreCard from "../components/ExploreCard";
import ResourcePill from "../components/ResourcePill";
import Reveal from "../components/Reveal";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { Search, SlidersHorizontal, Shield, Sparkles, Users, Briefcase } from "lucide-react";

export default function ExplorePage() {
  const { courses } = useAuth();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all' | 'mentors' | 'courses'

  // Combine mentors and courses into one unified offerings list
  const allOfferings = [
    ...mentors.map((m) => ({ ...m, offeringType: "mentor" })),
    ...(courses || []).map((c) => ({ ...c, offeringType: "course" })),
  ];

  const filteredItems = allOfferings.filter((item) => {
    // Type filter
    if (filterType === "mentors" && item.offeringType !== "mentor") return false;
    if (filterType === "courses" && item.offeringType !== "course") return false;

    // Category filter
    const matchCategory = activeCategory === "All" || item.category === activeCategory;

    // Search query filter
    const title = item.skill || item.title || "";
    const name = item.name || item.mentorName || "";
    const matchSearch =
      searchQuery === "" ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="pt-28 pb-20 px-4 sm:px-6 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Banner with Lesson Monster Mascot */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-purple-800/30 relative overflow-hidden">
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1.5 mb-2">
                <Shield size={12} />
                Verified Mentorship Catalog
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Find Your Monster Mentor
              </h1>
              <p className="text-purple-200/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Book hourly 1-on-1 sessions or multi-milestone bootcamps with complete smart contract escrow safety.
              </p>

              {/* Filter Type Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-5">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterType === "all"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  All ({allOfferings.length})
                </button>
                <button
                  onClick={() => setFilterType("mentors")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterType === "mentors"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Users size={13} />
                  <span>1-on-1 Mentors</span>
                </button>
                <button
                  onClick={() => setFilterType("courses")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterType === "courses"
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Briefcase size={13} />
                  <span>Milestone Gigs</span>
                </button>
              </div>
            </div>

            {/* Monster Illustration */}
            <div className="flex-shrink-0 relative z-10">
              <img
                src="/monsters/knowledge.png"
                alt="Lesson Monster Scholar"
                className="w-36 sm:w-44 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] animate-float"
              />
            </div>
          </div>

          {/* Search & Categories Bar */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500"
              />
              <input
                type="search"
                placeholder="Search by mentor name, technology (e.g. React, Solidity), or gig title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Quick Trending Tags */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-bold text-[11px] mr-1">Trending:</span>
              {["Frontend", "Solidity", "Figma", "Career", "Product", "Python"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearchQuery(searchQuery === tag ? "" : tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    searchQuery === tag
                      ? "bg-purple-600 text-white"
                      : "bg-purple-50/70 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <CategoryChips active={activeCategory} onChange={setActiveCategory} />
          </div>

          {/* Results Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-700 font-bold text-xs sm:text-sm">
                Showing <span className="text-purple-700">{filteredItems.length}</span> verified offerings
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-purple-600 font-bold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {/* UNIFIED 1-TYPE CARD GRID */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <ExploreCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
              <Search size={28} className="text-slate-400 mx-auto mb-2" />
              <p className="text-slate-900 font-bold text-sm">No offerings found</p>
              <p className="text-slate-500 text-xs mt-1">Try clearing your search term or category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  setFilterType("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Curated Resources section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="font-extrabold text-slate-900 text-base mb-3">
              Helpful Guides & Checklists
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {resources.map((r) => (
                <ResourcePill key={r.id} resource={r} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
