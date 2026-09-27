const assert = require("assert");
const { ethers } = require("hardhat");

describe("VerifiableCredential", function () {
  let mockUsdc, skillGraph, verifiableCredential;
  let owner, mentor, learner, arbiter, unauthorized;

  beforeEach(async function () {
    [owner, mentor, learner, arbiter, unauthorized] = await ethers.getSigners();

    // Deploy SkillGraph
    const SkillGraph = await ethers.getContractFactory("SkillGraph");
    skillGraph = await SkillGraph.deploy();
    await skillGraph.waitForDeployment();

    // Deploy VerifiableCredential
    const VC = await ethers.getContractFactory("VerifiableCredential");
    verifiableCredential = await VC.deploy(await skillGraph.getAddress());
    await verifiableCredential.waitForDeployment();

    // Authorize VerifiableCredential to update SkillGraph
    await skillGraph.setAuthorized(await verifiableCredential.getAddress(), true);

    // Authorize owner to issue credentials directly (for testing)
    await verifiableCredential.setAuthorized(owner.address, true);
  });

  // ── Issuance ─────────────────────────────────────────────────────

  it("should issue composite credentials to both learner and mentor", async function () {
    const sessionId = 1;
    const rating = 5;
    const skillTag = "Solidity Basics";

    const tx = await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, sessionId, rating, skillTag
    );
    const receipt = await tx.wait();

    // Two credentials should be emitted (one for learner, one for mentor)
    const events = receipt.logs
      .map(log => {
        try { return verifiableCredential.interface.parseLog(log); } catch { return null; }
      })
      .filter(e => e && e.name === "CredentialIssued");

    assert.strictEqual(events.length, 2, "Should emit 2 CredentialIssued events");

    // Check credential types
    const credTypes = events.map(e => Number(e.args.credType));
    assert.ok(credTypes.includes(0), "Should include LEARNER_COMPLETION (0)");
    assert.ok(credTypes.includes(1), "Should include MENTOR_DELIVERY (1)");
  });

  it("should store learner credential correctly", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 4, "React"
    );

    const learnerCreds = await verifiableCredential.getCredentials(learner.address);
    assert.strictEqual(learnerCreds.length, 1);

    const cred = await verifiableCredential.credentials(learnerCreds[0]);
    assert.strictEqual(cred.subject, learner.address);
    assert.strictEqual(Number(cred.credType), 0); // LEARNER_COMPLETION
    assert.strictEqual(Number(cred.rating), 4);
  });

  it("should store mentor credential correctly", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 5, "Solidity Basics"
    );

    const mentorCreds = await verifiableCredential.getCredentials(mentor.address);
    assert.strictEqual(mentorCreds.length, 1);

    const cred = await verifiableCredential.credentials(mentorCreds[0]);
    assert.strictEqual(cred.subject, mentor.address);
    assert.strictEqual(Number(cred.credType), 1); // MENTOR_DELIVERY
  });

  it("should reject rating out of range", async function () {
    await assert.rejects(
      verifiableCredential.issueCompositeCredential(mentor.address, learner.address, 1, 6, "Solidity"),
      /InvalidRating/
    );
    await assert.rejects(
      verifiableCredential.issueCompositeCredential(mentor.address, learner.address, 1, 0, "Solidity"),
      /InvalidRating/
    );
  });

  it("should prevent duplicate credentials for same session", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 42, 5, "DeFi Architecture"
    );
    await assert.rejects(
      verifiableCredential.issueCompositeCredential(
        mentor.address, learner.address, 42, 4, "DeFi Architecture"
      ),
      /AlreadyIssued/
    );
  });

  it("should reject unauthorized callers", async function () {
    await assert.rejects(
      verifiableCredential.connect(unauthorized).issueCompositeCredential(
        mentor.address, learner.address, 1, 5, "Solidity"
      ),
      /Unauthorized/
    );
  });

  // ── EIP-712 Digest ───────────────────────────────────────────────

  it("should produce a non-zero EIP-712 digest", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 5, "Solidity Basics"
    );
    const learnerCreds = await verifiableCredential.getCredentials(learner.address);
    const digest = await verifiableCredential.getCredentialDigest(learnerCreds[0]);
    assert.notStrictEqual(digest, ethers.ZeroHash, "Digest should not be zero");
  });

  it("should produce different digests for different credentials", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 5, "Solidity Basics"
    );
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 2, 4, "React"
    );

    const learnerCreds = await verifiableCredential.getCredentials(learner.address);
    const digest1 = await verifiableCredential.getCredentialDigest(learnerCreds[0]);
    const digest2 = await verifiableCredential.getCredentialDigest(learnerCreds[1]);
    assert.notStrictEqual(digest1, digest2, "Digests should be unique");
  });

  // ── Aggregate Rating ─────────────────────────────────────────────

  it("should compute correct aggregate rating", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 4, "Solidity Basics"
    );
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 2, 5, "Solidity Basics"
    );

    const [avgRating, count] = await verifiableCredential.getAggregateRating(mentor.address);
    assert.strictEqual(Number(count), 2);
    assert.strictEqual(Number(avgRating), 45); // (4+5)/2 * 10 = 45
  });

  // ── IPFS CID update ──────────────────────────────────────────────

  it("should allow authorized caller to update IPFS metadata CID", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 5, "Solidity Basics"
    );
    const learnerCreds = await verifiableCredential.getCredentials(learner.address);
    const credId = learnerCreds[0];

    const testCid = "QmTestCID1234567890";
    await verifiableCredential.setMetadataCid(credId, testCid);

    const cred = await verifiableCredential.credentials(credId);
    assert.strictEqual(cred.metadataCid, testCid);
  });

  it("should reject unauthorized CID update", async function () {
    await verifiableCredential.issueCompositeCredential(
      mentor.address, learner.address, 1, 5, "Solidity Basics"
    );
    const learnerCreds = await verifiableCredential.getCredentials(learner.address);

    await assert.rejects(
      verifiableCredential.connect(unauthorized).setMetadataCid(learnerCreds[0], "QmFake"),
      /Unauthorized/
    );
  });
});
