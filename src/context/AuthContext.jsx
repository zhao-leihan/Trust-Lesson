"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  seedInitialDataIfNeeded,
  getLocalGigs,
  saveLocalGig,
  getLocalSessions,
  saveLocalSession,
  updateLocalSessionStatus,
  getLocalPortfolio,
  saveLocalPortfolioItem,
  deleteLocalPortfolioItem,
} from "../db/localDb";

const AuthContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const USE_API = true;

/**
 * Fetch helper with JWT auth header.
 */
async function apiFetch(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("tl_jwt") : null;
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API error");
  }
  return res.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Client Mount: Load from localStorage ──────────────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      const savedUser = localStorage.getItem("trust_lesson_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (
          parsed.email?.toLowerCase().includes("admin") ||
          parsed.name?.toLowerCase().includes("admin") ||
          parsed.role?.toUpperCase() === "ADMIN" ||
          parsed.roleType === "ADMIN"
        ) {
          parsed.role = "admin";
          parsed.roleType = "ADMIN";
        }
        setUser(parsed);
      }

      const savedSessions = localStorage.getItem("trust_lesson_sessions");
      if (savedSessions) setSessions(JSON.parse(savedSessions));

      const savedCourses = localStorage.getItem("trust_lesson_courses");
      if (savedCourses) setCourses(JSON.parse(savedCourses));

      const savedWallet = localStorage.getItem("trust_lesson_wallet");
      if (savedWallet) setWalletAddress(savedWallet);
    } catch (e) {
      console.warn("Error loading from localStorage", e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // ─── After Mount: Seed and load from IndexedDB / API ──────────────────────
  useEffect(() => {
    if (!mounted) return;
    const initDb = async () => {
      try {
        if (USE_API) {
          // Try API first
          const token = localStorage.getItem("tl_jwt");
          if (token) {
            try {
              const meRes = await apiFetch("/auth/me").catch(() => null);
              if (meRes?.user) {
                setUser((prev) => {
                  const merged = { ...(prev || {}), ...meRes.user };
                  localStorage.setItem("trust_lesson_user", JSON.stringify(merged));
                  return merged;
                });
              }
              const [sessionsData, gigsData] = await Promise.all([
                apiFetch("/sessions?role=learner").catch(() => null),
                apiFetch("/videos").catch(() => null),
              ]);
              if (sessionsData?.sessions?.length > 0) setSessions(sessionsData.sessions);
              if (gigsData?.videos?.length > 0) setCourses(gigsData.videos);
            } catch (e) {
              console.warn("[API] Fetch failed, falling back to IndexedDB:", e.message);
            }
          }
        }

        // Always sync with local IndexedDB as fallback / offline cache
        await seedInitialDataIfNeeded();
        const dbGigs = await getLocalGigs();
        if (dbGigs && dbGigs.length > 0 && !USE_API) setCourses(dbGigs);

        const dbSessions = await getLocalSessions();
        if (dbSessions && dbSessions.length > 0 && !USE_API) setSessions(dbSessions);

        const dbPortfolios = await getLocalPortfolio(user?.email);
        if (dbPortfolios) setPortfolios(dbPortfolios);

        // Fetch fresh profile from database to ensure no profile loss across logout/login
        if (user?.email) {
          try {
            const profileRes = await fetch(`/api/mentor/profile?email=${encodeURIComponent(user.email)}&userId=${user.id || ""}`);
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              if (profileData?.user) {
                setUser((prev) => {
                  if (!prev) return prev;
                  const merged = {
                    ...prev,
                    name: profileData.user.name || prev.name,
                    nickname: profileData.user.nickname || prev.nickname,
                    avatarUrl: profileData.user.avatarUrl || prev.avatarUrl,
                    bio: profileData.user.bio || prev.bio,
                    domain: profileData.user.domain || prev.domain,
                    hourlyRate: profileData.user.hourlyRate || prev.hourlyRate,
                    linkedin: profileData.user.linkedin || prev.linkedin,
                    twitter: profileData.user.twitter || prev.twitter,
                    portfolio: profileData.user.portfolio || prev.portfolio,
                    walletAddress: profileData.user.walletAddress || prev.walletAddress,
                    walletLocked: profileData.user.walletLocked ?? prev.walletLocked,
                    mentorLevel: profileData.user.mentorLevel || prev.mentorLevel,
                  };
                  localStorage.setItem("trust_lesson_user", JSON.stringify(merged));
                  return merged;
                });
              }
            }
          } catch (syncErr) {
            console.warn("[AuthContext] Profile sync warning:", syncErr);
          }
        }
      } catch (err) {
        console.warn("DB init warning:", err);
      }
    };
    initDb();
  }, [user?.email, mounted]);

  // ─── Wallet Connection (MetaMask / Coinbase / SIWE) ────────────────────────
  const connectWallet = async (walletType = "any") => {
    let address = null;

    if (typeof window !== "undefined") {
      let targetProvider = null;

      if (window.ethereum?.providers?.length) {
        if (walletType === "coinbase") {
          targetProvider = window.ethereum.providers.find((p) => p.isCoinbaseWallet) || window.coinbaseWalletExtension;
        } else if (walletType === "metamask") {
          targetProvider = window.ethereum.providers.find((p) => p.isMetaMask && !p.isCoinbaseWallet);
        }
        if (!targetProvider) targetProvider = window.ethereum.providers[0];
      } else if (walletType === "coinbase" && window.coinbaseWalletExtension) {
        targetProvider = window.coinbaseWalletExtension;
      } else if (window.ethereum) {
        targetProvider = window.ethereum;
      }

      if (targetProvider) {
        try {
          const accounts = await targetProvider.request({ method: "eth_requestAccounts" });
          if (accounts && accounts[0]) address = accounts[0];
        } catch (err) {
          console.warn(`[${walletType}] Wallet connection rejected, using simulated wallet`, err);
        }
      }
    }

    if (!address) {
      // Dev fallback: simulated wallet with distinct address per wallet provider
      address =
        walletType === "coinbase"
          ? "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
          : "0x71C35267243395B796b42f654b423984E0F449A";
    }

    setWalletAddress(address);
    localStorage.setItem("trust_lesson_wallet", address);

    // SIWE authentication flow if API is configured
    if (USE_API) {
      try {
        const { nonce } = await apiFetch("/auth/nonce", {
          method: "POST",
          body: JSON.stringify({ address }),
        });

        let signature = "dev-signature";
        if (typeof window !== "undefined" && targetProvider) {
          try {
            const message = `Trust Lesson Login\nAddress: ${address}\nNonce: ${nonce}`;
            signature = await targetProvider.request({
              method: "personal_sign",
              params: [message, address],
            });
          } catch {
            signature = "dev-signature";
          }
        }

        const { token, user: apiUser } = await apiFetch("/auth/verify", {
          method: "POST",
          body: JSON.stringify({ address, signature, nonce }),
        });

        localStorage.setItem("tl_jwt", token);

        if (apiUser && !user) {
          setUser({
            name: apiUser.name || address.slice(0, 8),
            email: apiUser.email || `${address.slice(2, 10)}@wallet.eth`,
            role: apiUser.role === "MENTOR" ? "mentor" : "student",
            avatar: (apiUser.name || address)[0].toUpperCase(),
            walletAddress: address,
          });
        }
      } catch (e) {
        console.warn("[SIWE] Auth failed:", e.message);
      }
    }

    return address;
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("trust_lesson_wallet");
    localStorage.removeItem("tl_jwt");
  };

  // ─── Persist user to localStorage ──────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    if (user) {
      localStorage.setItem("trust_lesson_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("trust_lesson_user");
    }
  }, [user, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("trust_lesson_sessions", JSON.stringify(sessions));
  }, [sessions, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("trust_lesson_courses", JSON.stringify(courses));
  }, [courses, mounted]);

  // ─── Auth Actions ───────────────────────────────────────────────────────────
  const login = (userData, remember = true) => {
    const rawRole = (userData.role || "student").toString();
    const roleUpper = rawRole.toUpperCase();
    const roleNormalized = roleUpper === "ADMIN" ? "admin" : roleUpper === "MENTOR" ? "mentor" : "student";

    const userObj = {
      id: userData.id,
      name: userData.name || userData.email?.split("@")[0] || "User",
      nickname: userData.nickname || userData.name?.toLowerCase().replace(/\s+/g, "_") || userData.email?.split("@")[0] || "user",
      email: userData.email,
      role: roleNormalized,
      roleType: roleUpper,
      university: userData.university || null,
      avatar: (userData.name || userData.email || "U")[0].toUpperCase(),
      avatarUrl: userData.avatarUrl || null,
      domain: userData.domain || (roleUpper === "ADMIN" ? "Platform Administrator" : roleUpper === "MENTOR" ? "Smart Contract & Web3 Architecture" : "Student Learner"),
      linkedin: userData.linkedin || "",
      instagram: userData.instagram || "",
      twitter: userData.twitter || "",
      portfolio: userData.portfolio || "",
      bio: userData.bio || "Hands-on, project-based mentorship with real code reviews.",
      hourlyRate: userData.hourlyRate || (roleUpper === "MENTOR" ? "45" : "35"),
      isVerified: userData.isVerified ?? false,
      walletAddress: userData.walletAddress || null,
      walletLocked: userData.walletLocked ?? false,
      mentorLevel: userData.mentorLevel || "RISING",
      joinedDate: userData.joinedDate || "September 2026",
    };
    setUser(userObj);
    if (typeof window !== "undefined") {
      localStorage.setItem("trust_lesson_user", JSON.stringify(userObj));
      if (remember) {
        localStorage.setItem("trust_lesson_remember", "true");
        if (userObj.email) {
          localStorage.setItem("trust_lesson_remember_email", userObj.email);
        }
      } else {
        localStorage.removeItem("trust_lesson_remember");
      }
    }

    // Sync profile to API if available
    if (USE_API) {
      const token = localStorage.getItem("tl_jwt");
      if (token) {
        apiFetch("/users/onboarding", {
          method: "POST",
          body: JSON.stringify({
            role: roleUpper === "MENTOR" ? "MENTOR" : roleUpper === "ADMIN" ? "ADMIN" : "LEARNER",
            domain: userObj.domain,
            bio: userObj.bio,
            avatarUrl: userObj.avatarUrl,
            linkedin: userObj.linkedin,
            instagram: userObj.instagram,
            twitter: userObj.twitter,
            portfolio: userObj.portfolio,
            hourlyRate: userObj.hourlyRate,
            university: userObj.university,
          }),
        }).catch((e) => console.warn("[API] Onboarding sync failed:", e.message));
      }
    }
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      if (typeof window !== "undefined") {
        localStorage.setItem("trust_lesson_user", JSON.stringify(nextUser));
      }
      return nextUser;
    });

    // Sync to API via /api/mentor/profile or /users/onboarding
    fetch("/api/mentor/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        email: user?.email,
        address: walletAddress || user?.walletAddress,
        ...updatedFields,
      }),
    }).catch((e) => console.warn("[API] Mentor profile update failed:", e.message));

    if (USE_API) {
      const token = localStorage.getItem("tl_jwt");
      if (token) {
        apiFetch("/users/onboarding", {
          method: "POST",
          body: JSON.stringify(updatedFields),
        }).catch((e) => console.warn("[API] Profile update failed:", e.message));
      }
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
      localStorage.removeItem("tl_jwt");
      localStorage.removeItem("trust_lesson_user");
    }
  };

  // ─── Session Actions ────────────────────────────────────────────────────────
  const addSession = async (session) => {
    setSessions((prev) => [session, ...prev]);
    try {
      await saveLocalSession(session);
    } catch (e) {
      console.warn("Session save error", e);
    }

    // Sync to API
    if (USE_API && session.mentorAddress) {
      apiFetch("/sessions", {
        method: "POST",
        body: JSON.stringify({
          mentorAddress: session.mentorAddress,
          totalAmount: session.price,
          note: session.note,
          milestones: session.milestones || [],
        }),
      }).catch((e) => console.warn("[API] Session create failed:", e.message));
    }
  };

  const addCourse = async (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
    try {
      await saveLocalGig(newCourse);
    } catch (e) {
      console.warn("Course save error", e);
    }

    // Persist real gig to database table `Offering`
    try {
      await fetch("/api/explore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeringType: "course",
          title: newCourse.title,
          category: newCourse.category || "Coding",
          price: Number(newCourse.price) || 0,
          duration: newCourse.duration || "1 Live Meeting",
          description: newCourse.description || "Structured milestone-based mentorship bootcamp.",
          coverImage: newCourse.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
          mentorName: user?.name || "Mentor",
          mentorPhoto: user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          mentorAddress: walletAddress || "",
          milestones: newCourse.milestones || [],
          deliverables: newCourse.deliverables || [],
        }),
      });
    } catch (err) {
      console.warn("[API] Failed to persist new gig to DB:", err);
    }
  };

  const updateSessionStatus = async (sessionId, status) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status,
              escrowStatus:
                status === "released"
                  ? "Released"
                  : status === "disputed"
                  ? "Disputed"
                  : s.escrowStatus,
            }
          : s
      )
    );
    try {
      await updateLocalSessionStatus(sessionId, status);
    } catch (e) {
      console.warn("Update session error", e);
    }
  };

  // ─── Portfolio Actions ──────────────────────────────────────────────────────
  const addPortfolioItem = async (item) => {
    const itemWithMentor = { ...item, mentorEmail: user?.email || "" };
    try {
      const saved = await saveLocalPortfolioItem(itemWithMentor);
      setPortfolios((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      return saved;
    } catch (e) {
      console.warn("Portfolio save error", e);
      setPortfolios((prev) => [itemWithMentor, ...prev]);
    }
  };

  const deletePortfolioItem = async (itemId) => {
    setPortfolios((prev) => prev.filter((p) => p.id !== itemId));
    try {
      await deleteLocalPortfolioItem(itemId);
    } catch (e) {
      console.warn("Portfolio delete error", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        logout,
        updateUserProfile,
        sessions,
        addSession,
        courses,
        addCourse,
        updateSessionStatus,
        walletAddress,
        connectWallet,
        disconnectWallet,
        portfolios,
        addPortfolioItem,
        deletePortfolioItem,
        // Expose API utility for child components
        apiFetch: USE_API ? apiFetch : null,
        isApiEnabled: USE_API,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
