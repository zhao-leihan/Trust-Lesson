/**
 * Escrow Access Gate (main.md Section 2)
 * Central authority for enrollment access and materials gating.
 */

import { prisma } from "./prisma.js";
import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

export const ESCROW_STATUS_RULES = {
  CREATED: {
    canViewMaterials: false,
    canRequestMeeting: false,
    canSeeJoinLink: false,
    isReadOnly: true,
    isDisputed: false,
  },
  FUNDED: {
    canViewMaterials: true,
    canRequestMeeting: true,
    canSeeJoinLink: true,
    isReadOnly: false,
    isDisputed: false,
  },
  IN_SESSION: {
    canViewMaterials: true,
    canRequestMeeting: true,
    canSeeJoinLink: true,
    isReadOnly: false,
    isDisputed: false,
  },
  COMPLETED: {
    canViewMaterials: true,
    canRequestMeeting: false,
    canSeeJoinLink: false,
    isReadOnly: true,
    isDisputed: false,
  },
  DISPUTED: {
    canViewMaterials: true,
    canRequestMeeting: false,
    canSeeJoinLink: false,
    isReadOnly: true,
    isDisputed: true,
  },
  RESOLVED: {
    canViewMaterials: false,
    canRequestMeeting: false,
    canSeeJoinLink: false,
    isReadOnly: true,
    isDisputed: false,
  },
  CANCELLED: {
    canViewMaterials: false,
    canRequestMeeting: false,
    canSeeJoinLink: false,
    isReadOnly: true,
    isDisputed: false,
  },
};

const ONCHAIN_STATUS_MAP = [
  "CREATED",
  "FUNDED",
  "IN_SESSION",
  "COMPLETED",
  "DISPUTED",
  "RESOLVED",
  "CANCELLED",
];

const ESCROW_ROUTER_ABI = [
  {
    name: "getSession",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "sessionId", type: "uint256" }],
    outputs: [
      { name: "learner", type: "address" },
      { name: "mentor", type: "address" },
      { name: "totalAmount", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "createdAt", type: "uint256" },
      { name: "milestoneCount", type: "uint256" },
    ],
  },
];

/**
 * Checks on-chain status if mirror is stale (> 60s)
 */
async function syncOnChainFreshness(enrollment) {
  if (!enrollment.onchainSessionId) return enrollment.escrowStatus;

  const ageMs = Date.now() - new Date(enrollment.updatedAt).getTime();
  if (ageMs < 60000) {
    return enrollment.escrowStatus;
  }

  const contractAddress =
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT ||
    process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS;
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

  if (!contractAddress) return enrollment.escrowStatus;

  try {
    const isSepolia = (process.env.NEXT_PUBLIC_CHAIN_ID || "421614") === "421614";
    const chain = isSepolia ? arbitrumSepolia : arbitrum;
    const client = createPublicClient({
      chain,
      transport: http(rpcUrl, { timeout: 3000 }),
    });

    const sessionData = await client.readContract({
      address: contractAddress,
      abi: ESCROW_ROUTER_ABI,
      functionName: "getSession",
      args: [BigInt(enrollment.onchainSessionId)],
    });

    const onchainStatusCode = Number(sessionData[3]);
    const resolvedStatus = ONCHAIN_STATUS_MAP[onchainStatusCode] || enrollment.escrowStatus;

    if (resolvedStatus !== enrollment.escrowStatus) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { escrowStatus: resolvedStatus },
      });
      return resolvedStatus;
    }
  } catch (err) {
    console.warn(`[getEnrollmentAccess] On-chain freshness check skipped: ${err.message}`);
  }

  return enrollment.escrowStatus;
}

/**
 * Primary access check function.
 * @param {string} enrollmentId
 * @param {string} userId - Current user's ID
 * @param {object} options - { checkFreshness: boolean }
 * @returns {Promise<{ allowed: boolean, notFound: boolean, enrollment: object, rules: object }>}
 */
export async function getEnrollmentAccess(enrollmentId, userId, options = {}) {
  if (!enrollmentId || !userId) {
    return { allowed: false, notFound: true, reason: "Missing parameters" };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      gig: true,
      learner: { select: { id: true, name: true, email: true, walletAddress: true, avatarUrl: true } },
      mentor: { select: { id: true, name: true, email: true, walletAddress: true, avatarUrl: true } },
      review: true,
      participants: true,
    },
  });

  if (!enrollment) {
    return { allowed: false, notFound: true, reason: "Enrollment not found" };
  }

  // A user may only access an enrollment if they are its learner or its mentor.
  // Return 404, not 403, for other people's IDs (Section 2 rule).
  const isLearner = enrollment.learnerId === userId;
  const isMentor = enrollment.mentorId === userId;

  if (!isLearner && !isMentor) {
    return { allowed: false, notFound: true, reason: "Access denied" };
  }

  let status = enrollment.escrowStatus;
  if (options.checkFreshness) {
    status = await syncOnChainFreshness(enrollment);
  }

  const rules = ESCROW_STATUS_RULES[status] || ESCROW_STATUS_RULES.CREATED;

  return {
    allowed: true,
    notFound: false,
    role: isLearner ? "LEARNER" : "MENTOR",
    isLearner,
    isMentor,
    enrollment,
    status,
    ...rules,
  };
}

/**
 * Checks if current time is within join window (15m before start until 30m after end)
 */
export function isMeetingInsideJoinWindow(meeting) {
  if (!meeting?.startAt || !meeting?.endAt) return false;
  const now = Date.now();
  const startTime = new Date(meeting.startAt).getTime();
  const endTime = new Date(meeting.endAt).getTime();

  const windowStart = startTime - 15 * 60 * 1000; // 15 mins before
  const windowEnd = endTime + 30 * 60 * 1000;    // 30 mins after

  return now >= windowStart && now <= windowEnd;
}
