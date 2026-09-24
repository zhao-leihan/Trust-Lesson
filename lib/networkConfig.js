/**
 * ==============================================================================
 * TRUST LESSON — CENTRALIZED NETWORK & MULTI-CHAIN SWITCHER
 * ==============================================================================
 * Switch entire platform networks (Testnet vs Mainnet vs Local) by editing
 * just ONE variable in `.env`:
 * 
 * NEXT_PUBLIC_APP_NETWORK="testnet"   --> Arbitrum Sepolia (Live Contracts)
 * NEXT_PUBLIC_APP_NETWORK="mainnet"   --> Arbitrum One (Production)
 * NEXT_PUBLIC_APP_NETWORK="local"     --> Hardhat Node (Localhost 8545)
 * ==============================================================================
 */

export const NETWORKS = {
  // ─── 1. ARBITRUM SEPOLIA TESTNET (STAGING / LIVE TESTNET) ───────────────────
  testnet: {
    id: "testnet",
    name: "Arbitrum Sepolia",
    shortName: "Arb Sepolia",
    isTestnet: true,
    chainId: 421614,
    chainIdHex: "0x66eee",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    explorerUrl: "https://sepolia.arbiscan.io",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    contracts: {
      escrowRouter: "0xA9E6Ef15829c0629aE2F4B3135EAC7528123eeDD",
      reputationRegistry: "0xE04Ca75db5020D3F2C48b0a921CB93419BE53A0E",
      mentorStaking: "0x6d34056576d76835CC3e0bB8F372C2EB4A7D324b",
      videoAccess: "0x6E87B4D073f36624111267ba498705E194C28763",
      usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Official Arbitrum Sepolia USDC
      usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    },
    transakEnv: "STAGING",
  },

  // ─── 2. ARBITRUM ONE MAINNET (PRODUCTION / LIVE MAINNET) ────────────────────
  mainnet: {
    id: "mainnet",
    name: "Arbitrum One",
    shortName: "Arbitrum",
    isTestnet: false,
    chainId: 42161,
    chainIdHex: "0xa4b1",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    contracts: {
      // Mainnet contract addresses (auto-populated when deployed to mainnet)
      escrowRouter: process.env.MAINNET_ESCROW_CONTRACT || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      reputationRegistry: process.env.MAINNET_REPUTATION_CONTRACT || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      mentorStaking: process.env.MAINNET_STAKING_CONTRACT || "",
      videoAccess: process.env.MAINNET_VIDEO_ACCESS_CONTRACT || "",
      usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Official Arbitrum One Native USDC
      usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Official Arbitrum One Native USDT
    },
    transakEnv: "PRODUCTION",
  },

  // ─── 3. LOCAL HARDHAT ENGINE (DEVELOPMENT MOCK) ─────────────────────────────
  local: {
    id: "local",
    name: "Hardhat Localhost",
    shortName: "Localhost",
    isTestnet: true,
    chainId: 31337,
    chainIdHex: "0x7a69",
    rpcUrl: "http://127.0.0.1:8545",
    explorerUrl: "http://localhost:8545",
    currency: {
      name: "GO Ether",
      symbol: "ETH",
      decimals: 18,
    },
    contracts: {
      escrowRouter: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      reputationRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      mentorStaking: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
      videoAccess: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      usdc: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      usdt: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    },
    transakEnv: "STAGING",
  },
};

/**
 * Returns the currently active network configuration.
 * Default network is "testnet" (Arbitrum Sepolia).
 */
export function getActiveNetwork() {
  const mode = (
    process.env.NEXT_PUBLIC_APP_NETWORK ||
    (process.env.NEXT_PUBLIC_CHAIN_ID === "42161" ? "mainnet" : "testnet")
  ).toLowerCase();

  const network = NETWORKS[mode] || NETWORKS.testnet;

  // Allow explicit .env overrides if user sets custom RPC or Contract in .env
  return {
    ...network,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || network.rpcUrl,
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || network.chainId,
    contracts: {
      escrowRouter: process.env.NEXT_PUBLIC_ESCROW_CONTRACT || network.contracts.escrowRouter,
      reputationRegistry: process.env.NEXT_PUBLIC_REPUTATION_CONTRACT || network.contracts.reputationRegistry,
      mentorStaking: process.env.NEXT_PUBLIC_STAKING_CONTRACT || network.contracts.mentorStaking,
      videoAccess: process.env.NEXT_PUBLIC_VIDEO_ACCESS_CONTRACT || network.contracts.videoAccess,
      usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS || network.contracts.usdc,
      usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS || network.contracts.usdt,
    },
  };
}

/**
 * Helper to get a specific contract address for current active network
 */
export function getContractAddress(contractName) {
  const network = getActiveNetwork();
  return network.contracts[contractName] || "";
}

/**
 * Helper to get explorer transaction link
 */
export function getExplorerTxUrl(txHash) {
  const network = getActiveNetwork();
  return `${network.explorerUrl}/tx/${txHash}`;
}

/**
 * Helper to get explorer address link
 */
export function getExplorerAddressUrl(address) {
  const network = getActiveNetwork();
  return `${network.explorerUrl}/address/${address}`;
}

export const activeNetwork = getActiveNetwork();
export default getActiveNetwork;
