import "server-only";

const DEFAULT_MAX_TRACKED_KEYS = 5_000;

type RateLimitOptions = {
  windowMs: number;
  windowLimit: number;
  dailyLimit?: number;
  maxTrackedKeys?: number;
};

type DailyCounter = { day: string; count: number };

const slidingWindowHits = new Map<string, number[]>();
const dailyHits = new Map<string, DailyCounter>();
const globalDailyHits = new Map<string, DailyCounter>();

export class RequestBodyError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "RequestBodyError";
    this.status = status;
  }
}

function getDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function trimTrackedMaps(maxTrackedKeys: number) {
  if (slidingWindowHits.size > maxTrackedKeys) {
    for (const key of slidingWindowHits.keys()) {
      slidingWindowHits.delete(key);
      if (slidingWindowHits.size <= maxTrackedKeys) break;
    }
  }

  if (dailyHits.size > maxTrackedKeys) {
    for (const key of dailyHits.keys()) {
      dailyHits.delete(key);
      if (dailyHits.size <= maxTrackedKeys) break;
    }
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  const candidate =
    cloudflareIp || realIp || forwardedFor?.split(",")[0]?.trim() || "unknown";

  return candidate.replace(/[^a-zA-Z0-9:._-]/g, "").slice(0, 64) || "unknown";
}

export function requireSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
  const host = forwardedHost || request.headers.get("host");

  if (!origin || !host) {
    return { ok: false, status: 403, error: "Request origin was rejected." } as const;
  }

  try {
    const originUrl = new URL(origin);
    const expectedProtocol = forwardedProto === "http" ? "http:" : "https:";
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const protocolMatches =
      isLocalhost || !forwardedProto || originUrl.protocol === expectedProtocol;

    if (originUrl.host !== host || !protocolMatches) {
      return { ok: false, status: 403, error: "Request origin was rejected." } as const;
    }
  } catch {
    return { ok: false, status: 403, error: "Request origin was rejected." } as const;
  }

  return { ok: true } as const;
}

export async function readJsonBodyWithLimit<T>(request: Request, maxBytes: number): Promise<T> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") {
    throw new RequestBodyError("Use application/json.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestBodyError("Request body is too large.", 413);
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new RequestBodyError("Invalid request body.", 400);
  }

  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      throw new RequestBodyError("Request body is too large.", 413);
    }

    chunks.push(value);
  }

  try {
    const bodyText = new TextDecoder().decode(
      chunks.length === 1 ? chunks[0] : concatUint8Arrays(chunks, receivedBytes),
    );
    return JSON.parse(bodyText) as T;
  } catch {
    throw new RequestBodyError("Invalid request body.", 400);
  }
}

function concatUint8Arrays(chunks: Uint8Array[], totalLength: number) {
  const merged = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return merged;
}

export function consumeRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const dayKey = getDayKey();
  const maxTrackedKeys = options.maxTrackedKeys ?? DEFAULT_MAX_TRACKED_KEYS;

  trimTrackedMaps(maxTrackedKeys);

  const windowHits = (slidingWindowHits.get(key) ?? []).filter(
    (timestamp) => now - timestamp < options.windowMs,
  );

  if (windowHits.length >= options.windowLimit) {
    return false;
  }

  if (options.dailyLimit) {
    const dailyKey = `${key}:daily`;
    const daily = dailyHits.get(dailyKey);

    if (daily && daily.day === dayKey) {
      if (daily.count >= options.dailyLimit) {
        return false;
      }
      daily.count += 1;
    } else {
      dailyHits.set(dailyKey, { day: dayKey, count: 1 });
    }
  }

  windowHits.push(now);
  slidingWindowHits.set(key, windowHits);
  return true;
}

export function consumeGlobalDailyLimit(key: string, limit: number) {
  const dayKey = getDayKey();
  const daily = globalDailyHits.get(key);

  if (daily && daily.day === dayKey) {
    if (daily.count >= limit) {
      return false;
    }
    daily.count += 1;
  } else {
    globalDailyHits.set(key, { day: dayKey, count: 1 });
  }

  return true;
}
