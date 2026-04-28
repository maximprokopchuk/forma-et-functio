import { NextResponse } from "next/server";
import { getRubric } from "@/lib/rubrics";

export const runtime = "nodejs";
// Rubrics are filesystem content cached at module load — safe to cache the
// HTTP response too. They change only on deploy.
export const revalidate = 3600;

/**
 * GET /api/rubrics/:id — public rubric metadata for SubmissionForm criteria
 * preview and FeedbackReadout label mapping.
 *
 * Returns dimensions with id/label/weight only. The `levels` text and
 * `reference_examples` are author-side context for the AI prompt; we don't
 * leak them to the client to avoid users gaming their submissions against
 * the rubric description verbatim.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-z0-9-]+$/.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const rubric = getRubric(id);
  if (!rubric) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: rubric.id,
    dimensions: rubric.dimensions.map((d) => ({
      id: d.id,
      label: d.label,
      weight: d.weight,
    })),
  });
}
