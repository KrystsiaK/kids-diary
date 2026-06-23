import { isAdminAuthenticated } from "@/features/admin/lib/admin-auth";
import { requireSameOriginRequest } from "@/lib/request-security";
import { saveUploadedImage } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 90 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Your admin session has expired." }, { status: 401 });
  }

  const originCheck = requireSameOriginRequest(request);
  if (!originCheck.ok) {
    return Response.json({ error: "Upload origin was rejected." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.split(";", 1)[0] ?? "";
  if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
    return Response.json(
      { error: "Use a JPG, PNG, WebP, GIF, or AVIF image." },
      { status: 415 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "This image exceeds the 90 MB per-file limit." },
      { status: 413 },
    );
  }

  try {
    const bytes = await request.arrayBuffer();

    if (bytes.byteLength === 0) {
      return Response.json({ error: "The selected image is empty." }, { status: 400 });
    }

    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      return Response.json(
        { error: "This image exceeds the 90 MB per-file limit." },
        { status: 413 },
      );
    }

    const file = new File([bytes], "admin-upload", { type: contentType });
    const url = await saveUploadedImage(file);

    if (!url) {
      return Response.json({ error: "The image could not be stored." }, { status: 502 });
    }

    return Response.json({ url });
  } catch (error) {
    console.error("Admin image upload failed.", error);

    const message =
      error instanceof Error && error.message.startsWith("Unsupported image format")
        ? "The file contents do not match a supported image format."
        : "The image could not be uploaded to storage. Try again.";

    return Response.json({ error: message }, { status: 502 });
  }
}
