import { checkObjectStorageConnection } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.FILE_STORAGE_MODE !== "s3") {
    return Response.json(
      { status: "disabled", storage: "local" },
      { status: 503 },
    );
  }

  try {
    await checkObjectStorageConnection();
    return Response.json({ status: "ok", storage: "s3" });
  } catch (error) {
    const errorName =
      typeof error === "object" && error !== null && "name" in error
        ? String(error.name)
        : "StorageConnectionError";

    console.error("Object storage healthcheck failed.", error);

    return Response.json(
      { status: "error", storage: "s3", error: errorName },
      { status: 503 },
    );
  }
}
