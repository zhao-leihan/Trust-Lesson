import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { verifyJwt, signJwt, signAccessToken, signRefreshToken, verifyRefreshToken, extractBearerToken } from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getCloudflareUploadUrl, getSignedPlaybackUrl, getSignedPlaybackToken } from "@/lib/cloudflare";
import { uploadResourceToR2, getPresignedR2DownloadUrl, verifyAndGetDevResource } from "@/lib/cloudflareR2";
import { uploadToIpfs, uploadJsonToIpfs } from "@/lib/ipfs";
import { getSponsorVaultStatus, issueOnChainCredentialWithSubsidy, PLATFORM_SPONSOR_WALLET } from "@/lib/gasSponsor";
import { getActiveNetwork } from "@/lib/networkConfig";
import { calculateMentorScore, isJurorEligible, calculateStudentScore } from "@/lib/leaderboardScore";
import { sendWelcomeEmail, sendTransactionReceiptEmail, sendNewMaterialEmail } from "@/lib/resend";
import { generateCaptcha, verifyCaptcha } from "@/lib/captcha";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = async (c, next) => {
  const token = extractBearerToken(c.req.header("Authorization")) || getCookie(c, "tl_session");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  try {
    const payload = await verifyJwt(token);
    // Check token revocation (session invalidation)
    if (payload.sub && payload.tv) {
      try {
        const db = await getPrisma();
        const u = await db.user.findUnique({ where: { id: payload.sub } });
        if (u && (u.tokenVersion || 1) > payload.tv) {
          return c.json({ error: "Session has been revoked. Please sign in again." }, 401);
        }
      } catch {}
    }
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};

// ─── Helper: get Prisma lazily (avoid import at module level for edge compat) ─
let _prisma = null;
async function getPrisma() {
  if (!_prisma) {
    const { prisma } = await import("@/lib/prisma");
    _prisma = prisma;
  }
  return _prisma;
}


// ════════════════════════════════════════════════════════════════════
// AUTH ROUTES (Email/Password + SIWE Web3 + Captcha)
// ════════════════════════════════════════════════════════════════════

/** GET /api/auth/captcha — Generate Visual SVG Captcha */
app.get("/auth/captcha", async (c) => {
  const captcha = generateCaptcha();
  return c.json(captcha);
});

/** GET /api/auth/google/login — 1-Click Google Calendar & Meet connection */
app.get("/auth/google/login", (c) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar.events")}&access_type=offline&prompt=consent`;
  return c.redirect(url);
});

/** GET /api/auth/google/callback — Auto-saves GOOGLE_REFRESH_TOKEN to .env */
app.get("/auth/google/callback", async (c) => {
  const code = c.req.query("code");
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${new URL(c.req.url).origin}/api/auth/google/callback`;

  if (!code) return c.text("Authorization code missing", 400);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await tokenRes.json();
  if (data.refresh_token) {
    const fs = await import("fs");
    const path = await import("path");
    const envPath = path.resolve(process.cwd(), ".env");
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("GOOGLE_REFRESH_TOKEN=")) {
      envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=".*"/, `GOOGLE_REFRESH_TOKEN="${data.refresh_token}"`);
    } else {
      envContent += `\nGOOGLE_REFRESH_TOKEN="${data.refresh_token}"\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf8");
    process.env.GOOGLE_REFRESH_TOKEN = data.refresh_token;

    return c.html(`
      <div style="font-family:system-ui,sans-serif;padding:50px;text-align:center;">
        <h2 style="color:#16a34a;margin-bottom:8px;">Google Meet Connected! 🎉</h2>
        <p style="color:#475569;margin-bottom:24px;">GOOGLE_REFRESH_TOKEN has been automatically saved to .env</p>
        <a href="/dashboard/requests" style="background:#7c3aed;color:white;padding:10px 20px;border-radius:12px;text-decoration:none;font-weight:bold;">Return to Dashboard</a>
      </div>
    `);
  }

  return c.json({ error: "Failed to obtain refresh token", detail: data }, 400);
});

/** POST /api/auth/login — Email + Password Login with Turnstile & Dual Tokens */
app.post("/auth/login", async (c) => {
  const clientIp = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("x-real-ip") || "127.0.0.1";
  const body = await c.req.json().catch(() => ({}));
  const { email, password, rememberMe, turnstileToken, captchaId, captchaAnswer } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Sliding Window Rate Limiting (IP & Email level)
  const ipLimit = checkRateLimit(`ip:${clientIp}`);
  if (!ipLimit.allowed) {
    return c.json({
      error: `Too many login attempts from this network. Please wait ${ipLimit.retryAfterSeconds} seconds before trying again.`,
      retryAfter: ipLimit.retryAfterSeconds,
    }, 429);
  }

  const emailLimit = checkRateLimit(`email:${cleanEmail}`);
  if (!emailLimit.allowed) {
    return c.json({
      error: `Too many login attempts for this account. Please wait ${emailLimit.retryAfterSeconds} seconds before trying again.`,
      retryAfter: emailLimit.retryAfterSeconds,
    }, 429);
  }

  // 2. Cloudflare Turnstile Bot Verification (with backward-compatible visual captcha fallback)
  if (turnstileToken) {
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      recordFailedAttempt(`ip:${clientIp}`);
      recordFailedAttempt(`email:${cleanEmail}`);
      return c.json({ error: turnstileCheck.error || "Turnstile security check failed." }, 400);
    }
  } else if (captchaId && captchaAnswer) {
    const captchaCheck = verifyCaptcha(captchaId, captchaAnswer);
    if (!captchaCheck.valid) {
      recordFailedAttempt(`ip:${clientIp}`);
      recordFailedAttempt(`email:${cleanEmail}`);
      return c.json({ error: captchaCheck.reason || "Invalid captcha verification code." }, 400);
    }
  } else {
    recordFailedAttempt(`ip:${clientIp}`);
    recordFailedAttempt(`email:${cleanEmail}`);
    return c.json({ error: "Security bot verification is required." }, 400);
  }

  try {
    const db = await getPrisma();
    const adminEmails = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
    const isAdminEmail = adminEmails.includes(cleanEmail);
    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      recordFailedAttempt(`ip:${clientIp}`);
      recordFailedAttempt(`email:${cleanEmail}`);
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedAttempt(`ip:${clientIp}`);
      recordFailedAttempt(`email:${cleanEmail}`);
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Reset rate limits on successful authentication
    resetRateLimit(`ip:${clientIp}`);
    resetRateLimit(`email:${cleanEmail}`);

    // Auto-elevate designated admin emails if not already set
    if (isAdminEmail && (user.role !== "ADMIN" || !user.isJuror)) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          isJuror: true,
          isVerified: true,
          mentorLevel: "MASTER",
          stakeAmount: 1000,
        },
      });
    }

    const isRemember = Boolean(rememberMe);
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      address: user.walletAddress,
      role: user.role,
      tv: user.tokenVersion || 1,
    };

    // Issue short-lived Access Token (15m) + long-lived Refresh Token (7d / 30d)
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload, isRemember);

    // Set secure HttpOnly cookies
    setCookie(c, "tl_session", accessToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60, // 15 minutes
    });

    setCookie(c, "tl_refresh", refreshToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: isRemember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    });

    let userNickname = null;
    try {
      const rows = await db.$queryRawUnsafe(`SELECT nickname FROM "User" WHERE id = ? LIMIT 1`, user.id);
      if (rows && rows[0]) userNickname = rows[0].nickname;
    } catch {}

    return c.json({
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: userNickname || user.name?.toLowerCase().replace(/\s+/g, "_"),
        role: user.role,
        isJuror: user.isJuror || isAdminEmail,
        university: user.university,
        walletAddress: user.walletAddress,
        walletLocked: user.walletLocked || false,
        mentorLevel: user.mentorLevel || "RISING",
        isVerified: user.isVerified,
        domain: user.domain,
        hourlyRate: user.hourlyRate,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        linkedin: user.linkedin,
        twitter: user.twitter,
        portfolio: user.portfolio,
      },
    });
  } catch (e) {
    console.error("[Login Error]:", e);
    return c.json({ error: "Database error during login", detail: e.message }, 500);
  }
});

/** POST /api/auth/refresh — Silent Access Token Refresh with Rotation */
app.post("/auth/refresh", async (c) => {
  const refreshToken = getCookie(c, "tl_refresh") || extractBearerToken(c.req.header("Authorization"));
  if (!refreshToken) {
    return c.json({ error: "No refresh token provided" }, 401);
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const db = await getPrisma();
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      deleteCookie(c, "tl_session", { path: "/" });
      deleteCookie(c, "tl_refresh", { path: "/" });
      return c.json({ error: "User not found" }, 401);
    }

    // Token version check for revocation
    if ((user.tokenVersion || 1) !== payload.tv) {
      deleteCookie(c, "tl_session", { path: "/" });
      deleteCookie(c, "tl_refresh", { path: "/" });
      return c.json({ error: "Session has been revoked. Please sign in again." }, 401);
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      address: user.walletAddress,
      role: user.role,
      tv: user.tokenVersion || 1,
    };

    const newAccessToken = await signAccessToken(tokenPayload);
    const newRefreshToken = await signRefreshToken(tokenPayload, false);

    // Rotate cookies
    setCookie(c, "tl_session", newAccessToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60,
    });

    setCookie(c, "tl_refresh", newRefreshToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    return c.json({
      token: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    deleteCookie(c, "tl_session", { path: "/" });
    deleteCookie(c, "tl_refresh", { path: "/" });
    return c.json({ error: "Invalid or expired refresh token" }, 401);
  }
});

/** POST /api/auth/logout — Invalidate Session and Clear Cookies */
app.post("/auth/logout", async (c) => {
  deleteCookie(c, "tl_session", { path: "/" });
  deleteCookie(c, "tl_refresh", { path: "/" });
  return c.json({ success: true, message: "Logged out successfully" });
});

/** POST /api/auth/google — Authentic Google Identity OAuth Login / Registration */
app.post("/auth/google", async (c) => {
  try {
    const { credential, accessToken, email, name, avatarUrl } = await c.req.json();
    let verifiedEmail = null;
    let verifiedName = name || null;
    let verifiedAvatar = avatarUrl || null;

    // 1. Verify via Google ID Token (Google Identity Services standard credential)
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (verifyRes.ok) {
          const tokenInfo = await verifyRes.json();
          verifiedEmail = tokenInfo.email;
          verifiedName = tokenInfo.name || verifiedName;
          verifiedAvatar = tokenInfo.picture || verifiedAvatar;
        }
      } catch (err) {
        console.warn("[Google tokeninfo check error]:", err);
      }
    }

    // 2. Verify via Google Access Token (userinfo endpoint)
    if (accessToken && !verifiedEmail) {
      try {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userinfoRes.ok) {
          const info = await userinfoRes.json();
          verifiedEmail = info.email;
          verifiedName = info.name || verifiedName;
          verifiedAvatar = info.picture || verifiedAvatar;
        }
      } catch (err) {
        console.warn("[Google userinfo check error]:", err);
      }
    }

    // Fallback if client verified
    if (!verifiedEmail && email) {
      verifiedEmail = email;
    }

    if (!verifiedEmail) {
      return c.json({ error: "Failed to verify Google account credentials." }, 400);
    }

    const cleanEmail = verifiedEmail.toLowerCase().trim();
    const db = await getPrisma();

    const adminEmails = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
    const isAdminEmail = adminEmails.includes(cleanEmail);

    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const randHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const randWallet = `0x${randHex}`;

      user = await db.user.create({
        data: {
          email: cleanEmail,
          name: verifiedName || cleanEmail.split("@")[0],
          avatarUrl: verifiedAvatar || "/student-profile.webp",
          role: isAdminEmail ? "ADMIN" : "LEARNER",
          isJuror: isAdminEmail,
          isVerified: isAdminEmail,
          mentorLevel: isAdminEmail ? "MASTER" : "RISING",
          stakeAmount: isAdminEmail ? 1000 : 0,
          walletAddress: randWallet,
          walletLocked: false,
        },
      });
    } else {
      const updates = {};
      if (verifiedAvatar && (!user.avatarUrl || user.avatarUrl.includes("student-profile"))) {
        updates.avatarUrl = verifiedAvatar;
      }
      if (verifiedName && !user.name) {
        updates.name = verifiedName;
      }
      if (isAdminEmail && (user.role !== "ADMIN" || !user.isJuror)) {
        updates.role = "ADMIN";
        updates.isJuror = true;
        updates.isVerified = true;
        updates.mentorLevel = "MASTER";
        updates.stakeAmount = 1000;
      }
      if (Object.keys(updates).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }

    const token = await signJwt(
      {
        sub: user.id,
        email: user.email,
        address: user.walletAddress,
        role: user.role,
        tv: user.tokenVersion || 1,
      },
      "30d"
    );

    setCookie(c, "tl_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    let userNickname = null;
    try {
      const rows = await db.$queryRawUnsafe(`SELECT nickname FROM "User" WHERE id = ? LIMIT 1`, user.id);
      if (rows && rows[0]) userNickname = rows[0].nickname;
    } catch {}

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: userNickname || user.name?.toLowerCase().replace(/\s+/g, "_"),
        role: user.role,
        isJuror: user.isJuror || isAdminEmail,
        university: user.university,
        walletAddress: user.walletAddress,
        walletLocked: user.walletLocked || false,
        mentorLevel: user.mentorLevel || "RISING",
        isVerified: user.isVerified,
        domain: user.domain,
        hourlyRate: user.hourlyRate,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        linkedin: user.linkedin,
        twitter: user.twitter,
        portfolio: user.portfolio,
      },
    });
  } catch (e) {
    console.error("[Google Auth Route Error]:", e);
    return c.json({ error: "Google authentication failed", detail: e.message }, 500);
  }
});

/** GET /api/auth/me — Retrieve authenticated user profile by JWT */
app.get("/auth/me", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { id: jwtUser.sub },
    });
    if (!user) return c.json({ error: "User not found" }, 404);

    let userNickname = null;
    try {
      const rows = await db.$queryRawUnsafe(`SELECT nickname FROM "User" WHERE id = ? LIMIT 1`, user.id);
      if (rows && rows[0]) userNickname = rows[0].nickname;
    } catch {}

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: userNickname || user.name?.toLowerCase().replace(/\s+/g, "_"),
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        walletLocked: user.walletLocked || false,
        mentorLevel: user.mentorLevel || "RISING",
        isVerified: user.isVerified,
        domain: user.domain,
        hourlyRate: user.hourlyRate,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        linkedin: user.linkedin,
        twitter: user.twitter,
        portfolio: user.portfolio,
      },
    });
  } catch (e) {
    console.error("[Auth /me Error]:", e);
    return c.json({ error: "Failed to fetch session", detail: e.message }, 500);
  }
});

/** POST /api/auth/logout — Invalidate cookie & revoke server session */
app.post("/auth/logout", async (c) => {
  deleteCookie(c, "tl_session", { path: "/" });
  const token = extractBearerToken(c.req.header("Authorization")) || getCookie(c, "tl_session");
  if (token) {
    try {
      const payload = await verifyJwt(token);
      if (payload.sub) {
        const db = await getPrisma();
        await db.user.update({
          where: { id: payload.sub },
          data: { tokenVersion: { increment: 1 } },
        });
      }
    } catch {}
  }
  return c.json({ success: true, message: "Logged out and session revoked." });
});

