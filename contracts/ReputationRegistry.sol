// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @author Trust Lesson
 * @notice Issues non-transferable Soulbound Tokens (SBTs) as reputation credentials.
 * Credentials are issued by the EscrowRouter after session completion.
 */
contract ReputationRegistry is Ownable {
    struct Credential {
        address mentor;
        address learner;
        uint256 sessionId;
        uint8 rating;       // 1-5 stars
        string skillTag;    // e.g. "Solidity", "React"
        uint256 issuedAt;
    }

    uint256 public nextCredentialId;
    mapping(uint256 => Credential) public credentials;

    // mentor → list of credential IDs
    mapping(address => uint256[]) public mentorCredentials;
    // learner → list of credential IDs
    mapping(address => uint256[]) public learnerCredentials;

    address public escrowRouter;

    event CredentialIssued(
        uint256 indexed credentialId,
        address indexed mentor,
        address indexed learner,
        uint256 sessionId,
        uint8 rating
    );

    error Unauthorized();
    error InvalidRating();

    constructor() Ownable(msg.sender) {}

    modifier onlyAuthorized() {
        if (msg.sender != escrowRouter && msg.sender != owner()) revert Unauthorized();
        _;
    }

    /**
     * @notice Issue a Soulbound credential after session completion.
     * @param mentor Mentor address.
     * @param learner Learner address.
     * @param sessionId On-chain session ID.
     * @param rating 1-5 star rating.
     * @param skillTag Short skill description.
     */
    function issueCredential(
        address mentor,
        address learner,
        uint256 sessionId,
        uint8 rating,
        string calldata skillTag
    ) external onlyAuthorized returns (uint256 credentialId) {
        if (rating < 1 || rating > 5) revert InvalidRating();

        credentialId = nextCredentialId++;
        credentials[credentialId] = Credential({
            mentor: mentor,
            learner: learner,
            sessionId: sessionId,
            rating: rating,
            skillTag: skillTag,
            issuedAt: block.timestamp
        });

        mentorCredentials[mentor].push(credentialId);
        learnerCredentials[learner].push(credentialId);

        emit CredentialIssued(credentialId, mentor, learner, sessionId, rating);
    }

    /** @notice Get all credential IDs for a mentor. */
    function getMentorCredentials(address mentor) external view returns (uint256[] memory) {
        return mentorCredentials[mentor];
    }

    /** @notice Get all credential IDs for a learner. */
    function getLearnerCredentials(address learner) external view returns (uint256[] memory) {
        return learnerCredentials[learner];
    }

    /** @notice Compute aggregate rating for a mentor (scaled x10 for precision). */
    function getMentorRating(address mentor) external view returns (uint256 avgRating, uint256 count) {
        uint256[] storage ids = mentorCredentials[mentor];
        count = ids.length;
        if (count == 0) return (0, 0);
        uint256 sum = 0;
        for (uint256 i = 0; i < count; i++) {
            sum += credentials[ids[i]].rating;
        }
        avgRating = (sum * 10) / count; // e.g. 48 = 4.8 stars
    }

    /** @notice Set the EscrowRouter that can issue credentials. */
    function setEscrowRouter(address router) external onlyOwner {
        escrowRouter = router;
    }
}
