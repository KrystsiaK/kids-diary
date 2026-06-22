export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "explorers-journal",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
