import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || "Trust Lesson <onboarding@resend.dev>";

/**
 * 1. Send Welcome Email upon Account Creation
 */
export async function sendWelcomeEmail({ to, name, role = "student" }) {
  const roleTitle = role.toUpperCase() === "ADMIN" ? "Administrator" : role.toUpperCase() === "MENTOR" ? "Mentor" : "Student";
  const subject = `Welcome to Trust Lesson, ${name || "Learner"}!`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Welcome to Trust Lesson</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
          .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #c084fc; letter-spacing: -0.5px; }
          .badge { display: inline-block; background-color: #581c87; color: #e9d5ff; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-top: 8px; }
          h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 16px; }
          .highlight { background-color: #0f172a; border-left: 3px solid #a855f7; padding: 12px 16px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #9333ea, #6366f1); color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; text-align: center; }
          .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">Trust Lesson</div>
            <div class="badge">Role: ${roleTitle}</div>
          </div>
          <h1>Welcome aboard, ${name || "Friend"}!</h1>
          <p>Your Trust Lesson account has been successfully initialized. You are now part of a decentralized, milestone-based mentorship exchange protected by non-custodial smart escrow contracts on <strong>Arbitrum</strong>.</p>
          
          <div class="highlight">
            <p style="margin: 0; color: #e2e8f0; font-size: 13px;">
              <strong>Account:</strong> ${to}<br/>
              <strong>Network:</strong> Arbitrum One / Sepolia<br/>
              <strong>Gas Fee:</strong> 100% Subsidized by Platform Sponsor
            </p>
          </div>

          <p>Log in anytime to explore courses, connect your Web3 wallet, or access your personalized learning workspace.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://trust-lesson.xyz"}/login" class="btn">Access Dashboard</a>
          </div>
          <div class="footer">
            Trust Lesson &bull; Non-Custodial Smart Escrows &bull; Arbitrum L2
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] Welcome email dispatched to ${to} (${name}) [Role: ${roleTitle}]`);
    return { success: true, simulated: true };
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });
    if (response.error) {
      console.warn(`[Resend Error] Failed to send welcome email to ${to}:`, response.error.message || response.error);
      return { success: false, error: response.error.message || "Failed to send email" };
    }
    const emailId = response.data?.id;
    console.log(`[Resend] Welcome email sent to ${to}:`, emailId);
    return { success: true, id: emailId };
  } catch (error) {
    console.warn(`[Resend Error] Failed to send welcome email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 2. Send Transaction / Escrow Milestone Receipt Email
 */
export async function sendTransactionReceiptEmail({ to, name, sessionTitle, amount, txHash }) {
  const subject = `Escrow Payment Confirmed: ${sessionTitle || "Mentorship Session"}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Transaction Receipt - Trust Lesson</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
          .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #c084fc; }
          .status { color: #34d399; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
          .receipt-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; color: #94a3b8; }
          .row strong { color: #f8fafc; }
          .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">Trust Lesson</div>
            <div class="status">Escrow Vault Funded</div>
          </div>
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 12px;">Payment Receipt & Milestone Locked</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Hello ${name || "Learner"}, your milestone deposit has been successfully confirmed and secured in the Arbitrum Non-Custodial Escrow vault. Funds will only be released once you approve your mentor's deliverable.
          </p>
          <div class="receipt-box">
            <div class="row">
              <span>Item / Package:</span>
              <strong>${sessionTitle || "Mentorship Gig"}</strong>
            </div>
            <div class="row">
              <span>Escrow Deposit:</span>
              <strong>$${Number(amount || 0).toFixed(2)} USDC</strong>
            </div>
            <div class="row">
              <span>Arbitrum Gas:</span>
              <strong style="color: #34d399;">100% Subsidized (FREE)</strong>
            </div>
            ${
              txHash
                ? `<div class="row"><span>Transaction:</span><strong style="word-break: break-all; font-size: 11px; color: #a855f7;">${txHash}</strong></div>`
                : ""
            }
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            You can monitor milestone delivery and release payments inside your student workspace anytime.
          </p>
          <div class="footer">
            Trust Lesson &bull; Non-Custodial Smart Escrow Protocol
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] Transaction receipt dispatched to ${to} for $${amount} (${sessionTitle})`);
    return { success: true, simulated: true };
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });
    if (response.error) {
      console.warn(`[Resend Error] Failed to send transaction receipt to ${to}:`, response.error.message || response.error);
      return { success: false, error: response.error.message || "Failed to send email" };
    }
    const emailId = response.data?.id;
    console.log(`[Resend] Transaction email sent to ${to}:`, emailId);
    return { success: true, id: emailId };
  } catch (error) {
    console.warn(`[Resend Error] Failed to send transaction receipt to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 3. Send New Material / Module Upload Notification Email
 */
export async function sendNewMaterialEmail({ to, studentName, mentorName, gigTitle, moduleTitle }) {
  const subject = `New Learning Material Available: ${moduleTitle || "Course Module"}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Course Material Released</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
          .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 800; color: #c084fc; }
          .badge { display: inline-block; background-color: #3b0764; color: #d8b4fe; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-top: 8px; }
          .highlight { background-color: #0f172a; border-left: 3px solid #38bdf8; padding: 16px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #9333ea, #6366f1); color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 14px; text-align: center; }
          .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">Trust Lesson</div>
            <div class="badge">Curriculum Update</div>
          </div>
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 8px;">New Material Added to Your Course</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Hello ${studentName || "Learner"}, your mentor <strong>${mentorName || "Your Mentor"}</strong> has just published new learning material for <em>${gigTitle || "your course"}</em>.
          </p>
          
          <div class="highlight">
            <p style="margin: 0; color: #e2e8f0; font-size: 13px;">
              <strong>New Module:</strong> ${moduleTitle || "Updated Curriculum Content"}<br/>
              <strong>Access Mode:</strong> Gated Native Storage (Cloudflare Stream / R2)<br/>
              <strong>Status:</strong> Unlocked for Enrolled Students
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 14px;">
            You can stream the video lecture and download protected course documents directly through your student portal.
          </p>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://trust-lesson.xyz"}/dashboard" class="btn">Open Course Player</a>
          </div>

          <div class="footer">
            Trust Lesson &bull; Access-Gated Learning Experience
          </div>
        </div>
      </body>
    </html>
  `;

  if (!resend) {
    console.log(`[Resend Mock] New material notification dispatched to ${to} (${moduleTitle} by ${mentorName})`);
    return { success: true, simulated: true };
  }

  try {
    const response = await resend.emails.send({
      from: SENDER_EMAIL,
      to,
      subject,
      html,
    });
    if (response.error) {
      console.warn(`[Resend Error] Failed to send new material notification to ${to}:`, response.error.message || response.error);
      return { success: false, error: response.error.message || "Failed to send email" };
    }
    const emailId = response.data?.id;
    console.log(`[Resend] New material email sent to ${to}:`, emailId);
    return { success: true, id: emailId };
  } catch (error) {
    console.warn(`[Resend Error] Failed to send new material notification to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
