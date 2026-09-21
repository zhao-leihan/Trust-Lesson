const assert = require("assert");
const { ethers } = require("hardhat");

describe("Trust Lesson Escrow System", function () {
  let mockUsdc, escrowRouter, mentorStaking, reputationRegistry, videoAccess;
  let owner, mentor, learner, arbiter;

  beforeEach(async function () {
    [owner, mentor, learner, arbiter] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();

    // Transfer some USDC to learner and mentor
    await mockUsdc.mint(learner.address, 10_000 * 10 ** 6);
    await mockUsdc.mint(mentor.address, 10_000 * 10 ** 6);

    // 2. Deploy Contracts
    const Rep = await ethers.getContractFactory("ReputationRegistry");
    reputationRegistry = await Rep.deploy();

    const Staking = await ethers.getContractFactory("MentorStaking");
    mentorStaking = await Staking.deploy(await mockUsdc.getAddress());

    const Video = await ethers.getContractFactory("VideoAccess");
    videoAccess = await Video.deploy(await mockUsdc.getAddress());

    const Escrow = await ethers.getContractFactory("EscrowRouter");
    escrowRouter = await Escrow.deploy(await mockUsdc.getAddress(), arbiter.address);

    // 3. Permissions
    await reputationRegistry.setEscrowRouter(await escrowRouter.getAddress());
    await mentorStaking.setEscrowRouter(await escrowRouter.getAddress());
  });

  it("should create, fund, and complete an escrow session with milestone release", async function () {
    const milestones = [50 * 10 ** 6, 50 * 10 ** 6]; // 100 USDC total
    const subtotal = 100 * 10 ** 6;
    const fee = (subtotal * 700) / 10_000; // 7% = 7 USDC
    const total = subtotal + fee;

    // Learner approves USDC
    await mockUsdc.connect(learner).approve(await escrowRouter.getAddress(), total);

    // Create session
    const tx = await escrowRouter.connect(learner).createSession(mentor.address, milestones);
    await tx.wait();

    // Verify session
    const session = await escrowRouter.getSession(0);
    assert.strictEqual(session.learner, learner.address);
    assert.strictEqual(session.mentor, mentor.address);
    assert.strictEqual(session.totalAmount, BigInt(total));

    // Mentor starts session
    await escrowRouter.connect(mentor).startSession(0);

    // Learner confirms milestone 0
    const mentorInitialBal = await mockUsdc.balanceOf(mentor.address);
    await escrowRouter.connect(learner).confirmMilestone(0, 0);
    const mentorAfterMilestone1 = await mockUsdc.balanceOf(mentor.address);
    assert.strictEqual(mentorAfterMilestone1 - mentorInitialBal, BigInt(50 * 10 ** 6));

    // Learner confirms milestone 1
    await escrowRouter.connect(learner).confirmMilestone(0, 1);
    const finalSession = await escrowRouter.getSession(0);
    assert.strictEqual(Number(finalSession.status), 3); // Status.COMPLETED
  });

  it("should allow mentor to stake and get verified status", async function () {
    const stakeAmount = 100 * 10 ** 6; // 100 USDC min
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), stakeAmount);

    await mentorStaking.connect(mentor).stake(stakeAmount);
    const isVerified = await mentorStaking.isVerified(mentor.address);
    assert.strictEqual(isVerified, true);
  });
});
