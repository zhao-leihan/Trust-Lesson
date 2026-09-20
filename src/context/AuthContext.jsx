import { createContext, useContext, useState, useEffect } from "react";
import { mySessions as initialSessions, initialCourses } from "../data/mentors";
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("trust_learn_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("trust_learn_sessions");
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem("trust_learn_courses");
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [portfolios, setPortfolios] = useState([]);

  const [walletAddress, setWalletAddress] = useState(() => {
    return localStorage.getItem("trust_learn_wallet") || null;
  });

  // Seed and load from local IndexedDB on startup
  useEffect(() => {
    const initDb = async () => {
      try {
        await seedInitialDataIfNeeded();
        const dbGigs = await getLocalGigs();
        if (dbGigs && dbGigs.length > 0) setCourses(dbGigs);

        const dbSessions = await getLocalSessions();
        if (dbSessions && dbSessions.length > 0) setSessions(dbSessions);

        const dbPortfolios = await getLocalPortfolio(user?.email);
        if (dbPortfolios) setPortfolios(dbPortfolios);
      } catch (err) {
        console.warn("DB init warning:", err);
      }
    };
    initDb();
  }, [user?.email]);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          localStorage.setItem("trust_learn_wallet", accounts[0]);
          return accounts[0];
        }
      } catch (err) {
        console.warn("Wallet connection request rejected, using simulated wallet", err);
      }
    }
    const simulatedAddr = "0x71C35267243395B796b42f654b423984E0F449A";
    setWalletAddress(simulatedAddr);
    localStorage.setItem("trust_learn_wallet", simulatedAddr);
    return simulatedAddr;
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem("trust_learn_wallet");
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("trust_learn_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("trust_learn_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("trust_learn_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("trust_learn_courses", JSON.stringify(courses));
  }, [courses]);

  const login = (userData) => {
    const userObj = {
      name: userData.name || userData.email.split("@")[0],
      email: userData.email,
      role: userData.role === "mentor" ? "mentor" : "student",
      avatar: (userData.name || userData.email)[0].toUpperCase(),
      domain: userData.domain || "Frontend & Web Engineering",
      linkedin: userData.linkedin || "",
      instagram: userData.instagram || "",
      twitter: userData.twitter || "",
      portfolio: userData.portfolio || "",
      bio: userData.bio || "Hands-on, project-based mentorship with real code reviews.",
      hourlyRate: userData.hourlyRate || "35",
      joinedDate: "September 2026",
    };
    setUser(userObj);
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
  };

  const logout = () => {
    setUser(null);
  };

  const addSession = async (session) => {
    setSessions((prev) => [session, ...prev]);
    try {
      await saveLocalSession(session);
    } catch (e) {
      console.warn("Session save error", e);
    }
  };

  const addCourse = async (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
    try {
      await saveLocalGig(newCourse);
    } catch (e) {
      console.warn("Course save error", e);
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

  const addPortfolioItem = async (item) => {
    const itemWithMentor = {
      ...item,
      mentorEmail: user?.email || "",
    };
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
