"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "144586018759-pl02601bl9a3u9r3r3uu0nsuqkamtma7.apps.googleusercontent.com";

export function useGoogleAuth(options = {}) {
  const { onProfileSuccess } = options;
  const { login } = useAuth();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const tokenClientRef = useRef(null);

  const devLocalIp = process.env.NEXT_PUBLIC_DEV_LOCAL_IP;

  // Auto-redirect from configured dev IP to localhost
  useEffect(() => {
    if (typeof window !== "undefined" && devLocalIp && window.location.hostname.includes(devLocalIp)) {
      window.location.replace(window.location.href.replace(devLocalIp, "localhost"));
    }
  }, [devLocalIp]);

  // Initialize official Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGsi = () => {
      if (!window.google?.accounts) return;

      try {
        // 1. Initialize OAuth 2.0 Token Client for authentic Google popup
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setGoogleError(tokenResponse.error_description || "Google authorization failed.");
              setGoogleLoading(false);
              return;
            }

            try {
              setGoogleLoading(true);
              setGoogleError("");

              // Fetch authentic user profile from Google's official userinfo API
              const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await userinfoRes.json();

              if (!profile.email) {
                throw new Error("Unable to retrieve email from Google.");
              }

              // If consumer provided onProfileSuccess callback (e.g. registration flow), pass data and stop
              if (onProfileSuccess) {
                onProfileSuccess({
                  email: profile.email,
                  name: profile.name || "",
                  avatarUrl: profile.picture || null,
                });
                setGoogleLoading(false);
                return;
              }

              // Send to backend
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  accessToken: tokenResponse.access_token,
                  email: profile.email,
                  name: profile.name || profile.email.split("@")[0],
                  avatarUrl: profile.picture || null,
                }),
              });

              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || "Google Sign-In failed.");
              }

              if (data.token) {
                localStorage.setItem("tl_jwt", data.token);
              }
              localStorage.setItem("trust_lesson_remember", "true");
              localStorage.setItem("trust_lesson_remember_email", profile.email);

              login(data.user, true);
              router.push("/dashboard?tab=profile");
            } catch (err) {
              console.error("[Google Auth Error]:", err);
              setGoogleError(err.message || "Failed to sign in with Google.");
            } finally {
              setGoogleLoading(false);
            }
          },
        });

        // 2. Initialize ID Token flow
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (!response?.credential) return;
            try {
              setGoogleLoading(true);
              setGoogleError("");
              const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Google Sign-In failed.");
              if (data.token) localStorage.setItem("tl_jwt", data.token);
              login(data.user, true);
              router.push("/dashboard?tab=profile");
            } catch (err) {
              setGoogleError(err.message || "Failed to sign in with Google.");
            } finally {
              setGoogleLoading(false);
            }
          },
          auto_select: false,
        });
      } catch (err) {
        console.warn("[Google Identity Services initialization warning]:", err);
      }
    };

    if (window.google?.accounts) {
      initGsi();
      return;
    }

    // Load Google Identity Services script
    const existingScript = document.getElementById("google-gsi-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", initGsi);
    }
  }, [login, router]);

  // Handle OAuth redirect fallback if access token in URL hash fragment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        setGoogleLoading(true);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((r) => r.json())
          .then(async (profile) => {
            if (!profile.email) throw new Error("No email returned from Google");
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken,
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                avatarUrl: profile.picture || null,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Google Sign-In failed.");
            if (data.token) localStorage.setItem("tl_jwt", data.token);
            login(data.user, true);
            router.push("/dashboard?tab=profile");
          })
          .catch((err) => {
            setGoogleError(err.message || "Google OAuth redirect login failed.");
          })
          .finally(() => {
            setGoogleLoading(false);
          });
      }
    }
  }, [login, router]);

  const signInWithGoogle = useCallback(() => {
    if (typeof window !== "undefined" && devLocalIp && window.location.hostname.includes(devLocalIp)) {
      window.location.replace(window.location.href.replace(devLocalIp, "localhost"));
      return;
    }

    setGoogleError("");
    setGoogleLoading(true);

    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
    } else if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setGoogleError(tokenResponse.error_description || "Google authorization failed.");
            setGoogleLoading(false);
            return;
          }
          try {
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const profile = await userinfoRes.json();
            if (onProfileSuccess) {
              onProfileSuccess({
                email: profile.email,
                name: profile.name || "",
                avatarUrl: profile.picture || null,
              });
              setGoogleLoading(false);
              return;
            }
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                accessToken: tokenResponse.access_token,
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                avatarUrl: profile.picture || null,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Google Sign-In failed.");
            if (data.token) localStorage.setItem("tl_jwt", data.token);
            login(data.user, true);
            router.push("/dashboard?tab=profile");
          } catch (err) {
            setGoogleError(err.message || "Failed to sign in with Google.");
          } finally {
            setGoogleLoading(false);
          }
        },
      });
      tokenClientRef.current = client;
      client.requestAccessToken({ prompt: "select_account" });
    } else {
      // Standard OAuth 2.0 direct authorization redirect fallback
      const redirectUri = typeof window !== "undefined" ? `${window.location.origin}/login` : "";
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
      window.location.href = googleOAuthUrl;
    }
  }, [login, router]);

  return {
    signInWithGoogle,
    googleLoading,
    googleError,
  };
}
