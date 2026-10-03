// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEscrowRouter.sol";
import "./interfaces/IKlerosArbitrator.sol";
import "./interfaces/IMentorStaking.sol";

/**
 * @title DisputeCouncil
 * @author Trust Lesson
 * @notice Decentralized dispute resolution council with on-chain dynamic sortition (Phase 1.5 Opsi Y).
 *
 * Dynamic Sortition Architecture:
 * - Staked mentors join the decentralized Juror Pool (requires stake >= 100 USDC)
 * - For every dispute case, 5 distinct jurors are drawn dynamically via on-chain sortition
 *   using block.prevrandao, block.timestamp, and case parameters
 * - Conflict of Interest Filter: Parties involved in the dispute (learner & mentor) are strictly excluded
 * - 3-of-5 quorum required for resolution
 * - 72-hour resolution window; auto weighted-average / 50-50 fallback if window expires
 * - Evidence stored as IPFS CID — publicly auditable by anyone
 * - Appeal path to Kleros Court (Phase 2.0 interface hook ready)
 */
contract DisputeCouncil is Ownable {
    // ─── Constants ───────────────────────────────────────────────────
    uint256 public constant RESOLVE_WINDOW = 72 hours;
    uint256 public constant APPEAL_WINDOW  = 24 hours;
    uint256 public constant QUORUM         = 3;
    uint256 public constant JUROR_COUNT    = 5;
    uint256 public constant MIN_JUROR_STAKE = 100 * 10 ** 6; // 100 USDC

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
        address[JUROR_COUNT] selectedJurors; // 5 dynamically drawn jurors for this case
    }

    // ─── Storage ─────────────────────────────────────────────────────

    IEscrowRouter public escrowRouter;
    IMentorStaking public mentorStaking;
    uint256 public nextCaseId;

    // Juror Pool for Dynamic Sortition
    address[] public jurorPool;
    mapping(address => bool) public isJurorInPool;
    mapping(address => uint256) public jurorPoolIndex;

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

    event JurorJoinedPool(address indexed juror);
    event JurorRemovedFromPool(address indexed juror);
    event JurorsDrawn(uint256 indexed caseId, address[JUROR_COUNT] selectedJurors);
    event CaseOpened(uint256 indexed caseId, uint256 indexed sessionId, string evidenceIpfsCid, uint256 deadline);
    event VoteCast(uint256 indexed caseId, address indexed juror, uint8 releasePercent);
    event CaseResolved(uint256 indexed caseId, uint256 indexed sessionId, uint8 finalReleasePercent, bool autoResolved);
    event CaseAppealed(uint256 indexed caseId, uint256 klerosDisputeId);
    event KlerosArbitratorSet(address klerosArbitrator);
    event MentorStakingSet(address mentorStaking);
    event EscrowRouterSet(address escrowRouter);

    // ─── Errors ──────────────────────────────────────────────────────
    error NotSelectedJuror();
    error AlreadyVoted();
    error CaseNotOpen();
    error CaseAlreadyResolved();
    error ResolveWindowActive();
    error AppealWindowExpired();
    error QuorumNotReached();
    error SessionAlreadyHasCase();
    error KlerosNotConfigured();
    error Unauthorized();
    error InsufficientJurorPool();
    error JurorAlreadyInPool();
    error JurorNotInPool();
    error IneligibleForJurorPool();
    error ZeroAddress();
    error StakingNotConfigured();

    // ─── Constructor ─────────────────────────────────────────────────

    constructor(
        address _escrowRouter,
        address _mentorStaking,
        address[] memory _initialJurors
    ) Ownable(msg.sender) {
        if (_escrowRouter == address(0) || _mentorStaking == address(0)) revert ZeroAddress();
        escrowRouter = IEscrowRouter(_escrowRouter);
        mentorStaking = IMentorStaking(_mentorStaking);
        for (uint256 i = 0; i < _initialJurors.length; i++) {
            _addJurorToPool(_initialJurors[i]);
        }
    }

    // ─── Juror Pool Management ────────────────────────────────────────

    /**
     * @notice Staked mentor joins the decentralized juror pool.
     * Enforces fail-closed: requires mentorStaking to be configured and stake >= MIN_JUROR_STAKE (100 USDC).
     */
    function joinJurorPool() external {
        if (address(mentorStaking) == address(0)) revert StakingNotConfigured();
        if (mentorStaking.getStakeAmount(msg.sender) < MIN_JUROR_STAKE) {
            revert IneligibleForJurorPool();
        }
        _addJurorToPool(msg.sender);
    }

    /**
     * @notice Admin can enroll verified eligible mentors into the juror pool.
     */
    function addJuror(address juror) external onlyOwner {
        _addJurorToPool(juror);
    }

    /**
     * @notice Remove a juror from the pool (self-exit or admin removal).
     */
    function removeJuror(address juror) external {
        if (msg.sender != juror && msg.sender != owner()) revert Unauthorized();
        _removeJurorFromPool(juror);
    }

    function _addJurorToPool(address juror) internal {
        require(juror != address(0), "Zero address");
        if (isJurorInPool[juror]) revert JurorAlreadyInPool();
        jurorPoolIndex[juror] = jurorPool.length;
        jurorPool.push(juror);
        isJurorInPool[juror] = true;
        emit JurorJoinedPool(juror);
    }

    function _removeJurorFromPool(address juror) internal {
        if (!isJurorInPool[juror]) revert JurorNotInPool();
        uint256 index = jurorPoolIndex[juror];
        uint256 lastIndex = jurorPool.length - 1;
        if (index != lastIndex) {
            address lastJuror = jurorPool[lastIndex];
            jurorPool[index] = lastJuror;
            jurorPoolIndex[lastJuror] = index;
        }
        jurorPool.pop();
        delete isJurorInPool[juror];
        delete jurorPoolIndex[juror];
        emit JurorRemovedFromPool(juror);
    }

    // ─── Admin Setters ────────────────────────────────────────────────

    function setMentorStaking(address _staking) external onlyOwner {
        mentorStaking = IMentorStaking(_staking);
        emit MentorStakingSet(_staking);
    }

    function setKlerosArbitrator(address _kleros) external onlyOwner {
        klerosArbitrator = _kleros;
        emit KlerosArbitratorSet(_kleros);
    }

    function setEscrowRouter(address _escrowRouter) external onlyOwner {
        escrowRouter = IEscrowRouter(_escrowRouter);
        emit EscrowRouterSet(_escrowRouter);
    }

    // ─── Dynamic Sortition Engine ─────────────────────────────────────

    /**
     * @notice Draw 5 jurors dynamically for a specific case with Conflict of Interest Filter.
     */
    function _drawJurors(uint256 caseId, uint256 sessionId) internal returns (address[JUROR_COUNT] memory drawn) {
        uint256 poolSize = jurorPool.length;
        if (poolSize < JUROR_COUNT) revert InsufficientJurorPool();

        address partyLearner = address(0);
        address partyMentor = address(0);
        if (address(escrowRouter) != address(0)) {
            try escrowRouter.getSessionParties(sessionId) returns (address l, address m) {
                partyLearner = l;
                partyMentor = m;
            } catch {}
        }

        // Build list of eligible pool indices excluding conflicted parties
        uint256[] memory eligibleIndices = new uint256[](poolSize);
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < poolSize; i++) {
            address candidate = jurorPool[i];
            if (candidate != partyLearner && candidate != partyMentor) {
                eligibleIndices[eligibleCount++] = i;
            }
        }

        if (eligibleCount < JUROR_COUNT) revert InsufficientJurorPool();

        // Sample 5 unique jurors via pseudo-random shuffle (Fisher-Yates style)
        bytes32 seed = keccak256(
            abi.encodePacked(
                caseId,
                sessionId,
                block.prevrandao,
                block.timestamp,
                blockhash(block.number - 1),
                poolSize
            )
        );

        for (uint256 i = 0; i < JUROR_COUNT; i++) {
            uint256 randIndex = i + (uint256(keccak256(abi.encodePacked(seed, i))) % (eligibleCount - i));
            uint256 chosenPoolIdx = eligibleIndices[randIndex];
            eligibleIndices[randIndex] = eligibleIndices[i];
            eligibleIndices[i] = chosenPoolIdx;

            drawn[i] = jurorPool[chosenPoolIdx];
        }

        emit JurorsDrawn(caseId, drawn);
    }

    // ─── Core: Dispute Flow ───────────────────────────────────────────

    /**
     * @notice Open a new dispute case with on-chain dynamic sortition.
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

        address[JUROR_COUNT] memory drawn = _drawJurors(caseId, sessionId);

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
            raisedBy: raisedBy,
            selectedJurors: drawn
        });

        sessionToCase[sessionId] = caseId;
        sessionHasCase[sessionId] = true;

        emit CaseOpened(caseId, sessionId, evidenceIpfsCid, deadline);
    }

    /**
     * @notice Cast a vote on an open dispute case. Only dynamically selected jurors for this case can vote.
     * @param caseId The case to vote on.
     * @param releasePercent Percentage (0-100) of funds to release to mentor.
     */
    function castVote(uint256 caseId, uint8 releasePercent) external {
        if (!_isCaseJuror(caseId, msg.sender)) revert NotSelectedJuror();
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

        // Auto-resolve if 3-of-5 quorum reached
        if (c.totalVotes >= QUORUM) {
            _resolveCase(caseId, false);
        }
    }

    /**
     * @notice Trigger auto-resolution if resolve window expired without quorum.
     */
    function autoResolve(uint256 caseId) external {
        DisputeCase storage c = cases[caseId];
        if (c.resolved) revert CaseAlreadyResolved();
        if (block.timestamp <= c.resolveDeadline) revert ResolveWindowActive();

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
     */
    function appeal(uint256 caseId) external payable {
        if (klerosArbitrator == address(0)) revert KlerosNotConfigured();

        DisputeCase storage c = cases[caseId];
        if (!c.resolved) revert QuorumNotReached();
        if (block.timestamp > c.appealDeadline) revert AppealWindowExpired();
        if (c.appealed) revert CaseAlreadyResolved();

        c.appealed = true;

        bytes memory extraData = abi.encode(uint256(1), uint256(3));
        uint256 kDisputeId = IKlerosArbitrator(klerosArbitrator).createDispute{value: msg.value}(
            2,
            extraData
        );

        klerosDisputeId[caseId] = kDisputeId;

        emit CaseAppealed(caseId, kDisputeId);
    }

    // ─── Internal ─────────────────────────────────────────────────────

    function _resolveCase(uint256 caseId, bool isAuto) internal {
        DisputeCase storage c = cases[caseId];
        if (c.resolved) return;

        c.finalReleasePercent = uint8(c.weightedReleaseSum / c.totalVotes);
        c.resolved = true;
        c.appealDeadline = block.timestamp + APPEAL_WINDOW;

        escrowRouter.resolveDispute(c.sessionId, c.finalReleasePercent);

        emit CaseResolved(caseId, c.sessionId, c.finalReleasePercent, isAuto);
    }

    function _isCaseJuror(uint256 caseId, address addr) internal view returns (bool) {
        address[JUROR_COUNT] storage selected = cases[caseId].selectedJurors;
        for (uint256 i = 0; i < JUROR_COUNT; i++) {
            if (selected[i] == addr) return true;
        }
        return false;
    }

    // ─── Views ────────────────────────────────────────────────────────

    function getJurorPool() external view returns (address[] memory) {
        return jurorPool;
    }

    function getJurorPoolCount() external view returns (uint256) {
        return jurorPool.length;
    }

    function getCase(uint256 caseId) external view returns (DisputeCase memory) {
        return cases[caseId];
    }

    function getCaseBySession(uint256 sessionId) external view returns (DisputeCase memory) {
        return cases[sessionToCase[sessionId]];
    }

    function getCaseJurors(uint256 caseId) external view returns (address[JUROR_COUNT] memory) {
        return cases[caseId].selectedJurors;
    }

    function getJurors() external view returns (address[] memory) {
        return jurorPool;
    }

    function getJurorVotes(uint256 caseId)
        external
        view
        returns (address[] memory voters, uint8[] memory votes, bool[] memory voted)
    {
        voters = new address[](JUROR_COUNT);
        votes  = new uint8[](JUROR_COUNT);
        voted  = new bool[](JUROR_COUNT);
        address[JUROR_COUNT] storage selected = cases[caseId].selectedJurors;
        for (uint256 i = 0; i < JUROR_COUNT; i++) {
            voters[i] = selected[i];
            voted[i]  = hasVoted[caseId][selected[i]];
            votes[i]  = jurorVote[caseId][selected[i]];
        }
    }
}