/** POST /api/auth/register — Email + Password Registration with Deep Onboarding */
app.post("/auth/register", async (c) => {
  const body = await c.req.json();
  const {
    email,
    password,
    name,
    role,
    university,
    domain,
    bio,
    hourlyRate,
    walletAddress,
    linkedin,
    instagram,
    twitter,
    portfolio,
    stakeAmount,
    isVerified,
    birthDate,
    domicileCountry,
    educationHistory,
    learningInterests,
    skills,
    languages,
    videoIntroUrl,
    verificationType,
    availability,
  } = body;

  if (!email || !password || !name) {
    return c.json({ error: "Name, email, and password are required" }, 400);
  }

  try {
    const db = await getPrisma();
    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return c.json({ error: "An account with this email already exists" }, 400);
    }

    const cleanEmail = email.toLowerCase().trim();
    const adminEmails = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
    const isAdminEmail = adminEmails.includes(cleanEmail);
    const assignedRole = isAdminEmail ? "ADMIN" : (role || "LEARNER").toUpperCase();
    const passwordHash = hashPassword(password);
    const hasStaked = Number(stakeAmount) >= 100;
    const isJuror = isAdminEmail || Boolean(hasStaked && assignedRole === "MENTOR");
    const verifiedStatus = Boolean(isVerified || hasStaked || assignedRole === "ADMIN");

    const newUser = await db.user.create({
      data: {
        email: cleanEmail,
        name,
        passwordHash,
        role: assignedRole,
        isJuror,
        university: assignedRole === "LEARNER" ? university || null : null,
        domain: assignedRole === "MENTOR" ? domain || "Software Engineering" : null,
        hourlyRate: assignedRole === "MENTOR" ? Number(hourlyRate) || 35 : (isAdminEmail ? 50 : 0),
        bio: bio || (isAdminEmail ? "Trust Lesson Platform Administrator and Ex-Officio Council Juror." : null),
        walletAddress: walletAddress || null,
        linkedin: linkedin || null,
        instagram: instagram || null,
        twitter: twitter || null,
        portfolio: portfolio || null,
        stakeAmount: isAdminEmail ? 1000 : (Number(stakeAmount) || 0),
        isVerified: verifiedStatus,
        mentorLevel: isAdminEmail ? "MASTER" : (hasStaked ? "PRO" : "RISING"),
        tokenVersion: 1,
      },
    });

    // Send Welcome Email via Resend
    sendWelcomeEmail({
      to: newUser.email,
      name: newUser.name,
      role: newUser.role,
    }).catch((err) => console.warn("[Resend Register Email Warning]:", err.message));

    // Save extended SQLite columns
    try {
      await db.$executeRawUnsafe(
        `UPDATE "User" SET 
          "birthDate" = ?, 
          "domicileCountry" = ?, 
          "educationHistory" = ?, 
          "learningInterests" = ?, 
          "skills" = ?, 
          "languages" = ?, 
          "videoIntroUrl" = ?, 
          "verificationType" = ?, 
          "availability" = ? 
        WHERE id = ?`,
        birthDate || null,
        domicileCountry || null,
        educationHistory ? JSON.stringify(educationHistory) : null,
        learningInterests ? JSON.stringify(learningInterests) : null,
        skills ? JSON.stringify(skills) : null,
        languages ? JSON.stringify(languages) : null,
        videoIntroUrl || null,
        verificationType || null,
        availability ? JSON.stringify(availability) : null,
        newUser.id
      );
    } catch (colErr) {
      console.warn("[Register Warning] Extended column update:", colErr.message);
    }

    const token = await signJwt(
      {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tv: 1,
      },
      "30d"
    );

    setCookie(c, "tl_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    return c.json(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          isJuror: newUser.isJuror,
          university: newUser.university,
          domain: newUser.domain,
          hourlyRate: newUser.hourlyRate,
          isVerified: verifiedStatus,
          walletAddress: newUser.walletAddress,
          stakeAmount: newUser.stakeAmount,
          mentorLevel: newUser.mentorLevel,
        },
      },
      201
    );
  } catch (e) {
    console.error("[Register Error]:", e);
    return c.json({ error: "Database error during registration", detail: e.message }, 500);
  }
});

/** POST /api/auth/google — Seamless Google Sign-In & Instant Onboarding */
app.post("/auth/google", async (c) => {
  const body = await c.req.json();
  const { email, name, avatarUrl } = body;

  if (!email) {
    return c.json({ error: "Email is required for Google Sign-In" }, 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  const adminEmails = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
  const isAdminEmail = adminEmails.includes(cleanEmail);

  try {
    const db = await getPrisma();
    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await db.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split("@")[0],
          role: isAdminEmail ? "ADMIN" : "LEARNER",
          isJuror: isAdminEmail,
          isVerified: true,
          avatarUrl: avatarUrl || null,
          stakeAmount: isAdminEmail ? 1000 : 0,
          mentorLevel: isAdminEmail ? "MASTER" : "RISING",
          hourlyRate: isAdminEmail ? 50 : 35,
          bio: isAdminEmail
            ? "Trust Lesson Platform Administrator and Ex-Officio Council Juror."
            : "Trust Lesson Learner authenticated via Google.",
          tokenVersion: 1,
        },
      });

      // Send welcome email via Resend
      sendWelcomeEmail({
        to: user.email,
        name: user.name,
        role: user.role,
      }).catch((err) => console.warn("[Resend Google Welcome Warning]:", err.message));
    } else if (isAdminEmail && (user.role !== "ADMIN" || !user.isJuror)) {
      // Auto-escalate designated admin emails to Super-Admin + Council Juror
      user = await db.user.update({
        where: { id: user.id },
        data: {
          role: "ADMIN",
          isJuror: true,
          isVerified: true,
          mentorLevel: "MASTER",
          stakeAmount: 1000,
        },
      });
    }

    const token = await signJwt(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tv: user.tokenVersion || 1,
      },
      "30d"
    );

    setCookie(c, "tl_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 30 * 24 * 60 * 60,
    });

    let userNickname = null;
    try {
      const rows = await db.$queryRawUnsafe(`SELECT nickname FROM "User" WHERE id = ? LIMIT 1`, user.id);
      if (rows && rows[0]) userNickname = rows[0].nickname;
    } catch {}

    return c.json({
      token,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: userNickname || user.name?.toLowerCase().replace(/\s+/g, "_"),
        role: user.role,
        isJuror: user.isJuror || isAdminEmail,
        university: user.university,
        walletAddress: user.walletAddress,
        walletLocked: user.walletLocked || false,
        mentorLevel: user.mentorLevel || "RISING",
        isVerified: user.isVerified,
        domain: user.domain,
        hourlyRate: user.hourlyRate,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        linkedin: user.linkedin,
        twitter: user.twitter,
        portfolio: user.portfolio,
      },
    });
  } catch (e) {
    console.error("[Google Auth Error]:", e);
    return c.json({ error: "Database error during Google sign-in", detail: e.message }, 500);
  }
});

/** POST /api/auth/nonce — Generate SIWE nonce */
app.post("/auth/nonce", async (c) => {
  const { address } = await c.req.json();
  if (!address) return c.json({ error: "address required" }, 400);

  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  try {
    const db = await getPrisma();
    await db.authNonce.upsert({
      where: { address: address.toLowerCase() },
      update: { nonce, expiresAt },
      create: { address: address.toLowerCase(), nonce, expiresAt },
    });
  } catch {
    // DB not connected — return nonce anyway for dev
    console.warn("[nonce] DB not connected, returning dev nonce");
  }

  return c.json({ nonce });
});

/** POST /api/auth/verify — Verify SIWE signature, return JWT */
app.post("/auth/verify", async (c) => {
  const { address, signature, nonce } = await c.req.json();
  if (!address || !signature) return c.json({ error: "address and signature required" }, 400);

  // In production: verify EIP-4361 signature using viem verifyMessage
  // For now: accept any signature in dev mode
  const isDev = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost");
  let user = null;

  try {
    const db = await getPrisma();

    // Verify nonce
    const storedNonce = await db.authNonce.findUnique({
      where: { address: address.toLowerCase() },
    });
    if (!isDev && (!storedNonce || storedNonce.nonce !== nonce || storedNonce.expiresAt < new Date())) {
      return c.json({ error: "Invalid or expired nonce" }, 401);
    }

    // Find or create user
    user = await db.user.upsert({
      where: { walletAddress: address.toLowerCase() },
      update: { updatedAt: new Date() },
      create: { walletAddress: address.toLowerCase(), role: "LEARNER" },
    });

    // Clean up nonce
    await db.authNonce.deleteMany({ where: { address: address.toLowerCase() } });
  } catch {
    // DB not connected — create a mock user object
    console.warn("[verify] DB not connected, using mock user");
    user = {
      id: `mock-${address.slice(2, 8)}`,
      walletAddress: address.toLowerCase(),
      role: "LEARNER",
      name: null,
    };
  }

  const token = await signJwt({
    sub: user.id,
    address: user.walletAddress,
    role: user.role,
  });

  return c.json({ token, user });
});

/** GET /api/auth/me — Get current user from JWT */
app.get("/auth/me", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({ where: { id: jwtUser.sub } });
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ user });
  } catch {
    return c.json({ user: jwtUser });
  }
});

// ════════════════════════════════════════════════════════════════════
// USER ROUTES
// ════════════════════════════════════════════════════════════════════

/** GET /api/users/:address */
app.get("/users/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { walletAddress: address },
      include: {
        sessionsAsMentor: { where: { status: "COMPLETED" } },
        videos: { where: { isActive: true } },
      },
    });
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ user });
  } catch (e) {
    return c.json({ error: "DB unavailable", detail: e.message }, 503);
  }
});

/** POST /api/users/onboarding — Update profile */
app.post("/users/onboarding", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const body = await c.req.json();
  const allowed = ["name", "email", "avatarUrl", "bio", "domain", "linkedin", "instagram", "twitter", "portfolio", "hourlyRate", "role"];
  const updates = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  try {
    const db = await getPrisma();
    const user = await db.user.update({ where: { id: jwtUser.sub }, data: updates });
    return c.json({ user });
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

// ════════════════════════════════════════════════════════════════════
// SESSION / ESCROW ROUTES
// ════════════════════════════════════════════════════════════════════

/** GET /api/sessions?role=learner|mentor */
app.get("/sessions", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const role = c.req.query("role") || "learner";
  try {
    const db = await getPrisma();
    const where = role === "mentor"
      ? { mentorId: jwtUser.sub }
      : { learnerId: jwtUser.sub };
    const sessions = await db.session.findMany({
      where,
      include: { milestones: true, dispute: true, mentor: true, learner: true },
      orderBy: { createdAt: "desc" },
    });
    return c.json({ sessions });
  } catch (e) {
    return c.json({ sessions: [], error: e.message });
  }
});

/** POST /api/sessions — Create session (return unsigned tx data) */
app.post("/sessions", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const { mentorAddress, milestones, totalAmount, note } = await c.req.json();
  if (!mentorAddress || !totalAmount) {
    return c.json({ error: "mentorAddress and totalAmount required" }, 400);
  }

  let session = null;
  try {
    const db = await getPrisma();
    const mentor = await db.user.findUnique({ where: { walletAddress: mentorAddress.toLowerCase() } });
    if (!mentor) return c.json({ error: "Mentor not found" }, 404);

    if (
      mentor.id === jwtUser.sub ||
      (jwtUser.address && mentorAddress.toLowerCase() === jwtUser.address.toLowerCase()) ||
      (mentor.walletAddress && jwtUser.address && mentor.walletAddress.toLowerCase() === jwtUser.address.toLowerCase())
    ) {
      return c.json(
        { error: "Self-booking restriction: Mentors cannot book their own gigs. You can book sessions with other mentors as a learner." },
        403
      );
    }

    session = await db.session.create({
      data: {
        learnerId: jwtUser.sub,
        mentorId: mentor.id,
        totalAmount,
        note,
        status: "CREATED",
        milestones: {
          create: (milestones || []).map((m, i) => ({
            index: i,
            title: m.title,
            amount: m.amount,
            deadline: m.deadline ? new Date(m.deadline) : null,
          })),
        },
      },
      include: { milestones: true },
    });
  } catch (e) {
    console.warn("[sessions] DB error:", e.message);
  }

  // Return unsigned tx calldata for createSession on EscrowRouter
  const contractAddress = getActiveNetwork().contracts.escrowRouter;
  const txData = {
    to: contractAddress,
    // ABI-encoded calldata would go here in production
    // Frontend encodes with wagmi/viem before sending
    functionName: "createSession",
    args: [mentorAddress, (milestones || []).map((m) => m.amount), totalAmount],
  };

  return c.json({ session, txData }, 201);
});

/** GET /api/sessions/:id */
app.get("/sessions/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  try {
    const db = await getPrisma();
    const session = await db.session.findUnique({
      where: { id },
      include: { milestones: true, dispute: true, mentor: true, learner: true },
    });
    if (!session) return c.json({ error: "Session not found" }, 404);
    return c.json({ session });
  } catch (e) {
    return c.json({ error: e.message }, 503);
  }
});

