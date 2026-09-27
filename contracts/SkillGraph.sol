// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SkillGraph
 * @author Trust Lesson
 * @notice On-chain skill node graph. Credentials form a composable graph:
 *   e.g. "Solidity Security" + "Audit Experience" + 3 sessions = Level 3.
 * Skill nodes are defined by platform admin, subject progress is updated
 * by the VerifiableCredential contract after each issuance.
 */
contract SkillGraph is Ownable {
    // ─── Structs ─────────────────────────────────────────────────────

    struct SkillNode {
        string name;           // e.g. "Solidity Security"
        bytes32[] prereqIds;   // prerequisite skill node IDs (can be empty)
        uint256 minSessions1;  // sessions needed for Level 1
        uint256 minSessions2;  // sessions needed for Level 2
        uint256 minSessions3;  // sessions needed for Level 3
        uint256 minRating1;    // min avg rating*10 for Level 1 (e.g. 30 = 3.0)
        uint256 minRating2;    // min avg rating*10 for Level 2
        uint256 minRating3;    // min avg rating*10 for Level 3
        bool exists;
    }

    struct SkillProgress {
        uint256 sessionCount;    // # completed sessions in this skill
        uint256 totalRating;     // sum of ratings received (1-5 each)
        uint256 lastUpdatedAt;
    }

    // ─── Storage ─────────────────────────────────────────────────────

    // skillId → SkillNode definition
    mapping(bytes32 => SkillNode) public skillNodes;
    bytes32[] public skillNodeIds;

    // subject → skillId → progress
    mapping(address => mapping(bytes32 => SkillProgress)) public skillProgress;

    // Authorized callers (VerifiableCredential contract)
    mapping(address => bool) public authorized;

    // ─── Events ──────────────────────────────────────────────────────

    event SkillNodeDefined(bytes32 indexed skillId, string name);
    event ProgressUpdated(address indexed subject, bytes32 indexed skillId, uint256 sessionCount, uint8 newLevel);
    event AuthorizationSet(address indexed caller, bool authorized);

    // ─── Errors ──────────────────────────────────────────────────────
    error SkillNotFound(bytes32 skillId);
    error Unauthorized();
    error SkillAlreadyExists(bytes32 skillId);

    // ─── Constructor ─────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {
        // Pre-seed foundational skill nodes
        _defineSkill(
            keccak256("Solidity Basics"),
            "Solidity Basics",
            new bytes32[](0),
            1, 3, 5,  // min sessions per level
            30, 35, 40 // min avg rating*10 per level
        );
        _defineSkill(
            keccak256("Web3 Frontend"),
            "Web3 Frontend",
            new bytes32[](0),
            1, 3, 5,
            30, 35, 40
        );

        bytes32[] memory solidityPrereqs = new bytes32[](1);
        solidityPrereqs[0] = keccak256("Solidity Basics");
        _defineSkill(
            keccak256("Solidity Security"),
            "Solidity Security",
            solidityPrereqs,
            1, 3, 5,
            35, 40, 45
        );
        _defineSkill(
            keccak256("DeFi Architecture"),
            "DeFi Architecture",
            solidityPrereqs,
            1, 3, 5,
            35, 40, 45
        );
        _defineSkill(
            keccak256("React"),
            "React",
            new bytes32[](0),
            1, 3, 5,
            30, 35, 40
        );
        _defineSkill(
            keccak256("System Design"),
            "System Design",
            new bytes32[](0),
            1, 3, 5,
            35, 40, 45
        );
        _defineSkill(
            keccak256("Zero Knowledge Proofs"),
            "Zero Knowledge Proofs",
            solidityPrereqs,
            2, 5, 10,
            40, 45, 48
        );
    }

    // ─── Admin ───────────────────────────────────────────────────────

    /**
     * @notice Define a new skill node in the graph.
     */
    function defineSkill(
        bytes32 skillId,
        string calldata name,
        bytes32[] calldata prereqIds,
        uint256 minSessions1, uint256 minSessions2, uint256 minSessions3,
        uint256 minRating1, uint256 minRating2, uint256 minRating3
    ) external onlyOwner {
        _defineSkill(skillId, name, prereqIds, minSessions1, minSessions2, minSessions3, minRating1, minRating2, minRating3);
    }

    function _defineSkill(
        bytes32 skillId,
        string memory name,
        bytes32[] memory prereqIds,
        uint256 minSessions1, uint256 minSessions2, uint256 minSessions3,
        uint256 minRating1, uint256 minRating2, uint256 minRating3
    ) internal {
        if (skillNodes[skillId].exists) revert SkillAlreadyExists(skillId);
        skillNodes[skillId] = SkillNode({
            name: name,
            prereqIds: prereqIds,
            minSessions1: minSessions1,
            minSessions2: minSessions2,
            minSessions3: minSessions3,
            minRating1: minRating1,
            minRating2: minRating2,
            minRating3: minRating3,
            exists: true
        });
        skillNodeIds.push(skillId);
        emit SkillNodeDefined(skillId, name);
    }

    /**
     * @notice Set authorization for a caller (VerifiableCredential contract).
     */
    function setAuthorized(address caller, bool auth) external onlyOwner {
        authorized[caller] = auth;
        emit AuthorizationSet(caller, auth);
    }

    // ─── Core: Update Progress ────────────────────────────────────────

    /**
     * @notice Update a subject's progress in a skill after credential issuance.
     * @param subject The wallet receiving the credential (learner or mentor).
     * @param skillId The skill node ID (keccak256 of skill name).
     * @param rating The rating received (1-5).
     */
    function updateProgress(address subject, bytes32 skillId, uint8 rating) external {
        if (!authorized[msg.sender] && msg.sender != owner()) revert Unauthorized();
        if (!skillNodes[skillId].exists) revert SkillNotFound(skillId);

        SkillProgress storage p = skillProgress[subject][skillId];
        p.sessionCount += 1;
        p.totalRating += rating;
        p.lastUpdatedAt = block.timestamp;

        emit ProgressUpdated(subject, skillId, p.sessionCount, getSkillLevel(subject, skillId));
    }

    // ─── View: Compute Level ──────────────────────────────────────────

    /**
     * @notice Compute a subject's level in a given skill.
     * @return level 0 = unqualified, 1 = Beginner, 2 = Intermediate, 3 = Advanced.
     */
    function getSkillLevel(address subject, bytes32 skillId) public view returns (uint8 level) {
        if (!skillNodes[skillId].exists) return 0;
        SkillNode storage node = skillNodes[skillId];
        SkillProgress storage p = skillProgress[subject][skillId];

        if (p.sessionCount == 0) return 0;

        uint256 avgRating = (p.totalRating * 10) / p.sessionCount; // e.g. 48 = 4.8

        // Check prereqs — subject must be at least Level 1 in each prereq
        for (uint256 i = 0; i < node.prereqIds.length; i++) {
            if (getSkillLevel(subject, node.prereqIds[i]) < 1) return 0;
        }

        // Level 3
        if (
            p.sessionCount >= node.minSessions3 &&
            avgRating >= node.minRating3
        ) return 3;

        // Level 2
        if (
            p.sessionCount >= node.minSessions2 &&
            avgRating >= node.minRating2
        ) return 2;

        // Level 1
        if (
            p.sessionCount >= node.minSessions1 &&
            avgRating >= node.minRating1
        ) return 1;

        return 0;
    }

    /**
     * @notice Get all skills a subject has progress in.
     */
    function getSubjectSkills(address subject)
        external
        view
        returns (bytes32[] memory ids, string[] memory names, uint8[] memory levels, uint256[] memory sessionCounts)
    {
        uint256 total = skillNodeIds.length;
        ids = new bytes32[](total);
        names = new string[](total);
        levels = new uint8[](total);
        sessionCounts = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            bytes32 sid = skillNodeIds[i];
            ids[i] = sid;
            names[i] = skillNodes[sid].name;
            levels[i] = getSkillLevel(subject, sid);
            sessionCounts[i] = skillProgress[subject][sid].sessionCount;
        }
    }

    /**
     * @notice Get all defined skill node IDs.
     */
    function getAllSkillNodeIds() external view returns (bytes32[] memory) {
        return skillNodeIds;
    }
}
