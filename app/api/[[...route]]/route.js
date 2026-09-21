import { Hono } from "hono";
import { handle } from "hono/vercel";
import { verifyJwt, signJwt, extractBearerToken } from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { getCloudflareUploadUrl, getSignedPlaybackUrl } from "@/lib/cloudflare";
import { uploadToIpfs, uploadJsonToIpfs } from "@/lib/ipfs";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = async (c, next) => {
  const token = extractBearerToken(c.req.header("Authorization"));
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  try {
    const payload = await verifyJwt(token);
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
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  try {
    const db = await getPrisma();
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      address: user.walletAddress,
      role: user.role,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        university: user.university,
        walletAddress: user.walletAddress,
        isVerified: user.isVerified,
        domain: user.domain,
        hourlyRate: user.hourlyRate,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (e) {
    console.error("[Login Error]:", e);
    return c.json({ error: "Database error during login", detail: e.message }, 500);
  }
});

/** POST /api/auth/register — Email + Password Registration with University */
app.post("/auth/register", async (c) => {
  const body = await c.req.json();
  const { email, password, name, role, university, domain, bio, hourlyRate } = body;

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

    const assignedRole = (role || "LEARNER").toUpperCase();
    const passwordHash = hashPassword(password);

    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role: assignedRole,
        university: assignedRole === "LEARNER" ? university || null : null,
        domain: assignedRole === "MENTOR" ? domain || "Software Engineering" : null,
        hourlyRate: assignedRole === "MENTOR" ? Number(hourlyRate) || 35 : 0,
        bio: bio || null,
        isVerified: assignedRole === "ADMIN",
      },
    });

    const token = await signJwt({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return c.json(
      {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          university: newUser.university,
          domain: newUser.domain,
          hourlyRate: newUser.hourlyRate,
          isVerified: newUser.isVerified,
        },
      },
      201
    );
  } catch (e) {
    console.error("[Register Error]:", e);
    return c.json({ error: "Database error during registration", detail: e.message }, 500);
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
  const contractAddress = process.env.NEXT_PUBLIC_ESCROW_CONTRACT || "";
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
    });
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

    // Parse JSON fields (milestones, deliverables) if present
    let parsedOfferings = offerings.map((item) => ({
      ...item,
      milestones: item.milestones ? JSON.parse(item.milestones) : null,
      deliverables: item.deliverables ? JSON.parse(item.deliverables) : null,
    }));

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

    return c.json({
      offering: {
        ...item,
        milestones: item.milestones ? JSON.parse(item.milestones) : null,
        deliverables: item.deliverables ? JSON.parse(item.deliverables) : null,
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
        category: body.category || "Coding",
        price: Number(body.price) || 0,
        duration: body.duration || "1 hour",
        level: body.level || "All levels",
        description: body.description,
        coverImage: body.coverImage,
        mentorName: body.mentorName,
        mentorPhoto: body.mentorPhoto,
        mentorAddress: body.mentorAddress,
        milestones: body.milestones ? JSON.stringify(body.milestones) : null,
        deliverables: body.deliverables ? JSON.stringify(body.deliverables) : null,
      },
    });
    return c.json({ offering: newOffering }, 201);
  } catch (e) {
    return c.json({ error: "Failed to create offering in database", detail: e.message }, 400);
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

    // Platform fee: 5% protocol cut
    const platformTreasury = Number((totalVolume * 0.05).toFixed(2));
    const paidToMentors = Number((completedVolume * 0.95).toFixed(2));

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
      treasuryWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
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

// ════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════════

app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
