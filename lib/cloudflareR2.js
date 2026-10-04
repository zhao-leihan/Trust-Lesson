import crypto from "crypto";

/**
 * Cloudflare R2 Helper for Private Gated Module Documents (PDF, PPTX, Slides, etc.)
 * S3-compatible API using native Node.js crypto (AWS SigV4)
 * Documentation: https://developers.cloudflare.com/r2/api/s3/api/
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "trust-lesson-resources";
const JWT_SECRET = process.env.JWT_SECRET || "trust-lesson-r2-dev-secret-key-min-32chars";

// In-memory / temporary store for local dev when R2 credentials are not yet configured
const devResourceStore = new Map();

/**
 * Upload a document to private Cloudflare R2 storage.
 * @param {object} params
 * @param {Buffer|Uint8Array} params.fileBuffer - Raw binary of file
 * @param {string} params.fileName - Original file name (e.g. "Web3_Solidity_Guide.pdf")
 * @param {string} params.contentType - MIME type
 * @param {string} params.moduleId - Module identifier
 * @param {string} [params.resourceId] - Resource identifier
 * @returns {Promise<{ resourceId: string, key: string, name: string, size: number, type: string, uploadedAt: string }>}
 */
export async function uploadResourceToR2({ fileBuffer, fileName, contentType = "application/octet-stream", moduleId = "default", resourceId }) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const resId = resourceId || `res-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const key = `modules/${moduleId}/${resId}-${safeFileName}`;
  const size = fileBuffer.length || (fileBuffer.byteLength ?? 0);
  const uploadedAt = new Date().toISOString();

  // If Cloudflare R2 credentials are provided, upload to real R2 bucket via S3 API
  if (ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${BUCKET_NAME}/${key}`;

    const dateStr = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
    const dateStamp = dateStr.slice(0, 8); // YYYYMMDD
    const region = "auto";
    const service = "s3";

    // AWS SigV4 Headers
    const payloadHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const canonicalHeaders = `content-type:${contentType}\nhost:${ACCOUNT_ID}.r2.cloudflarestorage.com\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${dateStr}\n`;
    const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = [
      "PUT",
      `/${BUCKET_NAME}/${key}`,
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      dateStr,
      credentialScope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const kDate = crypto.createHmac("sha256", `AWS4${SECRET_ACCESS_KEY}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
    const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "x-amz-date": dateStr,
        "x-amz-content-sha256": payloadHash,
        Authorization: authHeader,
      },
      body: fileBuffer,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[Cloudflare R2] Upload failed:", res.status, errText);
      throw new Error(`R2 upload failed: ${res.statusText}`);
    }
  } else {
    // DEV FALLBACK: Store buffer in secure memory vault
    devResourceStore.set(key, {
      buffer: fileBuffer,
      fileName,
      contentType,
      size,
      uploadedAt,
    });
  }

  return {
    resourceId: resId,
    key,
    name: fileName,
    size,
    type: contentType,
    uploadedAt,
  };
}

/**
 * Generate a short-lived presigned download URL for a private R2 resource.
 * @param {object} params
 * @param {string} params.key - The R2 object key
 * @param {string} [params.filename] - Original download filename
 * @param {number} [params.expiresInSeconds=900] - Expiry in seconds (default 15 minutes)
 * @returns {Promise<{ downloadUrl: string, expiresAt: string, expiresIn: number }>}
 */
export async function getPresignedR2DownloadUrl({ key, filename, expiresInSeconds = 900 }) {
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  if (ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const dateStr = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = dateStr.slice(0, 8);
    const region = "auto";
    const service = "s3";
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

    const queryParams = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${ACCESS_KEY_ID}/${credentialScope}`,
      "X-Amz-Date": dateStr,
      "X-Amz-Expires": expiresInSeconds.toString(),
      "X-Amz-SignedHeaders": "host",
    });

    if (filename) {
      queryParams.set("response-content-disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    }

    const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = "host";

    const canonicalRequest = [
      "GET",
      `/${BUCKET_NAME}/${key}`,
      queryParams.toString(),
      canonicalHeaders,
      signedHeaders,
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      dateStr,
      credentialScope,
      crypto.createHash("sha256").update(canonicalRequest).digest("hex"),
    ].join("\n");

    const kDate = crypto.createHmac("sha256", `AWS4${SECRET_ACCESS_KEY}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
    const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    queryParams.set("X-Amz-Signature", signature);

    const downloadUrl = `${endpoint}/${BUCKET_NAME}/${key}?${queryParams.toString()}`;
    return { downloadUrl, expiresAt, expiresIn: expiresInSeconds };
  }

  // DEV FALLBACK: Generate HMAC-signed time-expiring download link handled by /api/modules/resources/download-temp
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const signatureData = `${key}:${exp}`;
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(signatureData).digest("hex");
  const token = Buffer.from(JSON.stringify({ key, exp, sig, name: filename })).toString("base64url");

  const downloadUrl = `/api/modules/resources/download-temp?token=${token}`;
  return { downloadUrl, expiresAt, expiresIn: expiresInSeconds };
}

/**
 * Verify and retrieve data from a dev temporary download token.
 * @param {string} token - Base64url token
 * @returns {{ valid: boolean, key?: string, name?: string, fileData?: any, error?: string }}
 */
export function verifyAndGetDevResource(token) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const { key, exp, sig, name } = JSON.parse(raw);

    if (Date.now() / 1000 > exp) {
      return { valid: false, error: "Download link has expired (15m window passed)" };
    }

    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${key}:${exp}`).digest("hex");
    if (sig !== expectedSig) {
      return { valid: false, error: "Invalid signature" };
    }

    const fileData = devResourceStore.get(key);
    return { valid: true, key, name, fileData };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
