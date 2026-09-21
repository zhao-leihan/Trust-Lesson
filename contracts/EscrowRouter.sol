// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EscrowRouter
 * @author Trust Lesson
 * @notice Handles P2P mentorship payments on Arbitrum via USDC escrow.
 * @dev State machine: CREATED → FUNDED → IN_SESSION → COMPLETED
 *                              ↘ DISPUTED → RESOLVED
 */
contract EscrowRouter is ReentrancyGuard, Ownable {
    // ─── Constants ───────────────────────────────────────────────────
    uint256 public constant PLATFORM_FEE_BPS = 700; // 7%
    uint256 public constant DISPUTE_TIMEOUT = 48 hours;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    // ─── Token ───────────────────────────────────────────────────────
    IERC20 public immutable usdc;

    // ─── State Machine ───────────────────────────────────────────────
    enum Status { CREATED, FUNDED, IN_SESSION, COMPLETED, DISPUTED, RESOLVED, CANCELLED }

    struct Milestone {
        uint256 amount;     // in USDC (6 decimals)
        bool released;      // true after learner confirms
    }

    struct Session {
        address learner;
        address mentor;
        uint256 totalAmount;       // gross amount deposited by learner
        uint256 platformFeeAmount; // deducted upfront
        Status status;
        uint256 createdAt;
        uint256 disputeDeadline;   // set when IN_SESSION starts
        Milestone[] milestones;
    }

    // ─── Storage ─────────────────────────────────────────────────────
    uint256 public nextSessionId;
    mapping(uint256 => Session) public sessions;
    address public arbiter; // dispute arbiter / DAO
    uint256 public accumulatedFees;

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

    // ─── Errors ──────────────────────────────────────────────────────
    error InvalidStatus(uint256 sessionId, Status current, Status required);
    error Unauthorized();
    error InvalidMilestones();
    error TransferFailed();
    error DisputeTimeoutNotReached();
    error InvalidReleasePercent();

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

    modifier onlyArbiter() {
        if (msg.sender != arbiter && msg.sender != owner()) revert Unauthorized();
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
     * @notice Learner creates a session and deposits USDC into escrow.
     * @param mentor The mentor's address.
     * @param milestoneAmounts Array of USDC amounts per milestone (6 decimals).
     * @return sessionId The new session ID.
     */
    function createSession(
        address mentor,
        uint256[] calldata milestoneAmounts
    ) external nonReentrant returns (uint256 sessionId) {
        if (milestoneAmounts.length == 0 || milestoneAmounts.length > 10)
            revert InvalidMilestones();

        // Calculate total and platform fee
        uint256 subtotal = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            subtotal += milestoneAmounts[i];
        }
        uint256 fee = (subtotal * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        uint256 total = subtotal + fee;

        // Pull USDC from learner (CEI: update state before transfer)
        sessionId = nextSessionId++;
        Session storage s = sessions[sessionId];
        s.learner = msg.sender;
        s.mentor = mentor;
        s.totalAmount = total;
        s.platformFeeAmount = fee;
        s.status = Status.FUNDED;
        s.createdAt = block.timestamp;

        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            s.milestones.push(Milestone({ amount: milestoneAmounts[i], released: false }));
        }

        accumulatedFees += fee;

        // Transfer USDC from learner to this contract
        bool ok = usdc.transferFrom(msg.sender, address(this), total);
        if (!ok) revert TransferFailed();

        emit SessionCreated(sessionId, msg.sender, mentor, total);
        emit SessionFunded(sessionId, total);
    }

    /**
     * @notice Mentor starts the session (moves to IN_SESSION).
     * Sets dispute timeout deadline.
     */
    function startSession(uint256 sessionId)
        external
        onlyMentor(sessionId)
        inStatus(sessionId, Status.FUNDED)
    {
        sessions[sessionId].status = Status.IN_SESSION;
        sessions[sessionId].disputeDeadline = block.timestamp + DISPUTE_TIMEOUT;
        emit SessionStarted(sessionId);
    }

    /**
     * @notice Learner confirms a milestone is complete, releasing funds to mentor.
     * @param sessionId The session ID.
     * @param index Milestone index (0-based).
     */
    function confirmMilestone(uint256 sessionId, uint256 index)
        external
        nonReentrant
        onlyLearner(sessionId)
        inStatus(sessionId, Status.IN_SESSION)
    {
        Session storage s = sessions[sessionId];
        require(index < s.milestones.length, "Invalid milestone index");
        require(!s.milestones[index].released, "Already released");

        // CEI: update state first
        s.milestones[index].released = true;
        uint256 amount = s.milestones[index].amount;

        // Check if all milestones released → complete
        bool allReleased = true;
        for (uint256 i = 0; i < s.milestones.length; i++) {
            if (!s.milestones[i].released) { allReleased = false; break; }
        }
        if (allReleased) s.status = Status.COMPLETED;

        // Transfer milestone amount to mentor (pull payment)
        bool ok = usdc.transfer(s.mentor, amount);
        if (!ok) revert TransferFailed();

        emit MilestoneReleased(sessionId, index, amount);
        if (allReleased) emit SessionCompleted(sessionId);
    }

    /**
     * @notice Learner raises a dispute. Freezes remaining funds.
     * @param sessionId The session ID.
     * @param evidenceHash IPFS CID of evidence (bytes32).
     */
    function raiseDispute(uint256 sessionId, bytes32 evidenceHash)
        external
        onlyLearner(sessionId)
        inStatus(sessionId, Status.IN_SESSION)
    {
        sessions[sessionId].status = Status.DISPUTED;
        emit DisputeRaised(sessionId, msg.sender, evidenceHash);
    }

    /**
     * @notice Arbiter resolves a dispute, splitting remaining funds.
     * @param sessionId The session ID.
     * @param releasePercent 0-100. Percent of remaining funds to release to mentor.
     */
    function resolveDispute(uint256 sessionId, uint8 releasePercent)
        external
        nonReentrant
        onlyArbiter
        inStatus(sessionId, Status.DISPUTED)
    {
        if (releasePercent > 100) revert InvalidReleasePercent();

        Session storage s = sessions[sessionId];
        s.status = Status.RESOLVED;

        // Calculate remaining locked amount
        uint256 remaining = 0;
        for (uint256 i = 0; i < s.milestones.length; i++) {
            if (!s.milestones[i].released) remaining += s.milestones[i].amount;
        }

        uint256 toMentor = (remaining * releasePercent) / 100;
        uint256 toLearner = remaining - toMentor;

        if (toMentor > 0) usdc.transfer(s.mentor, toMentor);
        if (toLearner > 0) usdc.transfer(s.learner, toLearner);

        emit DisputeResolved(sessionId, releasePercent);
    }

    /**
     * @notice Learner cancels a session if mentor never started within 48h.
     */
    function cancelSession(uint256 sessionId)
        external
        nonReentrant
        onlyLearner(sessionId)
        inStatus(sessionId, Status.FUNDED)
    {
        require(
            block.timestamp > sessions[sessionId].createdAt + DISPUTE_TIMEOUT,
            "Too early to cancel"
        );
        sessions[sessionId].status = Status.CANCELLED;

        // Refund learner (minus platform fee which is kept)
        uint256 refund = sessions[sessionId].totalAmount - sessions[sessionId].platformFeeAmount;
        bool ok = usdc.transfer(msg.sender, refund);
        if (!ok) revert TransferFailed();

        emit SessionCancelled(sessionId);
    }

    // ─── Admin ───────────────────────────────────────────────────────

    /** @notice Owner withdraws accumulated platform fees. */
    function withdrawFees(address to) external onlyOwner nonReentrant {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        usdc.transfer(to, amount);
        emit FeeWithdrawn(to, amount);
    }

    /** @notice Update arbiter address. */
    function setArbiter(address newArbiter) external onlyOwner {
        arbiter = newArbiter;
    }

    // ─── View ────────────────────────────────────────────────────────

    function getSession(uint256 sessionId) external view returns (
        address learner, address mentor, uint256 totalAmount,
        Status status, uint256 createdAt, uint256 milestoneCount
    ) {
        Session storage s = sessions[sessionId];
        return (s.learner, s.mentor, s.totalAmount, s.status, s.createdAt, s.milestones.length);
    }

    function getMilestone(uint256 sessionId, uint256 index) external view returns (
        uint256 amount, bool released
    ) {
        Milestone storage m = sessions[sessionId].milestones[index];
        return (m.amount, m.released);
    }
}
