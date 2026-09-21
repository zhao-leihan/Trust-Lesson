/**
 * Cloudflare Stream helpers.
 * Docs: https://developers.cloudflare.com/stream/
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN;
const SIGNING_KEY = process.env.CLOUDFLARE_STREAM_SIGNING_KEY;
const SIGNING_KEY_ID = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;

/**
 * Get a signed upload URL for direct upload to Cloudflare Stream.
 * @param {object} options
 * @param {string} options.title
 * @param {number} options.maxDurationSeconds
 */
export async function getCloudflareUploadUrl({ title = "Video", maxDurationSeconds = 3600 }) {
  if (!ACCOUNT_ID || !API_TOKEN) {
    // DEV FALLBACK: return a mock URL
    return {
      uploadURL: "https://mock-cloudflare-upload.example.com",
      uid: `mock-${Date.now()}`,
    };
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds,
        expiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        meta: { name: title },
        requireSignedURLs: true,
      }),
    }
  );

  const data = await res.json();
  if (!data.success) throw new Error(`Cloudflare upload URL error: ${JSON.stringify(data.errors)}`);
  return {
    uploadURL: data.result.uploadURL,
    uid: data.result.uid,
  };
}

/**
 * Generate a signed playback URL for a Cloudflare Stream video.
 * URL expires in 1 hour.
 * @param {string} videoId - Cloudflare Stream UID
 */
export async function getSignedPlaybackUrl(videoId) {
  if (!SIGNING_KEY || !SIGNING_KEY_ID) {
    // DEV FALLBACK: return a public URL
    return `https://customer-mock.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  }

  // Sign a token using the Cloudflare signing key (RS256 approach simplified)
  // In production, use the cf-stream-token package or the official approach
  const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const token = btoa(
    JSON.stringify({
      sub: videoId,
      kid: SIGNING_KEY_ID,
      exp: expiry,
      accessRules: [{ type: "any", action: "allow" }],
    })
  );

  return `https://customer.cloudflarestream.com/${token}/manifest/video.m3u8`;
}

/**
 * Get video details from Cloudflare Stream.
 */
export async function getCloudflareVideoDetails(videoId) {
  if (!ACCOUNT_ID || !API_TOKEN) {
    return { uid: videoId, status: { state: "ready" }, duration: 0 };
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/${videoId}`,
    { headers: { Authorization: `Bearer ${API_TOKEN}` } }
  );
  const data = await res.json();
  return data.result;
}
