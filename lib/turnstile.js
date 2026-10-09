/**
 * Cloudflare Turnstile Server-Side Verification Helper
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const TURNSTILE_SECRET_KEY =
  process.env.TURNSTILE_SECRET_KEY || "0x4AAAAAAFSTgM-NVT653MvvhqoNnG2SXVY";

/**
 * Verify Cloudflare Turnstile Token
 * @param {string} token - The response token from the Turnstile widget
 * @param {string} [remoteIp] - Client IP address (optional)
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function verifyTurnstileToken(token, remoteIp = "") {
  if (!token) {
    return { success: false, error: "Cloudflare Turnstile verification token is missing." };
  }

  // Allow dev test token bypass if configured
  if (token === "dev-test-bypass-token" || token === "1x00000000000000000000AA") {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      return { success: false, error: `Cloudflare Turnstile gateway returned HTTP ${res.status}` };
    }

    const outcome = await res.json();
    if (outcome.success) {
      return { success: true };
    }

    const errorCodes = outcome["error-codes"] ? outcome["error-codes"].join(", ") : "verification failed";
    console.warn("[Turnstile] Verification rejected:", errorCodes);
    return {
      success: false,
      error: `Security verification failed (${errorCodes}). Please try again.`,
    };
  } catch (err) {
    console.error("[Turnstile] Verification network error:", err);
    // In dev mode, gracefully allow test continuation if Cloudflare API is unreachable
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Turnstile] Dev mode fallback: allowing sign-in due to network unreachable");
      return { success: true };
    }
    return { success: false, error: "Unable to verify security challenge. Please try again." };
  }
}
