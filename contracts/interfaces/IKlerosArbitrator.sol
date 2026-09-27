// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IKlerosArbitrator
 * @notice Interface for Kleros Court arbitration.
 * Phase 2.0 escalation path — pluggable arbitrator.
 * Ref: https://kleros.gitbook.io/docs/developer/arbitration-development
 */
interface IKlerosArbitrator {
    /**
     * @notice Create a Kleros dispute with a given number of choices.
     * @param _choices Number of ruling choices (2 for binary: mentor wins / learner wins).
     * @param _extraData Extra data to configure the dispute (court ID, jurors).
     * @return disputeID The Kleros dispute ID.
     */
    function createDispute(uint256 _choices, bytes calldata _extraData)
        external
        payable
        returns (uint256 disputeID);

    /**
     * @notice Get the cost of creating a dispute.
     */
    function arbitrationCost(bytes calldata _extraData) external view returns (uint256);

    /**
     * @notice Get the current ruling for a Kleros dispute.
     * @return ruling 0 = pending, 1 = mentor wins, 2 = learner wins.
     */
    function currentRuling(uint256 _disputeID) external view returns (uint256 ruling);
}
