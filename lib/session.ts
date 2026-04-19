import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

type CookieStore = ReturnType<typeof cookies>;

export const PARTICIPANT_COOKIE = "mp_session";
export const ADMIN_COOKIE = "mp_admin";

const PARTICIPANT_TTL = 60 * 60 * 24 * 7; // 7j
const ADMIN_TTL = 60 * 60 * 8; // 8h

function getSessionSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET manquant ou trop court (>=16 chars)");
  }
  return new TextEncoder().encode(s);
}

function getAdminSecret(): Uint8Array {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET manquant ou trop court (>=16 chars)");
  }
  return new TextEncoder().encode(s);
}

export interface ParticipantSession {
  participantId: string;
  iat: number;
  exp: number;
}

export interface AdminSession {
  admin: true;
  iat: number;
  exp: number;
}

async function sign(payload: Record<string, unknown>, secret: Uint8Array, ttl: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secret);
}

export async function createParticipantSession(participantId: string): Promise<void> {
  const token = await sign({ participantId }, getSessionSecret(), PARTICIPANT_TTL);
  cookies().set(PARTICIPANT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PARTICIPANT_TTL,
  });
}

export async function getParticipantSession(
  store?: CookieStore
): Promise<ParticipantSession | null> {
  const c = store ?? cookies();
  const token = c.get(PARTICIPANT_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    if (typeof payload.participantId !== "string") return null;
    return payload as unknown as ParticipantSession;
  } catch {
    return null;
  }
}

export async function clearParticipantSession(): Promise<void> {
  cookies().set(PARTICIPANT_COOKIE, "", { path: "/", maxAge: 0 });
}

export async function createAdminSession(): Promise<void> {
  const token = await sign({ admin: true }, getAdminSecret(), ADMIN_TTL);
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TTL,
  });
}

export async function getAdminSession(
  store?: CookieStore
): Promise<AdminSession | null> {
  const c = store ?? cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAdminSecret());
    if (payload.admin !== true) return null;
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function clearAdminSession(): Promise<void> {
  cookies().set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

