// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VideoAccess
 * @author Trust Lesson
 * @notice On-chain access control for mentor videos.
 * Video file stored on Cloudflare Stream; hash & access tracked on-chain.
 */
contract VideoAccess is ReentrancyGuard, Ownable {
    IERC20 public immutable usdc;
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%
    uint256 public constant BPS_DENOMINATOR = 10_000;

    struct Video {
        address mentor;
        bytes32 contentHash; // SHA-256 of original file
        uint256 priceUsdc;   // price in USDC (6 decimals)
        bool active;
    }

    uint256 public nextVideoId;
    mapping(uint256 => Video) public videos;
    // learner → videoId → has access
    mapping(address => mapping(uint256 => bool)) public accessMap;

    event VideoRegistered(uint256 indexed videoId, address mentor, bytes32 contentHash);
    event VideoPurchased(uint256 indexed videoId, address learner);
    event VideoDeactivated(uint256 indexed videoId);

    error VideoNotFound();
    error AlreadyOwned();
    error VideoInactive();
    error TransferFailed();
    error Unauthorized();

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Mentor registers a new video.
     * @param contentHash SHA-256 hash of the video file (proof of content).
     * @param priceUsdc Price in USDC (use 0 for free access).
     */
    function registerVideo(bytes32 contentHash, uint256 priceUsdc)
        external
        returns (uint256 videoId)
    {
        videoId = nextVideoId++;
        videos[videoId] = Video({
            mentor: msg.sender,
            contentHash: contentHash,
            priceUsdc: priceUsdc,
            active: true
        });
        // Mentor gets free access to their own video
        accessMap[msg.sender][videoId] = true;
        emit VideoRegistered(videoId, msg.sender, contentHash);
    }

    /**
     * @notice Learner purchases access to a video.
     * Transfers USDC from learner → mentor (minus platform fee).
     */
    function purchaseAccess(uint256 videoId) external nonReentrant {
        Video storage v = videos[videoId];
        if (v.mentor == address(0)) revert VideoNotFound();
        if (!v.active) revert VideoInactive();
        if (accessMap[msg.sender][videoId]) revert AlreadyOwned();

        // CEI: grant access before transfer
        accessMap[msg.sender][videoId] = true;

        if (v.priceUsdc > 0) {
            uint256 fee = (v.priceUsdc * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            uint256 toMentor = v.priceUsdc - fee;

            // Transfer from learner to this contract then to mentor
            bool ok = usdc.transferFrom(msg.sender, v.mentor, toMentor);
            if (!ok) revert TransferFailed();
            // Fee stays in contract, owner withdraws
            bool feeOk = usdc.transferFrom(msg.sender, address(this), fee);
            if (!feeOk) revert TransferFailed();
        }

        emit VideoPurchased(videoId, msg.sender);
    }

    /** @notice Check if learner has access. */
    function hasAccess(address learner, uint256 videoId) external view returns (bool) {
        return accessMap[learner][videoId];
    }

    /** @notice Mentor can deactivate their video. */
    function deactivateVideo(uint256 videoId) external {
        if (videos[videoId].mentor != msg.sender && msg.sender != owner()) revert Unauthorized();
        videos[videoId].active = false;
        emit VideoDeactivated(videoId);
    }

    /** @notice Owner withdraws platform fees. */
    function withdrawFees(address to) external onlyOwner nonReentrant {
        uint256 balance = usdc.balanceOf(address(this));
        usdc.transfer(to, balance);
    }
}
