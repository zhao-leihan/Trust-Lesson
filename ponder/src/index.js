import { ponder } from "@ponder/core";

/**
 * Trust Lesson — Ponder Event Handlers
 *
 * These handlers sync on-chain events to Ponder's built-in SQLite/PostgreSQL store.
 * Access via auto-generated REST API at http://localhost:42069
 *
 * Schema is auto-derived from the event args — no manual schema needed.
 * Handles re-orgs automatically.
 *
 * Start: npm run indexer:ponder
 */

// ─── EscrowRouter Events ─────────────────────────────────────────

ponder.on("EscrowRouter:SessionCreated", async ({ event, context }) => {
  const { sessionId, learner, mentor, totalAmount } = event.args;

  await context.db.Session.upsert({
    id: sessionId.toString(),
    create: {
      sessionId:   sessionId.toString(),
      learner:     learner.toLowerCase(),
      mentor:      mentor.toLowerCase(),
      totalAmount: totalAmount.toString(),
      status:      "FUNDED",
      createdAt:   BigInt(event.block.timestamp),
      txHashCreate: event.transaction.hash,
    },
    update: {},
  });
});

ponder.on("EscrowRouter:SessionStarted", async ({ event, context }) => {
  const { sessionId } = event.args;

  await context.db.Session.update({
    id: sessionId.toString(),
    data: { status: "IN_SESSION" },
  });
});

ponder.on("EscrowRouter:MilestoneReleased", async ({ event, context }) => {
  const { sessionId, index, amount } = event.args;

  // Upsert milestone record
  await context.db.Milestone.upsert({
    id: `${sessionId}-${index}`,
    create: {
      sessionId: sessionId.toString(),
      index:     Number(index),
      amount:    amount.toString(),
      status:    "RELEASED",
      releasedAt: BigInt(event.block.timestamp),
      txHash:    event.transaction.hash,
    },
    update: {
      status:    "RELEASED",
      releasedAt: BigInt(event.block.timestamp),
    },
  });
});

ponder.on("EscrowRouter:SessionCompleted", async ({ event, context }) => {
  const { sessionId } = event.args;

  await context.db.Session.update({
    id: sessionId.toString(),
    data: {
      status:      "COMPLETED",
      completedAt: BigInt(event.block.timestamp),
    },
  });
});

ponder.on("EscrowRouter:DisputeRaised", async ({ event, context }) => {
  const { sessionId, raisedBy, evidenceHash } = event.args;

  await context.db.Session.update({
    id: sessionId.toString(),
    data: { status: "DISPUTED" },
  });

  await context.db.Dispute.upsert({
    id: sessionId.toString(),
    create: {
      sessionId:    sessionId.toString(),
      raisedBy:     raisedBy.toLowerCase(),
      evidenceHash: evidenceHash,
      status:       "OPEN",
      raisedAt:     BigInt(event.block.timestamp),
    },
    update: {},
  });
});

ponder.on("EscrowRouter:DisputeResolved", async ({ event, context }) => {
  const { sessionId, releasePercent } = event.args;

  await context.db.Session.update({
    id: sessionId.toString(),
    data: { status: "RESOLVED" },
  });

  await context.db.Dispute.update({
    id: sessionId.toString(),
    data: {
      status:         "RESOLVED",
      releasePercent: Number(releasePercent),
      resolvedAt:     BigInt(event.block.timestamp),
    },
  });
});

ponder.on("EscrowRouter:SessionCancelled", async ({ event, context }) => {
  const { sessionId } = event.args;

  await context.db.Session.update({
    id: sessionId.toString(),
    data: { status: "CANCELLED" },
  });
});

// ─── VerifiableCredential Events ─────────────────────────────────

