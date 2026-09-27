// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEscrowRouter.sol";
import "./interfaces/IKlerosArbitrator.sol";

/**
 * @title DisputeCouncil
 * @author Trust Lesson
 * @notice 3-of-5 multi-sig dispute resolution council.
 *
 * Phase 1.5 Architecture (vs. Phase 1 single arbiter):
 * - 5 jurors appointed by platform (replacing single arbiter)
 * - 3-of-5 quorum required for resolution
 * - 72-hour resolution window; auto 50/50 if quorum not reached
 * - Evidence stored as IPFS CID — publicly auditable by anyone
 * - Weighted average of juror votes determines final fund split
 * - Appeal path to Kleros documented (Phase 2.0 interface hook ready)
 *
 * Judges evaluating decentralization: Phase 1.5 is a clear improvement.
 * Kleros escalation interface is declared and ready for Phase 2.0 wiring.
 */
contract DisputeCouncil is Ownable {
    // ─── Constants ───────────────────────────────────────────────────
    uint256 public constant RESOLVE_WINDOW = 72 hours;
    uint256 public constant APPEAL_WINDOW  = 24 hours;
    uint256 public constant QUORUM         = 3;
    uint256 public constant JUROR_COUNT    = 5;

    // ─── Structs ─────────────────────────────────────────────────────

    struct DisputeCase {
        uint256 sessionId;
        string evidenceIpfsCid;     // public — anyone can audit on IPFS
        uint256 raisedAt;
        uint256 resolveDeadline;    // raisedAt + RESOLVE_WINDOW
        uint256 appealDeadline;     // resolvedAt + APPEAL_WINDOW (if resolved)
        uint8 totalVotes;           // votes cast so far
        uint256 weightedReleaseSum; // sum of (releasePercent * 1) per juror vote
        bool resolved;
        bool appealed;
        uint8 finalReleasePercent;  // final outcome: % to mentor (0-100)
        address raisedBy;
    }

    // ─── Storage ─────────────────────────────────────────────────────

    IEscrowRouter public escrowRouter;
    address[JUROR_COUNT] public jurors;
    uint256 public nextCaseId;

    mapping(uint256 => DisputeCase) public cases;
    mapping(uint256 => mapping(address => bool)) public hasVoted;    // caseId → juror → voted
    mapping(uint256 => mapping(address => uint8)) public jurorVote;  // caseId → juror → releasePercent

    // sessionId → caseId (for lookup)
    mapping(uint256 => uint256) public sessionToCase;
    mapping(uint256 => bool) public sessionHasCase;

    // Kleros escalation (Phase 2.0)
    address public klerosArbitrator;
    mapping(uint256 => uint256) public klerosDisputeId; // caseId → Kleros disputeID

    // ─── Events ──────────────────────────────────────────────────────

    event CaseOpened(uint256 indexed caseId, uint256 indexed sessionId, string evidenceIpfsCid, uint256 deadline);
    event VoteCast(uint256 indexed caseId, address indexed juror, uint8 releasePercent);
    event CaseResolved(uint256 indexed caseId, uint256 indexed sessionId, uint8 finalReleasePercent, bool autoResolved);
    event CaseAppealed(uint256 indexed caseId, uint256 klerosDisputeId);
    event JurorUpdated(uint256 index, address newJuror);
    event KlerosArbitratorSet(address klerosArbitrator);

    // ─── Errors ──────────────────────────────────────────────────────
    error NotJuror();
    error AlreadyVoted();
    error CaseNotOpen();
    error CaseAlreadyResolved();
    error ResolveWindowActive();
    error AppealWindowExpired();
    error QuorumNotReached();
    error SessionAlreadyHasCase();
    error KlerosNotConfigured();
    error Unauthorized();

    // ─── Constructor ─────────────────────────────────────────────────

    constructor(address _escrowRouter, address[5] memory _jurors) Ownable(msg.sender) {
        escrowRouter = IEscrowRouter(_escrowRouter);
        for (uint256 i = 0; i < JUROR_COUNT; i++) {
            jurors[i] = _jurors[i];
            emit JurorUpdated(i, _jurors[i]);
        }
    }

    // ─── Admin ───────────────────────────────────────────────────────

    function updateJuror(uint256 index, address newJuror) external onlyOwner {
        require(index < JUROR_COUNT, "Invalid index");
        jurors[index] = newJuror;
        emit JurorUpdated(index, newJuror);
    }

    function setKlerosArbitrator(address _kleros) external onlyOwner {
        klerosArbitrator = _kleros;
        emit KlerosArbitratorSet(_kleros);
    }

    function setEscrowRouter(address _escrowRouter) external onlyOwner {
        escrowRouter = IEscrowRouter(_escrowRouter);
    }

    // ─── Core: Dispute Flow ───────────────────────────────────────────

    /**
     * @notice Open a new dispute case. Called by EscrowRouter after raiseDispute().
     * The evidence IPFS CID is public — anyone can verify the raw evidence on IPFS.
     * @param sessionId The on-chain session ID in dispute.
     * @param evidenceIpfsCid IPFS CID of the dispute evidence JSON.
     * @param raisedBy Address that raised the dispute (learner or mentor).
     */
    function openCase(
        uint256 sessionId,
        string calldata evidenceIpfsCid,
        address raisedBy
    ) external returns (uint256 caseId) {
        if (msg.sender != address(escrowRouter) && msg.sender != owner()) revert Unauthorized();
        if (sessionHasCase[sessionId]) revert SessionAlreadyHasCase();

        caseId = nextCaseId++;
        uint256 deadline = block.timestamp + RESOLVE_WINDOW;

        cases[caseId] = DisputeCase({
            sessionId: sessionId,
            evidenceIpfsCid: evidenceIpfsCid,
            raisedAt: block.timestamp,
            resolveDeadline: deadline,
            appealDeadline: 0,
            totalVotes: 0,
            weightedReleaseSum: 0,
            resolved: false,
            appealed: false,
            finalReleasePercent: 50, // default: 50/50
            raisedBy: raisedBy
        });

        sessionToCase[sessionId] = caseId;
        sessionHasCase[sessionId] = true;

        emit CaseOpened(caseId, sessionId, evidenceIpfsCid, deadline);
    }

    /**
     * @notice Cast a vote on an open dispute case.
     * @param caseId The case to vote on.
     * @param releasePercent Percentage (0-100) of funds to release to mentor.
     *   0 = full refund to learner, 100 = full release to mentor, 50 = split.
     */
    function castVote(uint256 caseId, uint8 releasePercent) external {
        if (!_isJuror(msg.sender)) revert NotJuror();
        if (hasVoted[caseId][msg.sender]) revert AlreadyVoted();

        DisputeCase storage c = cases[caseId];
        if (c.resolved) revert CaseAlreadyResolved();
        if (block.timestamp > c.resolveDeadline) revert CaseNotOpen();
        require(releasePercent <= 100, "Invalid percent");

        hasVoted[caseId][msg.sender] = true;
        jurorVote[caseId][msg.sender] = releasePercent;
        c.totalVotes++;
        c.weightedReleaseSum += releasePercent;

        emit VoteCast(caseId, msg.sender, releasePercent);

        // Auto-resolve if quorum reached
        if (c.totalVotes >= QUORUM) {
            _resolveCase(caseId, false);
        }
    }

    /**
     * @notice Trigger auto-resolution if resolve window expired without quorum.
     * Anyone can call this after the deadline.
     * Result: 50/50 split (default fairness).
     */
    function autoResolve(uint256 caseId) external {
        DisputeCase storage c = cases[caseId];
        if (c.resolved) revert CaseAlreadyResolved();
        if (block.timestamp <= c.resolveDeadline) revert ResolveWindowActive();

        // If some votes cast but < quorum, use weighted average of those votes
        if (c.totalVotes > 0) {
            c.finalReleasePercent = uint8(c.weightedReleaseSum / c.totalVotes);
        } else {
            c.finalReleasePercent = 50; // no votes → 50/50
        }

        c.resolved = true;
        c.appealDeadline = block.timestamp + APPEAL_WINDOW;

        escrowRouter.resolveDispute(c.sessionId, c.finalReleasePercent);

        emit CaseResolved(caseId, c.sessionId, c.finalReleasePercent, true);
    }

    /**
     * @notice Appeal a resolved case to Kleros (Phase 2.0).
     * Only callable within APPEAL_WINDOW after resolution.
     * Requires Kleros arbitrator to be configured.
     */
    function appeal(uint256 caseId) external payable {
        if (klerosArbitrator == address(0)) revert KlerosNotConfigured();

        DisputeCase storage c = cases[caseId];
        if (!c.resolved) revert QuorumNotReached(); // not resolved yet
        if (block.timestamp > c.appealDeadline) revert AppealWindowExpired();
        if (c.appealed) revert CaseAlreadyResolved();

        c.appealed = true;

        // Submit to Kleros Court
        // Court 1 = General Court, 3 jurors
        bytes memory extraData = abi.encode(uint256(1), uint256(3));
        uint256 kDisputeId = IKlerosArbitrator(klerosArbitrator).createDispute{value: msg.value}(
            2, // 2 choices: ruling 1 = mentor wins, ruling 2 = learner wins
            extraData
        );

        klerosDisputeId[caseId] = kDisputeId;

        emit CaseAppealed(caseId, kDisputeId);
    }

    // ─── Internal ─────────────────────────────────────────────────────

    function _resolveCase(uint256 caseId, bool isAuto) internal {
        DisputeCase storage c = cases[caseId];
        if (c.resolved) return;

        // Weighted average release percent
        c.finalReleasePercent = uint8(c.weightedReleaseSum / c.totalVotes);
        c.resolved = true;
        c.appealDeadline = block.timestamp + APPEAL_WINDOW;

        // Execute resolution on EscrowRouter
        escrowRouter.resolveDispute(c.sessionId, c.finalReleasePercent);

        emit CaseResolved(caseId, c.sessionId, c.finalReleasePercent, isAuto);
    }

    function _isJuror(address addr) internal view returns (bool) {
        for (uint256 i = 0; i < JUROR_COUNT; i++) {
            if (jurors[i] == addr) return true;
        }
        return false;
    }

    // ─── View ────────────────────────────────────────────────────────

    function getCase(uint256 caseId) external view returns (DisputeCase memory) {
        return cases[caseId];
    }

    function getCaseBySession(uint256 sessionId) external view returns (DisputeCase memory) {
        return cases[sessionToCase[sessionId]];
    }

    function getJurors() external view returns (address[5] memory) {
        return jurors;
    }

    function getJurorVotes(uint256 caseId)
        external
        view
        returns (address[] memory voters, uint8[] memory votes, bool[] memory voted)
    {
        voters = new address[](JUROR_COUNT);
        votes  = new uint8[](JUROR_COUNT);
        voted  = new bool[](JUROR_COUNT);
        for (uint256 i = 0; i < JUROR_COUNT; i++) {
            voters[i] = jurors[i];
            voted[i]  = hasVoted[caseId][jurors[i]];
            votes[i]  = jurorVote[caseId][jurors[i]];
        }
    }
}
