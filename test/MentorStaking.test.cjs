const assert = require("assert");
const { ethers } = require("hardhat");

describe("MentorStaking", function () {
  let mockUsdc, mentorStaking;
  let owner, mentor, slashRecipient, unauthorized;

  const MIN_STAKE = 100n * 10n ** 6n; // 100 USDC

  beforeEach(async function () {
    [owner, mentor, slashRecipient, unauthorized] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();

    await mockUsdc.mint(mentor.address, 10_000n * 10n ** 6n);

    const Staking = await ethers.getContractFactory("MentorStaking");
    mentorStaking = await Staking.deploy(await mockUsdc.getAddress());
    await mentorStaking.waitForDeployment();
  });

  // ── Staking ──────────────────────────────────────────────────────

  it("should allow mentor to stake USDC and become verified", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);

    const isVerified = await mentorStaking.isVerified(mentor.address);
    assert.strictEqual(isVerified, true);

    const stakeInfo = await mentorStaking.stakes(mentor.address);
    assert.strictEqual(stakeInfo.amount, MIN_STAKE);
  });

  it("should not verify mentor below minimum stake", async function () {
    const partialStake = 50n * 10n ** 6n; // 50 USDC < 100 min
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), partialStake);
    await mentorStaking.connect(mentor).stake(partialStake);

    const isVerified = await mentorStaking.isVerified(mentor.address);
    assert.strictEqual(isVerified, false);
  });

  it("should allow mentor to stake in increments", async function () {
    const half = MIN_STAKE / 2n;
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(half);
    assert.strictEqual(await mentorStaking.isVerified(mentor.address), false);

    await mentorStaking.connect(mentor).stake(half);
    assert.strictEqual(await mentorStaking.isVerified(mentor.address), true);
  });

  // ── Unstaking ────────────────────────────────────────────────────

  it("should immediately lose verified status on unstake request", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);
    assert.strictEqual(await mentorStaking.isVerified(mentor.address), true);

    await mentorStaking.connect(mentor).requestUnstake();
    assert.strictEqual(await mentorStaking.isVerified(mentor.address), false);
  });

  it("should reject unstake before 7-day delay", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);
    await mentorStaking.connect(mentor).requestUnstake();

    await assert.rejects(
      mentorStaking.connect(mentor).unstake(),
      /UnstakeDelayNotReached/
    );
  });

  it("should reject unstake without prior request", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);

    await assert.rejects(
      mentorStaking.connect(mentor).unstake(),
      /UnstakeNotRequested/
    );
  });

  // ── Slashing ─────────────────────────────────────────────────────

  it("should allow authorized caller to slash mentor stake", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);

    // Set owner as authorized escrowRouter for test
    await mentorStaking.setEscrowRouter(owner.address);

    const slashAmount = 20n * 10n ** 6n; // 20 USDC
    const initialRecipientBal = await mockUsdc.balanceOf(slashRecipient.address);

    await mentorStaking.slash(mentor.address, slashAmount, slashRecipient.address);

    const newRecipientBal = await mockUsdc.balanceOf(slashRecipient.address);
    assert.strictEqual(newRecipientBal - initialRecipientBal, slashAmount);

    const stakeInfo = await mentorStaking.stakes(mentor.address);
    assert.strictEqual(stakeInfo.amount, MIN_STAKE - slashAmount);
  });

  it("should reject slash from unauthorized caller", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);

    await assert.rejects(
      mentorStaking.connect(unauthorized).slash(mentor.address, MIN_STAKE, slashRecipient.address),
      /Unauthorized/
    );
  });

  it("should slash up to available amount if slash > stake", async function () {
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), MIN_STAKE);
    await mentorStaking.connect(mentor).stake(MIN_STAKE);
    await mentorStaking.setEscrowRouter(owner.address);

    // Try to slash 200 USDC, only 100 available
    const over = 200n * 10n ** 6n;
    await mentorStaking.slash(mentor.address, over, slashRecipient.address);

    const stakeInfo = await mentorStaking.stakes(mentor.address);
    assert.strictEqual(stakeInfo.amount, 0n);
  });
});
