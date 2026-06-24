import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const fileTypeFromBuffer = vi.fn();
  const sharp = vi.fn();
  const toBuffer = vi.fn();
  const s3Send = vi.fn();
  const randomUUID = vi.fn(() => "fixed-id");

  class PutObjectCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  class GetObjectCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  class HeadBucketCommand {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  }

  class S3Client {
    config: unknown;

    constructor(config: unknown) {
      this.config = config;
    }

    send(command: unknown) {
      return s3Send(command);
    }
  }

  return {
    fileTypeFromBuffer,
    sharp,
    toBuffer,
    s3Send,
    randomUUID,
    PutObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    S3Client,
  };
});

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return {
    ...actual,
    randomUUID: mocks.randomUUID,
  };
});

vi.mock("file-type", () => ({
  fileTypeFromBuffer: mocks.fileTypeFromBuffer,
}));

vi.mock("sharp", () => ({
  default: mocks.sharp,
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: mocks.S3Client,
  PutObjectCommand: mocks.PutObjectCommand,
  GetObjectCommand: mocks.GetObjectCommand,
  HeadBucketCommand: mocks.HeadBucketCommand,
}));

function resetStorageEnv() {
  delete process.env.FILE_STORAGE_MODE;
  delete process.env.UPLOADS_SUBDIR;
  delete process.env.S3_BUCKET;
  delete process.env.S3_ENDPOINT;
  delete process.env.S3_ACCESS_KEY_ID;
  delete process.env.S3_SECRET_ACCESS_KEY;
  delete process.env.S3_PUBLIC_BASE_URL;
  delete process.env.S3_REGION;
  delete process.env.S3_KEY_PREFIX;
  delete process.env.S3_FORCE_PATH_STYLE;
}

function pngFile(bytes = "raw-png") {
  return new File([Buffer.from(bytes)], "image.png", { type: "image/png" });
}

function commandInput(command: unknown) {
  return (command as { input: unknown }).input;
}

function filenameFromPublicPath(publicPath: string) {
  return publicPath.split("/").at(-1) ?? "";
}

