import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

const ADMIN_SESSION_COOKIE = "atlas_admin_session";
const intlMiddleware = createIntlMiddleware(routing);

async function verifySessionToken(value: string | undefined): Promise<boolean> {
  if (!value) return false;

  const dotIndex = value.indexOf(".");
  if (dotIndex === -1) return false;

  const expiresAtRaw = value.slice(0, dotIndex);
  const providedSignature = value.slice(dotIndex + 1);
  const expiresAt = Number(expiresAtRaw);

  if (!expiresAtRaw || !providedSignature || !Number.isFinite(expiresAt)) return false;
  if (Date.now() >= expiresAt) return false;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  const encoder = new TextEncoder();

  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    return false;
  }

  const hexPairs = providedSignature.match(/.{2}/g);
  if (!hexPairs || hexPairs.length !== 32) return false;
  const sigBytes = new Uint8Array(hexPairs.map((b) => parseInt(b, 16)));

  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(expiresAtRaw));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isValid = await verifySessionToken(sessionCookie);

    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
