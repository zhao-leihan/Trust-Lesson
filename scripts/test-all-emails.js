import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import {
  sendWelcomeEmail,
  sendGigOrderReceiptEmail,
  sendMentorNewBookingEmail,
  sendChatNotificationEmail,
  sendNewAssignmentEmail,
  sendCertificateEmail,
  sendFeedbackThankYouEmail,
  sendDeadlineWarningEmail,
} from "../lib/mail.js";

const TARGET_EMAIL = "rayhanabbrar233@gmail.com";

async function runEmailTests() {
  console.log(`\n======================================================`);
  console.log(`Starting Resend Automated Email Tests`);
  console.log(`Target Recipient: ${TARGET_EMAIL}`);
  console.log(`API Key: ${process.env.RESEND_API_KEY ? "CONFIGURED" : "MISSING"}`);
  console.log(`======================================================\n`);

  const results = [];

  // Helper with delay to avoid rate limits
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. User Registration Email (Learner)
  try {
    console.log("1. Testing Welcome Email (Learner)...");
    const res = await sendWelcomeEmail({
      email: TARGET_EMAIL,
      name: "Rayhan Young",
      role: "LEARNER",
      walletAddress: "0x71C8417c8078972Ea0907dE44161f38986B79D89",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Welcome Email", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Welcome Email", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 2a. Gig Order Receipt for Learner
  try {
    console.log("2a. Testing Gig Order Receipt Email (Learner)...");
    const res = await sendGigOrderReceiptEmail({
      email: TARGET_EMAIL,
      learnerName: "Rayhan Young",
      mentorName: "Dr. Satoshi Developer",
      gigTitle: "Mastering Smart Contracts & DeFi Security on Arbitrum",
      orderId: "enr_9b72ec11-44cd",
      totalAmount: 150.0,
      sessionsCount: 3,
      durationMin: 60,
      txHash: "0x89abf10928374829384729384729384729384729384729384729384729384729",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Order Receipt", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Order Receipt", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 2b. Mentor Notification for New Booking
  try {
    console.log("2b. Testing New Booking Alert Email (Mentor)...");
    const res = await sendMentorNewBookingEmail({
      email: TARGET_EMAIL,
      mentorName: "Dr. Satoshi Developer",
      learnerName: "Rayhan Young",
      gigTitle: "Mastering Smart Contracts & DeFi Security on Arbitrum",
      orderId: "enr_9b72ec11-44cd",
      totalAmount: 150.0,
      sessionsCount: 3,
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Mentor Booking Alert", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Mentor Booking Alert", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 3. Incoming Chat Notification
  try {
    console.log("3. Testing Incoming Chat Notification Email...");
    const res = await sendChatNotificationEmail({
      recipientEmail: TARGET_EMAIL,
      recipientName: "Rayhan Young",
      senderName: "Dr. Satoshi Developer",
      messageSnippet: "Hey Rayhan! I reviewed your smart contract audit assignment. Let's schedule our 1-on-1 meeting tomorrow at 3 PM UTC.",
      chatUrl: "http://localhost:3000/dashboard/chat",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Chat Notification", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Chat Notification", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 4. Mentor Uploads Assignment Notification
  try {
    console.log("4. Testing New Assignment Notification Email...");
    const res = await sendNewAssignmentEmail({
      learnerEmail: TARGET_EMAIL,
      learnerName: "Rayhan Young",
      mentorName: "Dr. Satoshi Developer",
      gigTitle: "Mastering Smart Contracts & DeFi Security on Arbitrum",
      taskTitle: "Module 2: Implement Reentrancy Guard & Invariant Testing",
      instructions: "Clone the provided repo, write unit tests catching the vulnerability in Vault.sol, and submit your GitHub PR link or PDF summary.",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      classroomUrl: "http://localhost:3000/dashboard/classes/enr_9b72ec11-44cd",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "New Assignment Alert", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "New Assignment Alert", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 5. Course Completion Certificate with Attached PDF
  try {
    console.log("5. Testing Course Completion & Certificate Email (with PDF attachment)...");
    const res = await sendCertificateEmail({
      learnerEmail: TARGET_EMAIL,
      learnerName: "Rayhan Young",
      mentorName: "Dr. Satoshi Developer",
      gigTitle: "Mastering Smart Contracts & DeFi Security on Arbitrum",
      certificateId: "TL-CERT-ARBITRUM-2026-0042",
      certificateUrl: "http://localhost:3000/certificate/TL-CERT-ARBITRUM-2026-0042",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Certificate with PDF", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Certificate with PDF", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 6. Feedback & Review Thank You Email
  try {
    console.log("6. Testing Feedback Thank You Email...");
    const res = await sendFeedbackThankYouEmail({
      userEmail: TARGET_EMAIL,
      userName: "Rayhan Young",
      gigTitle: "Mastering Smart Contracts & DeFi Security on Arbitrum",
      rating: 5,
      feedbackComment: "Phenomenal mentorship! The live debugging and reentrancy examples were top tier.",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Feedback Thank You", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Feedback Thank You", status: "FAILED", error: e.message });
  }

  await wait(800);

  // 7. Approaching Deadline Warning Email
  try {
    console.log("7. Testing Deadline Alert Email...");
    const res = await sendDeadlineWarningEmail({
      recipientEmail: TARGET_EMAIL,
      recipientName: "Rayhan Young",
      taskTitle: "Module 2: Implement Reentrancy Guard & Invariant Testing",
      gigTitle: "Mastering Smart Contracts & DeFi Security on Arbitrum",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 1,
      classroomUrl: "http://localhost:3000/dashboard/classes/enr_9b72ec11-44cd",
    });
    console.log("   Result:", res.error ? `FAILED: ${res.error.message}` : `SENT (ID: ${res.data?.id})`);
    results.push({ test: "Deadline Alert", status: res.error ? "FAILED" : "SUCCESS", id: res.data?.id });
  } catch (e) {
    console.error("   Error:", e.message);
    results.push({ test: "Deadline Alert", status: "FAILED", error: e.message });
  }

  console.log("\n======================================================");
  console.log("Test Summary:");
  console.table(results);
  console.log("======================================================\n");
}

runEmailTests().catch(console.error);
