/**
 * Trust Lesson — Smart Wallet / Account Abstraction via Pimlico
 *
 * Enables email-auth users to get ERC-4337 smart accounts.
 * EOA (MetaMask) path is completely unchanged — this is additive.
 *
 * Stack: Pimlico Bundler & Paymaster (ERC-4337 v0.7) on Arbitrum Sepolia / Arbitrum One
 * Docs: https://docs.pimlico.io/
 */

/**
 * Check if permissionless library is available.
 */
function isPermissionlessAvailable() {
  try {
    require.resolve("permissionless");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get or create a Pimlico ERC-4337 smart account.
 *
 * @param {object} params
 * @param {string} params.ownerPrivateKey - Ephemeral session key private key.
 * @param {string} [params.apiKey] - Pimlico API key.
 * @param {number} [params.chainId] - Chain ID (default: 421614 = Arbitrum Sepolia).
 * @returns {Promise<{address: string, account: object|null, smartAccountClient: object|null, isSmartWallet: boolean}>}
 */
export async function getOrCreateSmartAccount({
  ownerPrivateKey,
  apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || "",
  chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "421614"),
}) {
  if (!isPermissionlessAvailable()) {
    console.warn(
      "[smartWallet] permissionless not installed. Falling back to EOA mode."
    );
    const { ethers } = await import("ethers");
    const wallet = new ethers.Wallet(ownerPrivateKey);
    return { address: wallet.address, account: null, smartAccountClient: null, isSmartWallet: false };
  }

  const { createSmartAccountClient } = await import("permissionless");
  const { createPimlicoClient } = await import("permissionless/clients/pimlico");
  const { toSimpleSmartAccount } = await import("permissionless/accounts");
  const { createPublicClient, http } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");
  const { arbitrumSepolia, arbitrum } = await import("viem/chains");

  const chain = chainId === 421614 ? arbitrumSepolia : arbitrum;
  const pimlicoRpcUrl = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${apiKey}`;

  const publicClient = createPublicClient({
    chain,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"),
  });

  const ownerAccount = privateKeyToAccount(ownerPrivateKey);

  const entryPoint = {
    address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
    version: "0.7",
  };

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner: ownerAccount,
    entryPoint,
  });

  const pimlicoClient = createPimlicoClient({
    transport: http(pimlicoRpcUrl),
    entryPoint,
  });

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain,
    bundlerTransport: http(pimlicoRpcUrl),
    paymaster: pimlicoClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  return {
    address: simpleAccount.address,
    account: simpleAccount,
    smartAccountClient,
    isSmartWallet: true,
  };
}

/**
 * Check if the current session is using a smart wallet.
 * @returns {boolean}
 */
export function isSmartWalletSession() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("tl_wallet_type") === "smart";
}

/**
 * Store the wallet type in session storage.
 * @param {'smart'|'eoa'} type
 */
export function setWalletType(type) {
  if (typeof window === "undefined") return;
  localStorage.setItem("tl_wallet_type", type);
}

/**
 * Get the stored smart wallet address (if any).
 */
export function getStoredSmartWalletAddress() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("tl_smart_wallet_address");
}

/**
 * Feature flag: is AA enabled for this environment?
 */
export function isAAEnabled() {
  return !!process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
}
