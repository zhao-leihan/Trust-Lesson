import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "trust-lesson-dev-secret-key-min-32chars";

// In-memory set of used token signatures to prevent replay attacks
const consumedTokens = new Set();

// Clean up old consumed tokens periodically
const cleanupTimer = setInterval(() => {
  if (consumedTokens.size > 2000) {
    consumedTokens.clear();
  }
}, 15 * 60 * 1000);

if (cleanupTimer && typeof cleanupTimer.unref === "function") {
  cleanupTimer.unref();
}

/**
 * Generate a random alphanumeric code avoiding ambiguous characters
 */
function generateCode(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate an SVG captcha with noise lines and distorted characters
 */
export function generateCaptcha() {
  const code = generateCode(5);
  const exp = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  // Create HMAC token
  const payload = Buffer.from(JSON.stringify({ code, exp, nonce: crypto.randomBytes(8).toString("hex") })).toString("base64");
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  const captchaId = `${payload}.${signature}`;

  // Generate SVG with noise and stylized letters
  const width = 160;
  const height = 52;
  const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#4338ca", "#7c3aed"];

  // Noise lines
  let lines = "";
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * 20);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(width - Math.random() * 20);
    const y2 = Math.floor(Math.random() * height);
    const stroke = colors[i % colors.length];
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.35" />`;
  }

  // Noise dots
  let dots = "";
  for (let i = 0; i < 24; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.5 + 0.5).toFixed(1);
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" fill-opacity="0.4" />`;
  }

  // Letter glyphs with random rotations and offsets
  let textElements = "";
  const letterSpacing = width / (code.length + 1);
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = Math.floor(18 + i * letterSpacing + (Math.random() * 6 - 3));
    const y = Math.floor(34 + (Math.random() * 6 - 3));
    const rot = Math.floor(Math.random() * 24 - 12);
    const color = colors[i % colors.length];
    textElements += `<text x="${x}" y="${y}" font-family="Courier, monospace, sans-serif" font-size="26" font-weight="900" fill="${color}" transform="rotate(${rot} ${x} ${y})" letter-spacing="2">${char}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; display: block;">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" rx="12" fill="url(#bgGrad)" />
    ${lines}
    ${dots}
    ${textElements}
  </svg>`;

  return {
    captchaId,
    captchaSvg: svg,
  };
}

/**
 * Verify a captcha token against user submission
 */
export function verifyCaptcha(captchaId, userInput) {
  if (!captchaId || !userInput) {
    return { valid: false, reason: "Security verification code is required." };
  }

  const parts = captchaId.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "Malformed security verification token." };
  }

  const [payloadStr, signature] = parts;

  // Verify HMAC signature
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadStr).digest("hex");
  if (signature !== expectedSig) {
    return { valid: false, reason: "Security verification token is invalid or tampered." };
  }

  // Prevent replay
  if (consumedTokens.has(signature)) {
    return { valid: false, reason: "This verification code has already been used. Please refresh." };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadStr, "base64").toString("utf-8"));
  } catch (e) {
    return { valid: false, reason: "Unable to parse security verification payload." };
  }

  // Check expiration
  if (!payload.exp || Date.now() > payload.exp) {
    return { valid: false, reason: "Verification code has expired. Please refresh and try again." };
  }

  // Check code match (case-insensitive)
  const cleanInput = String(userInput).trim().toUpperCase();
  const cleanExpected = String(payload.code).trim().toUpperCase();

  if (cleanInput !== cleanExpected) {
    return { valid: false, reason: "Incorrect verification code. Please check the characters and try again." };
  }

  // Mark token as consumed
  consumedTokens.add(signature);

  return { valid: true };
}
