"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ExploreCard from "../../src/components/ExploreCard";
import ResourcePill from "../../src/components/ResourcePill";
import Footer from "../../src/components/Footer";
import {
  Search,
  LayoutGrid,
  User,
  BookOpen,
  Briefcase,
  Code,
  PenTool,
  TrendingUp,
  Megaphone,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

export default function ExplorePage() {
  const [offerings, setOfferings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // ── Fetch Live Catalog from Backend API ──
  const fetchExploreCatalog = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/api/explore").then((res) => {
        if (!res.ok) throw new Error("Failed to load explore catalog");
        return res.json();
      }),
      fetch("/api/resources").then((res) => {
        if (!res.ok) return { resources: [] };
        return res.json();
      }).catch(() => ({ resources: [] })),
    ])
      .then(([exploreData, resourcesData]) => {
        if (exploreData.offerings) {
          setOfferings(exploreData.offerings);
        }
        if (resourcesData.resources) {
          setResources(resourcesData.resources);
        }
      })
      .catch((err) => {
        console.error("API error loading explore catalog:", err);
        setError("Unable to connect to explore catalog service.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchExploreCatalog();
  }, []);

  // ── Dynamic Filtering over Live Backend Data ──
  const filteredItems = offerings.filter((item) => {
    // Type filter
    if (filterType === "mentors" && item.offeringType !== "mentor") return false;
    if (filterType === "courses" && item.offeringType !== "course") return false;

    // Category filter
    let matchCategory = true;
    if (activeCategory !== "All") {
      const catLower = activeCategory.toLowerCase();
      const itemCat = (item.category || "").toLowerCase();
      const itemSkill = (item.skill || item.title || "").toLowerCase();
      const itemDomain = (item.domain || "").toLowerCase();

      if (catLower === "mentors") {
        matchCategory = item.offeringType === "mentor";
      } else if (catLower === "tutors" || catLower === "consultants") {
        matchCategory = item.offeringType === "mentor" || itemCat.includes(catLower);
      } else if (catLower === "programming") {
        matchCategory = itemCat.includes("coding") || itemCat.includes("programming") || itemSkill.includes("solidity") || itemSkill.includes("react") || itemSkill.includes("web3");
      } else if (catLower === "design") {
        matchCategory = itemCat.includes("design") || itemSkill.includes("ui") || itemSkill.includes("ux");
      } else if (catLower === "business") {
        matchCategory = itemCat.includes("business") || itemCat.includes("career");
      } else if (catLower === "marketing") {
        matchCategory = itemCat.includes("marketing") || itemDomain.includes("growth");
      } else {
        matchCategory = itemCat === catLower || itemSkill.includes(catLower);
      }
    }

    // Search query filter
    const title = item.skill || item.title || "";
    const name = item.name || item.mentorName || "";
    const desc = item.description || "";
    const matchSearch =
      searchQuery === "" ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  const categories = [
    { id: "All", label: "All", icon: LayoutGrid },
    { id: "Mentors", label: "Mentors", icon: User },
    { id: "Tutors", label: "Tutors", icon: BookOpen },
    { id: "Consultants", label: "Consultants", icon: Briefcase },
    { id: "Programming", label: "Programming", icon: Code },
    { id: "Design", label: "Design", icon: PenTool },
    { id: "Business", label: "Business", icon: TrendingUp },
    { id: "Marketing", label: "Marketing", icon: Megaphone },
    { id: "Other", label: "Other", icon: MoreHorizontal },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* ── 1. HERO BANNER WITH PURPLE PAINT WAVE & MASCOTS ── */}
      <section className="relative bg-white pt-28 sm:pt-32 pb-10 px-4 sm:px-6 overflow-hidden border-b border-purple-100/80">
        {/* Purple Watercolor Paint Wave Background Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Ambient Paint Wave Gradients */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-purple-200/50 via-purple-100/30 to-transparent rounded-[100%] blur-3xl" />
          <div className="absolute top-10 -left-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl" />
          <div className="absolute top-10 -right-20 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl" />

          {/* Organic Purple Watercolor Wave SVG */}
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-30 mix-blend-multiply"
            viewBox="0 0 1440 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="paintWave1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#9333ea" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="paintWave2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#c4b5fd" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0" />
              </linearGradient>
              <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
            </defs>
            <path
              d="M0,80 C320,160 480,-20 800,90 C1120,200 1280,40 1440,70 L1440,0 L0,0 Z"
              fill="url(#paintWave1)"
              filter="url(#blurFilter)"
            />
            <path
              d="M0,140 C380,240 620,40 960,160 C1200,240 1360,110 1440,130 L1440,0 L0,0 Z"
              fill="url(#paintWave2)"
            />
            <path
              d="M-50,220 C280,310 500,120 850,210 C1200,300 1320,180 1500,200"
              stroke="#a855f7"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeOpacity="0.2"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Mascot (Student reading book) with Floating & Entrance Animation */}
            <div className="hidden lg:flex flex-col items-center justify-center w-56 xl:w-64 shrink-0 animate-fadeInUp">
              <img
                src="/monsters/knowledge.png"
                alt="Knowledge Scholar Monster"
                className="w-full max-w-[220px] h-auto object-contain drop-shadow-xl animate-float hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Center Content: Title, Subtitle, Search with Smooth Entrance Animation */}
            <div className="flex-1 text-center max-w-2xl mx-auto py-2 animate-fadeInUp">
              {/* Pill Badge */}
              <div className="inline-flex items-center justify-center mb-4">
                <span className="px-4 py-1 rounded-full bg-purple-100/80 text-purple-700 font-extrabold text-[11px] tracking-widest uppercase border border-purple-200/50 shadow-xs">
                  Courses & Mentorship
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Find the{" "}
                <span className="text-purple-600 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                  Right
                </span>{" "}
                Mentor,
                <br />
                Tutor or Consultant
              </h1>

              {/* Subtitle */}
              <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed max-w-lg mx-auto">
                Browse trusted knowledge providers, explore their expertise, and start your learning journey with confidence.
              </p>

              {/* Pill Search Bar */}
              <div className="mt-7 max-w-xl mx-auto animate-scaleIn">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="bg-white border-2 border-purple-200/90 rounded-full p-1.5 pl-5 flex items-center shadow-lg shadow-purple-500/10 focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/15 transition-all"
                >
                  <Search size={18} className="text-purple-400 shrink-0 mr-2.5" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for courses, mentors, tutors, or consultants..."
                    className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-2.5 rounded-full transition-all shrink-0 cursor-pointer shadow-md shadow-purple-600/25 active:scale-95"
                  >
                    Explore
                  </button>
                </form>
              </div>
            </div>

            {/* Right Mascot (Mentor with laptop) with Floating & Entrance Animation */}
            <div className="hidden lg:flex flex-col items-center justify-center w-56 xl:w-64 shrink-0 animate-fadeInUp">
              <img
                src="/monsters/mentor.png"
                alt="Mentor Monster"
                className="w-full max-w-[220px] h-auto object-contain drop-shadow-xl animate-float-slow hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* ── Horizontal Category Filter Pills with Entrance Animation ── */}
          <div className="mt-8 pt-4 flex items-center justify-start lg:justify-center gap-2 overflow-x-auto no-scrollbar py-2 animate-fadeInUp">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-105"
                      : "bg-purple-50/70 hover:bg-purple-100 text-slate-700 border border-purple-100/80 hover:scale-102"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-white" : "text-purple-600"} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 2. CATALOG & RESULTS SECTION ── */}
      <div className="py-10 px-4 sm:px-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Results Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-slate-700 font-bold text-xs sm:text-sm">
                Showing <span className="text-indigo-600 font-black">{filteredItems.length}</span> verified offerings
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse flex flex-col justify-between"
                >
                  <div className="w-full h-44 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-rose-200 shadow-xs">
              <p className="text-rose-700 font-bold text-sm mb-2">{error}</p>
              <button
                onClick={fetchExploreCatalog}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Retry Loading</span>
              </button>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fadeInUp">
              {filteredItems.map((item) => (
                <ExploreCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            /* Clean Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto space-y-4">
              <img
                src="/monsters/hello.png"
                alt="Lesson Monster"
                className="w-20 h-auto mx-auto object-contain drop-shadow-md animate-wiggle"
              />
              <div>
                <p className="text-slate-900 font-black text-lg">No Mentors or Gigs Available Yet</p>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  The database is clean and ready. Registered mentors can publish their 1-on-1 sessions or multi-milestone gigs from their dashboard.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Register as Mentor
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Curated Resources */}
          {resources.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h2 className="font-extrabold text-slate-900 text-base mb-3">
                Helpful Guides & Checklists
              </h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {resources.map((r) => (
                  <ResourcePill key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
