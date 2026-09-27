// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOptimisticOracle
 * @notice Interface for UMA Optimistic Oracle V3 integration.
 * Phase 2.0 alternative to Kleros — uses optimistic verification
 * with dispute bond instead of jury panel.
 * Ref: https://docs.uma.xyz/developers/optimistic-oracle-v3
 */
interface IOptimisticOracle {
    /**
     * @notice Assert a claim on-chain.
     * If not disputed within the liveness period, it resolves as true.
     * @param claim The claim bytes (ABI-encoded assertion).
     * @param asserter The address making the claim.
     * @param callbackRecipient Address to receive the resolution callback.
     * @param escalationManager Address of escalation manager (0 for none).
     * @param liveness Seconds before claim auto-resolves if undisputed.
     * @param currency The ERC20 token used for bonds.
     * @param bond Bond amount in currency tokens.
     * @param identifier Bytes32 identifier for the claim type.
     * @param domainId Bytes32 domain ID.
     * @return assertionId Unique identifier for this assertion.
     */
    function assertTruthWithDefaults(
        bytes calldata claim,
        address asserter,
        address callbackRecipient,
        address escalationManager,
        uint64 liveness,
        address currency,
        uint256 bond,
        bytes32 identifier,
        bytes32 domainId
    ) external returns (bytes32 assertionId);

    /**
     * @notice Settle an expired or resolved assertion and get the result.
     */
    function settleAndGetAssertionResult(bytes32 assertionId) external returns (bool);
}
