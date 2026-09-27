// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICredentialIssuer
 * @notice Interface that any credential issuer must implement.
 * Allows EscrowRouter to swap ReputationRegistry for VerifiableCredential
 * without redeploying EscrowRouter.
 */
interface ICredentialIssuer {
    enum CredentialType { LEARNER_COMPLETION, MENTOR_DELIVERY }

    /**
     * @notice Issue credentials to both learner and mentor after session completion.
     * @return learnerCredId The credential ID issued to the learner.
     * @return mentorCredId The credential ID issued to the mentor.
     */
    function issueCompositeCredential(
        address mentor,
        address learner,
        uint256 sessionId,
        uint8 rating,
        string calldata skillTag
    ) external returns (uint256 learnerCredId, uint256 mentorCredId);

    /**
     * @notice Get all credential IDs for a subject (learner or mentor).
     */
    function getCredentials(address subject) external view returns (uint256[] memory);

    /**
     * @notice Get the EIP-712 digest of a credential for off-chain verification.
     */
    function getCredentialDigest(uint256 credentialId) external view returns (bytes32);
}
