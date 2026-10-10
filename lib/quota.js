import { prisma } from "./prisma.js";

/**
 * Atomically reserves 1 session unit on an enrollment.
 * Executes the atomic race-safe SQL query defined in main.md Section 4:
 *
 * UPDATE "Enrollment"
 * SET "sessionsReserved" = "sessionsReserved" + 1
 * WHERE id = $1 AND "sessionsUsed" + "sessionsReserved" < "sessionsIncluded"
 * RETURNING *;
 *
 * @param {object} tx - Prisma transaction client
 * @param {string} enrollmentId - ID of the enrollment
 * @param {string|null} meetingId - Associated meeting ID (optional)
 * @param {string} reason - Audit reason for ledger
 * @returns {Promise<object>} Updated enrollment
 * @throws {Error} if quota is exceeded
 */
export async function reserveQuota(tx, enrollmentId, meetingId = null, reason = "Meeting requested") {
  const rows = await tx.$queryRawUnsafe(
    `
    UPDATE "Enrollment"
    SET "sessionsReserved" = "sessionsReserved" + 1,
        "updatedAt" = NOW()
    WHERE id = $1 AND ("sessionsUsed" + "sessionsReserved") < "sessionsIncluded"
    RETURNING *;
    `,
    enrollmentId
  );

  if (!rows || rows.length === 0) {
    const error = new Error("QUOTA_EXCEEDED: No live sessions remaining in this enrollment package.");
    error.code = "QUOTA_EXCEEDED";
    error.statusCode = 409;
    throw error;
  }

  const updatedEnrollment = rows[0];

  // Record QuotaLedger audit entry
  await tx.quotaLedger.create({
    data: {
      enrollmentId,
      meetingId,
      action: "RESERVE",
      deltaReserved: 1,
      deltaUsed: 0,
      reason,
    },
  });

  return updatedEnrollment;
}

/**
 * Releases 1 reserved session unit back to available quota.
 * Called when mentor declines, request expires, or cancellation occurs >= 24h before start.
 */
export async function releaseQuota(tx, enrollmentId, meetingId = null, reason = "Meeting declined or cancelled") {
  const rows = await tx.$queryRawUnsafe(
    `
    UPDATE "Enrollment"
    SET "sessionsReserved" = GREATEST(0, "sessionsReserved" - 1),
        "updatedAt" = NOW()
    WHERE id = $1 AND "sessionsReserved" > 0
    RETURNING *;
    `,
    enrollmentId
  );

  if (rows && rows.length > 0) {
    await tx.quotaLedger.create({
      data: {
        enrollmentId,
        meetingId,
        action: "RELEASE",
        deltaReserved: -1,
        deltaUsed: 0,
        reason,
      },
    });
    return rows[0];
  }

  return null;
}

/**
 * Consumes 1 session unit: reserved decrements by 1, used increments by 1.
 * Called when a meeting completes successfully.
 */
export async function consumeQuota(tx, enrollmentId, meetingId = null, reason = "Meeting completed") {
  const rows = await tx.$queryRawUnsafe(
    `
    UPDATE "Enrollment"
    SET "sessionsReserved" = GREATEST(0, "sessionsReserved" - 1),
        "sessionsUsed" = "sessionsUsed" + 1,
        "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *;
    `,
    enrollmentId
  );

  if (rows && rows.length > 0) {
    await tx.quotaLedger.create({
      data: {
        enrollmentId,
        meetingId,
        action: "CONSUME",
        deltaReserved: -1,
        deltaUsed: 1,
        reason,
      },
    });
    return rows[0];
  }

  return null;
}

/**
 * Forfeits 1 session unit (counts as used): reserved decrements by 1, used increments by 1.
 * Called when learner cancels less than 24h before start or learner no-shows.
 */
export async function forfeitQuota(tx, enrollmentId, meetingId = null, reason = "Late cancellation (<24h) or learner no-show") {
  const rows = await tx.$queryRawUnsafe(
    `
    UPDATE "Enrollment"
    SET "sessionsReserved" = GREATEST(0, "sessionsReserved" - 1),
        "sessionsUsed" = "sessionsUsed" + 1,
        "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *;
    `,
    enrollmentId
  );

  if (rows && rows.length > 0) {
    await tx.quotaLedger.create({
      data: {
        enrollmentId,
        meetingId,
        action: "FORFEIT",
        deltaReserved: -1,
        deltaUsed: 1,
        reason,
      },
    });
    return rows[0];
  }

  return null;
}
