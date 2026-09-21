// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MentorStaking
 * @author Trust Lesson
 * @notice Mentors stake USDC to get Verified badge. Slashed if they lose disputes.
 */
contract MentorStaking is ReentrancyGuard, Ownable {
    IERC20 public immutable usdc;

    uint256 public constant MIN_STAKE = 100 * 10 ** 6;  // 100 USDC
    uint256 public constant UNSTAKE_DELAY = 7 days;

    struct StakeInfo {
        uint256 amount;          // current stake
        uint256 unstakeRequestAt; // timestamp of unstake request (0 if none)
        bool isVerified;         // true when stake >= MIN_STAKE
    }

    mapping(address => StakeInfo) public stakes;
    address public escrowRouter; // only EscrowRouter can slash

    event Staked(address indexed mentor, uint256 amount);
    event SlashApplied(address indexed mentor, uint256 amount, address recipient);
    event UnstakeRequested(address indexed mentor, uint256 availableAt);
    event Unstaked(address indexed mentor, uint256 amount);

    error NotEnoughStake();
    error UnstakeDelayNotReached();
    error UnstakeNotRequested();
    error Unauthorized();
    error TransferFailed();

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    /** @notice Mentor stakes USDC to get verified status. */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        StakeInfo storage s = stakes[msg.sender];
        s.amount += amount;
        s.isVerified = s.amount >= MIN_STAKE;

        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        emit Staked(msg.sender, amount);
    }

    /** @notice Request to unstake. Starts 7-day timelock. */
    function requestUnstake() external {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount > 0, "Nothing to unstake");
        s.unstakeRequestAt = block.timestamp;
        s.isVerified = false; // lose verified status immediately
        emit UnstakeRequested(msg.sender, block.timestamp + UNSTAKE_DELAY);
    }

    /** @notice Complete unstake after timelock. */
    function unstake() external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        if (s.unstakeRequestAt == 0) revert UnstakeNotRequested();
        if (block.timestamp < s.unstakeRequestAt + UNSTAKE_DELAY) revert UnstakeDelayNotReached();

        uint256 amount = s.amount;
        s.amount = 0;
        s.unstakeRequestAt = 0;

        bool ok = usdc.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit Unstaked(msg.sender, amount);
    }

    /** @notice Slash a mentor's stake (called by EscrowRouter or owner after lost dispute). */
    function slash(address mentor, uint256 amount, address recipient) external nonReentrant {
        if (msg.sender != escrowRouter && msg.sender != owner()) revert Unauthorized();
        StakeInfo storage s = stakes[mentor];
        uint256 slashable = amount < s.amount ? amount : s.amount;
        s.amount -= slashable;
        s.isVerified = s.amount >= MIN_STAKE;

        bool ok = usdc.transfer(recipient, slashable);
        if (!ok) revert TransferFailed();

        emit SlashApplied(mentor, slashable, recipient);
    }

    /** @notice Check if a mentor is verified. */
    function isVerified(address mentor) external view returns (bool) {
        return stakes[mentor].isVerified;
    }

    /** @notice Set the EscrowRouter contract address. */
    function setEscrowRouter(address router) external onlyOwner {
        escrowRouter = router;
    }
}
