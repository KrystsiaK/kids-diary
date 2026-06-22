import { getStoredImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

function isSafeKeyPart(value: string) {
  return Boolean(value) && value !== "." && value !== ".." && !value.includes("/");
}

function isMissingObjectError(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return (
    candidate.name === "NoSuchKey" ||
    candidate.name === "NotFound" ||
    candidate.$metadata?.httpStatusCode === 404
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;

  if (!key.length || key.some((part) => !isSafeKeyPart(part))) {
    return Response.json({ error: "Invalid media key." }, { status: 400 });
  }

  try {
    const object = await getStoredImage(key.join("/"));

    if (!object.Body) {
      return Response.json({ error: "Media not found." }, { status: 404 });
    }

    const headers = new Headers({
      "Cache-Control": object.CacheControl || "public, max-age=31536000, immutable",
      "Content-Type": object.ContentType || "application/octet-stream",
    });

    if (typeof object.ContentLength === "number") {
      headers.set("Content-Length", object.ContentLength.toString());
    }

    if (object.ETag) {
      headers.set("ETag", object.ETag);
    }

    return new Response(object.Body.transformToWebStream(), { headers });
  } catch (error) {
    if (isMissingObjectError(error)) {
      return Response.json({ error: "Media not found." }, { status: 404 });
    }

    console.error("Failed to load media from object storage.", error);
    return Response.json({ error: "Media is temporarily unavailable." }, { status: 502 });
  }
}
