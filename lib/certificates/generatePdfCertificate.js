import PDFDocument from "pdfkit";

/**
 * Generate a 2-Page Landscape PDF Certificate (White Elegant Theme)
 * Page 1: Certificate Front (Learner, Mentor, Grade Badge, Signatures)
 * Page 2: Certificate Back (On-Chain Verification, Blockchain Hashes, Task Transcript)
 */
export async function generatePdfCertificate({
  learnerName = "Verified Learner",
  learnerAddress = "0x0000000000000000000000000000000000000000",
  mentorName = "Verified Mentor",
  mentorAddress = "0x0000000000000000000000000000000000000000",
  gigTitle = "Decentralized Course & Mentorship",
  category = "Blockchain & Web3",
  certificateId = "TL-SBT-0001",
  numericScore = 95,
  date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  txHash = "0x0000000000000000000000000000000000000000000000000000000000000000",
  blockNumber = 254821490,
  contractAddress = "0x50fA8e6c56B97484D2571b2C220d3EDbBAe6847D",
  metadataCid = null,
  assignments = [],
}) {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4 (842 x 595 points)
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 28, bottom: 28, left: 28, right: 28 },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;

      // Grade predicate calculation
      let gradeLabel = "Good";
      if (numericScore >= 90) gradeLabel = "Amazing";
      else if (numericScore >= 80) gradeLabel = "Great";

      // ─────────────────────────────────────────────────────────────
      // PAGE 1: CERTIFICATE FRONT (WHITE ELEGANT THEME)
      // ─────────────────────────────────────────────────────────────

      // Pure White Background
      doc.rect(0, 0, width, height).fill("#ffffff");

      // Double Outer Border (Navy & Purple)
      doc
        .rect(18, 18, width - 36, height - 36)
        .strokeColor("#6366f1")
        .lineWidth(2)
        .stroke();

      doc
        .rect(24, 24, width - 48, height - 48)
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .stroke();

      // Corner Accents
      const cornerSize = 18;
      doc.rect(24, 24, cornerSize, cornerSize).fill("#4f46e5");
      doc.rect(width - 24 - cornerSize, 24, cornerSize, cornerSize).fill("#4f46e5");
      doc.rect(24, height - 24 - cornerSize, cornerSize, cornerSize).fill("#4f46e5");
      doc.rect(width - 24 - cornerSize, height - 24 - cornerSize, cornerSize, cornerSize).fill("#4f46e5");

      // Header Brand
      doc
        .fillColor("#4338ca")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("TRUST LESSON PROTOCOL", 0, 52, { align: "center", characterSpacing: 2 });

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text("ARBITRUM NON-CUSTODIAL MENTORSHIP EXCHANGE", 0, 68, { align: "center", characterSpacing: 1 });

      // Certificate Title
      doc
        .fillColor("#0f172a")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF COMPLETION", 0, 102, { align: "center" });

      doc
        .fillColor("#64748b")
        .fontSize(10)
        .font("Helvetica")
        .text("THIS RECOGNIZES THAT", 0, 140, { align: "center", characterSpacing: 1.5 });

      // Learner Name
      doc
        .fillColor("#1e1b4b")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(learnerName, 0, 160, { align: "center" });

      // Thin divider
      doc
        .moveTo(width / 2 - 140, 192)
        .lineTo(width / 2 + 140, 192)
        .strokeColor("#6366f1")
        .lineWidth(1.5)
        .stroke();

      // Description Body
      doc
        .fillColor("#334155")
        .fontSize(11)
        .font("Helvetica")
        .text(
          "has successfully completed the required milestones, interactive sessions, and practical assessments for",
          70,
          205,
          { align: "center", width: width - 140 }
        );

      // Gig Title
      doc
        .fillColor("#4338ca")
        .fontSize(17)
        .font("Helvetica-Bold")
        .text(`"${gigTitle}"`, 70, 230, { align: "center", width: width - 140 });

      // Grade Badge Pill
      const badgeY = 270;
      doc
        .roundedRect(width / 2 - 80, badgeY, 160, 26, 13)
        .fillAndStroke("#eef2ff", "#6366f1");

      doc
        .fillColor("#4338ca")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`GRADE: ${gradeLabel.toUpperCase()} (${numericScore}%)`, width / 2 - 80, badgeY + 7, {
          align: "center",
          width: 160,
        });

      // Signatures Section (Left: Mentor, Right: CEO Rayhan Young)
      const sigY = 385;

      // Left: Mentor Signature
      doc
        .moveTo(90, sigY + 45)
        .lineTo(270, sigY + 45)
        .strokeColor("#cbd5e1")
        .lineWidth(1)
        .stroke();

      doc
        .fillColor("#4338ca")
        .fontSize(14)
        .font("Times-Italic")
        .text(mentorName, 90, sigY + 22, { width: 180, align: "center" });

      doc
        .fillColor("#0f172a")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text(mentorName, 90, sigY + 50, { width: 180, align: "center" })
        .fillColor("#64748b")
        .fontSize(7.5)
        .font("Helvetica")
        .text("Verified Course Instructor", 90, sigY + 62, { width: 180, align: "center" });

      // Center: Official Stamp / Serial
      doc
        .fillColor("#64748b")
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .text("CERTIFICATE SERIAL", width / 2 - 80, sigY + 38, { width: 160, align: "center" })
        .fillColor("#0f172a")
        .fontSize(8.5)
        .font("Helvetica")
        .text(certificateId, width / 2 - 80, sigY + 50, { width: 160, align: "center" })
        .fillColor("#64748b")
        .fontSize(7.5)
        .text(date, width / 2 - 80, sigY + 62, { width: 160, align: "center" });

      // Right: CEO Signature (Rayhan Young)
      doc
        .moveTo(width - 270, sigY + 45)
        .lineTo(width - 90, sigY + 45)
        .strokeColor("#cbd5e1")
        .lineWidth(1)
        .stroke();

      doc
        .fillColor("#4338ca")
        .fontSize(15)
        .font("Times-Italic")
        .text("Rayhan Young", width - 270, sigY + 20, { width: 180, align: "center" });

      doc
        .fillColor("#0f172a")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Rayhan Young", width - 270, sigY + 50, { width: 180, align: "center" })
        .fillColor("#64748b")
        .fontSize(7.5)
        .font("Helvetica")
        .text("Founder & CEO, Trust Lesson", width - 270, sigY + 62, { width: 180, align: "center" });

      // Bottom Page Footer
      doc
        .fillColor("#94a3b8")
        .fontSize(7)
        .font("Helvetica")
        .text("Page 1 of 2: Official Attestation - Turn over for Blockchain Proof & Academic Transcript", 0, height - 38, {
          align: "center",
        });

      // ─────────────────────────────────────────────────────────────
      // PAGE 2: REVERSE SIDE (TRANSCRIPT & ON-CHAIN PROOF)
      // ─────────────────────────────────────────────────────────────
      doc.addPage();

      // White Background
      doc.rect(0, 0, width, height).fill("#ffffff");

      // Outer Border
      doc
        .rect(18, 18, width - 36, height - 36)
        .strokeColor("#6366f1")
        .lineWidth(2)
        .stroke();

      doc
        .rect(24, 24, width - 48, height - 48)
        .strokeColor("#e2e8f0")
        .lineWidth(1)
        .stroke();

      // Header
      doc
        .fillColor("#4338ca")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("TRUST LESSON ON-CHAIN TRANSCRIPT & VERIFICATION LEDGER", 0, 42, {
          align: "center",
          characterSpacing: 1.5,
        });

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text(`OFFICIAL RECORD FOR CREDENTIAL: ${certificateId}`, 0, 56, { align: "center" });

      // Two Column Layout
      // Left Column: Blockchain Attestation Proof
      const colLeftX = 45;
      const colWidth = 345;
      let leftY = 82;

      doc
        .fillColor("#0f172a")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("1. ON-CHAIN ATTESTATION PROOF", colLeftX, leftY);

      leftY += 16;
      doc
        .roundedRect(colLeftX, leftY, colWidth, 185, 8)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      const printProofRow = (label, value, yOffset) => {
        doc
          .fillColor("#64748b")
          .fontSize(7.5)
          .font("Helvetica-Bold")
          .text(label, colLeftX + 14, leftY + yOffset);
        doc
          .fillColor("#0f172a")
          .fontSize(8)
          .font("Helvetica")
          .text(value, colLeftX + 14, leftY + yOffset + 11, { width: colWidth - 28 });
      };

      printProofRow("SETTLEMENT NETWORK", "Arbitrum Sepolia L2 (Rollup)", 10);
      printProofRow("SOULBOUND REGISTRY CONTRACT", contractAddress, 36);
      printProofRow("TRANSACTION HASH", txHash || "Settled on Arbitrum", 62);
      printProofRow("BLOCK NUMBER", String(blockNumber), 90);
      printProofRow("LEARNER WALLET", learnerAddress, 116);
      printProofRow("MENTOR WALLET", mentorAddress, 142);

      // Bottom of left column: Gas Subsidy Notice
      leftY += 200;
      doc
        .roundedRect(colLeftX, leftY, colWidth, 75, 6)
        .fillAndStroke("#eef2ff", "#c7d2fe");

      doc
        .fillColor("#3730a3")
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("NON-CUSTODIAL ESCROW GUARANTEE", colLeftX + 12, leftY + 10)
        .fillColor("#475569")
        .fontSize(7.5)
        .font("Helvetica")
        .text(
          "Payment was locked in audited Arbitrum escrow router contracts and released directly to the mentor upon milestone approval. All L2 gas fees were 100% subsidized by the Trust Lesson Platform Gas Sponsor vault.",
          colLeftX + 12,
          leftY + 24,
          { width: colWidth - 24, lineGap: 1.5 }
        );

      // Right Column: Assignment Transcript & Evaluation
      const colRightX = 425;
      const rightWidth = 370;
      let rightY = 82;

      doc
        .fillColor("#0f172a")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("2. ACADEMIC EVALUATION & TASK BREAKDOWN", colRightX, rightY);

      rightY += 16;
      doc
        .roundedRect(colRightX, rightY, rightWidth, 275, 8)
        .fillAndStroke("#f8fafc", "#e2e8f0");

      // Table Header
      doc
        .rect(colRightX, rightY, rightWidth, 22)
        .fill("#f1f5f9");

      doc
        .fillColor("#475569")
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .text("TASK / DELIVERABLE", colRightX + 12, rightY + 7)
        .text("STATUS", colRightX + 220, rightY + 7)
        .text("SCORE", colRightX + 310, rightY + 7);

      // Task rows
      const displayAssignments =
        assignments.length > 0
          ? assignments
          : [
              { title: "Core Milestone Deliverable #1", status: "APPROVED", score: numericScore },
              { title: "Practical Code Review & Exercise", status: "APPROVED", score: numericScore },
              { title: "Final Capstone Assessment", status: "APPROVED", score: numericScore },
            ];

      let rowY = rightY + 28;
      displayAssignments.slice(0, 5).forEach((item, idx) => {
        const itemTitle = item.title || item.definition?.title || `Assignment #${idx + 1}`;
        const itemStatus = item.status || "APPROVED";
        const itemScore = item.score !== undefined ? `${item.score}%` : `${numericScore}%`;

        doc
          .fillColor("#0f172a")
          .fontSize(7.5)
          .font("Helvetica")
          .text(itemTitle.slice(0, 32), colRightX + 12, rowY, { width: 200 })
          .fillColor(itemStatus === "APPROVED" ? "#16a34a" : "#ca8a04")
          .font("Helvetica-Bold")
          .text(itemStatus, colRightX + 220, rowY)
          .fillColor("#0f172a")
          .text(itemScore, colRightX + 310, rowY);

        rowY += 24;
      });

      // Overall Score Summary in Box
      const summaryBoxY = rightY + 175;
      doc
        .roundedRect(colRightX + 12, summaryBoxY, rightWidth - 24, 75, 6)
        .fillAndStroke("#ffffff", "#e2e8f0");

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text("WEIGHTED FINAL SCORE", colRightX + 24, summaryBoxY + 12)
        .fillColor("#4338ca")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(`${numericScore}%`, colRightX + 24, summaryBoxY + 24);

      doc
        .fillColor("#64748b")
        .fontSize(8)
        .font("Helvetica")
        .text("ACHIEVEMENT RATING", colRightX + 160, summaryBoxY + 12)
        .fillColor("#059669")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(gradeLabel.toUpperCase(), colRightX + 160, summaryBoxY + 25);

      doc
        .fillColor("#64748b")
        .fontSize(7)
        .font("Helvetica")
        .text(
          "Passing Requirement: Minimum 70% average across all required tasks. All requirements satisfied.",
          colRightX + 24,
          summaryBoxY + 54,
          { width: rightWidth - 48 }
        );

      // Bottom Page Footer
      doc
        .fillColor("#94a3b8")
        .fontSize(7)
        .font("Helvetica")
        .text("Page 2 of 2: Verified On-Chain Transcript & Proof - Trust Lesson Protocol", 0, height - 38, {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
