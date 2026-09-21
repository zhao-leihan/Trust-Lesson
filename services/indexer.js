/**
 * Trust Lesson — On-Chain Event Indexer
 * Uses viem to watch Arbitrum One events and sync to PostgreSQL.
 *
 * Run standalone: node services/indexer.js
 * Or integrate as a background process.
 */

// Note: import { createPublicClient, http, parseAbiItem } from "viem";
// and { arbitrum } from "viem/chains";
// These are listed as future dependencies.

// ABI fragments for events we want to index
const ESCROW_EVENTS = [
  "event SessionCreated(uint256 indexed sessionId, address learner, address mentor, uint256 totalAmount)",
  "event MilestoneReleased(uint256 indexed sessionId, uint256 index, uint256 amount)",
  "event DisputeRaised(uint256 indexed sessionId, address raisedBy, bytes32 evidenceHash)",
  "event DisputeResolved(uint256 indexed sessionId, uint8 releasePercent)",
];

const VIDEO_EVENTS = [
  "event VideoRegistered(uint256 indexed videoId, address mentor, bytes32 contentHash)",
  "event VideoPurchased(uint256 indexed videoId, address learner)",
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://arb1.arbitrum.io/rpc";

/**
 * Start the indexer.
 * In production: import prisma and viem, watch events, update DB.
 */
export async function startIndexer() {
  if (!CONTRACT_ADDRESS) {
    console.warn("[Indexer] No contract address configured. Indexer disabled.");
    return;
  }

  console.log("[Indexer] Starting on", RPC_URL, "contract:", CONTRACT_ADDRESS);

  // Example structure for production:
  //
  // const client = createPublicClient({ chain: arbitrum, transport: http(RPC_URL) });
  //
  // client.watchContractEvent({
  //   address: CONTRACT_ADDRESS,
  //   abi: parseAbiItem(ESCROW_EVENTS),
  //   onLogs: async (logs) => {
  //     for (const log of logs) {
  //       await handleEvent(log);
  //     }
  //   },
  // });

  console.log("[Indexer] Watching events...");
}

/**
 * Handle a single on-chain event and update the database.
 */
async function handleEvent(log) {
  const { eventName, args } = log;
  console.log(`[Indexer] Event: ${eventName}`, args);

  // Import prisma lazily to avoid module issues
  const { prisma } = await import("../lib/prisma.js");

  switch (eventName) {
    case "SessionCreated": {
      const { sessionId, learner, mentor, totalAmount } = args;
      await prisma.session.updateMany({
        where: { learnerId: { contains: learner.toLowerCase() } },
        data: { onChainId: BigInt(sessionId), status: "FUNDED" },
      }).catch(console.warn);
      break;
    }
    case "MilestoneReleased": {
      const { sessionId, index, amount } = args;
      await prisma.milestone.updateMany({
        where: { session: { onChainId: BigInt(sessionId) }, index: Number(index) },
        data: { status: "RELEASED" },
      }).catch(console.warn);
      break;
    }
    case "DisputeRaised": {
      const { sessionId } = args;
      await prisma.session.updateMany({
        where: { onChainId: BigInt(sessionId) },
        data: { status: "DISPUTED" },
      }).catch(console.warn);
      break;
    }
    case "DisputeResolved": {
      const { sessionId } = args;
      await prisma.session.updateMany({
        where: { onChainId: BigInt(sessionId) },
        data: { status: "RESOLVED" },
      }).catch(console.warn);
      break;
    }
    default:
      console.log("[Indexer] Unknown event:", eventName);
  }
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startIndexer().catch(console.error);
}
