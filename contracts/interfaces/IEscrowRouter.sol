// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEscrowRouter
 * @notice External interface for the Trust Lesson EscrowRouter.
 * Used by DisputeCouncil to execute resolutions.
 */
interface IEscrowRouter {
    enum Status { CREATED, FUNDED, IN_SESSION, COMPLETED, DISPUTED, RESOLVED, CANCELLED }

    /**
     * @notice Resolve a disputed session.
     * Called by the DisputeCouncil after quorum is reached.
     * @param sessionId The session to resolve.
     * @param releasePercent Percentage (0-100) of funds to release to mentor.
     */
    function resolveDispute(uint256 sessionId, uint8 releasePercent) external;

    /**
     * @notice Get session status.
     */
    function getSessionStatus(uint256 sessionId) external view returns (Status);

    /**
     * @notice Get session parties.
     */
    function getSessionParties(uint256 sessionId) external view returns (address learner, address mentor);
}
