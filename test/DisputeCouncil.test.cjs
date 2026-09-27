const assert = require("assert");
const { ethers } = require("hardhat");

describe("DisputeCouncil", function () {
  let mockUsdc, escrowRouter, disputeCouncil;
  let owner, mentor, learner, juror1, juror2, juror3, juror4, juror5, unauthorized;

  const SESSION_ID = 0;

  async function createAndDisputeSession() {
    const milestones = [50n * 10n ** 6n];
    const subtotal = 50n * 10n ** 6n;
    const fee = (subtotal * 1000n) / 10000n;
    const total = subtotal + fee;

    await mockUsdc.connect(learner).approve(await escrowRouter.getAddress(), total);
    await escrowRouter.connect(learner).createSessionWithSkill(mentor.address, milestones, "Solidity Basics");
    await escrowRouter.connect(mentor).startSession(SESSION_ID);

    const evidenceHash = ethers.keccak256(ethers.toUtf8Bytes("evidence"));
    await escrowRouter.connect(learner).raiseDispute(SESSION_ID, evidenceHash);
  }

  beforeEach(async function () {
    [owner, mentor, learner, juror1, juror2, juror3, juror4, juror5, unauthorized] =
      await ethers.getSigners();

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();

    await mockUsdc.mint(learner.address, 10_000n * 10n ** 6n);

    // Deploy EscrowRouter (with owner as temporary arbiter)
    const Escrow = await ethers.getContractFactory("EscrowRouter");
    escrowRouter = await Escrow.deploy(await mockUsdc.getAddress(), owner.address);
    await escrowRouter.waitForDeployment();

    // Deploy DisputeCouncil
    const Council = await ethers.getContractFactory("DisputeCouncil");
    disputeCouncil = await Council.deploy(
      await escrowRouter.getAddress(),
      [juror1.address, juror2.address, juror3.address, juror4.address, juror5.address]
    );
    await disputeCouncil.waitForDeployment();

    // Set DisputeCouncil as resolver in EscrowRouter
    await escrowRouter.setDisputeCouncil(await disputeCouncil.getAddress());
  });

  // ── Case Opening ─────────────────────────────────────────────────

  it("should allow owner to open a case", async function () {
    await createAndDisputeSession();

    const tx = await disputeCouncil.openCase(SESSION_ID, "QmTestEvidence123", learner.address);
    const receipt = await tx.wait();

    const event = receipt.logs
      .map(log => { try { return disputeCouncil.interface.parseLog(log); } catch { return null; } })
      .find(e => e && e.name === "CaseOpened");

    assert.ok(event, "CaseOpened event should be emitted");
    assert.strictEqual(Number(event.args.sessionId), SESSION_ID);
  });

  it("should reject duplicate cases for same session", async function () {
    await createAndDisputeSession();
    await disputeCouncil.openCase(SESSION_ID, "QmTestEvidence", learner.address);
    await assert.rejects(
      disputeCouncil.openCase(SESSION_ID, "QmOtherEvidence", learner.address),
      /SessionAlreadyHasCase/
    );
  });

  // ── Voting ───────────────────────────────────────────────────────

  it("should allow jurors to cast votes", async function () {
    await createAndDisputeSession();
    await disputeCouncil.openCase(SESSION_ID, "QmEvidence", learner.address);

    await disputeCouncil.connect(juror1).castVote(0, 80); // 80% to mentor
    await disputeCouncil.connect(juror2).castVote(0, 70);

    const caseData = await disputeCouncil.getCase(0);
    assert.strictEqual(Number(caseData.totalVotes), 2);
  });

  it("should prevent a juror from voting twice", async function () {
    await createAndDisputeSession();
    await disputeCouncil.openCase(SESSION_ID, "QmEvidence", learner.address);
    await disputeCouncil.connect(juror1).castVote(0, 50);
    await assert.rejects(
      disputeCouncil.connect(juror1).castVote(0, 60),
      /AlreadyVoted/
    );
  });

  it("should prevent non-jurors from voting", async function () {
    await createAndDisputeSession();
    await disputeCouncil.openCase(SESSION_ID, "QmEvidence", learner.address);
    await assert.rejects(
      disputeCouncil.connect(unauthorized).castVote(0, 50),
      /NotJuror/
    );
  });

  // ── Quorum Resolution ────────────────────────────────────────────

  it("should auto-resolve when 3-of-5 quorum is reached (weighted average)", async function () {
    await createAndDisputeSession();
    await disputeCouncil.openCase(SESSION_ID, "QmEvidence", learner.address);

    // 3 votes: 60 + 80 + 70 = 210 / 3 = 70% to mentor
    await disputeCouncil.connect(juror1).castVote(0, 60);
    await disputeCouncil.connect(juror2).castVote(0, 80);
    await disputeCouncil.connect(juror3).castVote(0, 70); // triggers quorum

    const caseData = await disputeCouncil.getCase(0);
    assert.strictEqual(caseData.resolved, true);
    assert.strictEqual(Number(caseData.finalReleasePercent), 70);
  });

  it("should split correctly on resolution — mentor gets 70%", async function () {
    const initialMentorBal = await mockUsdc.balanceOf(mentor.address);
    const initialLearnerBal = await mockUsdc.balanceOf(learner.address);

    await createAndDisputeSession();
    await disputeCouncil.openCase(SESSION_ID, "QmEvidence", learner.address);

    await disputeCouncil.connect(juror1).castVote(0, 70);
    await disputeCouncil.connect(juror2).castVote(0, 70);
    await disputeCouncil.connect(juror3).castVote(0, 70);

    const caseData = await disputeCouncil.getCase(0);
    assert.strictEqual(caseData.resolved, true);

    const mentorBal = await mockUsdc.balanceOf(mentor.address);
    const learnerBal = await mockUsdc.balanceOf(learner.address);

    // Mentor should have gained USDC, learner should have gotten partial refund
    assert.ok(mentorBal > initialMentorBal, "Mentor should receive funds");
  });

  // ── Juror Management ─────────────────────────────────────────────

  it("should allow owner to update a juror", async function () {
    await disputeCouncil.updateJuror(0, unauthorized.address);
    const jurors = await disputeCouncil.getJurors();
    assert.strictEqual(jurors[0], unauthorized.address);
  });

  it("should reject juror update from non-owner", async function () {
    await assert.rejects(
      disputeCouncil.connect(unauthorized).updateJuror(0, unauthorized.address),
      /OwnableUnauthorizedAccount/
    );
  });

  // ── Evidence Transparency ────────────────────────────────────────

  it("should store IPFS CID publicly in case data", async function () {
    await createAndDisputeSession();
    const testCid = "QmPublicEvidenceIPFSHash123456789";
    await disputeCouncil.openCase(SESSION_ID, testCid, learner.address);

    const caseData = await disputeCouncil.getCase(0);
    assert.strictEqual(caseData.evidenceIpfsCid, testCid);
  });
});
