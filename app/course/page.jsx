"use client";

import ExplorePage from "../explore/page";

// Re-export ExplorePage as CoursePage so /course and /explore share the catalog
export default function CoursePage() {
  return <ExplorePage />;
}
