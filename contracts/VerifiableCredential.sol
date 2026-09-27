// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./interfaces/ICredentialIssuer.sol";
import "./SkillGraph.sol";

/**
 * @title VerifiableCredential
 * @author Trust Lesson
 * @notice Composable, portable Soulbound Credentials (V2).
 *
 * Upgrades from ReputationRegistry:
 * 1. Issues credentials to BOTH learner AND mentor after each session.
 * 2. EIP-712 typed hash for off-chain portable verification.
 * 3. IPFS metadata CID for JSON-LD W3C VC format.
 * 4. Integrates with SkillGraph for composable skill progression.
 * 5. Credentials are non-transferable (Soulbound) — no safeTransfer.
 *
 * External verifiers (DAOs, job boards) can verify authenticity with:
 *   ethers.verifyTypedData(domain, types, value, platformSignature)
 * without needing to interact with Trust Lesson directly.
 */
contract VerifiableCredential is Ownable, EIP712, ICredentialIssuer {
    using ECDSA for bytes32;

    // ─── Types ───────────────────────────────────────────────────────

    struct Credential {
        address issuer;           // platform contract address
        address subject;          // who received this credential
        address counterparty;     // the other party in the session
        CredentialType credType;  // LEARNER_COMPLETION or MENTOR_DELIVERY
        uint256 sessionId;
        uint8 rating;             // 1-5 stars
        bytes32 skillNodeId;      // keccak256 of skill name — links to SkillGraph
        string metadataCid;       // IPFS CID with full JSON-LD credential
        bytes32 digest;           // EIP-712 hash for portable verification
        uint256 issuedAt;
        uint256 expiresAt;        // 0 = non-expiring (default)
    }

    // EIP-712 type hash
    bytes32 public constant CREDENTIAL_TYPEHASH = keccak256(
        "Credential(address subject,bytes32 skillNodeId,uint256 sessionId,uint8 rating,uint8 credType,uint256 issuedAt)"
    );

    // ─── Storage ─────────────────────────────────────────────────────

    uint256 public nextCredentialId;
    mapping(uint256 => Credential) public credentials;

    // subject → list of credential IDs (both learners and mentors)
    mapping(address => uint256[]) private _subjectCredentials;

    // sessionId → [learnerCredId, mentorCredId]
    mapping(uint256 => uint256[2]) public sessionCredentials;

    // Authorized callers (EscrowRouter)
    mapping(address => bool) public authorized;

    // SkillGraph reference
    SkillGraph public skillGraph;

    // ─── Events ──────────────────────────────────────────────────────

    event CredentialIssued(
        uint256 indexed credentialId,
        address indexed subject,
        CredentialType credType,
        uint256 sessionId,
        uint8 rating,
        bytes32 skillNodeId,
        string metadataCid
    );

    event AuthorizationSet(address indexed caller, bool authorized);
    event SkillGraphSet(address indexed skillGraph);

    // ─── Errors ──────────────────────────────────────────────────────
    error Unauthorized();
    error InvalidRating();
    error AlreadyIssued(uint256 sessionId);
    error Soulbound(); // non-transferable

    // ─── Constructor ─────────────────────────────────────────────────

    constructor(address _skillGraph)
        Ownable(msg.sender)
        EIP712("Trust Lesson Credentials", "1")
    {
        skillGraph = SkillGraph(_skillGraph);
    }

    // ─── Authorization ───────────────────────────────────────────────

    function setAuthorized(address caller, bool auth) external onlyOwner {
        authorized[caller] = auth;
        emit AuthorizationSet(caller, auth);
    }

    function setSkillGraph(address _skillGraph) external onlyOwner {
        skillGraph = SkillGraph(_skillGraph);
        emit SkillGraphSet(_skillGraph);
    }

    modifier onlyAuthorized() {
        if (!authorized[msg.sender] && msg.sender != owner()) revert Unauthorized();
        _;
    }

    // ─── Core: Issue Credential ───────────────────────────────────────

    /**
     * @inheritdoc ICredentialIssuer
     * @dev Issues TWO credentials: one to learner (LEARNER_COMPLETION) and
     * one to mentor (MENTOR_DELIVERY). Both are linked to the same sessionId.
     * @param skillTag Human-readable skill name (hashed to bytes32 internally).
     * @return learnerCredId ID of the learner's credential.
     * @return mentorCredId ID of the mentor's credential.
     */
    function issueCompositeCredential(
        address mentor,
        address learner,
        uint256 sessionId,
        uint8 rating,
        string calldata skillTag
    ) external onlyAuthorized returns (uint256 learnerCredId, uint256 mentorCredId) {
        if (rating < 1 || rating > 5) revert InvalidRating();
        if (sessionCredentials[sessionId][0] != 0 || sessionCredentials[sessionId][1] != 0) {
            revert AlreadyIssued(sessionId);
        }

        bytes32 skillNodeId = keccak256(bytes(skillTag));
        string memory emptyCid = ""; // IPFS CID populated by off-chain gas sponsor

        // Issue learner credential
        learnerCredId = _issueOne(
            learner, mentor, CredentialType.LEARNER_COMPLETION,
            sessionId, rating, skillNodeId, emptyCid
        );

        // Issue mentor credential
        mentorCredId = _issueOne(
            mentor, learner, CredentialType.MENTOR_DELIVERY,
            sessionId, rating, skillNodeId, emptyCid
        );

        sessionCredentials[sessionId] = [learnerCredId, mentorCredId];

        // Update SkillGraph progress for both parties
        if (address(skillGraph) != address(0)) {
            try skillGraph.updateProgress(learner, skillNodeId, rating) {} catch {}
            try skillGraph.updateProgress(mentor, skillNodeId, rating) {} catch {}
        }
    }

    function _issueOne(
        address subject,
        address counterparty,
        CredentialType credType,
        uint256 sessionId,
        uint8 rating,
        bytes32 skillNodeId,
        string memory metadataCid
    ) internal returns (uint256 credentialId) {
        credentialId = nextCredentialId++;

        // Compute EIP-712 digest for portable off-chain verification
        bytes32 digest = _hashTypedDataV4(
            keccak256(abi.encode(
                CREDENTIAL_TYPEHASH,
                subject,
                skillNodeId,
                sessionId,
                rating,
                uint8(credType),
                block.timestamp
            ))
        );

        credentials[credentialId] = Credential({
            issuer: address(this),
            subject: subject,
            counterparty: counterparty,
            credType: credType,
            sessionId: sessionId,
            rating: rating,
            skillNodeId: skillNodeId,
            metadataCid: metadataCid,
            digest: digest,
            issuedAt: block.timestamp,
            expiresAt: 0
        });

        _subjectCredentials[subject].push(credentialId);

        emit CredentialIssued(credentialId, subject, credType, sessionId, rating, skillNodeId, metadataCid);
    }

    // ─── Off-Chain Verification Support ──────────────────────────────

    /**
     * @notice Update the IPFS metadata CID for a credential (after gas-sponsored IPFS upload).
     * Only callable by authorized contracts (gas sponsor relayer).
     */
    function setMetadataCid(uint256 credentialId, string calldata cid) external onlyAuthorized {
        credentials[credentialId].metadataCid = cid;
    }

    /**
     * @inheritdoc ICredentialIssuer
     */
    function getCredentialDigest(uint256 credentialId) external view override returns (bytes32) {
        return credentials[credentialId].digest;
    }

    /**
     * @notice Verify that a credential digest was signed by an expected signer.
     * @param credentialId The credential to verify.
     * @param signature Platform's EIP-712 signature over the credential.
     * @param expectedSigner The platform public key (deployer / sponsor wallet).
     */
    function verifyCredential(
        uint256 credentialId,
        bytes calldata signature,
        address expectedSigner
    ) external view returns (bool) {
        bytes32 digest = credentials[credentialId].digest;
        address recovered = ECDSA.recover(digest, signature);
        return recovered == expectedSigner;
    }

    /**
     * @inheritdoc ICredentialIssuer
     */
    function getCredentials(address subject) external view override returns (uint256[] memory) {
        return _subjectCredentials[subject];
    }

    /**
     * @notice Get aggregate rating stats for a subject.
     * @return avgRating Average rating scaled x10 (e.g. 48 = 4.8).
     * @return count Total number of credentials.
     */
    function getAggregateRating(address subject)
        external
        view
        returns (uint256 avgRating, uint256 count)
    {
        uint256[] storage ids = _subjectCredentials[subject];
        count = ids.length;
        if (count == 0) return (0, 0);
        uint256 sum = 0;
        for (uint256 i = 0; i < count; i++) {
            sum += credentials[ids[i]].rating;
        }
        avgRating = (sum * 10) / count;
    }

    /**
     * @notice Backward-compat: legacy issueCredential (single, learner only).
     * Kept for any scripts that call the old ReputationRegistry interface.
     * @dev Emits to both parties internally.
     */
    function issueCredential(
        address mentor,
        address learner,
        uint256 sessionId,
        uint8 rating,
        string calldata skillTag
    ) external onlyAuthorized returns (uint256 credentialId) {
        (credentialId, ) = this.issueCompositeCredential(mentor, learner, sessionId, rating, skillTag);
    }

    // ─── Domain Separator (public, for off-chain signers) ─────────────

    function getDomainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
