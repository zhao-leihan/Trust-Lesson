import { useState } from "react";
import { mentors, resources } from "../data/mentors";
import CategoryChips from "../components/CategoryChips";
import MentorCard from "../components/MentorCard";
import ResourcePill from "../components/ResourcePill";
import SessionDetail from "../components/SessionDetail";
import MilestoneList from "../components/MilestoneList";

export default function ExploreScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState(mentors[0]);

  const filtered =
    activeCategory === "All"
      ? mentors
      : mentors.filter((m) => m.category === activeCategory);

  return (
    <div className="flex gap-5 h-full min-h-0">
      {/* Main area */}
      <div className="flex-1 bg-white rounded-3xl p-6 flex flex-col gap-5 overflow-y-auto min-h-0">
        {/* Headline */}
        <div>
          <h1 className="text-navy font-semibold leading-tight" style={{ fontSize: "clamp(32px,3.5vw,52px)", lineHeight: 1.05 }}>
            Choose your<br />mentor
          </h1>
        </div>

        {/* Category chips */}
        <CategoryChips active={activeCategory} onChange={setActiveCategory} />

        {/* Mentor grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                isSelected={selectedMentor?.id === mentor.id}
                onClick={setSelectedMentor}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-lavender flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" fill="#8B7CF6" opacity="0.3" />
                <circle cx="14" cy="10" r="4" fill="#5B4BDB" opacity="0.5" />
                <ellipse cx="14" cy="20" rx="7" ry="4" fill="#5B4BDB" opacity="0.3" />
              </svg>
            </div>
            <div>
              <p className="text-navy font-semibold">No mentors in this category yet</p>
              <p className="text-navy/50 text-sm mt-1">Check back soon or explore other skills</p>
            </div>
            <button
              onClick={() => setActiveCategory("All")}
              className="px-5 py-2.5 rounded-full bg-violet text-white font-medium text-sm"
            >
              Find a mentor
            </button>
          </div>
        )}

        {/* Resources section */}
        <div>
          <h2 className="text-navy font-semibold text-lg mb-3">Resources</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {resources.map((r) => (
              <ResourcePill key={r.id} resource={r} />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto min-h-0">
        <div className="flex-1 min-h-0">
          <SessionDetail
            mentor={selectedMentor}
            onBack={() => setSelectedMentor(null)}
          />
        </div>
        <MilestoneList />
      </div>
    </div>
  );
}
