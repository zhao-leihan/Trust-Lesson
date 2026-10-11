/**
 * Package parser and normalizer for Trust Lesson
 * Conforms to main.md Section 3:
 * Structured fields:
 * - liveSessionsIncluded: number (0 = self-paced)
 * - sessionDurationMin: number (minutes, default 60)
 * - validityDays: number (default 30)
 */

export function parseDurationToMinutes(durationStr) {
  if (!durationStr || typeof durationStr !== "string") return 60;
  const lower = durationStr.toLowerCase();
  
  const minMatch = lower.match(/(\d+)\s*(?:min|minute)/);
  if (minMatch) return parseInt(minMatch[1], 10);
  
  const hourMatch = lower.match(/(\d+)\s*(?:hr|hour)/);
  if (hourMatch) return parseInt(hourMatch[1], 10) * 60;

  return 60;
}

export function parsePackageLiveSessions(pkg) {
  if (typeof pkg.liveSessionsIncluded === "number" && !isNaN(pkg.liveSessionsIncluded)) {
    return Math.max(0, Math.floor(pkg.liveSessionsIncluded));
  }

  // Check if explicit self-paced flag or text
  const checkText = `${pkg.name || ""} ${pkg.tier || ""} ${pkg.duration || ""} ${pkg.description || ""}`.toLowerCase();
  if (checkText.includes("self-paced") || checkText.includes("self paced") || checkText.includes("no meeting") || checkText.includes("0 live") || checkText.includes("video only")) {
    return 0;
  }

  // Regex for "3 Live Meeting", "1 Session", "5 Live", etc.
  const match = (pkg.duration || "").match(/(\d+)\s*(?:live|session|meeting)/i) ||
                (pkg.name || "").match(/(\d+)\s*(?:live|session|meeting)/i) ||
                (pkg.description || "").match(/(\d+)\s*(?:live|session|meeting)/i);
  
  if (match) {
    return parseInt(match[1], 10);
  }

  // Fallback defaults based on tier name
  const tierLower = (pkg.tier || "").toLowerCase();
  if (tierLower === "basic") return 1;
  if (tierLower === "standard") return 3;
  if (tierLower === "premium") return 8;

  return 1;
}

export function parsePackageValidity(pkg) {
  if (typeof pkg.validityDays === "number" && !isNaN(pkg.validityDays) && pkg.validityDays > 0) {
    return Math.floor(pkg.validityDays);
  }

  const checkText = `${pkg.name || ""} ${pkg.tier || ""} ${pkg.duration || ""} ${pkg.description || ""}`.toLowerCase();
  const dayMatch = checkText.match(/(\d+)\s*(?:day)/);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  const monthMatch = checkText.match(/(\d+)\s*(?:month)/);
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30;

  const weekMatch = checkText.match(/(\d+)\s*(?:week)/);
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7;

  // Defaults
  const tierLower = (pkg.tier || "").toLowerCase();
  if (tierLower === "basic") return 30;
  if (tierLower === "standard") return 60;
  if (tierLower === "premium") return 90;

  return 30;
}

export function normalizePackage(pkg, index = 0) {
  if (!pkg || typeof pkg !== "object") return null;

  const liveSessions = parsePackageLiveSessions(pkg);
  const durationMin = typeof pkg.sessionDurationMin === "number" && pkg.sessionDurationMin > 0
    ? Math.floor(pkg.sessionDurationMin)
    : parseDurationToMinutes(pkg.duration);
  const validity = parsePackageValidity(pkg);

  const tierDefault = index === 0 ? "Basic" : index === 1 ? "Standard" : "Premium";

  return {
    ...pkg,
    id: pkg.id || `pkg-${index + 1}`,
    tier: pkg.tier || tierDefault,
    name: pkg.name || `${pkg.tier || tierDefault} Package`,
    price: Number(pkg.price) || 0,
    duration: pkg.duration || `${liveSessions} Live Session${liveSessions === 1 ? "" : "s"}`,
    liveSessionsIncluded: liveSessions,
    sessionDurationMin: durationMin,
    validityDays: validity,
    isSelfPaced: liveSessions === 0,
    deliverables: Array.isArray(pkg.deliverables) ? pkg.deliverables : [],
  };
}

export function parsePackages(packagesRaw) {
  if (!packagesRaw) return [];
  let parsed = [];
  if (typeof packagesRaw === "string") {
    try {
      parsed = JSON.parse(packagesRaw);
    } catch {
      return [];
    }
  } else if (Array.isArray(packagesRaw)) {
    parsed = packagesRaw;
  } else if (typeof packagesRaw === "object") {
    parsed = [packagesRaw];
  }

  return parsed.map((p, idx) => normalizePackage(p, idx)).filter(Boolean);
}
