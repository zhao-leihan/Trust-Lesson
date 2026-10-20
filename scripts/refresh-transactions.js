import { prisma } from "../lib/prisma.js";

async function refreshTransactionData() {
  console.log("Starting clean refresh of transaction, meeting, and escrow records...");

  try {
    // 1. Delete dependent meeting participants & meetings
    await prisma.meetingParticipant.deleteMany({});
    console.log("Cleared meeting participants");

    await prisma.meeting.deleteMany({});
    console.log("Cleared meetings");

    // 2. Delete task submissions & task assignments
    await prisma.taskSubmission.deleteMany({});
    console.log("Cleared task submissions");

    await prisma.taskAssignment.deleteMany({});
    console.log("Cleared task assignments");

    // 3. Delete quota ledgers & learner availability windows
    await prisma.quotaLedger.deleteMany({});
    console.log("Cleared quota ledgers");

    await prisma.learnerAvailabilityWindow.deleteMany({});
    console.log("Cleared availability windows");

    // 4. Delete certificates, feedbacks, reviews
    await prisma.certificate.deleteMany({});
    console.log("Cleared certificates");

    await prisma.feedback.deleteMany({});
    console.log("Cleared feedbacks");

    await prisma.review.deleteMany({});
    console.log("Cleared reviews");

    // 5. Delete milestones, disputes, video purchases
    await prisma.milestone.deleteMany({});
    console.log("Cleared milestones");

    await prisma.dispute.deleteMany({});
    console.log("Cleared disputes");

    await prisma.videoPurchase.deleteMany({});
    console.log("Cleared video purchases");

    // 6. Delete chat messages, chat participants, and chat threads
    await prisma.chatMessage.deleteMany({});
    await prisma.chatParticipant.deleteMany({});
    await prisma.chatThread.deleteMany({});
    console.log("Cleared chat threads and messages");

    // 7. Delete notifications
    await prisma.notification.deleteMany({});
    console.log("Cleared notifications");

    // 8. Delete enrollments
    await prisma.enrollment.deleteMany({});
    console.log("Cleared enrollments");

    // 9. Delete sessions
    await prisma.session.deleteMany({});
    console.log("Cleared sessions");

    console.log("Transaction and escrow state successfully refreshed to a clean state for mainnet testing!");
    process.exit(0);
  } catch (err) {
    console.error("Error refreshing data:", err);
    process.exit(1);
  }
}

refreshTransactionData();
