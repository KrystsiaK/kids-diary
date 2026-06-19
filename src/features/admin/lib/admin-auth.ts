import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_SESSION_COOKIE = "atlas_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is required to protect the admin area.");
  }

  return adminPassword;
}

function getAdminSessionSecret() {
  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret) {
    throw new Error("AUTH_SECRET is required to sign admin sessions.");
  }

  return authSecret;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function signSessionPayload(payload: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(payload).digest("hex");
}

function createSessionToken(expiresAt: number) {
  const payload = String(expiresAt);
  return `${payload}.${signSessionPayload(payload)}`;
}

function verifySessionToken(value: string | undefined) {
  if (!value) {
    return false;
  }

  const [expiresAtRaw, providedSignature] = value.split(".");
  const expiresAt = Number(expiresAtRaw);

  if (!expiresAtRaw || !providedSignature || !Number.isFinite(expiresAt)) {
    return false;
  }

  if (Date.now() >= expiresAt) {
    return false;
  }

  const expectedSignature = signSessionPayload(expiresAtRaw);

  return timingSafeEqual(digest(providedSignature), digest(expectedSignature));
}

export function verifyAdminPassword(candidate: string) {
  const expectedPassword = getAdminPassword();
  return timingSafeEqual(digest(candidate), digest(expectedPassword));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;

  cookieStore.set(ADMIN_SESSION_COOKIE, createSessionToken(expiresAt), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    priority: "high",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

