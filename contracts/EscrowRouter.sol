// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICredentialIssuer.sol";
import "./interfaces/IMentorStaking.sol";
import "./interfaces/IEscrowRouter.sol";

/**
 * @title EscrowRouter
 * @author Trust Lesson
 * @notice Handles P2P mentorship payments on Arbitrum via USDC escrow.
 * @dev State machine: CREATED → FUNDED → IN_SESSION → COMPLETED
 *                              ↘ DISPUTED → RESOLVED
 *
 * V2 Changes:
 * - Uses ICredentialIssuer interface (swappable: ReputationRegistry → VerifiableCredential)
 * - Uses IMentorStaking interface (swappable staking module)
 * - Supports DisputeCouncil as resolution caller (replaces single arbiter)
 * - Implements IEscrowRouter interface for DisputeCouncil callback
 */
contract EscrowRouter is ReentrancyGuard, Ownable, IEscrowRouter {
    // ─── Constants ───────────────────────────────────────────────────
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%
    uint256 public constant DISPUTE_TIMEOUT  = 48 hours;
    uint256 public constant BPS_DENOMINATOR  = 10_000;

    // ─── Token ───────────────────────────────────────────────────────
    IERC20 public immutable usdc;

    // ─── State Machine (Status inherited from IEscrowRouter) ────────

    struct Milestone {
        uint256 amount;   // in USDC (6 decimals)
        bool released;    // true after learner confirms
    }

    struct Session {
        address learner;
        address mentor;
        uint256 totalAmount;        // gross amount deposited by learner
        uint256 platformFeeAmount;  // deducted upfront
        Status status;
        uint256 createdAt;
        uint256 disputeDeadline;    // set when IN_SESSION starts
        Milestone[] milestones;
        string skillTag;            // skill for credential issuance
    }

    // ─── Storage ─────────────────────────────────────────────────────
    uint256 public nextSessionId;
    mapping(uint256 => Session) public sessions;

    // Phase 1: single arbiter (kept for backward compat)
    address public arbiter;
    // Phase 1.5: DisputeCouncil multi-sig (preferred resolver)
    address public disputeCouncil;

    uint256 public accumulatedFees;

    // Modular interfaces (swappable without redeploying EscrowRouter)
    ICredentialIssuer public credentialIssuer;
    IMentorStaking    public mentorStakingModule;

    // ─── Events ──────────────────────────────────────────────────────
    event SessionCreated(uint256 indexed sessionId, address learner, address mentor, uint256 totalAmount);
    event SessionFunded(uint256 indexed sessionId, uint256 amount);
    event SessionStarted(uint256 indexed sessionId);
    event MilestoneReleased(uint256 indexed sessionId, uint256 index, uint256 amount);
    event SessionCompleted(uint256 indexed sessionId);
    event DisputeRaised(uint256 indexed sessionId, address raisedBy, bytes32 evidenceHash);
    event DisputeResolved(uint256 indexed sessionId, uint8 releasePercent);
    event SessionCancelled(uint256 indexed sessionId);
    event FeeWithdrawn(address to, uint256 amount);
    event CredentialIssuerSet(address indexed issuer);
    event MentorStakingModuleSet(address indexed staking);
    event DisputeCouncilSet(address indexed council);

    // ─── Errors ──────────────────────────────────────────────────────
    error InvalidStatus(uint256 sessionId, Status current, Status required);
    error Unauthorized();
    error InvalidMilestones();
    error TransferFailed();
    error DisputeTimeoutNotReached();
    error InvalidReleasePercent();
    error CannotMentorSelf();

    // ─── Constructor ─────────────────────────────────────────────────
    constructor(address _usdc, address _arbiter) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        arbiter = _arbiter;
    }

    // ─── Modifiers ───────────────────────────────────────────────────
    modifier onlyLearner(uint256 sessionId) {
        if (sessions[sessionId].learner != msg.sender) revert Unauthorized();
        _;
    }

    modifier onlyMentor(uint256 sessionId) {
        if (sessions[sessionId].mentor != msg.sender) revert Unauthorized();
        _;
    }

    /**
     * @dev Callable by: arbiter (Phase 1) OR disputeCouncil (Phase 1.5) OR owner.
     */
    modifier onlyResolver() {
        if (
            msg.sender != arbiter &&
            msg.sender != disputeCouncil &&
            msg.sender != owner()
        ) revert Unauthorized();
        _;
    }

    modifier inStatus(uint256 sessionId, Status required) {
        if (sessions[sessionId].status != required)
            revert InvalidStatus(sessionId, sessions[sessionId].status, required);
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    // CORE SESSION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Learner creates a session and deposits USDC into escrow (V1 / default).
     * @param mentor The mentor's address.
     * @param milestoneAmounts Array of USDC amounts per milestone (6 decimals).
     * @return sessionId The new session ID.
     */
    function createSession(
        address mentor,
        uint256[] calldata milestoneAmounts
    ) external nonReentrant returns (uint256 sessionId) {
        return _createSession(mentor, milestoneAmounts, "");
    }

    /**
     * @notice Learner creates a session with a skillTag for V2 Verifiable Credential issuance.
     * @param mentor The mentor's address.
     * @param milestoneAmounts Array of USDC amounts per milestone (6 decimals).
     * @param skillTag Skill being learned.
     * @return sessionId The new session ID.
     */
    function createSessionWithSkill(
        address mentor,
        uint256[] calldata milestoneAmounts,
        string calldata skillTag
    ) external nonReentrant returns (uint256 sessionId) {
        return _createSession(mentor, milestoneAmounts, skillTag);
    }

    function _createSession(
        address mentor,
        uint256[] calldata milestoneAmounts,
        string memory skillTag
    ) internal returns (uint256 sessionId) {
        if (mentor == msg.sender) revert CannotMentorSelf();
        if (milestoneAmounts.length == 0 || milestoneAmounts.length > 10)
            revert InvalidMilestones();

        uint256 subtotal = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            subtotal += milestoneAmounts[i];
        }
        uint256 fee   = (subtotal * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 total = subtotal + fee;

        sessionId = nextSessionId++;
        Session storage s = sessions[sessionId];
        s.learner            = msg.sender;
        s.mentor             = mentor;
        s.totalAmount        = total;
        s.platformFeeAmount  = fee;
        s.status             = Status.FUNDED;
        s.createdAt          = block.timestamp;
        s.skillTag           = skillTag;

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            s.milestones.push(Milestone({ amount: milestoneAmounts[i], released: false }));
        }

        accumulatedFees += fee;

        bool ok = usdc.transferFrom(msg.sender, address(this), total);
        if (!ok) revert TransferFailed();

        emit SessionCreated(sessionId, msg.sender, mentor, total);
        emit SessionFunded(sessionId, total);
    }

    /**
     * @notice Mentor starts the session (moves to IN_SESSION).
     */
    function startSession(uint256 sessionId)
        external
        onlyMentor(sessionId)
        inStatus(sessionId, Status.FUNDED)
    {
        Session storage s = sessions[sessionId];
        s.status          = Status.IN_SESSION;
        s.disputeDeadline = block.timestamp + DISPUTE_TIMEOUT;
        emit SessionStarted(sessionId);
    }

    /**
     * @notice Learner confirms a milestone, releasing payment to mentor.
     */
    function confirmMilestone(uint256 sessionId, uint256 milestoneIndex)
        external
        nonReentrant
        onlyLearner(sessionId)
        inStatus(sessionId, Status.IN_SESSION)
    {
        Session storage s = sessions[sessionId];
        require(milestoneIndex < s.milestones.length, "Invalid milestone");
        require(!s.milestones[milestoneIndex].released, "Already released");

        s.milestones[milestoneIndex].released = true;
        uint256 amount = s.milestones[milestoneIndex].amount;

        bool ok = usdc.transfer(s.mentor, amount);
        if (!ok) revert TransferFailed();

        emit MilestoneReleased(sessionId, milestoneIndex, amount);

        // Check if all milestones released → complete session
        bool allDone = true;
        for (uint256 i = 0; i < s.milestones.length; i++) {
            if (!s.milestones[i].released) { allDone = false; break; }
        }

        if (allDone) {
            s.status = Status.COMPLETED;
            emit SessionCompleted(sessionId);

            // Issue credentials via swappable ICredentialIssuer
            if (address(credentialIssuer) != address(0)) {
                try credentialIssuer.issueCompositeCredential(
                    s.mentor, s.learner, sessionId, 5, s.skillTag
                ) {} catch {}
            }
        }
    }

    /**
     * @notice Learner or mentor raises a dispute.
     * Opens a case in the DisputeCouncil if configured.
     */
    function raiseDispute(uint256 sessionId, bytes32 evidenceHash)
        external
        inStatus(sessionId, Status.IN_SESSION)
    {
        Session storage s = sessions[sessionId];
        require(
            msg.sender == s.learner || msg.sender == s.mentor,
            "Not a party"
        );

        s.status = Status.DISPUTED;
        emit DisputeRaised(sessionId, msg.sender, evidenceHash);
    }

    /**
     * @notice Resolve a dispute.
     * Callable by: arbiter, disputeCouncil, or owner.
     * In Phase 1.5: DisputeCouncil calls this after 3-of-5 quorum.
     * @param releasePercent 0-100: % of total (minus fee) to release to mentor.
     */
    function resolveDispute(uint256 sessionId, uint8 releasePercent)
        external
        override
        onlyResolver
        inStatus(sessionId, Status.DISPUTED)
        nonReentrant
    {
        if (releasePercent > 100) revert InvalidReleasePercent();

        Session storage s = sessions[sessionId];
        s.status = Status.RESOLVED;

        // Calculate amounts: remaining = total - fee (fee already counted)
        uint256 remaining = s.totalAmount - s.platformFeeAmount;
        uint256 toMentor  = (remaining * releasePercent) / 100;
        uint256 toLearner = remaining - toMentor;

        if (toMentor > 0) {
            bool ok = usdc.transfer(s.mentor, toMentor);
            if (!ok) revert TransferFailed();
        }
        if (toLearner > 0) {
            bool ok = usdc.transfer(s.learner, toLearner);
            if (!ok) revert TransferFailed();
        }

        emit DisputeResolved(sessionId, releasePercent);
    }

    /**
     * @notice Cancel a session that is still in FUNDED state (not started).
     * Only learner can cancel; full refund minus fee.
     */
    function cancelSession(uint256 sessionId)
        external
        onlyLearner(sessionId)
        inStatus(sessionId, Status.FUNDED)
        nonReentrant
    {
        Session storage s = sessions[sessionId];
        s.status = Status.CANCELLED;

        // Refund: total - fee (fee was already accumulated)
        uint256 refund = s.totalAmount - s.platformFeeAmount;
        accumulatedFees -= s.platformFeeAmount; // reverse fee accumulation on cancel
        bool ok = usdc.transfer(s.learner, refund);
        if (!ok) revert TransferFailed();

        emit SessionCancelled(sessionId);
    }

    // ═══════════════════════════════════════════════════════════════
    // IEscrowRouter INTERFACE IMPLEMENTATION
    // ═══════════════════════════════════════════════════════════════

    function getSessionStatus(uint256 sessionId)
        external
        view
        override
        returns (IEscrowRouter.Status)
    {
        return IEscrowRouter.Status(uint8(sessions[sessionId].status));
    }

    function getSessionParties(uint256 sessionId)
        external
        view
        override
        returns (address learner, address mentor)
    {
        learner = sessions[sessionId].learner;
        mentor  = sessions[sessionId].mentor;
    }

    // ═══════════════════════════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════════════════════════

    function withdrawFees(address to) external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        bool ok = usdc.transfer(to, amount);
        if (!ok) revert TransferFailed();
        emit FeeWithdrawn(to, amount);
    }

    function setArbiter(address _arbiter) external onlyOwner {
        arbiter = _arbiter;
    }

    function setDisputeCouncil(address _council) external onlyOwner {
        disputeCouncil = _council;
        emit DisputeCouncilSet(_council);
    }

    function setCredentialIssuer(address _issuer) external onlyOwner {
        credentialIssuer = ICredentialIssuer(_issuer);
        emit CredentialIssuerSet(_issuer);
    }

    function setMentorStakingModule(address _staking) external onlyOwner {
        mentorStakingModule = IMentorStaking(_staking);
        emit MentorStakingModuleSet(_staking);
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW
    // ═══════════════════════════════════════════════════════════════

    function getSession(uint256 sessionId) external view returns (
        address learner,
        address mentor,
        uint256 totalAmount,
        uint256 platformFeeAmount,
        Status status,
        uint256 createdAt,
        uint256 milestoneCount
    ) {
        Session storage s = sessions[sessionId];
        return (
            s.learner,
            s.mentor,
            s.totalAmount,
            s.platformFeeAmount,
            s.status,
            s.createdAt,
            s.milestones.length
        );
    }

    function getMilestone(uint256 sessionId, uint256 index)
        external
        view
        returns (uint256 amount, bool released)
    {
        Milestone storage m = sessions[sessionId].milestones[index];
        return (m.amount, m.released);
    }
}
