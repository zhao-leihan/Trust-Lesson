/**
 * Trust Lesson — Smart Wallet / Account Abstraction
 *
 * Enables email-auth users to get ERC-4337 smart accounts.
 * EOA (MetaMask) path is completely unchanged — this is additive.
 *
 * Stack: ZeroDev Kernel v3 on Arbitrum
 * Docs: https://docs.zerodev.app/
 *
 * Phase 1.5: Architecture defined, SDK integration ready.
 * Enable by installing: npm install @zerodev/sdk @zerodev/ecdsa-validator
 */

/**
 * Check if ZeroDev SDK is available.
 * Allows graceful degradation if packages not installed.
 */
function isZeroDevAvailable() {
  try {
    require.resolve("@zerodev/sdk");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get or create a ZeroDev smart account for an email-auth user.
 * The user's session key is derived from their email auth token.
 *
 * @param {object} params
 * @param {string} params.ownerPrivateKey - Ephemeral session key private key.
 * @param {string} [params.projectId] - ZeroDev project ID (from env).
 * @param {number} [params.chainId] - Chain ID (default: 421614 = Arbitrum Sepolia).
 * @returns {Promise<{address: string, account: object|null, isSmartWallet: boolean}>}
 */
export async function getOrCreateSmartAccount({
  ownerPrivateKey,
  projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || "",
  chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "421614"),
}) {
  if (!isZeroDevAvailable()) {
    console.warn(
      "[smartWallet] @zerodev/sdk not installed. " +
      "Run: npm install @zerodev/sdk @zerodev/ecdsa-validator viem" +
      "\nFalling back to EOA mode."
    );
    // Derive EOA address from private key as fallback
    const { ethers } = await import("ethers");
    const wallet = new ethers.Wallet(ownerPrivateKey);
    return { address: wallet.address, account: null, isSmartWallet: false };
  }

  // Dynamic import — only loads if package is installed
  const { createKernelAccount, createZeroDevPaymasterClient, createKernelAccountClient } =
    await import("@zerodev/sdk");
  const { signerToEcdsaValidator } = await import("@zerodev/ecdsa-validator");
  const { createPublicClient, http } = await import("viem");
  const { privateKeyToAccount } = await import("viem/accounts");

  const chain = {
    id: chainId,
    name: chainId === 421614 ? "Arbitrum Sepolia" : "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc"],
      },
    },
  };

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const ownerAccount = privateKeyToAccount(ownerPrivateKey);

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: ownerAccount,
    kernelVersion: "0.3.1",
  });

  const account = await createKernelAccount(publicClient, {
    plugins: { sudo: ecdsaValidator },
    kernelVersion: "0.3.1",
  });

  const paymasterClient = projectId
    ? createZeroDevPaymasterClient({
        chain,
        transport: http(`https://rpc.zerodev.app/api/v2/paymaster/${projectId}`),
      })
    : null;

  const kernelClient = createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(`https://rpc.zerodev.app/api/v2/bundler/${projectId}`),
    ...(paymasterClient && {
      middleware: {
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
      },
    }),
  });

  return {
    address: account.address,
    account,
    kernelClient,
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
  return !!process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
}
