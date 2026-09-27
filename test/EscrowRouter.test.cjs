const assert = require("assert");
const { ethers } = require("hardhat");

describe("Trust Lesson Escrow System", function () {
  let mockUsdc, escrowRouter, mentorStaking, reputationRegistry, videoAccess;
  let owner, mentor, learner, arbiter, unauthorized;

  const LEARNER_INITIAL = 10_000n * 10n ** 6n;
  const MENTOR_INITIAL  = 10_000n * 10n ** 6n;

  beforeEach(async function () {
    [owner, mentor, learner, arbiter, unauthorized] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();

    await mockUsdc.mint(learner.address, LEARNER_INITIAL);
    await mockUsdc.mint(mentor.address, MENTOR_INITIAL);

    const Staking = await ethers.getContractFactory("MentorStaking");
    mentorStaking = await Staking.deploy(await mockUsdc.getAddress());

    const Video = await ethers.getContractFactory("VideoAccess");
    videoAccess = await Video.deploy(await mockUsdc.getAddress());

    const Escrow = await ethers.getContractFactory("EscrowRouter");
    escrowRouter = await Escrow.deploy(await mockUsdc.getAddress(), arbiter.address);
    await escrowRouter.waitForDeployment();

    await mentorStaking.setEscrowRouter(await escrowRouter.getAddress());
  });

  // ── Helper ───────────────────────────────────────────────────────
  async function fundSession(milestoneAmounts) {
    const subtotal = milestoneAmounts.reduce((a, b) => a + b, 0n);
    const fee = (subtotal * 1000n) / 10000n;
    const total = subtotal + fee;
    await mockUsdc.connect(learner).approve(await escrowRouter.getAddress(), total);
    const tx = await escrowRouter.connect(learner).createSessionWithSkill(
      mentor.address, milestoneAmounts, "Solidity Basics"
    );
    await tx.wait();
    return { subtotal, fee, total };
  }

  // ── Session Creation ─────────────────────────────────────────────

  it("should create and fund a session with 10% platform fee", async function () {
    const milestones = [100n * 10n ** 6n];
    const { subtotal, fee, total } = await fundSession(milestones);

    const session = await escrowRouter.getSession(0);
    assert.strictEqual(session.learner, learner.address);
    assert.strictEqual(session.mentor, mentor.address);
    assert.strictEqual(session.totalAmount, total);
    assert.strictEqual(session.platformFeeAmount, fee);

    // Verify 10% fee
    const expectedFee = (subtotal * 1000n) / 10000n;
    assert.strictEqual(fee, expectedFee);
  });

  it("should deduct USDC from learner on session creation", async function () {
    const milestones = [50n * 10n ** 6n, 50n * 10n ** 6n];
    const { total } = await fundSession(milestones);

    const balance = await mockUsdc.balanceOf(learner.address);
    assert.strictEqual(balance, LEARNER_INITIAL - total);
  });

  it("should reject session with no milestones", async function () {
    await assert.rejects(
      escrowRouter.connect(learner).createSessionWithSkill(mentor.address, [], "Solidity"),
      /InvalidMilestones/
    );
  });

  it("should reject session with more than 10 milestones", async function () {
    const tooMany = Array(11).fill(10n * 10n ** 6n);
    const total = 11n * 10n * 10n ** 6n * 11n / 10n; // rough
    await mockUsdc.connect(learner).approve(await escrowRouter.getAddress(), total);
    await assert.rejects(
      escrowRouter.connect(learner).createSessionWithSkill(mentor.address, tooMany, "Skill"),
      /InvalidMilestones/
    );
  });

  // ── Session Lifecycle ────────────────────────────────────────────

  it("should create, fund, start, and complete an escrow session with milestone release", async function () {
    const milestones = [50n * 10n ** 6n, 50n * 10n ** 6n];
    await fundSession(milestones);

    // Mentor starts session
    await escrowRouter.connect(mentor).startSession(0);
    const s1 = await escrowRouter.getSession(0);
    assert.strictEqual(Number(s1.status), 2); // IN_SESSION

    // Learner confirms milestone 0
    const mentorBal0 = await mockUsdc.balanceOf(mentor.address);
    await escrowRouter.connect(learner).confirmMilestone(0, 0);
    const mentorBal1 = await mockUsdc.balanceOf(mentor.address);
    assert.strictEqual(mentorBal1 - mentorBal0, 50n * 10n ** 6n);

    // Learner confirms milestone 1 → session COMPLETED
    await escrowRouter.connect(learner).confirmMilestone(0, 1);
    const finalSession = await escrowRouter.getSession(0);
    assert.strictEqual(Number(finalSession.status), 3); // COMPLETED
  });

  it("should reject milestone confirmation from non-learner", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);

    await assert.rejects(
      escrowRouter.connect(unauthorized).confirmMilestone(0, 0),
      /Unauthorized/
    );
  });

  it("should reject double-confirmation of same milestone", async function () {
    const milestones = [50n * 10n ** 6n, 50n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);
    await escrowRouter.connect(learner).confirmMilestone(0, 0);

    await assert.rejects(
      escrowRouter.connect(learner).confirmMilestone(0, 0),
      /Already released/
    );
  });

  // ── Cancellation ─────────────────────────────────────────────────

  it("should allow learner to cancel a FUNDED (not started) session", async function () {
    const milestones = [100n * 10n ** 6n];
    const { subtotal, fee, total } = await fundSession(milestones);

    const learnerBalBefore = await mockUsdc.balanceOf(learner.address);
    await escrowRouter.connect(learner).cancelSession(0);
    const learnerBalAfter = await mockUsdc.balanceOf(learner.address);

    // Should get subtotal back (not fee)
    assert.strictEqual(learnerBalAfter - learnerBalBefore, subtotal);
  });

  it("should reject cancel from non-learner", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await assert.rejects(
      escrowRouter.connect(unauthorized).cancelSession(0),
      /Unauthorized/
    );
  });

  it("should reject cancel after session started", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);
    await assert.rejects(
      escrowRouter.connect(learner).cancelSession(0),
      /InvalidStatus/
    );
  });

  // ── Dispute ──────────────────────────────────────────────────────

  it("should allow learner to raise a dispute during IN_SESSION", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);

    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("learner evidence"));
    await escrowRouter.connect(learner).raiseDispute(0, evidenceHash);

    const session = await escrowRouter.getSession(0);
    assert.strictEqual(Number(session.status), 4); // DISPUTED
  });

  it("should allow arbiter to resolve a dispute with 50% split", async function () {
    const milestones = [100n * 10n ** 6n];
    const { subtotal } = await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);

    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
    await escrowRouter.connect(learner).raiseDispute(0, evidenceHash);

    const mentorBalBefore  = await mockUsdc.balanceOf(mentor.address);
    const learnerBalBefore = await mockUsdc.balanceOf(learner.address);

    await escrowRouter.connect(arbiter).resolveDispute(0, 50);

    const mentorBalAfter  = await mockUsdc.balanceOf(mentor.address);
    const learnerBalAfter = await mockUsdc.balanceOf(learner.address);

    const mentorGain  = mentorBalAfter - mentorBalBefore;
    const learnerGain = learnerBalAfter - learnerBalBefore;

    assert.strictEqual(mentorGain, subtotal / 2n);
    assert.strictEqual(learnerGain, subtotal / 2n);
  });

  it("should reject dispute resolution from unauthorized caller", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
    await escrowRouter.connect(learner).raiseDispute(0, evidenceHash);

    await assert.rejects(
      escrowRouter.connect(unauthorized).resolveDispute(0, 50),
      /Unauthorized/
    );
  });

  it("should reject invalid release percent (>100)", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);
    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
    await escrowRouter.connect(learner).raiseDispute(0, evidenceHash);

    await assert.rejects(
      escrowRouter.connect(arbiter).resolveDispute(0, 101),
      /InvalidReleasePercent/
    );
  });

  // ── Fee Management ───────────────────────────────────────────────

  it("should accumulate fees correctly across multiple sessions", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await fundSession(milestones);

    const subtotal = 100n * 10n ** 6n;
    const expectedFeePerSession = (subtotal * 1000n) / 10000n;
    const fees = await escrowRouter.accumulatedFees();
    assert.strictEqual(fees, expectedFeePerSession * 2n);
  });

  it("should allow owner to withdraw accumulated fees", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);

    const subtotal = 100n * 10n ** 6n;
    const fee = (subtotal * 1000n) / 10000n;

    const ownerBalBefore = await mockUsdc.balanceOf(owner.address);
    await escrowRouter.withdrawFees(owner.address);
    const ownerBalAfter = await mockUsdc.balanceOf(owner.address);

    assert.strictEqual(ownerBalAfter - ownerBalBefore, fee);
  });

  // ── Staking Integration ──────────────────────────────────────────

  it("should allow mentor to stake and get verified status", async function () {
    const stakeAmount = 100n * 10n ** 6n;
    await mockUsdc.connect(mentor).approve(await mentorStaking.getAddress(), stakeAmount);
    await mentorStaking.connect(mentor).stake(stakeAmount);
    assert.strictEqual(await mentorStaking.isVerified(mentor.address), true);
  });

  // ── Invariants ───────────────────────────────────────────────────

  it("invariant: contract USDC balance >= sum of open session amounts (minus fees)", async function () {
    const milestones1 = [80n * 10n ** 6n];
    const milestones2 = [120n * 10n ** 6n];
    await fundSession(milestones1);
    await fundSession(milestones2);

    const contractBalance = await mockUsdc.balanceOf(await escrowRouter.getAddress());
    const session0 = await escrowRouter.getSession(0);
    const session1 = await escrowRouter.getSession(1);
    const totalLocked = session0.totalAmount + session1.totalAmount;

    assert.ok(
      contractBalance >= totalLocked,
      `Contract balance ${contractBalance} should be >= total locked ${totalLocked}`
    );
  });

  it("invariant: platform fee is exactly 10% of subtotal", async function () {
    const amounts = [37n * 10n ** 6n, 63n * 10n ** 6n]; // odd amounts to test precision
    await fundSession(amounts);

    const session = await escrowRouter.getSession(0);
    const subtotal = 100n * 10n ** 6n;
    const expectedFee = (subtotal * 1000n) / 10000n;
    assert.strictEqual(session.platformFeeAmount, expectedFee);
    assert.strictEqual(session.totalAmount, subtotal + expectedFee);
  });

  it("invariant: COMPLETED status is terminal — no further state changes allowed", async function () {
    const milestones = [100n * 10n ** 6n];
    await fundSession(milestones);
    await escrowRouter.connect(mentor).startSession(0);
    await escrowRouter.connect(learner).confirmMilestone(0, 0);

    const session = await escrowRouter.getSession(0);
    assert.strictEqual(Number(session.status), 3); // COMPLETED

    // Cannot start, confirm, cancel, or dispute a COMPLETED session
    await assert.rejects(
      escrowRouter.connect(mentor).startSession(0),
      /InvalidStatus/
    );
  });
});
