import { Resend } from "resend";
import PDFDocument from "pdfkit";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Trust Lesson <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LOGO_URL = "https://raw.githubusercontent.com/zhao-leihan/Trust-Lesson/main/public/logo-full.webp";

/**
 * Safe Email Dispatcher
 */
async function safeSendEmail(payload) {
  if (!resend) {
    console.log(`[Resend Simulated] Email to ${payload.to}: ${payload.subject}`);
    return { data: { id: `sim-${Date.now()}` }, simulated: true };
  }
  return resend.emails.send(payload);
}

/**
 * Common HTML Email Layout Wrapper (Clean Light Theme)
 */
function createEmailTemplate({ title, subtitle, contentHtml, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }
    .header {
      background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
      padding: 36px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #f1f5f9;
    }
    .logo-container {
      margin-bottom: 16px;
    }
    .logo-img {
      max-width: 190px;
      height: auto;
      display: inline-block;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      background-color: #f3e8ff;
      border: 1px solid #d8b4fe;
      border-radius: 9999px;
      color: #7e22ce;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 10px;
    }
    .header-title {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    .header-subtitle {
      margin: 8px 0 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 400;
      line-height: 1.5;
    }
    .body {
      padding: 32px;
      background-color: #ffffff;
      font-size: 14px;
      line-height: 1.65;
      color: #334155;
    }
    .highlight-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 18px 20px;
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 9px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 13px;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #64748b;
      font-weight: 500;
    }
    .info-value {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 12px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25);
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #f1f5f9;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer p {
      margin: 4px 0;
    }
    .footer a {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-container">
          <img src="${LOGO_URL}" alt="Trust Lesson Logo" class="logo-img" />
        </div>
        <div class="badge">Arbitrum Non-Custodial Protocol</div>
        <h1 class="header-title">${title}</h1>
        ${subtitle ? `<p class="header-subtitle">${subtitle}</p>` : ""}
      </div>
      <div class="body">
        ${contentHtml}
        ${
          ctaText && ctaUrl
            ? `<div class="btn-container">
                 <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
               </div>`
            : ""
        }
      </div>
      <div class="footer">
        <p><strong>Trust Lesson Protocol</strong> - Decentralized Peer-to-Peer Mentorship & Milestone Escrow</p>
        <p>Protected by smart contracts on Arbitrum. Zero platform custody of user funds.</p>
        <p><a href="${APP_URL}">Open Dashboard</a> | <a href="${APP_URL}/explore">Explore Gigs</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate PDF Certificate buffer using PDFKit
 */
export async function generateCertificatePdf({
  learnerName = "Learner",
  mentorName = "Verified Mentor",
  gigTitle = "Decentralized Course",
  certificateId = "TL-CERT-0001",
  date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  transactionHash = null,
}) {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 certificate (842 x 595 pt)
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;

      // Dark background
      doc.rect(0, 0, width, height).fill("#0b0f19");

      // Outer border
      doc
        .rect(20, 20, width - 40, height - 40)
        .strokeColor("#9333ea")
        .lineWidth(3)
        .stroke();

      // Inner subtle border
      doc
        .rect(26, 26, width - 52, height - 52)
        .strokeColor("#312e81")
        .lineWidth(1)
        .stroke();

      // Header Brand
      doc
        .fillColor("#a855f7")
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("TRUST LESSON ON-CHAIN PROTOCOL", 0, 60, { align: "center", characterSpacing: 2 });

      doc
        .fillColor("#64748b")
        .fontSize(9)
        .font("Helvetica")
        .text("ARBITRUM VERIFIABLE SOULBOUND CREDENTIAL", 0, 78, { align: "center", characterSpacing: 1 });

      // Main Certificate Title
      doc
        .fillColor("#ffffff")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF COMPLETION", 0, 115, { align: "center" });

      doc
        .fillColor("#94a3b8")
        .fontSize(11)
        .font("Helvetica")
        .text("This certifies that", 0, 155, { align: "center" });

      // Learner Name
      doc
        .fillColor("#c084fc")
        .fontSize(26)
        .font("Helvetica-Bold")
        .text(learnerName, 0, 175, { align: "center" });

      // Divider line
      doc
        .moveTo(width / 2 - 160, 212)
        .lineTo(width / 2 + 160, 212)
        .strokeColor("#9333ea")
        .lineWidth(1)
        .stroke();

      // Body text
      doc
        .fillColor("#cbd5e1")
        .fontSize(12)
        .font("Helvetica")
        .text(
          "has successfully completed all curriculum milestones, practical deliverables, and requirements for",
          60,
          225,
          { align: "center", width: width - 120 }
        );

      // Gig Title
      doc
        .fillColor("#38bdf8")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(`"${gigTitle}"`, 60, 255, { align: "center", width: width - 120 });

      // Meta grid (Mentor, Date, ID)
      const colY = 320;
      doc
        .fillColor("#64748b")
        .fontSize(9)
        .font("Helvetica")
        .text("INSTRUCTOR / MENTOR", 80, colY, { align: "left" })
        .fillColor("#ffffff")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(mentorName, 80, colY + 14, { align: "left" });

      doc
        .fillColor("#64748b")
        .fontSize(9)
        .font("Helvetica")
        .text("COMPLETION DATE", width / 2 - 60, colY, { align: "center", width: 120 })
        .fillColor("#ffffff")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(date, width / 2 - 60, colY + 14, { align: "center", width: 120 });

      doc
        .fillColor("#64748b")
        .fontSize(9)
        .font("Helvetica")
        .text("CREDENTIAL IDENTIFIER", width - 260, colY, { align: "right", width: 180 })
        .fillColor("#ffffff")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(certificateId, width - 260, colY + 14, { align: "right", width: 180 });

      // Footer security note
      const footerY = height - 90;
      doc
        .moveTo(50, footerY)
        .lineTo(width - 50, footerY)
        .strokeColor("#1e293b")
        .lineWidth(1)
        .stroke();

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Non-Custodial Escrow Settlement Verified on Arbitrum. Cryptographically signed and tamper-proof.${
            transactionHash ? ` Tx: ${transactionHash.slice(0, 20)}...` : ""
          }`,
          50,
          footerY + 10,
          { align: "center", width: width - 100 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 1. User Registration (Learner & Mentor)
 */
export async function sendWelcomeEmail({ email, name, role = "LEARNER", walletAddress }) {
  const isMentor = role?.toUpperCase() === "MENTOR";
  const title = isMentor ? "Welcome to the Mentor Network" : "Welcome to Trust Lesson";
  const subtitle = isMentor
    ? "Your mentor account is ready. Start publishing gigs and sharing your expertise."
    : "Your learner account is ready. Explore curated mentorship gigs and level up your skills.";

  const contentHtml = `
    <p>Hello <strong>${name || (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Learner")}</strong>,</p>
    <p>Welcome to <strong>Trust Lesson</strong>, the decentralized peer-to-peer mentorship platform on Arbitrum.</p>
    
    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Account Role</span>
        <span class="info-value">${isMentor ? "Instructor / Mentor" : "Student / Learner"}</span>
      </div>
      ${
        walletAddress
          ? `<div class="info-row">
               <span class="info-label">Connected Wallet</span>
               <span class="info-value">${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}</span>
             </div>`
          : ""
      }
      <div class="info-row">
        <span class="info-label">Smart Escrow Protection</span>
        <span class="info-value">Active (Arbitrum L2)</span>
      </div>
      <div class="info-row">
        <span class="info-label">Gas Subsidy</span>
        <span class="info-value">100% Protocol Sponsored</span>
      </div>
    </div>

    ${
      isMentor
        ? `<p><strong>Recommended next steps for mentors:</strong></p>
           <ul>
             <li>Create your first gig curriculum with custom milestones.</li>
             <li>Set your available meeting hours and session duration.</li>
             <li>Upload curriculum slides, unlisted video tutorials, and starter repositories.</li>
           </ul>`
        : `<p><strong>Recommended next steps for learners:</strong></p>
           <ul>
             <li>Browse the marketplace to find verified Web3 and engineering mentors.</li>
             <li>Lock funds securely in milestone escrow; release only upon satisfactory delivery.</li>
             <li>Earn non-transferable Soulbound Certificates upon course completion.</li>
           </ul>`
    }
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to Trust Lesson - ${isMentor ? "Mentor Workspace" : "Start Learning"}`,
    html: createEmailTemplate({
      title,
      subtitle,
      contentHtml,
      ctaText: isMentor ? "Create Your First Gig" : "Explore Mentorship Gigs",
      ctaUrl: isMentor ? `${APP_URL}/dashboard/gigs/create` : `${APP_URL}/explore`,
    }),
  });
}

/**
 * 2a. Learner Gig Order Receipt
 */
export async function sendGigOrderReceiptEmail({
  email,
  learnerName,
  mentorName,
  gigTitle,
  orderId,
  totalAmount,
  sessionsCount = 1,
  durationMin = 60,
  txHash,
}) {
  const contentHtml = `
    <p>Hello <strong>${learnerName || "Learner"}</strong>,</p>
    <p>Thank you for enrolling! Your payment is safely locked in the Arbitrum smart escrow vault. The mentor has been notified.</p>

    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Curriculum / Gig</span>
        <span class="info-value">${gigTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Mentor</span>
        <span class="info-value">${mentorName || "Verified Mentor"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Escrow Deposit</span>
        <span class="info-value">$${Number(totalAmount).toFixed(2)} USDC</span>
      </div>
      <div class="info-row">
        <span class="info-label">Live Sessions Included</span>
        <span class="info-value">${sessionsCount} session(s) (${durationMin} min each)</span>
      </div>
      <div class="info-row">
        <span class="info-label">Enrollment ID</span>
        <span class="info-value">${orderId}</span>
      </div>
      ${
        txHash
          ? `<div class="info-row">
               <span class="info-label">Transaction Hash</span>
               <span class="info-value">${txHash.slice(0, 10)}...${txHash.slice(-6)}</span>
             </div>`
          : ""
      }
    </div>

    <p>Your classroom is now unlocked. You can immediately access curriculum modules, schedule 1-on-1 meeting times, and interact with your mentor.</p>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: email,
    subject: `Order Receipt: ${gigTitle} (Escrow Vault Funded)`,
    html: createEmailTemplate({
      title: "Enrollment Confirmed & Escrow Funded",
      subtitle: "Your payment is securely held on-chain until deliverables are completed.",
      contentHtml,
      ctaText: "Open My Classroom",
      ctaUrl: `${APP_URL}/dashboard/classes/${orderId}`,
    }),
  });
}

/**
 * 2b. Mentor Notification of New Gig Booking
 */
export async function sendMentorNewBookingEmail({
  email,
  mentorName,
  learnerName,
  gigTitle,
  orderId,
  totalAmount,
  sessionsCount = 1,
}) {
  const contentHtml = `
    <p>Hello <strong>${mentorName || "Mentor"}</strong>,</p>
    <p>A new student has enrolled in your gig and deposited funds into the milestone escrow contract.</p>

    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Enrolled Student</span>
        <span class="info-value">${learnerName || "Student"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Gig Curriculum</span>
        <span class="info-value">${gigTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Locked Escrow Payout</span>
        <span class="info-value">$${Number(totalAmount).toFixed(2)} USDC</span>
      </div>
      <div class="info-row">
        <span class="info-label">Booked Sessions</span>
        <span class="info-value">${sessionsCount} session(s)</span>
      </div>
    </div>

    <p>Please review their profile, assign curriculum tasks, and look out for meeting requests in your gig classroom.</p>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: email,
    subject: `New Student Enrolled: ${gigTitle}`,
    html: createEmailTemplate({
      title: "New Student Enrollment",
      subtitle: `Funds are deposited in escrow for "${gigTitle}".`,
      contentHtml,
      ctaText: "Manage Gig Classroom",
      ctaUrl: `${APP_URL}/dashboard/classes/${orderId}`,
    }),
  });
}

/**
 * 3. Incoming Chat Message Notification
 */
export async function sendChatNotificationEmail({
  recipientEmail,
  recipientName,
  senderName,
  messageSnippet = "Sent you a new direct message.",
  chatUrl,
}) {
  const contentHtml = `
    <p>Hello <strong>${recipientName || "there"}</strong>,</p>
    <p>You received a new message from <strong>${senderName || "Your peer"}</strong> on Trust Lesson.</p>

    <div class="highlight-card" style="border-left: 4px solid #7c3aed; background-color: #faf5ff; border: 1px solid #ede9fe; border-left: 4px solid #7c3aed; color: #4338ca; border-radius: 10px; padding: 16px; font-style: italic;">
      "${messageSnippet}"
    </div>

    <p>Reply directly in the live peer-to-peer chat interface.</p>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `New Message from ${senderName || "Peer"} on Trust Lesson`,
    html: createEmailTemplate({
      title: "New Incoming Message",
      subtitle: `${senderName || "A contact"} sent you a direct message.`,
      contentHtml,
      ctaText: "Open Chat",
      ctaUrl: chatUrl || `${APP_URL}/dashboard/chat`,
    }),
  });
}

/**
 * 4. Mentor Uploads / Assigns a Task
 */
export async function sendNewAssignmentEmail({
  learnerEmail,
  learnerName,
  mentorName,
  gigTitle,
  taskTitle,
  instructions,
  dueDate,
  classroomUrl,
}) {
  const contentHtml = `
    <p>Hello <strong>${learnerName || "Learner"}</strong>,</p>
    <p>Your mentor <strong>${mentorName || "Mentor"}</strong> has assigned a new task for <strong>${gigTitle}</strong>.</p>

    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Assignment Title</span>
        <span class="info-value">${taskTitle}</span>
      </div>
      ${
        dueDate
          ? `<div class="info-row">
               <span class="info-label">Due Date</span>
               <span class="info-value">${new Date(dueDate).toLocaleDateString("en-US", {
                 year: "numeric",
                 month: "short",
                 day: "numeric",
               })}</span>
             </div>`
          : ""
      }
      <div class="info-row">
        <span class="info-label">Course</span>
        <span class="info-value">${gigTitle}</span>
      </div>
    </div>

    ${
      instructions
        ? `<p><strong>Instructions from Mentor:</strong></p>
           <div style="background-color: #f8fafc; padding: 14px 18px; border-radius: 10px; font-size: 13px; color: #334155; border: 1px solid #e2e8f0; line-height: 1.6;">
             ${instructions}
           </div>`
        : ""
    }

    <p>Submit your deliverables (PDF file, text document, Google Form, or GitHub link) directly in the classroom.</p>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: learnerEmail,
    subject: `New Assignment: ${taskTitle} (${gigTitle})`,
    html: createEmailTemplate({
      title: "New Curriculum Assignment",
      subtitle: `Your mentor published an assignment for "${gigTitle}".`,
      contentHtml,
      ctaText: "View & Submit Assignment",
      ctaUrl: classroomUrl || `${APP_URL}/dashboard/classes`,
    }),
  });
}

/**
 * 5. Course Completed & Soulbound Certificate Issued (with Attached PDF)
 */
export async function sendCertificateEmail({
  learnerEmail,
  learnerName,
  mentorName,
  gigTitle,
  certificateId = "TL-CERT-0001",
  certificateUrl,
  pdfBuffer,
}) {
  let attachedPdf = pdfBuffer;
  if (!attachedPdf) {
    try {
      attachedPdf = await generateCertificatePdf({
        learnerName,
        mentorName,
        gigTitle,
        certificateId,
      });
    } catch (e) {
      console.warn("Failed generating PDF attachment:", e);
    }
  }

  const certUrl = certificateUrl || `${APP_URL}/certificate/${certificateId}`;

  const contentHtml = `
    <p>Congratulations, <strong>${learnerName || "Learner"}</strong>!</p>
    <p>You have officially completed <strong>${gigTitle}</strong> with mentor <strong>${mentorName || "Verified Mentor"}</strong>.</p>
    
    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Completed Curriculum</span>
        <span class="info-value">${gigTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Lead Instructor</span>
        <span class="info-value">${mentorName || "Verified Mentor"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Certificate Serial</span>
        <span class="info-value">${certificateId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Attestation Status</span>
        <span class="info-value">Verified On-Chain</span>
      </div>
    </div>

    <p>Your official Certificate of Completion is attached to this email as a PDF document. You can also view, share, or verify your credential online at any time.</p>
  `;

  const emailPayload = {
    from: FROM_EMAIL,
    to: learnerEmail,
    subject: `Congratulations! Your Certificate for ${gigTitle} is Ready`,
    html: createEmailTemplate({
      title: "Course Completed & Certificate Issued",
      subtitle: `Congratulations on graduating from "${gigTitle}".`,
      contentHtml,
      ctaText: "View Online Certificate",
      ctaUrl: certUrl,
    }),
  };

  if (attachedPdf) {
    emailPayload.attachments = [
      {
        filename: `TrustLesson-Certificate-${certificateId}.pdf`,
        content: attachedPdf,
      },
    ];
  }

  return safeSendEmail(emailPayload);
}

/**
 * 6. Feedback / Review Submission Thank You
 */
export async function sendFeedbackThankYouEmail({
  userEmail,
  userName,
  gigTitle,
  rating = 5,
  feedbackComment,
}) {
  const contentHtml = `
    <p>Hello <strong>${userName || "Learner"}</strong>,</p>
    <p>Thank you for submitting your evaluation and feedback for <strong>${gigTitle}</strong>.</p>

    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Curriculum / Gig</span>
        <span class="info-value">${gigTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Rating Submitted</span>
        <span class="info-value">${rating} / 5 Stars</span>
      </div>
      ${
        feedbackComment
          ? `<div class="info-row">
               <span class="info-label">Comments</span>
               <span class="info-value">${feedbackComment}</span>
             </div>`
          : ""
      }
    </div>

    <p>Your review helps power our on-chain reputation system and ensures transparency across the Arbitrum mentorship ecosystem.</p>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: userEmail,
    subject: `Thank you for your feedback on ${gigTitle}`,
    html: createEmailTemplate({
      title: "Thank You for Your Feedback",
      subtitle: "Your review strengthens the decentralized mentor reputation network.",
      contentHtml,
      ctaText: "Back to Dashboard",
      ctaUrl: `${APP_URL}/dashboard`,
    }),
  });
}

/**
 * 7. Approaching Deadline Warning
 */
export async function sendDeadlineWarningEmail({
  recipientEmail,
  recipientName,
  taskTitle,
  gigTitle,
  dueDate,
  daysRemaining = 1,
  classroomUrl,
}) {
  const contentHtml = `
    <p>Hello <strong>${recipientName || "Learner"}</strong>,</p>
    <p>This is a reminder that the deadline for <strong>${taskTitle}</strong> in <strong>${gigTitle}</strong> is approaching.</p>

    <div class="highlight-card" style="border: 1px solid #fef08a; background-color: #fefce8; border-left: 4px solid #eab308;">
      <div class="info-row">
        <span class="info-label">Assignment</span>
        <span class="info-value">${taskTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Course</span>
        <span class="info-value">${gigTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Due Date</span>
        <span class="info-value">${
          dueDate
            ? new Date(dueDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Upcoming"
        }</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time Remaining</span>
        <span class="info-value" style="color: #b45309; font-weight: 700;">${daysRemaining} day(s) left</span>
      </div>
    </div>

    <p>Please make sure to finalize your work and upload your deliverable before the deadline to keep your escrow release schedule on track.</p>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: recipientEmail,
    subject: `Deadline Alert: ${taskTitle} is due soon (${gigTitle})`,
    html: createEmailTemplate({
      title: "Assignment Deadline Reminder",
      subtitle: `Action required: Deliverable due in ${daysRemaining} day(s).`,
      contentHtml,
      ctaText: "Submit Deliverable Now",
      ctaUrl: classroomUrl || `${APP_URL}/dashboard/classes`,
    }),
  });
}

// Backwards compatibility aliases
export const sendTransactionReceiptEmail = sendGigOrderReceiptEmail;
export const sendNewMaterialEmail = sendNewAssignmentEmail;


/**
 * Mentorship Completion Approval Request Email (To Mentor)
 */
export async function sendCompletionRequestEmail({
  mentorEmail,
  mentorName,
  learnerName,
  gigTitle,
  classroomUrl,
}) {
  const contentHtml = `
    <p>Hello <strong>${mentorName || "Mentor"}</strong>,</p>
    <p>Your student <strong>${learnerName || "Learner"}</strong> has completed all learning modules and submitted their assignments for <strong>${gigTitle}</strong>.</p>
    <p>They have requested to finalize the mentorship and release the escrow funds. Please review and agree in your classroom dashboard to release the escrow payout and generate their verifiable on-chain certificate.</p>

    <div class="highlight-card">
      <div class="info-row">
        <span class="info-label">Student</span>
        <span class="info-value">${learnerName || "Student"}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Classroom</span>
        <span class="info-value">${gigTitle}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Action</span>
        <span class="info-value" style="color: #059669; font-weight: 700;">Review & Agree to Release</span>
      </div>
    </div>
  `;

  return safeSendEmail({
    from: FROM_EMAIL,
    to: mentorEmail,
    subject: `Action Required: ${learnerName || "Student"} requested completion for ${gigTitle}`,
    html: createEmailTemplate({
      title: "Mentorship Completion Request",
      subtitle: `${learnerName || "Student"} has requested to end mentorship and release escrow.`,
      contentHtml,
      ctaText: "Review & Agree in Classroom",
      ctaUrl: classroomUrl || `${APP_URL}/dashboard/classes`,
    }),
  });
}
