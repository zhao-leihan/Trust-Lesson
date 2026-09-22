/**
 * Local Database Engine (IndexedDB + Storage Fallback)
 * Structured with explicit schemas for users, gigs, sessions, portfolios, and wallet ledger.
 * Excludes heavy video binary files per architecture direction.
 */

const DB_NAME = "TrustLesson_LocalDB";
const DB_VERSION = 1;
const STORES = {
  USERS: "users",
  GIGS: "gigs",
  SESSIONS: "sessions",
  PORTFOLIOS: "portfolios",
  WALLET: "wallet",
};

// Open or initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.USERS)) {
        db.createObjectStore(STORES.USERS, { keyPath: "email" });
      }
      if (!db.objectStoreNames.contains(STORES.GIGS)) {
        db.createObjectStore(STORES.GIGS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
        db.createObjectStore(STORES.SESSIONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.PORTFOLIOS)) {
        db.createObjectStore(STORES.PORTFOLIOS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.WALLET)) {
        db.createObjectStore(STORES.WALLET, { keyPath: "address" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn("IndexedDB open error, falling back to localStorage", request.error);
      resolve(null);
    };
  });
}

// Generic transaction helper
async function performTx(storeName, mode, callback) {
  const db = await openDB();
  if (!db) {
    // LocalStorage fallback
    const key = `tl_db_${storeName}`;
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : [];
    return callback(null, data, (updated) => {
      localStorage.setItem(key, JSON.stringify(updated));
    });
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const result = callback(store);
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
}

// -------------------------------------------------------------
// SEEDING ON INITIAL RUN
// -------------------------------------------------------------
export async function seedInitialDataIfNeeded() {
  const db = await openDB();
  if (!db) return;
}

// -------------------------------------------------------------
// GIGS & COURSES CRUD
// -------------------------------------------------------------
export async function getLocalGigs() {
  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem("tl_db_gigs");
    return raw ? JSON.parse(raw) : [];
  }

  return new Promise((resolve) => {
    const tx = db.transaction(STORES.GIGS, "readonly");
    const req = tx.objectStore(STORES.GIGS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function saveLocalGig(gig) {
  // Enforce schema compliance
  const sanitizedGig = {
    id: gig.id || `gig-${Date.now()}`,
    title: gig.title || "Untitled Gig",
    category: gig.category || "General",
    price: gig.price || 50,
    duration: gig.duration || "1 Week",
    mentorName: gig.mentorName || "Anonymous Mentor",
    mentorAvatar: gig.mentorAvatar || "M",
    description: gig.description || "Project-based milestone mentorship.",
    level: gig.level || "All levels",
    milestones: gig.milestones || [],
    deliverables: gig.deliverables || [],
    hasVideoIntro: gig.hasVideoIntro !== undefined ? gig.hasVideoIntro : true,
    videoFileName: gig.videoFileName || "course_preview.mp4",
    videoDuration: gig.videoDuration || "01:30",
    createdAt: gig.createdAt || new Date().toISOString(),
  };

  const db = await openDB();
  if (!db) {
    const current = await getLocalGigs();
    const updated = [sanitizedGig, ...current.filter((g) => g.id !== sanitizedGig.id)];
    localStorage.setItem("tl_db_gigs", JSON.stringify(updated));
    return sanitizedGig;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.GIGS, "readwrite");
    const store = tx.objectStore(STORES.GIGS);
    store.put(sanitizedGig);
    tx.oncomplete = () => resolve(sanitizedGig);
    tx.onerror = () => reject(tx.error);
  });
}

// -------------------------------------------------------------
// SESSIONS CRUD
// -------------------------------------------------------------
export async function getLocalSessions() {
  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem("tl_db_sessions");
    return raw ? JSON.parse(raw) : [];
  }

  return new Promise((resolve) => {
    const tx = db.transaction(STORES.SESSIONS, "readonly");
    const req = tx.objectStore(STORES.SESSIONS).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

export async function saveLocalSession(session) {
  const db = await openDB();
  if (!db) {
    const current = await getLocalSessions();
    const updated = [session, ...current.filter((s) => s.id !== session.id)];
    localStorage.setItem("tl_db_sessions", JSON.stringify(updated));
    return session;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.SESSIONS, "readwrite");
    tx.objectStore(STORES.SESSIONS).put(session);
    tx.oncomplete = () => resolve(session);
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateLocalSessionStatus(sessionId, status) {
  const sessions = await getLocalSessions();
  const target = sessions.find((s) => s.id === sessionId);
  if (!target) return null;

  target.status = status;
  target.escrowStatus =
    status === "released"
      ? "Released"
      : status === "disputed"
      ? "Disputed"
      : target.escrowStatus;

  await saveLocalSession(target);
  return target;
}

// -------------------------------------------------------------
// PORTFOLIO CRUD
// -------------------------------------------------------------
export async function getLocalPortfolio(mentorEmail) {
  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem("tl_db_portfolios");
    const all = raw ? JSON.parse(raw) : defaultPortfolio;
    return mentorEmail ? all.filter((p) => p.mentorEmail === mentorEmail || !p.mentorEmail) : all;
  }

  return new Promise((resolve) => {
    const tx = db.transaction(STORES.PORTFOLIOS, "readonly");
    const req = tx.objectStore(STORES.PORTFOLIOS).getAll();
    req.onsuccess = () => {
      const results = req.result.length > 0 ? req.result : defaultPortfolio;
      resolve(mentorEmail ? results.filter((p) => p.mentorEmail === mentorEmail || !p.mentorEmail) : results);
    };
    req.onerror = () => resolve(defaultPortfolio);
  });
}

export async function saveLocalPortfolioItem(item) {
  const sanitizedItem = {
    id: item.id || `port-${Date.now()}`,
    mentorEmail: item.mentorEmail || "",
    title: item.title || "Untitled Project",
    description: item.description || "",
    projectUrl: item.projectUrl || "",
    githubUrl: item.githubUrl || "",
    tags: Array.isArray(item.tags) ? item.tags : (item.tags || "").split(",").map((t) => t.trim()),
    featured: Boolean(item.featured),
    createdAt: item.createdAt || new Date().toISOString(),
  };

  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem("tl_db_portfolios");
    const all = raw ? JSON.parse(raw) : defaultPortfolio;
    const updated = [sanitizedItem, ...all.filter((p) => p.id !== sanitizedItem.id)];
    localStorage.setItem("tl_db_portfolios", JSON.stringify(updated));
    return sanitizedItem;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PORTFOLIOS, "readwrite");
    tx.objectStore(STORES.PORTFOLIOS).put(sanitizedItem);
    tx.oncomplete = () => resolve(sanitizedItem);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteLocalPortfolioItem(itemId) {
  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem("tl_db_portfolios");
    const all = raw ? JSON.parse(raw) : defaultPortfolio;
    const filtered = all.filter((p) => p.id !== itemId);
    localStorage.setItem("tl_db_portfolios", JSON.stringify(filtered));
    return true;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PORTFOLIOS, "readwrite");
    tx.objectStore(STORES.PORTFOLIOS).delete(itemId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

// Default portfolio items (empty by default, loaded from LinkedIn or mentor input)
const defaultPortfolio = [];
