import { ethers } from "ethers";
import { getActiveNetwork, getExplorerTxUrl } from "../networkConfig.js";

const network = getActiveNetwork();
const ARBITRUM_RPC = network.rpcUrl;
const SKILL_GRAPH_ADDRESS =
  process.env.NEXT_PUBLIC_SKILL_GRAPH_CONTRACT ||
  network.contracts?.skillGraph ||
  "0x99303483484cc2c9393138574969f15C415A3016";

const SKILL_GRAPH_ABI = [
  "function updateProgress(address subject, bytes32 skillId, uint8 rating) external",
  "function getSkillLevel(address subject, bytes32 skillId) public view returns (uint8 level)",
  "function getSubjectSkills(address subject) external view returns (bytes32[] memory ids, string[] memory names, uint8[] memory levels, uint256[] memory sessionCounts)",
  "event ProgressUpdated(address indexed subject, bytes32 indexed skillId, uint256 sessionCount, uint8 newLevel)",
];

/**
 * Standard Skill Node IDs
 */
export const SKILL_NODES = {
  "Solidity Basics": ethers.keccak256(ethers.toUtf8Bytes("Solidity Basics")),
  "Web3 Frontend": ethers.keccak256(ethers.toUtf8Bytes("Web3 Frontend")),
  "Solidity Security": ethers.keccak256(ethers.toUtf8Bytes("Solidity Security")),
  "DeFi Architecture": ethers.keccak256(ethers.toUtf8Bytes("DeFi Architecture")),
  "React": ethers.keccak256(ethers.toUtf8Bytes("React")),
  "System Design": ethers.keccak256(ethers.toUtf8Bytes("System Design")),
  "Zero Knowledge Proofs": ethers.keccak256(ethers.toUtf8Bytes("Zero Knowledge Proofs")),
};

/**
 * Map skill tag to bytes32 skillId
 */
export function getSkillIdByName(name = "Solidity Basics") {
  if (SKILL_NODES[name]) return SKILL_NODES[name];
  return ethers.keccak256(ethers.toUtf8Bytes(name.trim()));
}

/**
 * Update a user's on-chain skill progress
 */
export async function updateOnChainSkillProgress({
  subjectAddress,
  skillName = "Solidity Basics",
  rating = 5,
}) {
  if (!subjectAddress || !subjectAddress.startsWith("0x") || subjectAddress.length !== 42) {
    return { success: false, error: "Invalid subject address" };
  }

  const skillId = getSkillIdByName(skillName);
  const cleanRating = Math.max(1, Math.min(5, Number(rating) || 5));

  const sponsorPrivateKey =
    process.env.PLATFORM_SPONSOR_PRIVATE_KEY || process.env.DEPLOY_PRIVATE_KEY;

  if (sponsorPrivateKey && sponsorPrivateKey.length >= 64) {
    try {
      const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
      const wallet = new ethers.Wallet(sponsorPrivateKey, provider);
      const contract = new ethers.Contract(SKILL_GRAPH_ADDRESS, SKILL_GRAPH_ABI, wallet);

      const tx = await contract.updateProgress(subjectAddress, skillId, cleanRating, {
        gasLimit: 300000,
      });
      const receipt = await tx.wait(1);

      return {
        success: true,
        onChain: true,
        txHash: receipt.hash,
        skillId,
        skillName,
        rating: cleanRating,
        contractAddress: SKILL_GRAPH_ADDRESS,
        explorerUrl: getExplorerTxUrl(receipt.hash),
      };
    } catch (err) {
      console.warn("[SkillGraph] Live updateProgress fallback:", err.message);
    }
  }

  return {
    success: true,
    onChain: false,
    skillId,
    skillName,
    rating: cleanRating,
    txHash: null,
    contractAddress: SKILL_GRAPH_ADDRESS,
    explorerUrl: null,
  };
}

/**
 * Fetch a learner's on-chain skill level for a specific skill
 */
export async function getOnChainSkillLevel(subjectAddress, skillName = "Solidity Basics") {
  if (!subjectAddress || !subjectAddress.startsWith("0x")) {
    return 0;
  }

  const skillId = getSkillIdByName(skillName);

  try {
    const provider = new ethers.JsonRpcProvider(ARBITRUM_RPC);
    const contract = new ethers.Contract(SKILL_GRAPH_ADDRESS, SKILL_GRAPH_ABI, provider);
    const level = await contract.getSkillLevel(subjectAddress, skillId);
    return Number(level);
  } catch (err) {
    console.warn("[SkillGraph] getSkillLevel RPC check failed:", err.message);
    return 1; // Graceful fallback Level 1
  }
}
