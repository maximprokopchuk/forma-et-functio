import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAuth, unauthorized } from "@/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/submissions/upload — generates a Vercel Blob client token so the
 * SubmissionForm can upload a screenshot directly to Blob storage. The actual
 * Submission row is created later by POST /api/submissions with `imageUrl`.
 *
 * Constraints set on the client token (server-enforced):
 *   - access: public (the gallery permalink renders the image inline)
 *   - allowedContentTypes: PNG/JPEG/WEBP/GIF only
 *   - maximumSizeInBytes: 5 MB
 *   - validUntil: 5 minutes (token is short-lived)
 *
 * Without BLOB_READ_WRITE_TOKEN the route returns 503 so the form can show a
 * friendly "uploads not configured" message instead of a generic failure.
 */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Загрузка изображений не настроена" },
      { status: 503 },
    );
  }

  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        access: "public",
        allowedContentTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
        maximumSizeInBytes: 5 * 1024 * 1024,
        validUntil: Date.now() + 5 * 60_000,
        addRandomSuffix: true,
        // The user id is encoded into the token payload so the upload-completed
        // callback (if we add one later) can attribute the blob.
        tokenPayload: JSON.stringify({ userId: session.user.id }),
      }),
      onUploadCompleted: async () => {
        // No DB write here — POST /api/submissions persists the imageUrl.
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(
      `[submissions/upload] handleUpload failed for user ${session.user.id}:`,
      err,
    );
    const message = err instanceof Error ? err.message : "upload error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
