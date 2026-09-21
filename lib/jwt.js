import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "trust-lesson-dev-secret-key-min-32chars"
);

/**
 * Sign a JWT with given payload.
 * @param {object} payload
 * @param {string} expiresIn - e.g. "7d"
 */
export async function signJwt(payload, expiresIn = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Verify a JWT and return decoded payload.
 * Throws if invalid or expired.
 */
export async function verifyJwt(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * Extract JWT from Authorization: Bearer <token> header.
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
