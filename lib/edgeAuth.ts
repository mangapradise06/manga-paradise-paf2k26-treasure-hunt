import { jwtVerify } from "jose";

/**
 * Edge-safe admin token verification (utilisé par le middleware).
 * Ne JAMAIS importer "server-only" ici : Edge runtime ne le supporte pas.
 */
export const ADMIN_COOKIE = "mp_admin";

export async function verifyAdminToken(
  token: string | undefined,
  secret: string | undefined
): Promise<boolean> {
  if (!token || !secret || secret.length < 16) return false;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload.admin === true;
  } catch {
    return false;
  }
}
