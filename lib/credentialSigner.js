/**
 * Trust Lesson — EIP-712 Credential Signer
 *
 * Signs Verifiable Credential digests using the platform's private key.
 * External verifiers (DAOs, job boards) can call:
 *   ethers.verifyTypedData(domain, types, value, signature)
 * to verify authenticity WITHOUT needing to interact with Trust Lesson.
 *
 * This enables selective disclosure: share only the CID + signature + public key.
 */

import { ethers } from "ethers";
import { getActiveNetwork } from "./networkConfig.js";

const network = getActiveNetwork();

// EIP-712 Domain — must match VerifiableCredential.sol constructor args
export const EIP712_DOMAIN = {
  name: "Trust Lesson Credentials",
  version: "1",
  chainId: network.chainId,
  verifyingContract: network.contracts.verifiableCredential || "",
};

// EIP-712 Types — must match CREDENTIAL_TYPEHASH in VerifiableCredential.sol
export const CREDENTIAL_TYPES = {
  Credential: [
    { name: "subject",     type: "address" },
    { name: "skillNodeId", type: "bytes32" },
    { name: "sessionId",   type: "uint256" },
    { name: "rating",      type: "uint8"   },
    { name: "credType",    type: "uint8"   },
    { name: "issuedAt",    type: "uint256" },
  ],
};

/**
 * Sign a credential value using the platform sponsor private key.
 * @param {object} credentialValue - The credential data to sign.
 * @param {string} credentialValue.subject - Wallet address of the credential holder.
 * @param {string} credentialValue.skillNodeId - bytes32 skill node ID (hex string).
 * @param {number|bigint} credentialValue.sessionId - On-chain session ID.
 * @param {number} credentialValue.rating - Rating 1-5.
 * @param {number} credentialValue.credType - 0 = LEARNER_COMPLETION, 1 = MENTOR_DELIVERY.
 * @param {number|bigint} credentialValue.issuedAt - Unix timestamp.
 * @returns {Promise<string>} EIP-712 signature (hex string).
 */
export async function signCredential(credentialValue) {
  const privateKey = process.env.PLATFORM_SPONSOR_PRIVATE_KEY;

  if (!privateKey) {
    console.warn("[credentialSigner] No PLATFORM_SPONSOR_PRIVATE_KEY — returning mock signature");
    return "0x" + "ab".repeat(32) + "cd".repeat(32) + "01";
  }

  const signer = new ethers.Wallet(privateKey);

  const signature = await signer.signTypedData(
    EIP712_DOMAIN,
    CREDENTIAL_TYPES,
    {
      subject:     credentialValue.subject,
      skillNodeId: credentialValue.skillNodeId,
      sessionId:   BigInt(credentialValue.sessionId),
      rating:      Number(credentialValue.rating),
      credType:    Number(credentialValue.credType),
      issuedAt:    BigInt(credentialValue.issuedAt),
    }
  );

  return signature;
}

/**
 * Verify a credential signature off-chain.
 * Any external system can call this to verify a Trust Lesson credential
 * without interacting with the smart contract.
 *
 * @param {object} credentialValue - The credential data (same shape as signCredential).
 * @param {string} signature - The EIP-712 signature to verify.
 * @param {string} expectedSigner - The platform public key (deployer / sponsor address).
 * @returns {boolean} True if signature is valid.
 */
export function verifyCredentialSignature(credentialValue, signature, expectedSigner) {
  try {
    const recovered = ethers.verifyTypedData(
      EIP712_DOMAIN,
      CREDENTIAL_TYPES,
      {
        subject:     credentialValue.subject,
        skillNodeId: credentialValue.skillNodeId,
        sessionId:   BigInt(credentialValue.sessionId),
        rating:      Number(credentialValue.rating),
        credType:    Number(credentialValue.credType),
        issuedAt:    BigInt(credentialValue.issuedAt),
      },
      signature
    );
    return recovered.toLowerCase() === expectedSigner.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Build a W3C Verifiable Credential JSON-LD document.
 * This is the portable format that can be shared externally.
 *
 * @param {object} params
 * @param {number} params.credentialId - On-chain credential ID.
 * @param {string} params.subject - Subject wallet address.
 * @param {string} params.skillName - Human-readable skill name.
 * @param {string} params.skillNodeId - bytes32 skill node ID.
 * @param {number} params.rating - Rating 1-5.
 * @param {number} params.credType - 0 = LEARNER_COMPLETION, 1 = MENTOR_DELIVERY.
 * @param {number} params.sessionId - On-chain session ID.
 * @param {string} params.signature - EIP-712 signature.
 * @param {string} params.issuedAt - ISO 8601 timestamp.
 * @returns {object} W3C VC JSON-LD document.
 */
export function buildVerifiableCredentialDocument(params) {
  const contractAddress = network.contracts.verifiableCredential || network.contracts.reputationRegistry;
  const chainId = network.chainId;
  const issuerDid = `did:pkh:eip155:${chainId}:${contractAddress}`;
  const subjectDid = `did:pkh:eip155:${chainId}:${params.subject}`;

  const credTypeName = params.credType === 0 ? "LearnerCompletionCredential" : "MentorDeliveryCredential";
  const arbiscanBase = network.explorer || "https://sepolia.arbiscan.io";

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://trustlesson.io/credentials/v1",
    ],
    type: ["VerifiableCredential", "TrustLessonCredential", credTypeName],
    id: `${arbiscanBase}/address/${contractAddress}#credential-${params.credentialId}`,
    issuer: {
      id: issuerDid,
      name: "Trust Lesson Platform",
      url: "https://trustlesson.io",
    },
    issuanceDate: params.issuedAt,
    credentialSubject: {
      id: subjectDid,
      skill: {
        id: `https://trustlesson.io/skills/${params.skillNodeId}`,
        name: params.skillName,
        nodeId: params.skillNodeId,
      },
      sessionId: params.sessionId,
      credentialId: params.credentialId,
      rating: params.rating,
      credentialType: credTypeName,
    },
    proof: {
      type: "EthereumEip712Signature2021",
      created: params.issuedAt,
      proofPurpose: "assertionMethod",
      verificationMethod: issuerDid,
      eip712: {
        domain: EIP712_DOMAIN,
        types: CREDENTIAL_TYPES,
        primaryType: "Credential",
      },
      proofValue: params.signature,
    },
    // On-chain verification reference
    onChain: {
      network: network.name || "arbitrum-sepolia",
      chainId: chainId,
      contractAddress: contractAddress,
      credentialId: params.credentialId,
      explorerUrl: `${arbiscanBase}/address/${contractAddress}`,
    },
  };
}

/**
 * Get the platform's public signing address (derived from private key).
 * External verifiers use this to call verifyCredentialSignature().
 */
export function getPlatformSignerAddress() {
  const privateKey = process.env.PLATFORM_SPONSOR_PRIVATE_KEY;
  if (!privateKey) return null;
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}
