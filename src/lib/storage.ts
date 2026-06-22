import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

import {
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";

import { getUploadsConfig } from "@/lib/uploads";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export type StorageMode = "local" | "s3";

type SaveImageInput = {
  bytes: Buffer;
  contentType: string;
  safeFilename: string;
};

async function validateImageMime(bytes: Buffer): Promise<string> {
  const detected = await fileTypeFromBuffer(bytes);
  if (!detected || !ALLOWED_IMAGE_MIME_TYPES.has(detected.mime)) {
    throw new Error(`Unsupported image format: ${detected?.mime ?? "unknown"}`);
  }
  return detected.mime;
}

function buildSafeFilename(detectedMime: string): string {
  const ext = MIME_TO_EXTENSION[detectedMime] ?? ".jpg";
  return `${randomUUID()}${ext}`;
}

function normalizeUploadsSubdir(value: string | undefined) {
  const candidate = value?.trim().replace(/^\/+|\/+$/g, "") || "uploads";
  return candidate
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9/_-]/g, ""))
    .filter(Boolean)
    .join("/");
}

function getStorageMode(): StorageMode {
  return process.env.FILE_STORAGE_MODE === "s3" ? "s3" : "local";
}

function getS3Config() {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  const region = process.env.S3_REGION || "auto";
  const keyPrefix = normalizeUploadsSubdir(process.env.S3_KEY_PREFIX);

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 storage requires S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.",
    );
  }

  return {
    bucket,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl?.replace(/\/+$/, "") || null,
    region,
    keyPrefix,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

let cachedS3Client: S3Client | null = null;

function getS3Client() {
  if (cachedS3Client) {
    return cachedS3Client;
  }

  const config = getS3Config();

  cachedS3Client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedS3Client;
}

async function saveImageLocally({ bytes, safeFilename }: SaveImageInput) {
  const { uploadsDir, publicBasePath } = getUploadsConfig();
  await mkdir(uploadsDir, { recursive: true });

  const { join } = await import("node:path");
  const absolutePath = join(uploadsDir, safeFilename);
  await writeFile(absolutePath, bytes);

  return `${publicBasePath}/${safeFilename}`;
}

async function saveImageToS3({ bytes, contentType, safeFilename }: SaveImageInput) {
  const config = getS3Config();
  const client = getS3Client();
  const key = config.keyPrefix ? `${config.keyPrefix}/${safeFilename}` : safeFilename;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl}/${key}`;
  }

  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/media/${encodedKey}`;
}

export async function getStoredImage(key: string) {
  const config = getS3Config();

  return getS3Client().send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

export async function checkObjectStorageConnection() {
  const config = getS3Config();

  await getS3Client().send(
    new HeadBucketCommand({
      Bucket: config.bucket,
    }),
  );
}

export async function saveUploadedImage(file: File) {
  if (!file || file.size === 0) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detectedMime = await validateImageMime(bytes);
  const safeFilename = buildSafeFilename(detectedMime);

  const input: SaveImageInput = {
    bytes,
    contentType: detectedMime,
    safeFilename,
  };

  if (getStorageMode() === "s3") {
    return saveImageToS3(input);
  }

  return saveImageLocally(input);
}