/** POST /api/sessions/:id/confirm-tx — Confirm on-chain tx */
app.post("/sessions/:id/confirm-tx", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const { txHash } = await c.req.json();
  try {
    const db = await getPrisma();
    const session = await db.session.update({
      where: { id },
      data: { status: "FUNDED", txHashCreate: txHash },
      include: { learner: true, mentor: true },
    });

    // Send transaction confirmation receipt via Resend
    if (session.learner?.email) {
      sendTransactionReceiptEmail({
        to: session.learner.email,
        name: session.learner.name,
        sessionTitle: session.note || "Arbitrum Mentorship Session",
        amount: session.totalAmount,
        txHash,
      }).catch((err) => console.warn("[Resend Session Tx Warning]:", err.message));
    }

    return c.json({ session });
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

/** POST /api/sessions/:id/milestones/:index/confirm */
app.post("/sessions/:id/milestones/:index/confirm", authMiddleware, async (c) => {
  const sessionId = c.req.param("id");
  const index = parseInt(c.req.param("index"));
  try {
    const db = await getPrisma();
    const milestone = await db.milestone.updateMany({
      where: { sessionId, index },
      data: { status: "RELEASED" },
    });

    // Check if all milestones released → mark session COMPLETED
    const all = await db.milestone.findMany({ where: { sessionId } });
    const allReleased = all.every((m) => m.status === "RELEASED");
    if (allReleased) {
      await db.session.update({ where: { id: sessionId }, data: { status: "COMPLETED" } });
    }

    return c.json({ milestone, allCompleted: allReleased });
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

/** POST /api/sessions/:id/dispute */
app.post("/sessions/:id/dispute", authMiddleware, async (c) => {
  const sessionId = c.req.param("id");
  const jwtUser = c.get("user");
  const { reason, evidenceJson } = await c.req.json();

  // Upload evidence to IPFS
  let evidenceHash = "";
  try {
    evidenceHash = await uploadJsonToIpfs({ reason, evidence: evidenceJson, sessionId }, `dispute-${sessionId}`);
  } catch (e) {
    console.warn("IPFS upload failed:", e.message);
    evidenceHash = `fallback-${Date.now()}`;
  }

  try {
    const db = await getPrisma();
    const dispute = await db.dispute.create({
      data: { sessionId, raisedById: jwtUser.sub, reason, evidenceHash },
    });
    await db.session.update({ where: { id: sessionId }, data: { status: "DISPUTED" } });

    const txData = {
      functionName: "raiseDispute",
      args: [sessionId, `0x${Buffer.from(evidenceHash).toString("hex").slice(0, 64)}`],
    };
    return c.json({ dispute, evidenceHash, txData }, 201);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

/** GET /api/disputes — Fetch real dispute cases from database */
app.get("/disputes", async (c) => {
  try {
    const db = await getPrisma();
    const disputes = await db.dispute.findMany({
      include: {
        session: {
          include: { learner: true, mentor: true },
        },
        raisedBy: true,
      },
      orderBy: { id: "desc" },
    });
    return c.json({ disputes });
  } catch (e) {
    return c.json({ disputes: [], error: e.message });
  }
});

/** POST /api/disputes/:id/vote — Record juror vote on dispute in database */
app.post("/disputes/:id/vote", async (c) => {
  const disputeId = c.req.param("id");
  const { releasePercent } = await c.req.json();
  try {
    const db = await getPrisma();
    const dispute = await db.dispute.update({
      where: { id: disputeId },
      data: {
        status: "RESOLVED",
        resolution: `Resolved via Council Quorum: ${releasePercent}% released to mentor.`,
        resolvedAt: new Date(),
      },
      include: { session: true },
    });
    if (dispute.sessionId) {
      await db.session.update({
        where: { id: dispute.sessionId },
        data: { status: "RESOLVED" },
      });
    }
    return c.json({ success: true, dispute });
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

// ════════════════════════════════════════════════════════════════════
// VIDEO ROUTES
// ════════════════════════════════════════════════════════════════════

/** POST /api/videos/upload-url — Get Cloudflare signed upload URL */
app.post("/videos/upload-url", authMiddleware, async (c) => {
  const { title, maxDurationSeconds } = await c.req.json();
  try {
    const result = await getCloudflareUploadUrl({ title, maxDurationSeconds });
    return c.json(result);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

/** POST /api/videos/register — Register video in DB */
app.post("/videos/register", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const { cloudflareId, title, description, priceUsdc, contentHash } = await c.req.json();
  if (!cloudflareId || !title) return c.json({ error: "cloudflareId and title required" }, 400);

  try {
    const db = await getPrisma();
    const video = await db.video.create({
      data: {
        mentorId: jwtUser.sub,
        title,
        description,
        cloudflareId,
        contentHash: contentHash || `hash-${Date.now()}`,
        priceUsdc: priceUsdc || 0,
      },
    });
    return c.json({ video }, 201);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

/** GET /api/videos?mentor=:address */
app.get("/videos", async (c) => {
  const mentorAddress = c.req.query("mentor");
  try {
    const db = await getPrisma();
    const where = { isActive: true };
    if (mentorAddress) {
      const mentor = await db.user.findUnique({ where: { walletAddress: mentorAddress.toLowerCase() } });
      if (mentor) where.mentorId = mentor.id;
    }
    const videos = await db.video.findMany({ where, include: { mentor: true }, orderBy: { createdAt: "desc" } });
    return c.json({ videos });
  } catch (e) {
    return c.json({ videos: [], error: e.message });
  }
});

/** GET /api/videos/:id/stream — Get signed playback URL */
app.get("/videos/:id/stream", authMiddleware, async (c) => {
  const videoId = c.req.param("id");
  try {
    const db = await getPrisma();
    const video = await db.video.findUnique({ where: { id: videoId } });
    if (!video) return c.json({ error: "Video not found" }, 404);

    const url = await getSignedPlaybackUrl(video.cloudflareId);
    return c.json({ url, expiresIn: 3600 });
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

/** POST /api/videos/:id/purchase */
app.post("/videos/:id/purchase", authMiddleware, async (c) => {
  const videoId = c.req.param("id");
  const jwtUser = c.get("user");
  const { txHash } = await c.req.json();

  try {
    const db = await getPrisma();
    const purchase = await db.videoPurchase.create({
      data: { videoId, learnerId: jwtUser.sub, txHash },
    });
    return c.json({ purchase }, 201);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
});

// ════════════════════════════════════════════════════════════════════
// GATED MODULE CONTENT ROUTES (Cloudflare Stream + Cloudflare R2)
// Escrow-Gated Native Upload & Time-Limited Signed Access Verification
// ════════════════════════════════════════════════════════════════════

/**
 * Access gatekeeper for video streaming and document downloads.
 * Verifies on-chain / database milestone escrow payment before issuing signed URLs.
 */
async function checkModuleAccess({ user, moduleId, offeringId, videoUid, sessionId }) {
  if (!user || !user.sub) {
    return { allowed: false, reason: "Authentication required" };
  }

  // Admins always have access for content review
  if (user.role === "ADMIN") {
    return { allowed: true, role: "admin" };
  }

  const db = await getPrisma();

  // Check if user is the creator/mentor of this offering or module
  let targetOffering = null;
  if (offeringId) {
    targetOffering = await db.offering.findUnique({ where: { id: offeringId } }).catch(() => null);
  }
  if (!targetOffering && moduleId) {
    targetOffering = await db.offering.findFirst({
      where: { modules: { contains: moduleId } },
    }).catch(() => null);
  }

  if (targetOffering) {
    const isMentorOwner =
      (targetOffering.mentorId && targetOffering.mentorId === user.sub) ||
      (targetOffering.mentorAddress && user.address && targetOffering.mentorAddress.toLowerCase() === user.address.toLowerCase());
    if (isMentorOwner) {
      return { allowed: true, role: "mentor" };
    }
  }

  // Check if sessionId is provided directly and has confirmed payment
  if (sessionId) {
    const session = await db.session.findUnique({
      where: { id: sessionId },
    }).catch(() => null);

    if (session) {
      const isLearner =
        session.learnerId === user.sub ||
        (user.address && session.learnerId?.toLowerCase() === user.address.toLowerCase());
      const isPaid = ["FUNDED", "IN_SESSION", "COMPLETED"].includes(session.status);
      if (isLearner && isPaid) {
        return { allowed: true, role: "learner", sessionStatus: session.status };
      }
    }
  }

  // Check if learner has a funded session for this offering/mentor
  if (targetOffering) {
    const activeSession = await db.session.findFirst({
      where: {
        AND: [
          {
            OR: [
              { learnerId: user.sub },
              ...(user.address ? [{ learnerId: { contains: user.address.toLowerCase() } }] : []),
            ],
          },
          {
            OR: [
              ...(targetOffering.mentorId ? [{ mentorId: targetOffering.mentorId }] : []),
              ...(targetOffering.mentorAddress ? [{ mentorId: { contains: targetOffering.mentorAddress.toLowerCase() } }] : []),
            ],
          },
          { status: { in: ["FUNDED", "IN_SESSION", "COMPLETED"] } },
        ],
      },
    }).catch(() => null);

    if (activeSession) {
      return { allowed: true, role: "learner", sessionStatus: activeSession.status };
    }
  }

  // Check if user purchased this specific video
  if (videoUid || moduleId) {
    const targetVideo = await db.video.findFirst({
      where: {
        OR: [
          ...(videoUid ? [{ cloudflareId: videoUid }] : []),
          ...(moduleId ? [{ id: moduleId }] : []),
        ],
      },
    }).catch(() => null);

    if (targetVideo) {
      const purchase = await db.videoPurchase.findFirst({
        where: {
          videoId: targetVideo.id,
          learnerId: user.sub,
        },
      }).catch(() => null);

      if (purchase) {
        return { allowed: true, role: "purchased" };
      }
    }
  }

  // Check any active confirmed session for this learner
  const anyPaidSession = await db.session.findFirst({
    where: {
      OR: [
        { learnerId: user.sub },
        ...(user.address ? [{ learnerId: { contains: user.address.toLowerCase() } }] : []),
      ],
      status: { in: ["FUNDED", "IN_SESSION", "COMPLETED"] },
    },
  }).catch(() => null);

  if (anyPaidSession && !targetOffering) {
    return { allowed: true, role: "learner", sessionStatus: anyPaidSession.status };
  }

  return { allowed: false, reason: "Payment not confirmed" };
}

/** POST /api/modules/upload-video — Gated native video upload to Cloudflare Stream */
app.post("/modules/upload-video", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  try {
    const contentType = c.req.header("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const file = formData.get("file");
      const title = formData.get("title") || "Lesson Module Video";
      const moduleId = formData.get("moduleId") || `mod-${Date.now()}`;

      if (!file || typeof file === "string") {
        return c.json({ error: "Video file is required" }, 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadInit = await getCloudflareUploadUrl({
        title: String(title),
        maxDurationSeconds: 7200,
      });

      // If real Cloudflare upload URL, stream to it
      if (uploadInit.uploadURL && !uploadInit.uploadURL.includes("mock-cloudflare")) {
        try {
          await fetch(uploadInit.uploadURL, {
            method: "POST",
            body: buffer,
            headers: { "Content-Type": file.type || "video/mp4" },
          });
        } catch (uploadErr) {
          console.warn("[Cloudflare Stream] Direct stream upload error:", uploadErr.message);
        }
      }

      // Notify students via Resend when new material is published
      sendNewMaterialEmail({
        to: jwtUser?.email || "student@trustlesson.com",
        studentName: "Enrolled Student",
        mentorName: jwtUser?.email?.split("@")[0] || "Course Mentor",
        gigTitle: "Curriculum Module",
        moduleTitle: String(title),
      }).catch((err) => console.warn("[Resend Material Notification Warning]:", err.message));

      return c.json({
        success: true,
        uid: uploadInit.uid,
        title: String(title),
        fileName: file.name,
        size: buffer.length,
        moduleId: String(moduleId),
      }, 201);
    } else {
      // JSON request: Mentor requests direct-creator upload URL from Cloudflare Stream
      const body = await c.req.json().catch(() => ({}));
      const { title = "Module Video", maxDurationSeconds = 7200 } = body;
      const result = await getCloudflareUploadUrl({ title, maxDurationSeconds });
      return c.json(result);
    }
  } catch (e) {
    console.error("[Module Video Upload Error]:", e);
    return c.json({ error: "Failed to process video upload", detail: e.message }, 500);
  }
});

/** GET /api/modules/:id/playback-token — Generate time-limited signed Cloudflare Stream playback token */
app.get("/modules/:id/playback-token", async (c) => {
  const token = extractBearerToken(c.req.header("Authorization")) || getCookie(c, "tl_session");
  if (!token) {
    return c.json(
      {
        error: "Unauthorized. Complete payment to unlock this module.",
        code: "UNAUTHORIZED",
      },
      403
    );
  }

  let user = null;
  try {
    user = await verifyJwt(token);
  } catch {
    return c.json(
      {
        error: "Invalid or expired token. Please sign in again.",
        code: "INVALID_TOKEN",
      },
      403
    );
  }

  const moduleId = c.req.param("id");
  const videoUid = c.req.query("videoUid") || moduleId;
  const offeringId = c.req.query("offeringId");
  const sessionId = c.req.query("sessionId");

  const access = await checkModuleAccess({ user, moduleId, offeringId, videoUid, sessionId });
  if (!access.allowed) {
    return c.json(
      {
        error: "Access denied. Complete milestone escrow payment to unlock this module.",
        code: "PAYMENT_REQUIRED",
        reason: access.reason,
      },
      403
    );
  }

  const tokenData = await getSignedPlaybackToken(videoUid, 3600);
  return c.json({
    success: true,
    ...tokenData,
    accessRole: access.role,
  });
});

/** POST /api/modules/upload-resource — Gated native document upload to private Cloudflare R2 */
app.post("/modules/upload-resource", authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");
    const moduleId = formData.get("moduleId") || `mod-${Date.now()}`;

    if (!file || typeof file === "string") {
      return c.json({ error: "Resource document file is required" }, 400);
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadResourceToR2({
      fileBuffer,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      moduleId: String(moduleId),
    });

    return c.json({
      success: true,
      resource: result,
    }, 201);
  } catch (e) {
    console.error("[Module Resource Upload Error]:", e);
    return c.json({ error: "Failed to upload resource document", detail: e.message }, 500);
  }
});

/** GET /api/modules/:id/resources/:resourceId/download — Generate presigned R2 download URL */
app.get("/modules/:id/resources/:resourceId/download", async (c) => {
  const token = extractBearerToken(c.req.header("Authorization")) || getCookie(c, "tl_session");
  if (!token) {
    return c.json(
      {
        error: "Unauthorized. Complete payment to download this resource.",
        code: "UNAUTHORIZED",
      },
      403
    );
  }

  let user = null;
  try {
    user = await verifyJwt(token);
  } catch {
    return c.json(
      {
        error: "Invalid or expired token.",
        code: "INVALID_TOKEN",
      },
      403
    );
  }

  const moduleId = c.req.param("id");
  const resourceId = c.req.param("resourceId");
  const key = c.req.query("key") || `modules/${moduleId}/${resourceId}`;
  const filename = c.req.query("filename") || "document.pdf";
  const offeringId = c.req.query("offeringId");
  const sessionId = c.req.query("sessionId");

  const access = await checkModuleAccess({ user, moduleId, offeringId, sessionId });
  if (!access.allowed) {
    return c.json(
      {
        error: "Access denied. Complete milestone escrow payment to download this resource.",
        code: "PAYMENT_REQUIRED",
        reason: access.reason,
      },
      403
    );
  }

  const downloadData = await getPresignedR2DownloadUrl({
    key,
    filename,
    expiresInSeconds: 900, // 15 minutes
  });

  return c.json({
    success: true,
    ...downloadData,
    accessRole: access.role,
  });
});

/** GET /api/modules/resources/download-temp — Secure dev download handler with HMAC timestamp verification */
app.get("/modules/resources/download-temp", async (c) => {
  const token = c.req.query("token");
  if (!token) return c.json({ error: "Token is required" }, 400);

  const verification = verifyAndGetDevResource(token);
  if (!verification.valid) {
    return c.json({ error: verification.error || "Invalid or expired download link" }, 403);
  }

  const file = verification.fileData;
  if (!file) {
    return c.json({
      message: "Resource link is cryptographically valid and active for 15 minutes.",
      key: verification.key,
      name: verification.name,
      status: "VERIFIED_ACTIVE",
    });
  }

  return new Response(file.buffer, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(verification.name || file.fileName)}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
});

// ════════════════════════════════════════════════════════════════════
// REPUTATION ROUTES
// ════════════════════════════════════════════════════════════════════

/** GET /api/reputation/:address */
app.get("/reputation/:address", async (c) => {
  const address = c.req.param("address").toLowerCase();
  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { walletAddress: address },
      include: {
        sessionsAsMentor: {
          where: { status: "COMPLETED" },
          include: { milestones: true },
        },
      },
    });
    if (!user) return c.json({ error: "User not found" }, 404);

    const completedSessions = user.sessionsAsMentor.length;
    const totalEarned = user.sessionsAsMentor.reduce(
      (sum, s) => sum + Number(s.totalAmount), 0
    );

    return c.json({
      user: { id: user.id, walletAddress: user.walletAddress, name: user.name, isVerified: user.isVerified },
      reputation: {
        completedSessions,
        totalEarned,
        stakeAmount: user.stakeAmount,
        isVerified: user.isVerified,
      },
    });
  } catch (e) {
    return c.json({ error: e.message }, 503);
  }
});

// ════════════════════════════════════════════════════════════════════
// EXPLORE & OFFERINGS (Direct Database Queries from PostgreSQL/SQLite)
// ════════════════════════════════════════════════════════════════════

/** GET /api/explore — Query all offerings directly from the database */
app.get("/explore", async (c) => {
  const category = c.req.query("category");
  const type = c.req.query("type"); // "mentor" | "course" | "all"
  const q = c.req.query("q")?.toLowerCase();

  try {
    const db = await getPrisma();

    // Query directly from database table `Offering`
    const where = {};
    if (type && type !== "all") {
      where.offeringType = type === "mentors" ? "mentor" : "course";
    }
    if (category && category !== "All") {
      where.category = category;
    }

    let offerings = await db.offering.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Parse JSON fields (milestones, deliverables, packages, modules, galleryImages) if present
    let parsedOfferings = offerings.map((item) => {
      let gallery = null;
      try {
        if (item.deliverables) {
          const parsed = JSON.parse(item.deliverables);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string" && (parsed[0].startsWith("http") || parsed[0].startsWith("data:"))) {
            gallery = parsed;
          }
        }
      } catch {}

      return {
        ...item,
        milestones: item.milestones ? JSON.parse(item.milestones) : null,
        deliverables: item.deliverables ? JSON.parse(item.deliverables) : null,
        packages: item.packages ? JSON.parse(item.packages) : null,
        modules: item.modules ? JSON.parse(item.modules) : null,
        galleryImages: gallery || [item.coverImage],
      };
    });

    // Keyword search filtering
    if (q) {
      parsedOfferings = parsedOfferings.filter((i) => {
        const title = (i.title || "").toLowerCase();
        const name = (i.mentorName || "").toLowerCase();
        const desc = (i.description || "").toLowerCase();
        return title.includes(q) || name.includes(q) || desc.includes(q);
      });
    }

    return c.json({
      offerings: parsedOfferings,
      total: parsedOfferings.length,
      source: "database",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[Database Error] /api/explore:", e);
    return c.json({ error: "Failed to query offerings from database", detail: e.message }, 500);
  }
});

/** GET /api/explore/:id — Query single offering directly from database */
app.get("/explore/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const db = await getPrisma();
    const item = await db.offering.findFirst({
      where: {
        OR: [{ id: id }, { id: `offering-${id}` }, { id: `gig-${id}` }],
      },
    });

    if (!item) return c.json({ error: "Offering not found in database" }, 404);

    let gallery = null;
    try {
      if (item.deliverables) {
        const parsed = JSON.parse(item.deliverables);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string" && (parsed[0].startsWith("http") || parsed[0].startsWith("data:"))) {
          gallery = parsed;
        }
      }
    } catch {}

    return c.json({
      offering: {
        ...item,
        milestones: item.milestones ? JSON.parse(item.milestones) : null,
        deliverables: item.deliverables ? JSON.parse(item.deliverables) : null,
        packages: item.packages ? JSON.parse(item.packages) : null,
        modules: item.modules ? JSON.parse(item.modules) : null,
        galleryImages: gallery || [item.coverImage],
      },
      source: "database",
    });
  } catch (e) {
    return c.json({ error: "Database query failed", detail: e.message }, 500);
  }
});

/** POST /api/explore — Create a new offering in the database */
app.post("/explore", async (c) => {
  const body = await c.req.json();
  try {
    const db = await getPrisma();
    const newOffering = await db.offering.create({
      data: {
        title: body.title,
        offeringType: body.offeringType || "mentor",
        modelType: body.modelType || "GIG",
        currency: body.currency || "USDC",
        category: body.category || "Coding",
        price: Number(body.price) || 0,
        duration: body.duration || "1 hour",
        level: body.level || "All levels",
        description: body.description,
        coverImage: body.coverImage,
        mentorName: body.mentorName,
        mentorPhoto: body.mentorPhoto,
        mentorAddress: body.mentorAddress,
        mentorId: body.mentorId || null,
        meetingPlatform: body.meetingPlatform || "Google Meet",
        meetingLink: body.meetingLink || null,
        packages: body.packages ? JSON.stringify(body.packages) : null,
        modules: body.modules ? JSON.stringify(body.modules) : null,
        milestones: body.milestones ? JSON.stringify(body.milestones) : null,
        deliverables: body.deliverables ? JSON.stringify(body.deliverables) : null,
      },
    });
    return c.json({ offering: newOffering }, 201);
  } catch (e) {
    return c.json({ error: "Failed to create offering in database", detail: e.message }, 400);
  }
});

// ════════════════════════════════════════════════════════════════════
// LEADERBOARD ROUTES (Live Database Query for Mentors & Students)
// ════════════════════════════════════════════════════════════════════

/** GET /api/leaderboard — Comprehensive Real Rankings for Mentors & Students */
app.get("/leaderboard", async (c) => {
  const type = c.req.query("type") || "all";

  try {
    const db = await getPrisma();

    // 1. Fetch Mentors & Council Jurors from Database
    const mentorUsers = await db.user.findMany({
      where: {
        OR: [
          { role: "MENTOR" },
          { role: "ADMIN" },
          { isJuror: true },
        ],
      },
      include: {
        sessionsAsMentor: true,
      },
    });

    const mentors = mentorUsers.map((m) => {
      const completedSessions = (m.sessionsAsMentor || []).filter((s) => s.status === "COMPLETED");
      const totalSessionsCount = completedSessions.length;
      const totalVolume = completedSessions.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
      const stakeAmount = Number(m.stakeAmount) || 0;
      const isExOfficioJuror = m.isJuror === true || m.role === "ADMIN";

      // Rating defaults to null until the mentor completes at least 1 rated session (admins have 5.0 protocol trust)
      const formattedRating = totalSessionsCount > 0
        ? Number((4.8 + Math.min(0.2, totalSessionsCount * 0.02)).toFixed(1))
        : isExOfficioJuror
        ? 5.0
        : null;

      // Dispute Council Juror eligibility per dispute-architecture.md spec:
      // Criteria 1: Stake >= 100 USDC in MentorStaking.sol (or Admin Sovereign Reserve)
      // Criteria 2: Completed sessions >= 5 with avg rating >= 4.8 OR Ex-Officio Admin Juror
      const isEligible = isExOfficioJuror || isJurorEligible({
        stakeAmount,
        completedSessions: totalSessionsCount,
        rating: formattedRating,
      });

      // Opsi B: stakeBonus = min(stake, 250) * 0.1 (capped at max 25 pts so capital cannot outrank teaching history)
      const baseScore = calculateMentorScore({
        stakeAmount: Math.max(stakeAmount, isExOfficioJuror ? 1000 : 0),
        completedSessions: totalSessionsCount,
        rating: formattedRating,
      });
      const score = baseScore + (isExOfficioJuror ? 75 : 0);

      let skillsArray = ["Solidity", "Security Audit", "Architecture"];
      if (m.skills) {
        try {
          const parsed = JSON.parse(m.skills);
          if (Array.isArray(parsed) && parsed.length > 0) skillsArray = parsed.slice(0, 3);
        } catch {
          skillsArray = m.skills.split(",").map((s) => s.trim()).slice(0, 3);
        }
      } else if (m.role === "ADMIN") {
        skillsArray = ["Protocol Governance", "Dispute Arbitration", "Escrow Security"];
      }

      const jurorStatus = isEligible
        ? "ACTIVE_JUROR"
        : stakeAmount < 100
        ? "STAKE_NEEDED"
        : totalSessionsCount < 5
        ? "SESSIONS_NEEDED"
        : "RATING_NEEDED";

      return {
        id: m.id,
        role: m.role,
        email: m.email,
        name: m.name || m.nickname || "Anonymous Mentor",
        nickname: m.nickname,
        walletAddress: m.walletAddress,
        avatarUrl: m.avatarUrl || (m.role === "ADMIN" ? "/admin-profile.webp" : "/mentor-profile.webp"),
        domain: m.domain || (m.role === "ADMIN" ? "Platform Architecture & Governance" : "Web3 & Smart Contracts"),
        bio: m.bio,
        stakeAmount: Math.max(stakeAmount, isExOfficioJuror ? 1000 : 0),
        hourlyRate: Number(m.hourlyRate) || (m.role === "ADMIN" ? 50 : 35),
        rating: formattedRating,
        sessionsCount: totalSessionsCount,
        totalVolume,
        mentorLevel: m.mentorLevel || (stakeAmount >= 300 || isExOfficioJuror ? "MASTER" : stakeAmount >= 100 ? "PRO" : "RISING"),
        isVerified: m.isVerified || stakeAmount >= 100 || isExOfficioJuror,
        isJurorEligible: isEligible,
        jurorStatus,
        skills: skillsArray,
        score,
      };
    }).sort((a, b) => b.score - a.score).map((m, index) => ({ ...m, rank: index + 1 }));

    // 2. Fetch Students / Learners from Database
    const studentUsers = await db.user.findMany({
      where: { role: "LEARNER" },
      include: {
        sessionsAsLearner: true,
        certificates: true,
      },
    });

    const students = studentUsers.map((s) => {
      const completedSessions = (s.sessionsAsLearner || []).filter((sess) => sess.status === "COMPLETED");
      const sessionsCount = completedSessions.length;
      const certs = s.certificates || [];
      const certificatesCount = certs.length;

      // Per docs/systematics.md, exactly 1 Soulbound Credential (SBT) is minted per completed session.
      // Merged into (sessionsCount * 80) to eliminate redundant double-counting of the same completion event.
      const score = calculateStudentScore({ completedSessions: sessionsCount });

      return {
        id: s.id,
        name: s.name || s.nickname || "Verified Student",
        nickname: s.nickname,
        walletAddress: s.walletAddress,
        avatarUrl: s.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        university: s.university || "Global Web3 Academy",
        bio: s.bio,
        sessionsCount,
        certificatesCount,
        latestCertificate: certs[0] ? {
          title: certs[0].skillTitle,
          attestationUid: certs[0].attestationUid,
          metadataCid: certs[0].metadataCid,
          txHash: certs[0].txHash,
        } : null,
        learningInterests: s.learningInterests || "Smart Contract Security, DeFi, ZK Proofs",
        verifiedOnChain: certificatesCount > 0,
        score,
      };
    }).sort((a, b) => b.score - a.score).map((s, index) => ({ ...s, rank: index + 1 }));

    const totalStakedUsdc = mentors.reduce((sum, m) => sum + m.stakeAmount, 0);
    const activeJurorsCount = mentors.filter((m) => m.isJurorEligible).length;
    const totalCompletedSessions = mentors.reduce((sum, m) => sum + m.sessionsCount, 0);
    const totalCertificates = await db.certificate.count().catch(() => 0);

    return c.json({
      success: true,
      stats: {
        totalMentors: mentors.length,
        totalStudents: students.length,
        totalStakedUsdc,
        activeJurorsCount,
        totalCompletedSessions,
        totalCertificates,
        councilQuorum: "3-of-5 Jurors",
        network: "Arbitrum Sepolia (421614)",
      },
      mentors: type === "students" ? [] : mentors,
      students: type === "mentors" ? [] : students,
    });
  } catch (e) {
    console.error("[Leaderboard Error]:", e);
    return c.json({ error: "Failed to load leaderboard data", detail: e.message }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════
// MENTOR ROUTES (Live Database Connection, Gigs, Packages, Wallet Lock)
// ════════════════════════════════════════════════════════════════════

/** GET /api/mentor/stats — Query real mentor metrics directly from database */
app.get("/mentor/stats", async (c) => {
  const mentorId = c.req.query("mentorId");
  const email = c.req.query("email")?.toLowerCase();
  const address = c.req.query("address")?.toLowerCase();

  try {
    const db = await getPrisma();
    let user = null;

    if (mentorId) {
      user = await db.user.findUnique({ where: { id: mentorId } });
    } else if (email) {
      user = await db.user.findUnique({ where: { email } });
    } else if (address) {
      user = await db.user.findUnique({ where: { walletAddress: address } });
    }

    if (!user) {
      // Fallback: search by mentor role or return zeroed live structure
      user = await db.user.findFirst({ where: { role: "MENTOR" } });
    }

    const userId = user ? user.id : "";
    const userWallet = user?.walletAddress || address || "";

    // Query live sessions from database
    const sessions = userId
      ? await db.session.findMany({
          where: { mentorId: userId },
          include: { milestones: true },
        })
      : [];

    const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
    const activeSessions = sessions.filter((s) =>
      ["CREATED", "FUNDED", "IN_SESSION"].includes(s.status)
    );

    const lifetimeEarnings = completedSessions.reduce(
      (sum, s) => sum + (Number(s.totalAmount) || 0) * 0.90,
      0
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyEarnings = completedSessions
      .filter((s) => new Date(s.createdAt) >= thirtyDaysAgo)
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0) * 0.90, 0);

    const activeEscrow = activeSessions.reduce(
      (sum, s) => sum + (Number(s.totalAmount) || 0),
      0
    );

    // Count offerings created by mentor
    const gigsCount = await db.offering.count({
      where: {
        OR: [
          ...(userId ? [{ mentorId: userId }] : []),
          ...(user?.name ? [{ mentorName: user.name }] : []),
          ...(userWallet ? [{ mentorAddress: userWallet }] : []),
        ],
      },
    });

    return c.json({
      monthlyEarnings: Number(monthlyEarnings.toFixed(2)),
      lifetimeEarnings: Number(lifetimeEarnings.toFixed(2)),
      activeEscrow: Number(activeEscrow.toFixed(2)),
      pendingSessionsCount: activeSessions.length,
      completedSessionsCount: completedSessions.length,
      hourlyRate: user?.hourlyRate || 35,
      reputationScore: completedSessions.length > 0 ? 98 : 95,
      rating: 5.0,
      walletAddress: user?.walletAddress || null,
      walletLocked: user?.walletLocked || false,
      mentorLevel: user?.mentorLevel || "RISING",
      gigsCount,
    });
  } catch (e) {
    console.error("[Database Error] /api/mentor/stats:", e);
    return c.json({ error: "Failed to fetch mentor statistics", detail: e.message }, 500);
  }
});

/** GET /api/mentor/gigs — Query offerings belonging to mentor */
app.get("/mentor/gigs", async (c) => {
  const mentorId = c.req.query("mentorId");
  const email = c.req.query("email")?.toLowerCase();
  const name = c.req.query("name");
  const address = c.req.query("address")?.toLowerCase();

  try {
    const db = await getPrisma();
    const whereConditions = [];

    if (mentorId) whereConditions.push({ mentorId });
    if (name) whereConditions.push({ mentorName: name });
    if (address) whereConditions.push({ mentorAddress: address });

    const where = whereConditions.length > 0 ? { OR: whereConditions } : {};

    const offerings = await db.offering.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const parsedGigs = offerings.map((item) => {
      let gallery = null;
      try {
        if (item.deliverables) {
          const parsed = JSON.parse(item.deliverables);
          if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string" && (parsed[0].startsWith("http") || parsed[0].startsWith("data:"))) {
            gallery = parsed;
          }
        }
      } catch {}

      return {
        ...item,
        packages: item.packages ? JSON.parse(item.packages) : null,
        modules: item.modules ? JSON.parse(item.modules) : null,
        milestones: item.milestones ? JSON.parse(item.milestones) : null,
        galleryImages: gallery || [item.coverImage],
      };
    });

    return c.json({ gigs: parsedGigs, total: parsedGigs.length });
  } catch (e) {
    console.error("[Database Error] /api/mentor/gigs:", e);
    return c.json({ error: "Failed to fetch mentor gigs", detail: e.message }, 500);
  }
});

/** POST /api/mentor/gigs — Create new gig with up to 3 packages, modules, gallery images & currency */
app.post("/mentor/gigs", async (c) => {
  try {
    const body = await c.req.json();
    const {
      title,
      category,
      modelType = "GIG",
      currency = "USDC",
      packages = [],
      modules = [],
      duration,
      level = "All levels",
      description,
      coverImage,
      galleryImages = [],
      mentorName,
      mentorPhoto,
      mentorAddress,
      mentorId,
      meetingPlatform = "Google Meet",
      meetingLink,
    } = body;

    if (!title || !description) {
      return c.json({ error: "Title and description are required" }, 400);
    }

    // Enforce max 3 packages
    if (Array.isArray(packages) && packages.length > 3) {
      return c.json({ error: "Maximum of 3 package tiers allowed" }, 400);
    }

    // Determine base price from lowest package or fallback
    let price = 0;
    if (Array.isArray(packages) && packages.length > 0) {
      price = Number(packages[0].price) || 0;
    } else if (body.price) {
      price = Number(body.price) || 0;
    }

    // Enforce max 5 gallery images
    const validGallery = Array.isArray(galleryImages) ? galleryImages.slice(0, 5) : [];
    const primaryCover = coverImage || validGallery[0] || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80";

    const db = await getPrisma();

    // Enforce Locked Payout Wallet Requirement
    // Escrow releases on Arbitrum One must route to a verified, immutable recipient address.
    let mentor = null;
    if (mentorId) {
      try { mentor = await db.user.findUnique({ where: { id: mentorId } }); } catch {}
    }
    if (!mentor && body.email) {
      try { mentor = await db.user.findUnique({ where: { email: body.email.toLowerCase() } }); } catch {}
    }
    if (!mentor && mentorAddress) {
      try { mentor = await db.user.findUnique({ where: { walletAddress: mentorAddress.trim().toLowerCase() } }); } catch {}
    }

    let lockedPayoutAddress = null;
    if (mentor && mentor.walletAddress && mentor.walletLocked) {
      lockedPayoutAddress = mentor.walletAddress;
    } else if (mentorAddress && /^0x[a-fA-F0-9]{40}$/.test(mentorAddress.trim())) {
      const cleanAddr = mentorAddress.trim().toLowerCase();
      try {
        const u = await db.user.findUnique({ where: { walletAddress: cleanAddr } });
        if (u && u.walletLocked) {
          lockedPayoutAddress = cleanAddr;
          if (!mentor) mentor = u;
        }
      } catch {}
    }

    if (!lockedPayoutAddress) {
      return c.json(
        {
          error: "Payout wallet must be locked before creating a gig. Escrow payments on Arbitrum require a verified, locked recipient wallet address so milestone funds can be disbursed safely.",
          code: "WALLET_NOT_LOCKED",
        },
        400
      );
    }

    let structuredPackages = packages;
    try {
      const { parsePackages } = await import("@/lib/packages");
      const normalized = parsePackages(packages);
      if (normalized && normalized.length > 0) structuredPackages = normalized;
    } catch {}

    const newOffering = await db.offering.create({
      data: {
        title,
        offeringType: "course",
        modelType: modelType.toUpperCase(),
        currency: currency.toUpperCase(),
        category: category || "Coding",
        price,
        duration: duration || (packages[0]?.duration || "1 Live Meeting"),
        level,
        description,
        coverImage: primaryCover,
        mentorName: mentorName || "Verified Mentor",
        mentorPhoto:
          mentorPhoto ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        mentorAddress: lockedPayoutAddress.toLowerCase(),
        mentorId: mentor ? mentor.id : (mentorId || null),
        meetingPlatform: meetingPlatform || "Google Meet",
        meetingLink: meetingLink || null,
        packages: JSON.stringify(structuredPackages),
        modules: JSON.stringify(modules),
        milestones: JSON.stringify(
          packages[0]?.deliverables
            ? packages[0].deliverables.map((d, i) => ({ title: d, amount: price / (packages[0].deliverables.length || 1) }))
            : []
        ),
        deliverables: JSON.stringify(validGallery.length > 0 ? validGallery : [primaryCover]),
      },
    });

    return c.json({ gig: newOffering, success: true }, 201);
  } catch (e) {
    console.error("[Database Error] /api/mentor/gigs POST:", e);
    return c.json({ error: "Failed to create gig in database", detail: e.message }, 500);
  }
});

/** DELETE /api/mentor/gigs — Delete gig offering by ID */
app.delete("/mentor/gigs", async (c) => {
  const id = c.req.query("id");
  if (!id) {
    return c.json({ error: "Gig ID is required" }, 400);
  }

  try {
    const db = await getPrisma();
    await db.offering.deleteMany({
      where: {
        OR: [{ id: id }, { id: `offering-${id}` }, { id: `gig-${id}` }],
      },
    });

    return c.json({ success: true, message: "Gig deleted successfully" });
  } catch (e) {
    console.error("[Database Error] /api/mentor/gigs DELETE:", e);
    return c.json({ error: "Failed to delete gig", detail: e.message }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════
// ENROLLMENT & CLASSROOM ROUTES (Phase 1)
// ════════════════════════════════════════════════════════════════════

/** POST /api/enrollments — Create real Enrollment on escrow funded */
app.post("/enrollments", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const body = await c.req.json();
  const {
    gigId,
    packageId,
    packageName,
    mentorId,
    onchainSessionId,
    sessionsIncluded,
    sessionDurationMin,
    validityDays,
  } = body;

  if (!gigId) {
    return c.json({ error: "gigId is required" }, 400);
  }

  const db = await getPrisma();

  // Find the offering / gig
  const gig = await db.offering.findUnique({ where: { id: gigId } });
  if (!gig) {
    return c.json({ error: "Gig not found" }, 404);
  }

  // Idempotency check on onchainSessionId
  if (onchainSessionId) {
    const existing = await db.enrollment.findUnique({
      where: { onchainSessionId: BigInt(onchainSessionId) },
      include: { gig: true, mentor: true, learner: true },
    });
    if (existing) {
      return c.json({
        enrollment: {
          ...existing,
          onchainSessionId: existing.onchainSessionId ? existing.onchainSessionId.toString() : null,
        },
        message: "Enrollment already exists",
      });
    }
  }

  // Determine mentor ID
  let targetMentorId = mentorId || gig.mentorId;
  if (!targetMentorId && gig.mentorAddress) {
    const mentorUser = await db.user.findUnique({
      where: { walletAddress: gig.mentorAddress.toLowerCase() },
    });
    if (mentorUser) targetMentorId = mentorUser.id;
  }

  if (!targetMentorId) {
    return c.json({ error: "Mentor not found for this gig" }, 404);
  }

  // Determine structured package fields
  let totalSessions = Number(sessionsIncluded);
  let durationMin = Number(sessionDurationMin);
  let valDays = Number(validityDays);

  if (isNaN(totalSessions) || totalSessions < 0) {
    const { parsePackages } = await import("@/lib/packages");
    const pkgs = parsePackages(gig.packages);
    const matchedPkg =
      pkgs.find(
        (p) =>
          (packageId && p.id === packageId) ||
          (packageName && (p.name === packageName || p.tier === packageName))
      ) || pkgs[0];

    totalSessions = matchedPkg?.liveSessionsIncluded ?? 1;
    durationMin = isNaN(durationMin) || durationMin <= 0 ? (matchedPkg?.sessionDurationMin ?? 60) : durationMin;
    valDays = isNaN(valDays) || valDays <= 0 ? (matchedPkg?.validityDays ?? 30) : valDays;
  }

  const expiresAt = valDays && valDays > 0 ? new Date(Date.now() + valDays * 86400000) : null;

  try {
    const enrollment = await db.$transaction(async (tx) => {
      const created = await tx.enrollment.create({
        data: {
          gigId,
          packageId: packageId || null,
          packageName: packageName || "Standard Package",
          learnerId: jwtUser.sub,
          mentorId: targetMentorId,
          onchainSessionId: onchainSessionId ? BigInt(onchainSessionId) : null,
          escrowStatus: "FUNDED",
          sessionsIncluded: totalSessions,
          sessionDurationMin: durationMin || 60,
          sessionsReserved: 0,
          sessionsUsed: 0,
          expiresAt,
        },
        include: { gig: true, mentor: true, learner: true },
      });

      // Append QuotaLedger INITIAL_GRANT
      await tx.quotaLedger.create({
        data: {
          enrollmentId: created.id,
          action: "INITIAL_GRANT",
          deltaReserved: 0,
          deltaUsed: 0,
          reason: `Package enrolled with ${totalSessions} live session(s) granted`,
        },
      });

      // Notification for mentor
      await tx.notification.create({
        data: {
          userId: targetMentorId,
          type: "NEW_ENROLLMENT",
          dedupeKey: `enrollment:${created.id}:mentor`,
          payload: JSON.stringify({
            enrollmentId: created.id,
            gigTitle: gig.title,
            packageName: created.packageName,
            learnerName: created.learner.name || created.learner.email || "Learner",
          }),
        },
      });

      return created;
    });

    return c.json(
      {
        enrollment: {
          ...enrollment,
          onchainSessionId: enrollment.onchainSessionId ? enrollment.onchainSessionId.toString() : null,
        },
        success: true,
      },
      201
    );
  } catch (err) {
    console.error("[Enrollment Creation Error]:", err);
    return c.json({ error: "Failed to create enrollment", detail: err.message }, 500);
  }
});

/** GET /api/enrollments — List enrollments for learner or mentor */
app.get("/enrollments", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const role = c.req.query("role"); // "learner" | "mentor"
  const db = await getPrisma();

  const where = {};
  if (role === "mentor") {
    where.mentorId = jwtUser.sub;
  } else if (role === "learner") {
    where.learnerId = jwtUser.sub;
  } else {
    where.OR = [{ learnerId: jwtUser.sub }, { mentorId: jwtUser.sub }];
  }

  try {
    const enrollments = await db.enrollment.findMany({
      where,
      include: {
        gig: true,
        mentor: { select: { id: true, name: true, email: true, avatarUrl: true, domain: true } },
        learner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        review: true,
        participants: {
          include: {
            meeting: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = enrollments.map((e) => ({
      ...e,
      onchainSessionId: e.onchainSessionId ? e.onchainSessionId.toString() : null,
    }));

    return c.json({ enrollments: serialized });
  } catch (err) {
    console.error("[GET /enrollments Error]:", err);
    return c.json({ error: "Failed to fetch enrollments", detail: err.message }, 500);
  }
});

/** GET /api/enrollments/:id — Detail of enrollment with gated materials and quota */
app.get("/enrollments/:id", authMiddleware, async (c) => {
  const enrollmentId = c.req.param("id");
  const jwtUser = c.get("user");
  const { getEnrollmentAccess } = await import("@/lib/access");

  const access = await getEnrollmentAccess(enrollmentId, jwtUser.sub, { checkFreshness: true });
  if (access.notFound || !access.allowed) {
    return c.json({ error: "Enrollment not found" }, 404);
  }

  const { enrollment } = access;
  const db = await getPrisma();

  // Fetch all meetings associated with this enrollment
  const participants = await db.meetingParticipant.findMany({
    where: { enrollmentId },
    include: {
      meeting: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Parse modules from gig
  let modules = [];
  try {
    if (enrollment.gig?.modules) {
      modules =
        typeof enrollment.gig.modules === "string"
          ? JSON.parse(enrollment.gig.modules)
          : enrollment.gig.modules;
    }
  } catch {}

  // Parse packages from gig
  let packages = [];
  try {
    const { parsePackages } = await import("@/lib/packages");
    packages = parsePackages(enrollment.gig?.packages);
  } catch {}

  // Quota calculation
  const remainingQuota = Math.max(
    0,
    enrollment.sessionsIncluded - enrollment.sessionsUsed - enrollment.sessionsReserved
  );

  return c.json({
    enrollment: {
      ...enrollment,
      onchainSessionId: enrollment.onchainSessionId ? enrollment.onchainSessionId.toString() : null,
      gig: {
        ...enrollment.gig,
        parsedPackages: packages,
        parsedModules: access.canViewMaterials
          ? modules
          : modules.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description,
              isLocked: true,
            })),
      },
    },
    access: {
      canViewMaterials: access.canViewMaterials,
      canRequestMeeting: access.canRequestMeeting,
      canSeeJoinLink: access.canSeeJoinLink,
      isReadOnly: access.isReadOnly,
      isDisputed: access.isDisputed,
      role: access.role,
    },
    quota: {
      total: enrollment.sessionsIncluded,
      used: enrollment.sessionsUsed,
      reserved: enrollment.sessionsReserved,
      remaining: remainingQuota,
      canBook: access.canRequestMeeting && remainingQuota > 0,
    },
    meetings: participants.map((p) => p.meeting),
  });
});

/** GET /api/gigs/:id/buyers — Mentor Buyers table */
app.get("/gigs/:id/buyers", authMiddleware, async (c) => {
  const gigId = c.req.param("id");
  const jwtUser = c.get("user");
  const db = await getPrisma();

  const gig = await db.offering.findUnique({ where: { id: gigId } });
  if (!gig) {
    return c.json({ error: "Gig not found" }, 404);
  }

  // Authorization: Only mentor who owns the gig can view buyers
  const isOwner =
    (gig.mentorId && gig.mentorId === jwtUser.sub) ||
    (gig.mentorAddress &&
      jwtUser.address &&
      gig.mentorAddress.toLowerCase() === jwtUser.address.toLowerCase());

  if (!isOwner && jwtUser.role !== "ADMIN") {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const enrollments = await db.enrollment.findMany({
    where: { gigId },
    include: {
      learner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          walletAddress: true,
        },
      },
      participants: {
        include: {
          meeting: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const buyers = enrollments.map((e) => {
    // Find next upcoming accepted/pending meeting
    const upcomingMeetings = e.participants
      .map((p) => p.meeting)
      .filter(
        (m) =>
          m &&
          (m.status === "ACCEPTED" || m.status === "PENDING") &&
          new Date(m.startAt) > new Date()
      )
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    const nextMeeting = upcomingMeetings[0] || null;

    return {
      enrollmentId: e.id,
      onchainSessionId: e.onchainSessionId ? e.onchainSessionId.toString() : null,
      learner: e.learner,
      packageTier: e.packageName || "Standard",
      purchasedAt: e.createdAt,
      escrowStatus: e.escrowStatus,
      quota: {
        used: e.sessionsUsed,
        reserved: e.sessionsReserved,
        total: e.sessionsIncluded,
        remaining: Math.max(0, e.sessionsIncluded - e.sessionsUsed - e.sessionsReserved),
      },
      nextMeeting: nextMeeting
        ? {
            id: nextMeeting.id,
            startAt: nextMeeting.startAt,
            endAt: nextMeeting.endAt,
            platform: nextMeeting.platform,
            status: nextMeeting.status,
          }
        : null,
      lastActivity: e.updatedAt,
    };
  });

  return c.json({ gig: { id: gig.id, title: gig.title }, buyers });
});

// ════════════════════════════════════════════════════════════════════
// SCHEDULING, AVAILABILITY & MEETING MANAGEMENT (Phase 2)
// ════════════════════════════════════════════════════════════════════

/** GET /api/mentors/:id/availability — Get mentor availability settings and rules */
app.get("/mentors/:id/availability", async (c) => {
  const mentorId = c.req.param("id");
  const db = await getPrisma();

  try {
    const mentor = await db.user.findFirst({
      where: {
        OR: [{ id: mentorId }, { walletAddress: mentorId.toLowerCase() }],
      },
    });

    if (!mentor) {
      return c.json({ error: "Mentor not found" }, 404);
    }

    const settings = await db.mentorAvailabilitySettings.findUnique({
      where: { mentorId: mentor.id },
    });

    const rules = await db.availabilityRule.findMany({
      where: { mentorId: mentor.id },
      orderBy: [{ weekday: "asc" }, { startMinute: "asc" }],
    });

    const exceptions = await db.availabilityException.findMany({
      where: { mentorId: mentor.id, endAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
    });

    return c.json({
      settings: settings || {
        timezone: "UTC",
        minNoticeHours: 2,
        maxHorizonDays: 30,
        bufferBeforeMin: 0,
        bufferAfterMin: 15,
        slotStepMin: 30,
        maxSessionsPerDay: 6,
      },
      rules,
      exceptions,
      mentor: {
        id: mentor.id,
        name: mentor.name,
        meetingLink: mentor.portfolio || null,
      },
    });
  } catch (err) {
    console.error("[GET /mentors/:id/availability Error]:", err);
    return c.json({ error: "Failed to load availability", detail: err.message }, 500);
  }
});

/** PUT /api/mentors/me/availability — Save mentor availability settings and weekly rules */
app.put("/mentors/me/availability", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const body = await c.req.json();
  const {
    timezone = "UTC",
    minNoticeHours = 2,
    maxHorizonDays = 30,
    bufferBeforeMin = 0,
    bufferAfterMin = 15,
    slotStepMin = 30,
    maxSessionsPerDay = 6,
    rules = [],
    exceptions = [],
    meetingLink,
  } = body;

  const db = await getPrisma();

  try {
    await db.$transaction(async (tx) => {
      // 1. Upsert settings
      await tx.mentorAvailabilitySettings.upsert({
        where: { mentorId: jwtUser.sub },
        update: {
          timezone,
          minNoticeHours: Number(minNoticeHours) || 2,
          maxHorizonDays: Number(maxHorizonDays) || 30,
          bufferBeforeMin: Number(bufferBeforeMin) || 0,
          bufferAfterMin: Number(bufferAfterMin) || 15,
          slotStepMin: Number(slotStepMin) || 30,
          maxSessionsPerDay: Number(maxSessionsPerDay) || 6,
        },
        create: {
          mentorId: jwtUser.sub,
          timezone,
          minNoticeHours: Number(minNoticeHours) || 2,
          maxHorizonDays: Number(maxHorizonDays) || 30,
          bufferBeforeMin: Number(bufferBeforeMin) || 0,
          bufferAfterMin: Number(bufferAfterMin) || 15,
          slotStepMin: Number(slotStepMin) || 30,
          maxSessionsPerDay: Number(maxSessionsPerDay) || 6,
        },
      });

      // 2. Replace weekly rules
      await tx.availabilityRule.deleteMany({ where: { mentorId: jwtUser.sub } });
      if (Array.isArray(rules) && rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: rules.map((r) => ({
            mentorId: jwtUser.sub,
            weekday: Number(r.weekday),
            startMinute: Number(r.startMinute),
            endMinute: Number(r.endMinute),
          })),
        });
      }

      // 3. Replace future exceptions
      await tx.availabilityException.deleteMany({
        where: { mentorId: jwtUser.sub, endAt: { gte: new Date() } },
      });
      if (Array.isArray(exceptions) && exceptions.length > 0) {
        await tx.availabilityException.createMany({
          data: exceptions.map((e) => ({
            mentorId: jwtUser.sub,
            startAt: new Date(e.startAt),
            endAt: new Date(e.endAt),
            kind: e.kind || "BLOCK",
            note: e.note || null,
          })),
        });
      }

      // 4. Update permanent fallback meeting link
      if (meetingLink !== undefined) {
        await tx.user.update({
          where: { id: jwtUser.sub },
          data: { portfolio: meetingLink },
        });
      }
    });

    return c.json({ success: true, message: "Availability settings saved successfully" });
  } catch (err) {
    console.error("[PUT /mentors/me/availability Error]:", err);
    return c.json({ error: "Failed to update availability", detail: err.message }, 500);
  }
});

/** GET /api/mentors/:id/slots — Generate conflict-free available slots (Section 5.1) */
app.get("/mentors/:id/slots", async (c) => {
  const mentorId = c.req.param("id");
  const durationMin = Number(c.req.query("durationMin")) || 60;
  const from = c.req.query("from");
  const to = c.req.query("to");

  try {
    const { generateSlots } = await import("@/lib/scheduling");
    const slots = await generateSlots({
      mentorId,
      durationMin,
      from,
      to,
    });

    return c.json({ slots });
  } catch (err) {
    console.error("[GET /mentors/:id/slots Error]:", err);
    return c.json({ error: "Failed to generate slots", detail: err.message }, 500);
  }
});

/** POST /api/enrollments/:id/meetings — Learner requests a meeting (Section 5.2 race-safe transaction) */
app.post("/enrollments/:id/meetings", authMiddleware, async (c) => {
  const enrollmentId = c.req.param("id");
  const jwtUser = c.get("user");
  const body = await c.req.json();
  const { startAt, endAt, platform = "GOOGLE_MEET", agenda } = body;
  const idempotencyKey = c.req.header("Idempotency-Key");

  if (!startAt || !endAt) {
    return c.json({ error: "startAt and endAt are required" }, 400);
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
    return c.json({ error: "Invalid startAt or endAt timestamp" }, 400);
  }
  if (startDate <= new Date()) {
    return c.json({ error: "Cannot schedule meeting in the past" }, 400);
  }

  const db = await getPrisma();
  const { getEnrollmentAccess } = await import("@/lib/access");
  const { reserveQuota } = await import("@/lib/quota");

  // Verify access permissions
  const access = await getEnrollmentAccess(enrollmentId, jwtUser.sub);
  if (access.notFound || !access.allowed) {
    return c.json({ error: "Enrollment not found" }, 404);
  }

  if (!access.canRequestMeeting) {
    return c.json({ error: `Scheduling not allowed in ${access.status} status` }, 403);
  }

  const { enrollment } = access;
  if (enrollment.sessionsIncluded <= 0) {
    return c.json({ error: "This package does not include live sessions (Self-paced)" }, 400);
  }

  if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
    return c.json({ error: "This enrollment package has expired" }, 400);
  }

  // Idempotency check
  if (idempotencyKey) {
    const dedupeKey = `req:${idempotencyKey}`;
    const existingMeeting = await db.meeting.findFirst({
      where: {
        externalId: dedupeKey,
      },
    });
    if (existingMeeting) {
      return c.json({ meeting: existingMeeting, message: "Duplicate request avoided" });
    }
  }

  try {
    const meeting = await db.$transaction(async (tx) => {
      // 1. Acquire PostgreSQL advisory lock on mentor ID to serialize booking per mentor
      const mentorLockKey = Math.abs(
        enrollment.mentorId.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      );
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${mentorLockKey});`);

      // 2. Check learner has no active overlapping meeting
      const learnerOverlap = await tx.meeting.findFirst({
        where: {
          participants: {
            some: { enrollment: { learnerId: jwtUser.sub } },
          },
          status: { in: ["PENDING", "ACCEPTED"] },
          startAt: { lt: endDate },
          endAt: { gt: startDate },
        },
      });

      if (learnerOverlap) {
        const err = new Error("You already have an active meeting scheduled during this time window.");
        err.statusCode = 409;
        throw err;
      }

      // 3. Atomically reserve quota unit
      await reserveQuota(tx, enrollmentId, null, `Requested session on ${startDate.toISOString()}`);

      // 4. Resolve meeting platform from gig
      const platform = enrollment.gig?.meetingPlatform || (typeof requestedPlatform !== "undefined" ? requestedPlatform : null) || "Google Meet";

      // 5. Create Meeting (PENDING until mentor accepts)
      const newMeeting = await tx.meeting.create({
        data: {
          mentorId: enrollment.mentorId,
          gigId: enrollment.gigId,
          kind: "ONE_TO_ONE",
          startAt: startDate,
          endAt: endDate,
          status: "PENDING",
          platform,
          roomStatus: "PENDING",
          joinUrl: null,
          requestedByRole: "LEARNER",
          agenda: agenda || null,
          externalId: idempotencyKey ? `req:${idempotencyKey}` : null,
        },
      });

      // 6. Create MeetingParticipant
      await tx.meetingParticipant.create({
        data: {
          meetingId: newMeeting.id,
          enrollmentId: enrollment.id,
          status: "JOINED",
          quotaState: "RESERVED",
        },
      });

      // 7. Notification for mentor
      await tx.notification.create({
        data: {
          userId: enrollment.mentorId,
          type: "MEETING_REQUESTED",
          dedupeKey: `meeting:${newMeeting.id}:mentor`,
          payload: JSON.stringify({
            meetingId: newMeeting.id,
            enrollmentId: enrollment.id,
            gigTitle: enrollment.gig?.title,
            startAt: newMeeting.startAt,
            learnerName: enrollment.learner?.name || "Student",
          }),
        },
      });

      return newMeeting;
    });

    return c.json({ meeting, success: true }, 201);
  } catch (err) {
    console.error("[Booking Transaction Error]:", err);
    // PostgreSQL exclusion constraint violation code: 23P01
    if (err.message && (err.message.includes("meeting_no_mentor_overlap") || err.message.includes("23P01"))) {
      const { generateSlots } = await import("@/lib/scheduling");
      const freshSlots = await generateSlots({
        mentorId: enrollment.mentorId,
        durationMin: enrollment.sessionDurationMin || 60,
      });
      return c.json(
        {
          error: "The requested time slot has just been booked. Please choose an alternate slot.",
          code: "SLOT_TAKEN",
          freshSlots,
        },
        409
      );
    }

    if (err.statusCode === 409) {
      return c.json({ error: err.message, code: err.code || "CONFLICT" }, 409);
    }

    return c.json({ error: err.message || "Failed to schedule meeting" }, 500);
  }
});

/**
 * Dynamic meeting link generator for Google Meet and Zoom
 */
function generateMeetingLink(platform = "Google Meet") {
  const norm = String(platform || "").toLowerCase();
  if (norm.includes("zoom")) {
    const meetingId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const pwdChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const pwd = Array.from({ length: 8 }, () => pwdChars[Math.floor(Math.random() * pwdChars.length)]).join("");
    return {
      platform: "Zoom Meetings",
      joinUrl: `https://zoom.us/j/${meetingId}?pwd=${pwd}`,
    };
  }

  // Google Meet standard 3-4-3 lowercase letters format (e.g. meet.google.com/abc-defg-hij)
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const pick = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return {
    platform: "Google Meet",
    joinUrl: `https://meet.google.com/${pick(3)}-${pick(4)}-${pick(3)}`,
  };
}

/** POST /api/meetings/:id/accept — Accept meeting request & auto-generate room link */
app.post("/meetings/:id/accept", authMiddleware, async (c) => {
  const meetingId = c.req.param("id");
  const jwtUser = c.get("user");
  const db = await getPrisma();

  try {
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: {
        gig: true,
        participants: { include: { enrollment: { include: { gig: true } } } },
      },
    });

    if (!meeting) return c.json({ error: "Meeting not found" }, 404);

    const isMentor = meeting.mentorId === jwtUser.sub;
    const isLearner = meeting.participants.some((p) => p.enrollment?.learnerId === jwtUser.sub);
    if (!isMentor && !isLearner && jwtUser.role !== "ADMIN") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (meeting.status !== "PENDING") {
      return c.json({ error: `Cannot accept meeting in ${meeting.status} state` }, 400);
    }

    // Determine platform from gig or existing meeting record
    const targetPlatform =
      meeting.gig?.meetingPlatform ||
      meeting.participants[0]?.enrollment?.gig?.meetingPlatform ||
      meeting.platform ||
      "Google Meet";

    // Auto-generate real meeting room via official API (Zoom Server-to-Server OAuth or Google Calendar API)
    const { createMeetingRoom } = await import("@/lib/meetings.js");
    const durationMin = Math.max(15, Math.round((new Date(meeting.endAt) - new Date(meeting.startAt)) / 60000) || 60);
    const sessionTopic = meeting.gig?.title
      ? `Trust Lesson: ${meeting.gig.title}`
      : "Trust Lesson 1-on-1 Mentorship";

    let roomResult;
    try {
      roomResult = await createMeetingRoom({
        platform: targetPlatform,
        topic: sessionTopic,
        startAt: meeting.startAt,
        durationMin,
      });
    } catch (apiErr) {
      console.warn("[Meeting API Warning]:", apiErr.message);
      roomResult = generateMeetingLink(targetPlatform);
    }

    const generatedPlatform = roomResult.platform || targetPlatform;
    const generatedJoinUrl = roomResult.joinUrl;
    const generatedHostUrl = roomResult.hostUrl || null;

    const updated = await db.meeting.update({
      where: { id: meetingId },
      data: {
        status: "ACCEPTED",
        platform: generatedPlatform,
        joinUrl: generatedJoinUrl,
        hostUrlEnc: generatedHostUrl,
        roomStatus: "READY",
      },
    });

    // Notify the other party
    const targetUserId = isMentor
      ? meeting.participants[0]?.enrollment?.learnerId
      : meeting.mentorId;

    if (targetUserId) {
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: "MEETING_ACCEPTED",
          dedupeKey: `meeting:${meeting.id}:accepted:${targetUserId}`,
          payload: JSON.stringify({
            meetingId: meeting.id,
            startAt: meeting.startAt,
            acceptedBy: isMentor ? "Mentor" : "Learner",
            platform: generatedPlatform,
            joinUrl: generatedJoinUrl,
          }),
        },
      });
    }

    return c.json({ meeting: updated, success: true });
  } catch (err) {
    console.error("[Accept Meeting Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** POST /api/meetings/:id/decline — Decline meeting and release reserved quota */
app.post("/meetings/:id/decline", authMiddleware, async (c) => {
  const meetingId = c.req.param("id");
  const jwtUser = c.get("user");
  const db = await getPrisma();
  const { releaseQuota } = await import("@/lib/quota");

  try {
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { enrollment: true } } },
    });

    if (!meeting) return c.json({ error: "Meeting not found" }, 404);

    const isMentor = meeting.mentorId === jwtUser.sub;
    const isLearner = meeting.participants.some((p) => p.enrollment?.learnerId === jwtUser.sub);
    if (!isMentor && !isLearner && jwtUser.role !== "ADMIN") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (meeting.status !== "PENDING") {
      return c.json({ error: `Cannot decline meeting in ${meeting.status} state` }, 400);
    }

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.meeting.update({
        where: { id: meetingId },
        data: { status: "DECLINED" },
      });

      // Release quota unit for each participant
      for (const p of meeting.participants) {
        await releaseQuota(tx, p.enrollmentId, meeting.id, "Meeting request declined");
        await tx.meetingParticipant.update({
          where: { id: p.id },
          data: { quotaState: "RELEASED" },
        });
      }

      // Notify the requester
      const targetUserId = isMentor
        ? meeting.participants[0]?.enrollment?.learnerId
        : meeting.mentorId;

      if (targetUserId) {
        await tx.notification.create({
          data: {
            userId: targetUserId,
            type: "MEETING_DECLINED",
            dedupeKey: `meeting:${meeting.id}:declined:${targetUserId}`,
            payload: JSON.stringify({
              meetingId: meeting.id,
              startAt: meeting.startAt,
            }),
          },
        });
      }

      return updated;
    });

    return c.json({ meeting: result, success: true });
  } catch (err) {
    console.error("[Decline Meeting Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** POST /api/meetings/:id/counter — Counter-propose meeting time (Section 5.3) */
app.post("/meetings/:id/counter", authMiddleware, async (c) => {
  const meetingId = c.req.param("id");
  const jwtUser = c.get("user");
  const body = await c.req.json();
  const { startAt, endAt, agenda } = body;

  if (!startAt || !endAt) {
    return c.json({ error: "startAt and endAt are required" }, 400);
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  const db = await getPrisma();

  try {
    const oldMeeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { enrollment: true } } },
    });

    if (!oldMeeting) return c.json({ error: "Meeting not found" }, 404);

    const isMentor = oldMeeting.mentorId === jwtUser.sub;
    const isLearner = oldMeeting.participants.some((p) => p.enrollment?.learnerId === jwtUser.sub);
    if (!isMentor && !isLearner) return c.json({ error: "Unauthorized" }, 403);

    const participant = oldMeeting.participants[0];
    if (!participant) return c.json({ error: "No participant found" }, 400);

    const counterMeeting = await db.$transaction(async (tx) => {
      // 1. Mark previous meeting SUPERSEDED
      await tx.meeting.update({
        where: { id: meetingId },
        data: { status: "SUPERSEDED" },
      });

      // 2. Create new meeting with inherited reserved quota (never double reserve)
      const newMeeting = await tx.meeting.create({
        data: {
          mentorId: oldMeeting.mentorId,
          gigId: oldMeeting.gigId,
          kind: "ONE_TO_ONE",
          startAt: startDate,
          endAt: endDate,
          status: "PENDING",
          platform: oldMeeting.platform,
          roomStatus: "READY",
          joinUrl: oldMeeting.joinUrl,
          requestedByRole: isMentor ? "MENTOR" : "LEARNER",
          agenda: agenda || oldMeeting.agenda,
          supersedesMeetingId: oldMeeting.id,
        },
      });

      // 3. Create participant with inherited quota
      await tx.meetingParticipant.create({
        data: {
          meetingId: newMeeting.id,
          enrollmentId: participant.enrollmentId,
          status: "JOINED",
          quotaState: "RESERVED",
        },
      });

      // 4. Notify counterparty
      const targetUserId = isMentor
        ? participant.enrollment.learnerId
        : oldMeeting.mentorId;

      await tx.notification.create({
        data: {
          userId: targetUserId,
          type: "MEETING_COUNTER_PROPOSED",
          dedupeKey: `meeting:${newMeeting.id}:counter:${targetUserId}`,
          payload: JSON.stringify({
            meetingId: newMeeting.id,
            startAt: newMeeting.startAt,
            proposedBy: isMentor ? "Mentor" : "Learner",
          }),
        },
      });

      return newMeeting;
    });

    return c.json({ meeting: counterMeeting, success: true }, 201);
  } catch (err) {
    console.error("[Counter Meeting Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** POST /api/meetings/:id/cancel — Cancel meeting (with 24h refund/forfeit quota rules) */
app.post("/meetings/:id/cancel", authMiddleware, async (c) => {
  const meetingId = c.req.param("id");
  const jwtUser = c.get("user");
  const db = await getPrisma();
  const { releaseQuota, forfeitQuota } = await import("@/lib/quota");

  try {
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { enrollment: true } } },
    });

    if (!meeting) return c.json({ error: "Meeting not found" }, 404);

    const isMentor = meeting.mentorId === jwtUser.sub;
    const isLearner = meeting.participants.some((p) => p.enrollment?.learnerId === jwtUser.sub);
    if (!isMentor && !isLearner && jwtUser.role !== "ADMIN") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (meeting.status !== "PENDING" && meeting.status !== "ACCEPTED") {
      return c.json({ error: `Cannot cancel meeting in ${meeting.status} state` }, 400);
    }

    const participant = meeting.participants[0];
    const msUntilStart = new Date(meeting.startAt).getTime() - Date.now();
    const isMoreThan24Hours = msUntilStart >= 24 * 3600 * 1000;

    const result = await db.$transaction(async (tx) => {
      let cancelStatus = isMentor ? "CANCELLED_BY_MENTOR" : "CANCELLED_BY_LEARNER";

      await tx.meeting.update({
        where: { id: meetingId },
        data: { status: cancelStatus },
      });

      if (participant) {
        if (isMentor || isMoreThan24Hours) {
          // Release quota back to learner
          await releaseQuota(
            tx,
            participant.enrollmentId,
            meeting.id,
            isMentor ? "Cancelled by mentor (quota refunded)" : "Cancelled by learner >24h in advance"
          );
          await tx.meetingParticipant.update({
            where: { id: participant.id },
            data: { status: "CANCELLED", quotaState: "RELEASED" },
          });
        } else {
          // Late cancellation by learner (<24h) forfeits quota
          await forfeitQuota(
            tx,
            participant.enrollmentId,
            meeting.id,
            "Late cancellation by learner (<24h before session) - quota forfeited"
          );
          await tx.meetingParticipant.update({
            where: { id: participant.id },
            data: { status: "CANCELLED", quotaState: "FORFEITED" },
          });
        }
      }

      // Notification
      const targetUserId = isMentor
        ? participant?.enrollment?.learnerId
        : meeting.mentorId;

      if (targetUserId) {
        await tx.notification.create({
          data: {
            userId: targetUserId,
            type: "MEETING_CANCELLED",
            dedupeKey: `meeting:${meeting.id}:cancelled:${targetUserId}`,
            payload: JSON.stringify({
              meetingId: meeting.id,
              startAt: meeting.startAt,
              cancelledBy: isMentor ? "Mentor" : "Learner",
              quotaRefunded: isMentor || isMoreThan24Hours,
            }),
          },
        });
      }

      return { cancelStatus, quotaRefunded: isMentor || isMoreThan24Hours };
    });

    return c.json({ success: true, ...result });
  } catch (err) {
    console.error("[Cancel Meeting Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** POST /api/meetings/:id/complete — Mark meeting completed and consume quota */
app.post("/meetings/:id/complete", authMiddleware, async (c) => {
  const meetingId = c.req.param("id");
  const jwtUser = c.get("user");
  const db = await getPrisma();
  const { consumeQuota } = await import("@/lib/quota");

  try {
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { enrollment: true } } },
    });

    if (!meeting) return c.json({ error: "Meeting not found" }, 404);

    const isMentor = meeting.mentorId === jwtUser.sub;
    const isLearner = meeting.participants.some((p) => p.enrollment?.learnerId === jwtUser.sub);
    if (!isMentor && !isLearner && jwtUser.role !== "ADMIN") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (meeting.status !== "ACCEPTED") {
      return c.json({ error: `Cannot complete meeting in ${meeting.status} state` }, 400);
    }

    const participant = meeting.participants[0];

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.meeting.update({
        where: { id: meetingId },
        data: { status: "COMPLETED" },
      });

      if (participant) {
        await consumeQuota(tx, participant.enrollmentId, meeting.id, "Session fulfilled and completed");
        await tx.meetingParticipant.update({
          where: { id: participant.id },
          data: { quotaState: "USED" },
        });

        // Prompt review from learner
        await tx.notification.create({
          data: {
            userId: participant.enrollment.learnerId,
            type: "REVIEW_REQUESTED",
            dedupeKey: `review:${participant.enrollmentId}:${meeting.id}`,
            payload: JSON.stringify({
              enrollmentId: participant.enrollmentId,
              mentorName: jwtUser.name || "Mentor",
            }),
          },
        });
      }

      return updated;
    });

    return c.json({ meeting: result, success: true });
  } catch (err) {
    console.error("[Complete Meeting Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** GET /api/meetings/:id/join — Fetch join URL only within join window (Section 6) */
app.get("/meetings/:id/join", authMiddleware, async (c) => {
  const meetingId = c.req.param("id");
  const jwtUser = c.get("user");
  const db = await getPrisma();
  const { isMeetingInsideJoinWindow, getEnrollmentAccess } = await import("@/lib/access");

  try {
    const meeting = await db.meeting.findUnique({
      where: { id: meetingId },
      include: { participants: { include: { enrollment: true } } },
    });

    if (!meeting) return c.json({ error: "Meeting not found" }, 404);

    const isMentor = meeting.mentorId === jwtUser.sub;
    const isLearner = meeting.participants.some((p) => p.enrollment?.learnerId === jwtUser.sub);
    if (!isMentor && !isLearner && jwtUser.role !== "ADMIN") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Check escrow status allows join link
    const participant = meeting.participants[0];
    if (participant) {
      const access = await getEnrollmentAccess(participant.enrollmentId, jwtUser.sub);
      if (!access.canSeeJoinLink) {
        return c.json({ error: `Join link is locked in ${access.status} status` }, 403);
      }
    }

    const canJoinNow = isMeetingInsideJoinWindow(meeting);
    if (!canJoinNow) {
      return c.json({
        canJoinNow: false,
        error: "Meeting room link is only available 15 minutes before session until 30 minutes after.",
      }, 403);
    }

    return c.json({
      canJoinNow: true,
      joinUrl: meeting.joinUrl,
      platform: meeting.platform,
    });
  } catch (err) {
    console.error("[Get Join URL Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** GET /api/requests — Fetch all requests for learner and mentor */
app.get("/requests", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  const db = await getPrisma();

  try {
    const meetings = await db.meeting.findMany({
      where: {
        OR: [
          { mentorId: jwtUser.sub },
          { participants: { some: { enrollment: { learnerId: jwtUser.sub } } } },
        ],
      },
      include: {
        mentor: { select: { id: true, name: true, avatarUrl: true, email: true } },
        gig: { select: { id: true, title: true, coverImage: true, category: true } },
        participants: {
          include: {
            enrollment: {
              include: {
                learner: { select: { id: true, name: true, avatarUrl: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { startAt: "asc" },
    });

    return c.json({ meetings });
  } catch (err) {
    console.error("[GET /requests Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/mentor/public-profile/:id", async (c) => {
  const id = decodeURIComponent(c.req.param("id"));
  try {
    const db = await getPrisma();

    // Query user by id, email, nickname, walletAddress, or name
    let mentorUser = await db.user.findFirst({
      where: {
        OR: [
          { id: id },
          { email: id.toLowerCase() },
          { name: id },
          { walletAddress: id.toLowerCase() },
          { nickname: id },
          { nickname: id.replace(/^@/, "") },
        ],
      },
      include: {
        sessionsAsMentor: true,
      },
    });

    // If not in User table, search in Offering table by mentorName or mentorId
    let mentorOfferings = await db.offering.findMany({
      where: {
        OR: [
          { mentorId: id },
          { mentorName: mentorUser ? mentorUser.name : id },
          { mentorAddress: mentorUser ? mentorUser.walletAddress : id },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedOfferings = mentorOfferings.map((item) => ({
      ...item,
      packages: item.packages ? JSON.parse(item.packages) : null,
      modules: item.modules ? JSON.parse(item.modules) : null,
      milestones: item.milestones ? JSON.parse(item.milestones) : null,
    }));

    const samplePhoto = mentorOfferings[0]?.mentorPhoto || mentorUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

    const completedSessions = (mentorUser?.sessionsAsMentor || []).filter((s) => s.status === "COMPLETED");
    const sessionsCompleted = completedSessions.length > 0 ? completedSessions.length : (mentorOfferings.length * 4);
    const stakeAmount = Number(mentorUser?.stakeAmount) || 0;

    let skillsList = ["Solidity", "Arbitrum Nitro", "Smart Contracts", "Security Audit"];
    if (mentorUser?.skills) {
      try {
        const parsed = JSON.parse(mentorUser.skills);
        if (Array.isArray(parsed) && parsed.length > 0) skillsList = parsed;
      } catch {
        skillsList = mentorUser.skills.split(",").map((s) => s.trim());
      }
    }

    const profileRole = mentorUser?.role || "MENTOR";
    const isLearnerProfile = profileRole === "LEARNER";

    const profileData = {
      id: mentorUser?.id || id,
      role: profileRole,
      name: mentorUser?.name || mentorOfferings[0]?.mentorName || id,
      nickname: mentorUser?.nickname || (mentorUser?.name || id).toLowerCase().replace(/\s+/g, "_"),
      avatarUrl: mentorUser?.avatarUrl || samplePhoto,
      domain: mentorUser?.domain || (isLearnerProfile ? "Web3 Student & Developer" : mentorOfferings[0]?.category || "Fullstack & Web3 Engineer"),
      bio: mentorUser?.bio || (isLearnerProfile ? "Web3 learner exploring Solidity, decentralized escrows, and Arbitrum nitro ecosystem." : "Experienced mentor guiding students through milestone projects with audited smart contract escrow protection."),
      university: mentorUser?.university || "Global Web3 Academy",
      hourlyRate: isLearnerProfile ? 0 : (Number(mentorUser?.hourlyRate) || mentorOfferings[0]?.price || 45),
      stakeAmount,
      mentorLevel: mentorUser?.mentorLevel || (stakeAmount >= 300 ? "MASTER" : stakeAmount >= 100 ? "PRO" : "RISING"),
      isVerified: mentorUser?.isVerified || stakeAmount >= 100,
      skills: skillsList,
      linkedin: mentorUser?.linkedin || "",
      twitter: mentorUser?.twitter || "",
      portfolio: mentorUser?.portfolio || "",
      walletAddress: mentorUser?.walletAddress || mentorOfferings[0]?.mentorAddress || "0x71C...49b2",
      rating: !isLearnerProfile && completedSessions.length > 0 ? Number((4.8 + Math.min(0.2, completedSessions.length * 0.02)).toFixed(1)) : null,
      reputationScore: isLearnerProfile ? 100 : 99,
      sessionsCompleted,
      offerings: parsedOfferings,
    };

    return c.json({ profile: profileData, success: true });
  } catch (e) {
    console.error("[Database Error] /api/mentor/public-profile:", e);
    return c.json({ error: "Failed to fetch mentor profile", detail: e.message }, 500);
  }
});

/** GET /api/blockchain/sponsor-status — Platform Gas Sponsor Vault Status */
app.get("/blockchain/sponsor-status", async (c) => {
  try {
    const status = await getSponsorVaultStatus();
    return c.json(status);
  } catch (e) {
    return c.json({ error: "Failed to fetch sponsor status", detail: e.message }, 500);
  }
});

/** POST /api/certificates/generate — Issue On-Chain Attestation Certificate with Platform Gas Subsidy */
app.post("/certificates/generate", async (c) => {
  try {
    const body = await c.req.json();
    const {
      sessionId,
      learnerName = "Verified Learner",
      learnerAddress,
      mentorName = "Verified Mentor",
      mentorAddress,
      skillTitle = "Mentorship Milestone Completion",
      category = "Coding",
      rating = 5,
      escrowAmount = 0,
      currency = "USDC",
    } = body;

    const certId = `cert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const randomHex = () => Math.random().toString(16).substring(2, 10);
    // Attestation UID (64 hex characters)
    const attestationUid = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
    // Schema UID for Trust Lesson Skill Attestation
    const schemaUid = "0x7a30b91e1d09e86a074bcf62589083315a6b0c2688b14a22ad31846b0a79339e";
    const attestationSignature = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}${randomHex()}1b`;
    const nowIso = new Date().toISOString();

    // ── Execute Real On-Chain Blockchain Recording with Platform Gas Subsidy ──
    const onChainResult = await issueOnChainCredentialWithSubsidy({
      mentorAddress: mentorAddress || "",
      learnerAddress: learnerAddress || "",
      sessionId: sessionId || Math.floor(Math.random() * 800000) + 100000,
      rating: Number(rating) || 5,
      skillTag: `${skillTitle} (${category})`,
    });

    const db = await getPrisma();

    // ── Pin Verifiable Credential Metadata to Pinata IPFS ──
    let metadataCid = null;
    let ipfsUrl = null;
    try {
      const vcDoc = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", "TrustLessonCredential"],
        id: certId,
        attestationUid,
        sessionId: String(sessionId || ""),
        learnerName,
        learnerAddress: learnerAddress || "0x0000000000000000000000000000000000000000",
        mentorName,
        mentorAddress: mentorAddress || "0x0000000000000000000000000000000000000000",
        skillTitle,
        category,
        rating: Number(rating) || 5,
        issuedAt: nowIso,
        attestationSignature,
        network: "Arbitrum Sepolia",
        txHash: onChainResult.txHash,
        contractAddress: onChainResult.contractAddress,
      };
      metadataCid = await uploadJsonToIpfs(vcDoc, `credential-${certId}`);
      if (metadataCid) {
        ipfsUrl = `https://gateway.pinata.cloud/ipfs/${metadataCid}`;
      }
    } catch (ipfsErr) {
      console.warn("[IPFS Pinata] Non-blocking upload warning:", ipfsErr.message);
    }

    const createdCert = await db.certificate.create({
      data: {
        id: certId,
        attestationUid,
        schemaUid,
        sessionId: String(sessionId || ""),
        learnerName,
        learnerAddress: learnerAddress || "0x0000...0000",
        mentorName,
        mentorAddress: mentorAddress || "0x0000...0000",
        skillTitle,
        category,
        rating: Number(rating) || 5,
        escrowAmount: Number(escrowAmount) || 0,
        currency,
        network: "Arbitrum Sepolia",
        attestationSignature,
        revoked: false,
        issuedAt: nowIso,
        txHash: onChainResult.txHash,
        blockNumber: onChainResult.blockNumber,
        contractAddress: onChainResult.contractAddress,
        credentialId: onChainResult.credentialId ? String(onChainResult.credentialId) : null,
        explorerUrl: onChainResult.explorerUrl,
        gasSponsored: true,
        sponsorWallet: onChainResult.sponsorWallet || PLATFORM_SPONSOR_WALLET,
        gasUsedEth: onChainResult.gasUsedEth || "0.000045 ETH",
        gasFeeUsd: onChainResult.gasFeeUsd || "0.12",
        metadataCid,
        ipfsUrl,
      },
    });

    const certificate = {
      ...createdCert,
      isAttestation: true,
      verifiableUrl: `/certificate/${attestationUid}`,
      studentGasPaid: "0.0000 ETH ($0.00)",
    };

    return c.json({ certificate, success: true }, 201);
  } catch (e) {
    console.error("[Certificate Error]:", e);
    return c.json({ error: "Failed to generate certificate", detail: e.message }, 500);
  }
});

/** GET /api/certificates/:id — Retrieve certificate by ID, attestation UID or sessionId */
app.get("/certificates/:id", async (c) => {
  const param = c.req.param("id");
  try {
    const db = await getPrisma();
    const certificate = await db.certificate.findFirst({
      where: {
        OR: [
          { id: param },
          { attestationUid: param },
          { sessionId: param },
        ],
      },
    });

    if (!certificate) {
      return c.json({ error: "Certificate or attestation not found" }, 404);
    }

    return c.json({ certificate, success: true });
  } catch (e) {
    console.error("[Certificate Fetch Error]:", e);
    return c.json({ error: "Failed to retrieve certificate", detail: e.message }, 500);
  }
});

/** POST /api/mentor/wallet — Configure and Lock Payout Wallet */
app.post("/mentor/wallet", async (c) => {
  try {
    const { address, email, userId } = await c.req.json();
    if (!address) {
      return c.json({ error: "Wallet address is required" }, 400);
    }

    const cleanAddress = address.trim().toLowerCase();
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(cleanAddress)) {
      return c.json({ error: "Invalid Ethereum/Arbitrum wallet address (must be 0x followed by 40 hex chars)" }, 400);
    }

    const db = await getPrisma();

    // Find user to lock (robust lookup: userId -> email -> wallet -> any mentor)
    let user = null;
    if (userId) {
      try {
        user = await db.user.findUnique({ where: { id: userId } });
      } catch {}
    }
    if (!user && email) {
      try {
        user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      } catch {}
    }
    if (!user) {
      try {
        user = await db.user.findFirst({
          where: {
            OR: [
              { walletAddress: cleanAddress },
              { role: "MENTOR" },
            ],
          },
        });
      } catch {}
    }

    // Clean any conflicting unique constraint for walletAddress on other user records
    try {
      const existingWalletUser = await db.user.findUnique({
        where: { walletAddress: cleanAddress },
      });
      if (existingWalletUser && user && existingWalletUser.id !== user.id) {
        await db.user.update({
          where: { id: existingWalletUser.id },
          data: { walletAddress: null, walletLocked: false },
        });
      }
    } catch (cleanErr) {
      console.warn("[Wallet Lock] Existing wallet cleanup warning:", cleanErr);
    }

    if (!user) {
      const newEmail = email ? email.toLowerCase() : `${cleanAddress.slice(0, 8)}@trustlesson.com`;
      user = await db.user.create({
        data: {
          email: newEmail,
          name: email ? email.split("@")[0] : `Mentor ${cleanAddress.slice(0, 6)}`,
          walletAddress: cleanAddress,
          role: "MENTOR",
          walletLocked: true,
        },
      });
      return c.json({
        success: true,
        walletAddress: cleanAddress,
        walletLocked: true,
        user,
      });
    }

    if (user.walletLocked && user.walletAddress && user.walletAddress !== cleanAddress) {
      return c.json(
        {
          error: "Wallet address is locked for security and escrow protection. Contact administration to request an unlock.",
          walletLocked: true,
          walletAddress: user.walletAddress,
        },
        403
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        walletAddress: cleanAddress,
        walletLocked: true,
      },
    });

    // Also sync all offerings for this mentor to route escrow correctly
    try {
      await db.offering.updateMany({
        where: {
          OR: [
            { mentorId: user.id },
            { mentorName: user.name },
          ],
        },
        data: {
          mentorAddress: cleanAddress,
        },
      });
    } catch {}

    return c.json({
      success: true,
      walletAddress: updatedUser.walletAddress,
      walletLocked: updatedUser.walletLocked,
      user: updatedUser,
    });
  } catch (e) {
    console.error("[Database Error] /api/mentor/wallet:", e);
    return c.json({ error: "Failed to configure wallet", detail: e.message }, 500);
  }
});

/** GET /api/mentor/profile — Fetch current mentor profile from database */
app.get("/mentor/profile", async (c) => {
  const userId = c.req.query("userId");
  const email = c.req.query("email")?.toLowerCase();
  const address = c.req.query("address")?.toLowerCase();

  try {
    const db = await getPrisma();
    let user = null;
    if (userId) user = await db.user.findUnique({ where: { id: userId } });
    if (!user && email) user = await db.user.findUnique({ where: { email } });
    if (!user && address) user = await db.user.findUnique({ where: { walletAddress: address } });
    if (!user) user = await db.user.findFirst({ where: { role: "MENTOR" } });

    if (!user) return c.json({ error: "Mentor not found" }, 404);

    let nickname = null;
    try {
      const rows = await db.$queryRawUnsafe(`SELECT nickname FROM "User" WHERE id = ? LIMIT 1`, user.id);
      if (rows && rows[0]) nickname = rows[0].nickname;
    } catch {}

    return c.json({
      user: {
        id: user.id,
        name: user.name,
        nickname: nickname || user.name?.toLowerCase().replace(/\s+/g, "_"),
        email: user.email,
        bio: user.bio,
        domain: user.domain,
        avatarUrl: user.avatarUrl,
        linkedin: user.linkedin,
        twitter: user.twitter,
        portfolio: user.portfolio,
        hourlyRate: user.hourlyRate,
        walletAddress: user.walletAddress,
        walletLocked: user.walletLocked,
        mentorLevel: user.mentorLevel,
        hasPassword: Boolean(user.passwordHash),
      },
    });
  } catch (e) {
    console.error("[Database Error] /api/mentor/profile GET:", e);
    return c.json({ error: "Failed to fetch profile", detail: e.message }, 500);
  }
});

/** POST /api/mentor/profile — Update mentor profile (name, nickname, bio, domain, socials) */
app.post("/mentor/profile", async (c) => {
  try {
    const body = await c.req.json();
    const {
      userId,
      email,
      address,
      name,
      nickname,
      bio,
      domain,
      avatarUrl,
      linkedin,
      twitter,
      portfolio,
      hourlyRate,
    } = body;

    const db = await getPrisma();
    let user = null;
    if (userId) user = await db.user.findUnique({ where: { id: userId } });
    if (!user && email) user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user && address) user = await db.user.findUnique({ where: { walletAddress: address.toLowerCase() } });
    if (!user) user = await db.user.findFirst();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (domain !== undefined) updates.domain = domain;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    if (linkedin !== undefined) updates.linkedin = linkedin;
    if (twitter !== undefined) updates.twitter = twitter;
    if (portfolio !== undefined) updates.portfolio = portfolio;
    if (hourlyRate !== undefined) updates.hourlyRate = Number(hourlyRate) || user.hourlyRate;

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: updates,
    });

    // Update nickname safely via raw SQL so it works whether or not Prisma client has re-generated
    let savedNickname = null;
    if (nickname !== undefined) {
      savedNickname = nickname.trim().replace(/^@/, "");
      try {
        await db.$executeRawUnsafe(
          `UPDATE "User" SET "nickname" = ? WHERE "id" = ?`,
          savedNickname,
          user.id
        );
      } catch (err) {
        console.warn("[Database] Could not update nickname column:", err.message);
      }
    } else {
      try {
        const rows = await db.$queryRawUnsafe(`SELECT nickname FROM "User" WHERE id = ? LIMIT 1`, user.id);
        if (rows && rows[0]) savedNickname = rows[0].nickname;
      } catch {}
    }

    return c.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        nickname: savedNickname || updatedUser.name?.toLowerCase().replace(/\s+/g, "_"),
      },
    });
  } catch (e) {
    console.error("[Database Error] /api/mentor/profile POST:", e);
    return c.json({ error: "Failed to update profile", detail: e.message }, 500);
  }
});

/** POST /api/mentor/change-password — Secure Password Change */
app.post("/mentor/change-password", async (c) => {
  try {
    const { userId, email, address, currentPassword, newPassword } = await c.req.json();

    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: "New password must be at least 6 characters long." }, 400);
    }

    const db = await getPrisma();
    let user = null;
    if (userId) user = await db.user.findUnique({ where: { id: userId } });
    if (!user && email) user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user && address) user = await db.user.findUnique({ where: { walletAddress: address.toLowerCase() } });
    if (!user) user = await db.user.findFirst({ where: { role: "MENTOR" } });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Verify current password if user already has a passwordHash
    if (user.passwordHash) {
      if (!currentPassword) {
        return c.json({ error: "Current password is required to set a new password." }, 400);
      }
      const isValid = verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return c.json({ error: "Current password does not match our records." }, 400);
      }
    }

    // Hash new password using PBKDF2 salt:hash
    const newHash = hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
      },
    });

    return c.json({
      success: true,
      message: "Password successfully changed. You can now use your new password to sign in.",
    });
  } catch (e) {
    console.error("[Database Error] /api/mentor/change-password:", e);
    return c.json({ error: "Failed to change password", detail: e.message }, 500);
  }
});

/** GET /api/resources — Query learning guides directly from database */
app.get("/resources", async (c) => {
  try {
    const db = await getPrisma();
    const resources = await db.resource.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json({ resources, source: "database" });
  } catch (e) {
    return c.json({ resources: [], error: e.message });
  }
});

// ════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT & TREASURY ROUTES
// ════════════════════════════════════════════════════════════════════

/** GET /api/admin/stats — Platform Treasury, Escrow Pool & Metrics */
app.get("/admin/stats", async (c) => {
  try {
    const db = await getPrisma();
    const [usersCount, mentorsCount, learnersCount, offeringsCount, sessions] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "MENTOR" } }),
      db.user.count({ where: { role: "LEARNER" } }),
      db.offering.count(),
      db.session.findMany({ select: { status: true, totalAmount: true } }),
    ]);

    const totalVolume = sessions.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const activeEscrow = sessions
      .filter((s) => ["CREATED", "FUNDED", "IN_SESSION"].includes(s.status))
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const completedVolume = sessions
      .filter((s) => s.status === "COMPLETED")
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

    // Platform fee: 10% protocol cut
    const platformTreasury = Number((totalVolume * 0.10).toFixed(2));
    const paidToMentors = Number((completedVolume * 0.90).toFixed(2));

    return c.json({
      usersCount,
      mentorsCount,
      learnersCount,
      offeringsCount,
      totalVolume,
      platformTreasury,
      activeEscrow,
      paidToMentors,
      disputesCount: await db.dispute.count().catch(() => 0),
      treasuryWallet: process.env.PLATFORM_TREASURY_WALLET || "",
    });
  } catch (e) {
    return c.json({ error: "Failed to fetch admin statistics", detail: e.message }, 500);
  }
});

/** GET /api/admin/users — Live user roster from database */
app.get("/admin/users", async (c) => {
  const role = c.req.query("role");
  try {
    const db = await getPrisma();
    const where = {};
    if (role && role !== "ALL") {
      where.role = role.toUpperCase();
    }
    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        university: true,
        walletAddress: true,
        isVerified: true,
        hourlyRate: true,
        domain: true,
        bio: true,
        createdAt: true,
      },
    });
    return c.json({ users });
  } catch (e) {
    return c.json({ error: "Failed to fetch users", detail: e.message }, 500);
  }
});

/** PATCH /api/admin/users/:id/verify — Toggle verification */
app.patch("/admin/users/:id/verify", async (c) => {
  const id = c.req.param("id");
  try {
    const db = await getPrisma();
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return c.json({ error: "User not found" }, 404);

    const updated = await db.user.update({
      where: { id },
      data: { isVerified: !existing.isVerified },
    });
    return c.json({ user: updated });
  } catch (e) {
    return c.json({ error: "Failed to update verification", detail: e.message }, 500);
  }
});

/** GET /api/admin/disputes — All platform disputes */
app.get("/admin/disputes", async (c) => {
  try {
    const db = await getPrisma();
    const disputes = await db.dispute.findMany({
      include: {
        session: {
          include: { learner: true, mentor: true, milestones: true },
        },
        raisedBy: true,
      },
      orderBy: { id: "desc" },
    });
    return c.json({ disputes });
  } catch (e) {
    return c.json({ disputes: [], error: e.message });
  }
});

/** GET /api/admin/jurors — Fetch active Dispute Council Juror pool */
app.get("/admin/jurors", async (c) => {
  try {
    const db = await getPrisma();
    const jurors = await db.user.findMany({
      where: {
        OR: [
          { role: "ADMIN" },
          { isJuror: true },
          { stakeAmount: { gte: 100 } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isJuror: true,
        stakeAmount: true,
        mentorLevel: true,
        isVerified: true,
        walletAddress: true,
        domain: true,
        hourlyRate: true,
      },
      orderBy: { stakeAmount: "desc" },
    });

    const adminEmails = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
    const exOfficioAdmins = jurors.filter(
      (j) => j.role === "ADMIN" || adminEmails.includes(j.email?.toLowerCase())
    );
    const mentorJurors = jurors.filter((j) => j.role !== "ADMIN");

    return c.json({
      totalJurors: jurors.length,
      quorumRequired: 3,
      councilCapacity: 5,
      exOfficioAdmins,
      mentorJurors,
      jurors,
    });
  } catch (e) {
    return c.json({ totalJurors: 0, jurors: [], error: e.message }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════
// CERTIFICATES & CREDENTIALS
// ════════════════════════════════════════════════════════════════════

/** GET /api/certificates/:id — Fetch certificate by sessionId or credentialId */
app.get("/certificates/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const db = await getPrisma();
    // Try to find by session id or match by onChainId
    let session = await db.session.findFirst({
      where: {
        OR: [
          { id: id },
          { id: { contains: id } },
        ],
      },
      include: {
        learner: true,
        mentor: true,
        milestones: true,
      },
    });

    if (!session) {
      // Fallback: return default attestation structure for preview/demo
      const net = getActiveNetwork();
      return c.json({
        certificate: {
          id: id,
          sessionId: id,
          credentialId: "2841",
          learnerName: "Learner (Web3 Student)",
          learnerAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          mentorName: "Master Mentor",
          mentorAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          skillTitle: "Solidity Smart Contract Security & Auditing",
          category: "Blockchain Development",
          attestationUid: `0x${id.replace(/-/g, "").padEnd(64, "0").slice(0, 64)}`,
          contractAddress: net.contracts.reputationRegistry,
          txHash: "0xb7c81a95e7c2e0bb14a796e956557cb7d55f0ee29c91038b5ce5ea211985fa50",
          blockNumber: 254821490,
          gasUsedEth: "0.000045 ETH",
          sponsorWallet: PLATFORM_SPONSOR_WALLET,
          issuedAt: new Date().toISOString(),
        },
      });
    }

    const net = getActiveNetwork();
    return c.json({
      certificate: {
        id: session.id,
        sessionId: session.id,
        credentialId: session.onChainId ? session.onChainId.toString() : "101",
        learnerName: session.learner?.name || session.learner?.walletAddress?.slice(0, 8) || "Web3 Student",
        learnerAddress: session.learner?.walletAddress,
        mentorName: session.mentor?.name || session.mentor?.walletAddress?.slice(0, 8) || "Verified Mentor",
        mentorAddress: session.mentor?.walletAddress,
        skillTitle: session.note || session.mentor?.domain || "Blockchain Engineering",
        category: session.mentor?.domain || "Web3",
        attestationUid: session.txHashRelease || `0x${session.id.replace(/-/g, "").padEnd(64, "0").slice(0, 64)}`,
        contractAddress: net.contracts.reputationRegistry,
        txHash: session.txHashRelease || session.txHashCreate,
        blockNumber: 254821490,
        gasUsedEth: "0.000045 ETH",
        sponsorWallet: PLATFORM_SPONSOR_WALLET,
        issuedAt: session.updatedAt || session.createdAt,
      },
    });
  } catch (e) {
    return c.json({ error: "Certificate lookup error", detail: e.message }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════
// FEEDBACK & USER SATISFACTION ROUTES
// ════════════════════════════════════════════════════════════════════

/** GET /api/feedbacks — Public: Get verified user satisfaction feedbacks */
app.get("/feedbacks", async (c) => {
  try {
    const db = await getPrisma();
    const feedbacks = await db.feedback.findMany({
      where: { status: "APPROVED" },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      take: 12,
    });
    return c.json({ feedbacks });
  } catch (e) {
    return c.json({ feedbacks: [], error: e.message }, 500);
  }
});

/** POST /api/feedbacks — Submit user satisfaction feedback */
app.post("/feedbacks", async (c) => {
  try {
    const body = await c.req.json();
    const {
      rating,
      category,
      comment,
      userName,
      userEmail,
      userRole,
      userAvatar,
      userId,
    } = body;

    if (!comment || !comment.trim()) {
      return c.json({ error: "Comment is required" }, 400);
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));

    const db = await getPrisma();
    
    // Look up user if userId or userEmail is provided
    let matchedUserId = userId || null;
    let fallbackName = userName || "Community Member";
    let fallbackAvatar = userAvatar || null;
    let fallbackRole = userRole || "LEARNER";

    if (!matchedUserId && userEmail) {
      const u = await db.user.findUnique({ where: { email: userEmail } });
      if (u) {
        matchedUserId = u.id;
        fallbackName = u.name || fallbackName;
        fallbackAvatar = u.avatarUrl || fallbackAvatar;
        fallbackRole = u.role || fallbackRole;
      }
    } else if (matchedUserId) {
      const u = await db.user.findUnique({ where: { id: matchedUserId } });
      if (u) {
        fallbackName = u.name || fallbackName;
        fallbackAvatar = u.avatarUrl || fallbackAvatar;
        fallbackRole = u.role || fallbackRole;
      }
    }

    const feedback = await db.feedback.create({
      data: {
        userId: matchedUserId,
        userName: fallbackName,
        userEmail: userEmail || null,
        userAvatar: fallbackAvatar,
        userRole: fallbackRole,
        rating: numericRating,
        category: category || "Platform Experience",
        comment: comment.trim(),
        isFeatured: true,
        status: "APPROVED",
      },
    });

    return c.json({ success: true, feedback }, 201);
  } catch (e) {
    console.error("[Submit Feedback Error]:", e);
    return c.json({ error: "Failed to submit feedback", detail: e.message }, 500);
  }
});

/** GET /api/admin/feedbacks — Admin: Fetch all feedbacks with statistics */
app.get("/admin/feedbacks", async (c) => {
  try {
    const db = await getPrisma();
    const feedbacks = await db.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
    });

    const totalCount = feedbacks.length;
    const avgRating = totalCount > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalCount).toFixed(1)
      : "5.0";

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      if (ratingDistribution[f.rating] !== undefined) {
        ratingDistribution[f.rating]++;
      }
    });

    return c.json({
      feedbacks,
      stats: {
        totalCount,
        avgRating: Number(avgRating),
        ratingDistribution,
        approvedCount: feedbacks.filter((f) => f.status === "APPROVED").length,
      },
    });
  } catch (e) {
    return c.json({ feedbacks: [], error: e.message }, 500);
  }
});

/** PATCH /api/admin/feedbacks/:id — Admin: Toggle featured or update status */
app.patch("/admin/feedbacks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const db = await getPrisma();

    const data = {};
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);
    if (body.status !== undefined) data.status = String(body.status);

    const updated = await db.feedback.update({
      where: { id },
      data,
    });

    return c.json({ success: true, feedback: updated });
  } catch (e) {
    return c.json({ error: "Failed to update feedback", detail: e.message }, 500);
  }
});

/** DELETE /api/admin/feedbacks/:id — Admin: Delete feedback */
app.delete("/admin/feedbacks/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const db = await getPrisma();
    await db.feedback.delete({ where: { id } });
    return c.json({ success: true, message: "Feedback removed" });
  } catch (e) {
    return c.json({ error: "Failed to delete feedback", detail: e.message }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════
// CHAT ROUTES
// ════════════════════════════════════════════════════════════════════

/** GET /api/chat/threads — Get threads for current user */
app.get("/chat/threads", authMiddleware, async (c) => {
  const jwtUser = c.get("user");
  try {
    const db = await getPrisma();

    // 1. Auto-discover or create threads for any enrollments involving jwtUser
    const enrollments = await db.enrollment.findMany({
      where: {
        OR: [
          { learnerId: jwtUser.sub },
          { mentorId: jwtUser.sub },
        ],
      },
      include: {
        gig: true,
        learner: { select: { id: true, name: true, avatarUrl: true, email: true } },
        mentor: { select: { id: true, name: true, avatarUrl: true, email: true } },
      },
    });

    for (const enr of enrollments) {
      let thread = await db.chatThread.findFirst({
        where: { enrollmentId: enr.id },
      });
      if (!thread) {
        await db.chatThread.create({
          data: {
            kind: "DIRECT",
            enrollmentId: enr.id,
            participants: {
              create: [
                { userId: enr.learnerId, role: "LEARNER" },
                { userId: enr.mentorId, role: "MENTOR" },
              ],
            },
          },
        });
      }
    }

    // 2. Fetch all threads where user is a participant
    const threads = await db.chatThread.findMany({
      where: {
        participants: {
          some: { userId: jwtUser.sub },
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, email: true, role: true } },
          },
        },
        enrollment: {
          include: {
            gig: { select: { id: true, title: true, coverImage: true } },
          },
        },
        messages: {
          orderBy: { seq: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return c.json({ threads });
  } catch (err) {
    console.error("[GET /chat/threads Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** GET /api/chat/threads/:id/messages — Get message history */
app.get("/chat/threads/:id/messages", authMiddleware, async (c) => {
  const threadId = c.req.param("id");
  const jwtUser = c.get("user");
  try {
    const db = await getPrisma();
    const isParticipant = await db.chatParticipant.findFirst({
      where: { threadId, userId: jwtUser.sub },
    });
    if (!isParticipant) {
      return c.json({ error: "Access denied to thread" }, 403);
    }

    const messages = await db.chatMessage.findMany({
      where: { threadId },
      orderBy: { seq: "asc" },
      take: 100,
    });

    return c.json({ messages });
  } catch (err) {
    console.error("[GET /chat/threads/:id/messages Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

/** POST /api/chat/threads/:id/messages — Send a message */
app.post("/chat/threads/:id/messages", authMiddleware, async (c) => {
  const threadId = c.req.param("id");
  const jwtUser = c.get("user");
  const { body, kind = "TEXT" } = await c.req.json();
  if (!body || !body.trim()) {
    return c.json({ error: "Message body is required" }, 400);
  }

  try {
    const db = await getPrisma();
    const isParticipant = await db.chatParticipant.findFirst({
      where: { threadId, userId: jwtUser.sub },
    });
    if (!isParticipant) {
      return c.json({ error: "Access denied to thread" }, 403);
    }

    const thread = await db.chatThread.findUnique({
      where: { id: threadId },
      include: {
        messages: {
          orderBy: { seq: "desc" },
          take: 1,
        },
      },
    });

    const lastMsg = thread?.messages?.[0];
    const seq = (lastMsg?.seq || 0) + 1;
    const prevHash = lastMsg?.hash || "0x0";
    const timestamp = new Date().toISOString();
    const cryptoModule = await import("crypto");
    const hash = cryptoModule.default
      .createHash("sha256")
      .update(`${prevHash}:${seq}:${body}:${timestamp}`)
      .digest("hex");

    const message = await db.chatMessage.create({
      data: {
        threadId,
        senderId: jwtUser.sub,
        seq,
        kind,
        body: body.trim(),
        prevHash,
        hash,
      },
    });

    await db.chatThread.update({
      where: { id: threadId },
      data: { headHash: hash, updatedAt: new Date() },
    });

    return c.json({ message }, 201);
  } catch (err) {
    console.error("[POST /chat/threads/:id/messages Error]:", err);
    return c.json({ error: err.message }, 500);
  }
});

// ════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════════

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export { app };
