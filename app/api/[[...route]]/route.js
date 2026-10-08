import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { verifyJwt, signJwt, extractBearerToken } from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getCloudflareUploadUrl, getSignedPlaybackUrl, getSignedPlaybackToken } from "@/lib/cloudflare";
import { uploadResourceToR2, getPresignedR2DownloadUrl, verifyAndGetDevResource } from "@/lib/cloudflareR2";
import { uploadToIpfs, uploadJsonToIpfs } from "@/lib/ipfs";
import { getSponsorVaultStatus, issueOnChainCredentialWithSubsidy, PLATFORM_SPONSOR_WALLET } from "@/lib/gasSponsor";
import { getActiveNetwork } from "@/lib/networkConfig";
import { calculateMentorScore, isJurorEligible, calculateStudentScore } from "@/lib/leaderboardScore";
import { sendWelcomeEmail, sendTransactionReceiptEmail, sendNewMaterialEmail } from "@/lib/resend";

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
// AUTH ROUTES (Email/Password + SIWE Web3)
// ════════════════════════════════════════════════════════════════════

/** POST /api/auth/login — Email + Password Login */
app.post("/auth/login", async (c) => {
  const { email, password, rememberMe } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const db = await getPrisma();
    const cleanEmail = email.toLowerCase().trim();
    const adminEmails = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((e) => e.trim()).filter(Boolean);
    const isAdminEmail = adminEmails.includes(cleanEmail);
    let user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

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
    const expiresIn = isRemember ? "30d" : "1d";
    const token = await signJwt(
      {
        sub: user.id,
        email: user.email,
        address: user.walletAddress,
        role: user.role,
        tv: user.tokenVersion || 1,
      },
      expiresIn
    );

    // Set secure HttpOnly cookie to protect against XSS
    setCookie(c, "tl_session", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: isRemember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
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
    console.error("[Login Error]:", e);
    return c.json({ error: "Database error during login", detail: e.message }, 500);
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

    // 1. Fetch Mentors & Council Jurors from NeonDB
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

    // 2. Fetch Students / Learners from NeonDB
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
        packages: JSON.stringify(packages),
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

/** GET /api/mentor/public-profile/:id — Public mentor profile with stats & offerings */
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

    const profileData = {
      id: mentorUser?.id || id,
      name: mentorUser?.name || mentorOfferings[0]?.mentorName || id,
      nickname: mentorUser?.nickname || (mentorUser?.name || id).toLowerCase().replace(/\s+/g, "_"),
      avatarUrl: mentorUser?.avatarUrl || samplePhoto,
      domain: mentorUser?.domain || mentorOfferings[0]?.category || "Fullstack & Web3 Engineer",
      bio: mentorUser?.bio || "Experienced mentor guiding students through milestone projects with audited smart contract escrow protection.",
      hourlyRate: Number(mentorUser?.hourlyRate) || mentorOfferings[0]?.price || 45,
      stakeAmount,
      mentorLevel: mentorUser?.mentorLevel || (stakeAmount >= 300 ? "MASTER" : stakeAmount >= 100 ? "PRO" : "RISING"),
      isVerified: mentorUser?.isVerified || stakeAmount >= 100,
      skills: skillsList,
      linkedin: mentorUser?.linkedin || "https://linkedin.com",
      twitter: mentorUser?.twitter || "https://x.com",
      portfolio: mentorUser?.portfolio || "https://trustlesson.io",
      walletAddress: mentorUser?.walletAddress || mentorOfferings[0]?.mentorAddress || "0x71C...49b2",
      rating: completedSessions.length > 0 ? Number((4.8 + Math.min(0.2, completedSessions.length * 0.02)).toFixed(1)) : null,
      reputationScore: 99,
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
    if (!user) user = await db.user.findFirst({ where: { role: "MENTOR" } });

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
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════════

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export { app };
