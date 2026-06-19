import "server-only";

import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getUploadsConfig } from "@/lib/uploads";

export type StorageMode = "local" | "s3";

type SaveImageInput = {
  bytes: Buffer;
  contentType: string;
  filename: string;
};

function normalizeUploadsSubdir(value: string | undefined) {
  const candidate = value?.trim().replace(/^\/+|\/+$/g, "") || "uploads";
  return candidate
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9/_-]/g, ""))
    .filter(Boolean)
    .join("/");
}

function sanitizeFilename(filename: string) {
  const extension = path.extname(filename).toLowerCase() || ".jpg";
  return `${randomUUID()}${extension.replace(/[^a-z0-9.]/g, "")}`;
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

  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    throw new Error(
      "S3 storage requires S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_PUBLIC_BASE_URL.",
    );
  }

  return {
    bucket,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
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

async function saveImageLocally({ bytes, filename }: SaveImageInput) {
  const { uploadsDir, publicBasePath } = getUploadsConfig();
  await mkdir(uploadsDir, { recursive: true });

  const savedFilename = sanitizeFilename(filename);
  const absolutePath = path.join(uploadsDir, savedFilename);
  await writeFile(absolutePath, bytes);

  return `${publicBasePath}/${savedFilename}`;
}

async function saveImageToS3({ bytes, contentType, filename }: SaveImageInput) {
  const config = getS3Config();
  const client = getS3Client();
  const savedFilename = sanitizeFilename(filename);
  const key = config.keyPrefix ? `${config.keyPrefix}/${savedFilename}` : savedFilename;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${config.publicBaseUrl}/${key}`;
}

export async function saveUploadedImage(file: File) {
  if (!file || file.size === 0) {
    return null;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const input: SaveImageInput = {
    bytes,
    contentType: file.type || "application/octet-stream",
    filename: file.name,
  };

  if (getStorageMode() === "s3") {
    return saveImageToS3(input);
  }

  return saveImageLocally(input);
}

