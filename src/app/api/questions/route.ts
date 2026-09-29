import { buildMatch } from "@/lib/draw";
import { categoryFilterSchema } from "@/lib/validation";

// Random draw on every request: never cache.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("category") ?? undefined;
  const parsed = categoryFilterSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "invalid_category" }, { status: 400 });
  }

  return Response.json(
    { questions: buildMatch(parsed.data) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
