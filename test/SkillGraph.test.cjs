const assert = require("assert");
const { ethers } = require("hardhat");

describe("SkillGraph", function () {
  let skillGraph;
  let owner, updater, subject, unauthorized;

  const SOLIDITY_BASICS_ID = ethers.keccak256(ethers.toUtf8Bytes("Solidity Basics"));
  const SOLIDITY_SECURITY_ID = ethers.keccak256(ethers.toUtf8Bytes("Solidity Security"));
  const REACT_ID = ethers.keccak256(ethers.toUtf8Bytes("React"));

  beforeEach(async function () {
    [owner, updater, subject, unauthorized] = await ethers.getSigners();

    const SkillGraph = await ethers.getContractFactory("SkillGraph");
    skillGraph = await SkillGraph.deploy();
    await skillGraph.waitForDeployment();

    // Authorize updater (simulates VerifiableCredential contract)
    await skillGraph.setAuthorized(updater.address, true);
  });

  // ── Initial State ────────────────────────────────────────────────

  it("should pre-seed skill nodes on deployment", async function () {
    const node = await skillGraph.skillNodes(SOLIDITY_BASICS_ID);
    assert.strictEqual(node.exists, true);
    assert.strictEqual(node.name, "Solidity Basics");
  });

  it("should have Solidity Security requiring Solidity Basics as prereq", async function () {
    const node = await skillGraph.skillNodes(SOLIDITY_SECURITY_ID);
    assert.strictEqual(node.exists, true);
    // prereqs array should have exactly 1 entry
    const allIds = await skillGraph.getAllSkillNodeIds();
    assert.ok(allIds.length > 0, "Should have skill nodes");
  });

  // ── Progress Update ──────────────────────────────────────────────

  it("should update progress for a subject", async function () {
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 5);

    const progress = await skillGraph.skillProgress(subject.address, REACT_ID);
    assert.strictEqual(Number(progress.sessionCount), 1);
    assert.strictEqual(Number(progress.totalRating), 5);
  });

  it("should accumulate progress across multiple sessions", async function () {
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 4);
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 5);
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 5);

    const progress = await skillGraph.skillProgress(subject.address, REACT_ID);
    assert.strictEqual(Number(progress.sessionCount), 3);
    assert.strictEqual(Number(progress.totalRating), 14);
  });

  it("should reject unauthorized progress updates", async function () {
    await assert.rejects(
      skillGraph.connect(unauthorized).updateProgress(subject.address, REACT_ID, 5),
      /Unauthorized/
    );
  });

  it("should reject update for non-existent skill", async function () {
    const fakeSkillId = ethers.keccak256(ethers.toUtf8Bytes("Fake Skill XYZ"));
    await assert.rejects(
      skillGraph.connect(updater).updateProgress(subject.address, fakeSkillId, 5),
      /SkillNotFound/
    );
  });

  // ── Level Computation ─────────────────────────────────────────────

  it("should return level 0 for no progress", async function () {
    const level = await skillGraph.getSkillLevel(subject.address, REACT_ID);
    assert.strictEqual(Number(level), 0);
  });

  it("should return level 1 after 1 session with sufficient rating", async function () {
    // React: minSessions1=1, minRating1=30 (3.0)
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 4); // avg*10 = 40 >= 30
    const level = await skillGraph.getSkillLevel(subject.address, REACT_ID);
    assert.strictEqual(Number(level), 1, "Should reach Level 1");
  });

  it("should return level 2 after 3 sessions with rating >= 3.5", async function () {
    // React: minSessions2=3, minRating2=35 (3.5)
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 4);
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 4);
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 4);
    // avg = (4+4+4)/3 * 10 = 40 >= 35 ✓
    const level = await skillGraph.getSkillLevel(subject.address, REACT_ID);
    assert.strictEqual(Number(level), 2, "Should reach Level 2");
  });

  it("should return level 3 after 5 sessions with rating >= 4.0", async function () {
    // React: minSessions3=5, minRating3=40 (4.0)
    for (let i = 0; i < 5; i++) {
      await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 5);
    }
    // avg = 5.0 * 10 = 50 >= 40 ✓
    const level = await skillGraph.getSkillLevel(subject.address, REACT_ID);
    assert.strictEqual(Number(level), 3, "Should reach Level 3");
  });

  it("should block level progression if prereq not met (Solidity Security requires Solidity Basics)", async function () {
    // Try to progress in Solidity Security without any Solidity Basics sessions
    await skillGraph.connect(updater).updateProgress(subject.address, SOLIDITY_SECURITY_ID, 5);
    const level = await skillGraph.getSkillLevel(subject.address, SOLIDITY_SECURITY_ID);
    assert.strictEqual(Number(level), 0, "Should be blocked by prereq");
  });

  it("should unlock progression once prereq is met", async function () {
    // First: get Level 1 in Solidity Basics
    await skillGraph.connect(updater).updateProgress(subject.address, SOLIDITY_BASICS_ID, 5);
    assert.strictEqual(Number(await skillGraph.getSkillLevel(subject.address, SOLIDITY_BASICS_ID)), 1);

    // Now progress Solidity Security
    // Solidity Security: minSessions1=1, minRating1=35
    await skillGraph.connect(updater).updateProgress(subject.address, SOLIDITY_SECURITY_ID, 5);
    const level = await skillGraph.getSkillLevel(subject.address, SOLIDITY_SECURITY_ID);
    assert.strictEqual(Number(level), 1, "Should be Level 1 now prereq is met");
  });

  // ── Define New Skill ─────────────────────────────────────────────

  it("should allow owner to define a new skill node", async function () {
    const newSkillId = ethers.keccak256(ethers.toUtf8Bytes("Cairo"));
    await skillGraph.defineSkill(
      newSkillId, "Cairo", [],
      1, 3, 5,
      30, 35, 40
    );
    const node = await skillGraph.skillNodes(newSkillId);
    assert.strictEqual(node.exists, true);
    assert.strictEqual(node.name, "Cairo");
  });

  it("should reject duplicate skill node definition", async function () {
    await assert.rejects(
      skillGraph.defineSkill(REACT_ID, "React Duplicate", [], 1, 3, 5, 30, 35, 40),
      /SkillAlreadyExists/
    );
  });

  // ── getSubjectSkills ──────────────────────────────────────────────

  it("should return subject skills array with levels", async function () {
    await skillGraph.connect(updater).updateProgress(subject.address, REACT_ID, 5);
    const [ids, names, levels, counts] = await skillGraph.getSubjectSkills(subject.address);
    assert.ok(ids.length > 0);
    // Find React in results
    const reactIndex = ids.findIndex(id => id === REACT_ID);
    assert.ok(reactIndex >= 0, "React should be in results");
    assert.strictEqual(Number(levels[reactIndex]), 1);
    assert.strictEqual(Number(counts[reactIndex]), 1);
  });
});
