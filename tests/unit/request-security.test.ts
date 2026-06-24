import { describe, expect, it } from "vitest";

import {
  RequestBodyError,
  consumeGlobalDailyLimit,
  consumeRateLimit,
  getClientIp,
  readJsonBodyWithLimit,
  requireSameOriginRequest,
} from "@/lib/request-security";

function request(url: string, init: RequestInit = {}) {
  return new Request(url, init);
}

describe("request-security", () => {
  it("extracts and sanitizes client IP from trusted proxy headers", () => {
    const req = request("https://site.test", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 5.6.7.8<script>",
      },
    });

    expect(getClientIp(req)).toBe("1.2.3.4");

    expect(
      getClientIp(
        request("https://site.test", {
          headers: { "cf-connecting-ip": "2001:db8::1<script>" },
        }),
      ),
    ).toBe("2001:db8::1script");

    expect(getClientIp(request("https://site.test"))).toBe("unknown");
  });

  it("requires same-origin requests", () => {
    expect(
      requireSameOriginRequest(
        request("https://site.test", {
          headers: {
            origin: "https://site.test",
            host: "site.test",
            "x-forwarded-proto": "https",
          },
        }),
      ),
    ).toEqual({ ok: true });

    expect(
      requireSameOriginRequest(
        request("https://site.test", {
          headers: {
            origin: "https://evil.test",
            host: "site.test",
          },
        }),
      ).ok,
    ).toBe(false);

    expect(requireSameOriginRequest(request("https://site.test")).ok).toBe(false);

    expect(
      requireSameOriginRequest(
        request("http://localhost:3000", {
          headers: {
            origin: "http://localhost:3000",
            host: "localhost:3000",
            "x-forwarded-proto": "https",
          },
        }),
      ),
    ).toEqual({ ok: true });

    expect(
      requireSameOriginRequest(
        request("https://site.test", {
          headers: {
            origin: "notaurl",
            host: "site.test",
          },
        }),
      ).ok,
    ).toBe(false);

    expect(
      requireSameOriginRequest(
        request("https://site.test", {
          headers: {
            origin: "http://site.test",
            host: "site.test",
            "x-forwarded-proto": "https",
          },
        }),
      ).ok,
    ).toBe(false);
  });

  it("reads JSON bodies with content-type and byte limits", async () => {
    await expect(
      readJsonBodyWithLimit<{ ok: boolean }>(
        request("https://site.test", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ok: true }),
        }),
        64,
      ),
    ).resolves.toEqual({ ok: true });

    await expect(
      readJsonBodyWithLimit(
        request("https://site.test", {
          method: "POST",
          headers: { "content-type": "text/plain" },
          body: "{}",
        }),
        64,
      ),
    ).rejects.toMatchObject({ status: 415 });

    await expect(
      readJsonBodyWithLimit(
        request("https://site.test", {
          method: "POST",
          headers: { "content-type": "application/json", "content-length": "100" },
          body: "{}",
        }),
        10,
      ),
    ).rejects.toBeInstanceOf(RequestBodyError);

    await expect(
      readJsonBodyWithLimit(
        request("https://site.test", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{not-json",
        }),
        64,
      ),
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      readJsonBodyWithLimit(
        request("https://site.test", {
          method: "GET",
          headers: { "content-type": "application/json" },
        }),
        64,
      ),
    ).rejects.toMatchObject({ status: 400 });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"multi":'));
        controller.enqueue(encoder.encode("true}"));
        controller.close();
      },
    });

    await expect(
      readJsonBodyWithLimit<{ multi: boolean }>(
        request("https://site.test", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: stream,
          // Node's Request implementation requires duplex for streaming bodies.
          duplex: "half",
        } as RequestInit & { duplex: "half" }),
        64,
      ),
    ).resolves.toEqual({ multi: true });
  });

  it("enforces sliding and daily rate limits", () => {
    const key = `unit-${crypto.randomUUID()}`;

    expect(consumeRateLimit(key, { windowMs: 60_000, windowLimit: 2, dailyLimit: 2 })).toBe(true);
    expect(consumeRateLimit(key, { windowMs: 60_000, windowLimit: 2, dailyLimit: 2 })).toBe(true);
    expect(consumeRateLimit(key, { windowMs: 60_000, windowLimit: 2, dailyLimit: 2 })).toBe(false);

    const dailyKey = `daily-${crypto.randomUUID()}`;
    expect(consumeRateLimit(dailyKey, { windowMs: 60_000, windowLimit: 10, dailyLimit: 1 })).toBe(true);
    expect(consumeRateLimit(dailyKey, { windowMs: 60_000, windowLimit: 10, dailyLimit: 1 })).toBe(false);

    for (let index = 0; index < 4; index += 1) {
      expect(
        consumeRateLimit(`trim-${crypto.randomUUID()}`, {
          windowMs: 60_000,
          windowLimit: 10,
          dailyLimit: 10,
          maxTrackedKeys: 1,
        }),
      ).toBe(true);
    }
  });

  it("enforces global daily limits", () => {
    const key = `global-${crypto.randomUUID()}`;

    expect(consumeGlobalDailyLimit(key, 1)).toBe(true);
    expect(consumeGlobalDailyLimit(key, 1)).toBe(false);

    const incrementKey = `global-increment-${crypto.randomUUID()}`;
    expect(consumeGlobalDailyLimit(incrementKey, 3)).toBe(true);
    expect(consumeGlobalDailyLimit(incrementKey, 3)).toBe(true);
  });
});
