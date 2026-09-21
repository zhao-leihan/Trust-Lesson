"use client";

import { useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Get stored JWT token from localStorage.
 */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tl_jwt");
}

/**
 * Base fetch wrapper with auth header.
 */
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

/**
 * Hook: SIWE authentication flow.
 * Connects wallet, requests nonce, signs, verifies, stores JWT.
 */
export function useSiweAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authenticate = useCallback(async (address) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Request nonce
      const { nonce } = await apiFetch("/auth/nonce", {
        method: "POST",
        body: JSON.stringify({ address }),
      });

      // 2. Sign message with wallet
      let signature = "dev-signature";
      if (typeof window !== "undefined" && window.ethereum) {
        const message = `Trust Lesson Login\nAddress: ${address}\nNonce: ${nonce}`;
        signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, address],
        });
      }

      // 3. Verify and get JWT
      const { token, user } = await apiFetch("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ address, signature, nonce }),
      });

      // 4. Store JWT
      localStorage.setItem("tl_jwt", token);
      return { token, user };
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tl_jwt");
  }, []);

  return { authenticate, logout, loading, error };
}

/**
 * Hook: fetch sessions for current user.
 */
export function useSessions(role = "learner") {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    if (!getToken()) return; // Not authenticated
    setLoading(true);
    try {
      const data = await apiFetch(`/sessions?role=${role}`);
      setSessions(data.sessions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [role]);

  return { sessions, fetchSessions, loading, error };
}

/**
 * Hook: create a new session.
 */
export function useCreateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSession = useCallback(async ({ mentorAddress, milestones, totalAmount, note }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/sessions", {
        method: "POST",
        body: JSON.stringify({ mentorAddress, milestones, totalAmount, note }),
      });
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSession, loading, error };
}

/**
 * Hook: get Cloudflare upload URL for video.
 */
export function useVideoUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUploadUrl = useCallback(async ({ title, maxDurationSeconds = 3600 }) => {
    setLoading(true);
    try {
      const data = await apiFetch("/videos/upload-url", {
        method: "POST",
        body: JSON.stringify({ title, maxDurationSeconds }),
      });
      return data; // { uploadURL, uid }
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerVideo = useCallback(async (videoData) => {
    setLoading(true);
    try {
      const data = await apiFetch("/videos/register", {
        method: "POST",
        body: JSON.stringify(videoData),
      });
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getUploadUrl, registerVideo, loading, error };
}

/**
 * Hook: raise a dispute.
 */
export function useDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const raiseDispute = useCallback(async ({ sessionId, reason, evidenceJson }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/sessions/${sessionId}/dispute`, {
        method: "POST",
        body: JSON.stringify({ reason, evidenceJson }),
      });
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { raiseDispute, loading, error };
}

/**
 * Hook: update user profile via onboarding endpoint.
 */
export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/users/onboarding", {
        method: "POST",
        body: JSON.stringify(profileData),
      });
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateProfile, loading, error };
}

/**
 * Generic API fetch export for direct use.
 */
export { apiFetch };