ponder.on("VerifiableCredential:CredentialIssued", async ({ event, context }) => {
  const { credentialId, subject, credType, sessionId, rating, skillNodeId, metadataCid } = event.args;

  await context.db.Credential.upsert({
    id: credentialId.toString(),
    create: {
      credentialId:  credentialId.toString(),
      subject:       subject.toLowerCase(),
      credType:      Number(credType), // 0=LEARNER_COMPLETION, 1=MENTOR_DELIVERY
      sessionId:     sessionId.toString(),
      rating:        Number(rating),
      skillNodeId:   skillNodeId,
      metadataCid:   metadataCid || "",
      issuedAt:      BigInt(event.block.timestamp),
      txHash:        event.transaction.hash,
    },
    update: {
      metadataCid: metadataCid || "",
    },
  });

  // Upsert subject stats for quick leaderboard queries
  const existing = await context.db.SubjectStats.findUnique({ id: subject.toLowerCase() });
  if (existing) {
    await context.db.SubjectStats.update({
      id: subject.toLowerCase(),
      data: {
        totalCredentials:   existing.totalCredentials + 1,
        totalRatingSum:     existing.totalRatingSum + Number(rating),
        lastCredentialAt:   BigInt(event.block.timestamp),
      },
    });
  } else {
    await context.db.SubjectStats.create({
      id: subject.toLowerCase(),
      data: {
        address:          subject.toLowerCase(),
        totalCredentials: 1,
        totalRatingSum:   Number(rating),
        lastCredentialAt: BigInt(event.block.timestamp),
      },
    });
  }
});

// ─── DisputeCouncil Events ────────────────────────────────────────

ponder.on("DisputeCouncil:CaseOpened", async ({ event, context }) => {
  const { caseId, sessionId, evidenceIpfsCid, deadline } = event.args;

  await context.db.DisputeCase.upsert({
    id: caseId.toString(),
    create: {
      caseId:          caseId.toString(),
      sessionId:       sessionId.toString(),
      evidenceIpfsCid: evidenceIpfsCid,
      deadline:        deadline,
      totalVotes:      0,
      resolved:        false,
      autoResolved:    false,
      openedAt:        BigInt(event.block.timestamp),
    },
    update: {},
  });
});

ponder.on("DisputeCouncil:VoteCast", async ({ event, context }) => {
  const { caseId, juror, releasePercent } = event.args;

  await context.db.DisputeVote.upsert({
    id: `${caseId}-${juror.toLowerCase()}`,
    create: {
      caseId:         caseId.toString(),
      juror:          juror.toLowerCase(),
      releasePercent: Number(releasePercent),
      votedAt:        BigInt(event.block.timestamp),
    },
    update: {
      releasePercent: Number(releasePercent),
    },
  });

  // Increment vote count on DisputeCase
  const c = await context.db.DisputeCase.findUnique({ id: caseId.toString() });
  if (c) {
    await context.db.DisputeCase.update({
      id: caseId.toString(),
      data: { totalVotes: c.totalVotes + 1 },
    });
  }
});

ponder.on("DisputeCouncil:CaseResolved", async ({ event, context }) => {
  const { caseId, sessionId, finalReleasePercent, autoResolved } = event.args;

  await context.db.DisputeCase.update({
    id: caseId.toString(),
    data: {
      resolved:            true,
      autoResolved:        autoResolved,
      finalReleasePercent: Number(finalReleasePercent),
      resolvedAt:          BigInt(event.block.timestamp),
    },
  });
});

// ─── MentorStaking Events ─────────────────────────────────────────

ponder.on("MentorStaking:Staked", async ({ event, context }) => {
  const { mentor, amount } = event.args;

  const existing = await context.db.MentorStake.findUnique({ id: mentor.toLowerCase() });
  if (existing) {
    await context.db.MentorStake.update({
      id: mentor.toLowerCase(),
      data: { totalStaked: (BigInt(existing.totalStaked) + amount).toString() },
    });
  } else {
    await context.db.MentorStake.create({
      id: mentor.toLowerCase(),
      data: {
        address:     mentor.toLowerCase(),
        totalStaked: amount.toString(),
        slashed:     "0",
        stakedAt:    BigInt(event.block.timestamp),
      },
    });
  }
});

ponder.on("MentorStaking:SlashApplied", async ({ event, context }) => {
  const { mentor, amount } = event.args;

  const existing = await context.db.MentorStake.findUnique({ id: mentor.toLowerCase() });
  if (existing) {
    const newSlashed = (BigInt(existing.slashed || "0") + amount).toString();
    await context.db.MentorStake.update({
      id: mentor.toLowerCase(),
      data: { slashed: newSlashed },
    });
  }
});

ponder.on("MentorStaking:Unstaked", async ({ event, context }) => {
  const { mentor, amount } = event.args;

  const existing = await context.db.MentorStake.findUnique({ id: mentor.toLowerCase() });
  if (existing) {
    const newStake = (BigInt(existing.totalStaked) - amount).toString();
    await context.db.MentorStake.update({
      id: mentor.toLowerCase(),
      data: { totalStaked: newStake },
    });
  }
});
