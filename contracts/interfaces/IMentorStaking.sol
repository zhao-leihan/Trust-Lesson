// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMentorStaking
 * @notice Interface for mentor staking module.
 * Allows EscrowRouter to call slash without being tightly coupled
 * to the MentorStaking implementation.
 */
interface IMentorStaking {
    enum Tier { NONE, PRO, MASTER }

    /**
     * @notice Check if a mentor has sufficient stake and is verified.
     */
    function isVerified(address mentor) external view returns (bool);

    /**
     * @notice Get the on-chain tier for a mentor.
     */
    function getTier(address mentor) external view returns (Tier);

    /**
     * @notice Get the current stake amount for a mentor (USDC, 6 decimals).
     */
    function getStakeAmount(address mentor) external view returns (uint256);

    /**
     * @notice Slash a mentor's stake after a lost dispute.
     * @param mentor The mentor to slash.
     * @param amount Amount to slash (USDC, 6 decimals).
     * @param recipient Address to receive the slashed funds.
     */
    function slash(address mentor, uint256 amount, address recipient) external;
}
