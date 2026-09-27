/**
 * Trust Lesson — Attendance Oracle
 *
 * Signs attendance evidence after a mentorship session.
 * The signed attestation is stored on IPFS as verifiable evidence.
 * If a dispute is raised but attendance proof exists, the DisputeCouncil
 * can weigh this evidence toward the mentor.
 *
 * Phase 1 (current): Manual attendance submission via dashboard UI.
 * Phase 2 (roadmap): Webhook from Google Meet / Zoom (signed by their API).
 */

import { ethers } from "ethers";

/**
 * Sign an attendance attestation.
 * @param {object} params
 * @param {number} params.sessionId - On-chain session ID.
 * @param {string} params.mentorAddress - Mentor's wallet address.
 * @param {string} params.learnerAddress - Learner's wallet address.
 * @param {number} params.attendedMinutes - Minutes attended.
 * @param {number} params.scheduledMinutes - Total scheduled minutes.
 * @param {string} [params.meetingId] - External meeting ID (Zoom/Google Meet).
 * @param {number} [params.timestamp] - Unix timestamp of session end (default: now).
 * @returns {Promise<{attestation: object, signature: string, hash: string}>}
 */
export async function signAttendanceAttestation(params) {
  const {
    sessionId,
    mentorAddress,
    learnerAddress,
    attendedMinutes,
    scheduledMinutes,
    meetingId = "",
    timestamp = Math.floor(Date.now() / 1000),
  } = params;

  const attestation = {
    sessionId,
    mentorAddress: mentorAddress.toLowerCase(),
    learnerAddress: learnerAddress.toLowerCase(),
    attendedMinutes,
    scheduledMinutes,
    attendancePercent: Math.round((attendedMinutes / scheduledMinutes) * 100),
    meetingId,
    timestamp,
    source: "trust-lesson-platform",
    version: "1",
  };

  // Create a deterministic hash of the attestation
  const hash = ethers.solidityPackedKeccak256(
    ["uint256", "address", "address", "uint256", "uint256", "uint256"],
    [
      BigInt(sessionId),
      mentorAddress,
      learnerAddress,
      BigInt(attendedMinutes),
      BigInt(scheduledMinutes),
      BigInt(timestamp),
    ]
  );

  let signature = "0x" + "00".repeat(65); // fallback if no key

  const privateKey = process.env.PLATFORM_SPONSOR_PRIVATE_KEY;
  if (privateKey) {
    const signer = new ethers.Wallet(privateKey);
    // Sign the raw hash (not typed data) for simplicity
    signature = await signer.signMessage(ethers.getBytes(hash));
  } else {
    console.warn("[attendanceOracle] No PLATFORM_SPONSOR_PRIVATE_KEY — unsigned attestation");
  }

  return {
    attestation,
    signature,
    hash,
  };
}

/**
 * Verify an attendance attestation signature.
 * @param {object} attestation - The attestation object.
 * @param {string} signature - The signature to verify.
 * @param {string} expectedSigner - The platform's public signing address.
 * @returns {boolean}
 */
export function verifyAttendanceSignature(attestation, signature, expectedSigner) {
  try {
    const hash = ethers.solidityPackedKeccak256(
      ["uint256", "address", "address", "uint256", "uint256", "uint256"],
      [
        BigInt(attestation.sessionId),
        attestation.mentorAddress,
        attestation.learnerAddress,
        BigInt(attestation.attendedMinutes),
        BigInt(attestation.scheduledMinutes),
        BigInt(attestation.timestamp),
      ]
    );

    const recovered = ethers.verifyMessage(ethers.getBytes(hash), signature);
    return recovered.toLowerCase() === expectedSigner.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Build a full attendance evidence object ready for IPFS upload.
 * This is the object that gets pinned and whose CID is submitted to DisputeCouncil.
 *
 * @param {object} params - Same params as signAttendanceAttestation.
 * @param {string} [meetingRecordingCid] - Optional IPFS CID of meeting recording.
 * @returns {Promise<{evidenceJson: object, signature: string, hash: string}>}
 */
export async function buildAttendanceEvidence(params, meetingRecordingCid = null) {
  const { attestation, signature, hash } = await signAttendanceAttestation(params);

  const evidenceJson = {
    type: "TrustLessonAttendanceEvidence",
    version: "1",
    attestation,
    signature,
    hash,
    verificationInstructions: {
      description: "Verify this attendance evidence using the Trust Lesson platform public key.",
      platformPublicKey: process.env.NEXT_PUBLIC_GAS_SPONSOR_ADDRESS || "",
      method: "ethers.verifyMessage(ethers.getBytes(hash), signature)",
      expectedResult: "Platform public key address",
    },
    ...(meetingRecordingCid && { meetingRecordingCid }),
    createdAt: new Date().toISOString(),
  };

  return { evidenceJson, signature, hash };
}
