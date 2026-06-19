import "server-only";

import path from "node:path";

function normalizeUploadsSubdir(value: string | undefined) {
  const candidate = value?.trim().replace(/^\/+|\/+$/g, "") || "uploads";
  return candidate
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");
}

export function getUploadsConfig() {
  const uploadsSubdir = normalizeUploadsSubdir(process.env.UPLOADS_SUBDIR);

  return {
    uploadsDir: path.join(process.cwd(), "public", uploadsSubdir),
    publicBasePath: `/${uploadsSubdir}`,
  };
}

