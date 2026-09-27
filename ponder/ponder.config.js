import { createConfig } from "@ponder/core";
import { http } from "viem";

// NOTE: Install ponder with: npm install @ponder/core
// Then add to package.json scripts:
//   "indexer:ponder": "ponder dev"
//   "indexer:ponder:start": "ponder start"

// Minimal ABI for events we want to index
const EscrowRouterAbi = [
  {
    type: "event",
    name: "SessionCreated",
    inputs: [
      { name: "sessionId", type: "uint256", indexed: true },
      { name: "learner",   type: "address", indexed: false },
      { name: "mentor",    type: "address", indexed: false },
      { name: "totalAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SessionStarted",
    inputs: [{ name: "sessionId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "MilestoneReleased",
    inputs: [
      { name: "sessionId", type: "uint256", indexed: true },
      { name: "index",     type: "uint256", indexed: false },
      { name: "amount",    type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SessionCompleted",
    inputs: [{ name: "sessionId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "DisputeRaised",
    inputs: [
      { name: "sessionId",    type: "uint256", indexed: true },
      { name: "raisedBy",     type: "address", indexed: false },
      { name: "evidenceHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "DisputeResolved",
    inputs: [
      { name: "sessionId",      type: "uint256", indexed: true },
      { name: "releasePercent", type: "uint8",   indexed: false },
    ],
  },
  {
    type: "event",
    name: "SessionCancelled",
    inputs: [{ name: "sessionId", type: "uint256", indexed: true }],
  },
];

const VerifiableCredentialAbi = [
  {
    type: "event",
    name: "CredentialIssued",
    inputs: [
      { name: "credentialId", type: "uint256", indexed: true },
      { name: "subject",      type: "address", indexed: true },
      { name: "credType",     type: "uint8",   indexed: false },
      { name: "sessionId",    type: "uint256", indexed: false },
      { name: "rating",       type: "uint8",   indexed: false },
      { name: "skillNodeId",  type: "bytes32", indexed: false },
      { name: "metadataCid",  type: "string",  indexed: false },
    ],
  },
];

const DisputeCouncilAbi = [
  {
    type: "event",
    name: "CaseOpened",
    inputs: [
      { name: "caseId",          type: "uint256", indexed: true },
      { name: "sessionId",       type: "uint256", indexed: true },
      { name: "evidenceIpfsCid", type: "string",  indexed: false },
      { name: "deadline",        type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "VoteCast",
    inputs: [
      { name: "caseId",         type: "uint256", indexed: true },
      { name: "juror",          type: "address", indexed: true },
      { name: "releasePercent", type: "uint8",   indexed: false },
    ],
  },
  {
    type: "event",
    name: "CaseResolved",
    inputs: [
      { name: "caseId",               type: "uint256", indexed: true },
      { name: "sessionId",            type: "uint256", indexed: true },
      { name: "finalReleasePercent",  type: "uint8",   indexed: false },
      { name: "autoResolved",         type: "bool",    indexed: false },
    ],
  },
];

const MentorStakingAbi = [
  {
    type: "event",
    name: "Staked",
    inputs: [
      { name: "mentor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SlashApplied",
    inputs: [
      { name: "mentor",    type: "address", indexed: true },
      { name: "amount",    type: "uint256", indexed: false },
      { name: "recipient", type: "address", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Unstaked",
    inputs: [
      { name: "mentor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
];

export default createConfig({
  networks: {
    arbitrumSepolia: {
      chainId: 421614,
      transport: http(
        process.env.PONDER_RPC_URL_421614 ||
        process.env.NEXT_PUBLIC_RPC_URL ||
        "https://sepolia-rollup.arbitrum.io/rpc"
      ),
    },
  },
  contracts: {
    EscrowRouter: {
      network: "arbitrumSepolia",
      abi: EscrowRouterAbi,
      address: process.env.NEXT_PUBLIC_ESCROW_CONTRACT || "0x14BBB05C74fBcD2E122E197FD244b54dFb171587",
      startBlock: 12_000_000,
    },
    VerifiableCredential: {
      network: "arbitrumSepolia",
      abi: VerifiableCredentialAbi,
      address: process.env.NEXT_PUBLIC_CREDENTIAL_CONTRACT || "0x0000000000000000000000000000000000000000",
      startBlock: 12_000_000,
    },
    DisputeCouncil: {
      network: "arbitrumSepolia",
      abi: DisputeCouncilAbi,
      address: process.env.NEXT_PUBLIC_DISPUTE_COUNCIL_CONTRACT || "0x0000000000000000000000000000000000000000",
      startBlock: 12_000_000,
    },
    MentorStaking: {
      network: "arbitrumSepolia",
      abi: MentorStakingAbi,
      address: process.env.NEXT_PUBLIC_STAKING_CONTRACT || "0x6d34056576d76835CC3e0bB8F372C2EB4A7D324b",
      startBlock: 12_000_000,
    },
  },
});
