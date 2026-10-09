import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "trust-lesson-dev-secret-key-min-32chars"
);

const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}-refresh` : "trust-lesson-dev-refresh-secret-min-32chars")
);

/**
 * Sign a standard JWT with given payload.
 * @param {object} payload
 * @param {string} expiresIn - e.g. "15m", "7d"
 */
export async function signJwt(payload, expiresIn = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Sign a short-lived Access Token (15 minutes)
 * @param {object} payload
 */
export async function signAccessToken(payload) {
  return await new SignJWT({ ...payload, tokenType: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

/**
 * Sign a long-lived Refresh Token (7 days, or 30 days if rememberMe)
 * @param {object} payload
 * @param {boolean} rememberMe
 */
export async function signRefreshToken(payload, rememberMe = false) {
  const expiresIn = rememberMe ? "30d" : "7d";
  return await new SignJWT({ ...payload, tokenType: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(refreshSecret);
}

/**
 * Verify an Access Token or standard JWT
 * @param {string} token
 */
export async function verifyJwt(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * Verify a Refresh Token
 * @param {string} token
 */
export async function verifyRefreshToken(token) {
  const { payload } = await jwtVerify(token, refreshSecret);
  if (payload.tokenType !== "refresh") {
    throw new Error("Invalid token type for refresh token");
  }
  return payload;
}

/**
 * Extract JWT from Authorization: Bearer <token> header.
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