describe("storage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    resetStorageEnv();
    mocks.randomUUID.mockReturnValue("fixed-id");
    mocks.fileTypeFromBuffer.mockResolvedValue({ mime: "image/png", ext: "png" });
    mocks.toBuffer.mockResolvedValue(Buffer.from("optimized-webp"));
    mocks.sharp.mockReturnValue({
      rotate: () => ({
        resize: () => ({
          webp: () => ({
            toBuffer: mocks.toBuffer,
          }),
        }),
      }),
    });
    mocks.s3Send.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetStorageEnv();
  });

  it("ignores empty uploads", async () => {
    const { saveUploadedImage } = await import("@/lib/storage");

    await expect(
      saveUploadedImage(new File([], "empty.png", { type: "image/png" })),
    ).resolves.toBeNull();
  });

  it("rejects unsupported image formats", async () => {
    mocks.fileTypeFromBuffer.mockResolvedValueOnce({ mime: "application/pdf", ext: "pdf" });

    const { saveUploadedImage } = await import("@/lib/storage");

    await expect(saveUploadedImage(pngFile())).rejects.toThrow(
      "Unsupported image format: application/pdf",
    );
  });

  it("stores animated GIFs locally without re-encoding them", async () => {
    mocks.fileTypeFromBuffer.mockResolvedValueOnce({ mime: "image/gif", ext: "gif" });
    const cwd = await mkdtemp(path.join(tmpdir(), "kids-diary-storage-"));
    vi.spyOn(process, "cwd").mockReturnValue(cwd);

    const { saveUploadedImage } = await import("@/lib/storage");
    const result = await saveUploadedImage(
      new File([Buffer.from("gif-bytes")], "loop.gif", { type: "image/gif" }),
    );

    expect(result).toMatch(/^\/uploads\/[a-f0-9-]+\.gif$/);
    expect(mocks.sharp).not.toHaveBeenCalled();
    await expect(
      readFile(path.join(cwd, "public/uploads", filenameFromPublicPath(result ?? "")), "utf8"),
    ).resolves.toBe("gif-bytes");
  });

  it("optimizes non-GIF images to WebP before local storage", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "kids-diary-storage-"));
    vi.spyOn(process, "cwd").mockReturnValue(cwd);
    process.env.UPLOADS_SUBDIR = " /Kid Photos/2026! ";

    const { saveUploadedImage } = await import("@/lib/storage");
    const result = await saveUploadedImage(pngFile());

    expect(result).toMatch(/^\/KidPhotos\/2026\/[a-f0-9-]+\.webp$/);
    expect(mocks.sharp).toHaveBeenCalledWith(expect.any(Buffer), { failOn: "none" });
    await expect(
      readFile(
        path.join(cwd, "public/KidPhotos/2026", filenameFromPublicPath(result ?? "")),
        "utf8",
      ),
    ).resolves.toBe("optimized-webp");
  });

  it("falls back to the original image when optimization fails", async () => {
    const cwd = await mkdtemp(path.join(tmpdir(), "kids-diary-storage-"));
    vi.spyOn(process, "cwd").mockReturnValue(cwd);
    mocks.toBuffer.mockRejectedValueOnce(new Error("sharp failed"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { saveUploadedImage } = await import("@/lib/storage");
    const result = await saveUploadedImage(pngFile("raw-original"));

    expect(result).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
    expect(consoleError).toHaveBeenCalledWith(
      "Image optimization failed; storing the original upload instead.",
      expect.any(Error),
    );
    await expect(
      readFile(path.join(cwd, "public/uploads", filenameFromPublicPath(result ?? "")), "utf8"),
    ).resolves.toBe("raw-original");
  });

  it("uploads optimized images to S3 and returns the configured public URL", async () => {
    process.env.FILE_STORAGE_MODE = "s3";
    process.env.S3_BUCKET = "kids";
    process.env.S3_ENDPOINT = "https://s3.test";
    process.env.S3_ACCESS_KEY_ID = "access";
    process.env.S3_SECRET_ACCESS_KEY = "secret";
    process.env.S3_PUBLIC_BASE_URL = "https://cdn.test/media/";
    process.env.S3_KEY_PREFIX = "/album one/";
    process.env.S3_FORCE_PATH_STYLE = "true";

    const { saveUploadedImage } = await import("@/lib/storage");
    const result = await saveUploadedImage(pngFile());

    expect(result).toMatch(/^https:\/\/cdn\.test\/media\/albumone\/[a-f0-9-]+\.webp$/);
    expect(commandInput(mocks.s3Send.mock.calls[0][0])).toMatchObject({
      Bucket: "kids",
      Key: expect.stringMatching(/^albumone\/[a-f0-9-]+\.webp$/),
      Body: Buffer.from("optimized-webp"),
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    });
  });

  it("returns encoded API media URLs when S3 has no public base URL", async () => {
    process.env.FILE_STORAGE_MODE = "s3";
    process.env.S3_BUCKET = "kids";
    process.env.S3_ENDPOINT = "https://s3.test";
    process.env.S3_ACCESS_KEY_ID = "access";
    process.env.S3_SECRET_ACCESS_KEY = "secret";
    process.env.S3_KEY_PREFIX = "family/photos";

    const { saveUploadedImage } = await import("@/lib/storage");

    await expect(saveUploadedImage(pngFile())).resolves.toMatch(
      /^\/api\/media\/family\/photos\/[a-f0-9-]+\.webp$/,
    );
  });

  it("requires complete S3 configuration", async () => {
    process.env.FILE_STORAGE_MODE = "s3";
    process.env.S3_BUCKET = "kids";

    const { saveUploadedImage } = await import("@/lib/storage");

    await expect(saveUploadedImage(pngFile())).rejects.toThrow(
      "S3 storage requires S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.",
    );
  });

  it("reads objects and checks bucket connectivity through S3 commands", async () => {
    process.env.S3_BUCKET = "kids";
    process.env.S3_ENDPOINT = "https://s3.test";
    process.env.S3_ACCESS_KEY_ID = "access";
    process.env.S3_SECRET_ACCESS_KEY = "secret";
    process.env.S3_REGION = "eu-test-1";

    const { checkObjectStorageConnection, getStoredImage } = await import("@/lib/storage");

    await getStoredImage("family/photo.webp");
    await checkObjectStorageConnection();

    expect(commandInput(mocks.s3Send.mock.calls[0][0])).toEqual({
      Bucket: "kids",
      Key: "family/photo.webp",
    });
    expect(commandInput(mocks.s3Send.mock.calls[1][0])).toEqual({
      Bucket: "kids",
    });
  });
});
