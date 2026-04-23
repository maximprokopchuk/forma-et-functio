"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/admin-audit";
import { generateFeedback } from "@/lib/ai/feedback";

/**
 * Admin-triggered retry of a failed submission. Resets status to PENDING
 * and re-invokes the feedback pipeline synchronously. Intentionally bounded
 * to admin-initiated retries — the periodic cron job does bulk retries with
 * its own retryCount ceiling.
 */
export async function retrySubmission(id: string): Promise<void> {
  const session = await requireAdmin();

  const existing = await db.submission.findUnique({ where: { id } });
  if (!existing) throw new Error("Работа не найдена.");

  await db.submission.update({
    where: { id },
    data: { status: "PENDING" },
  });

  await logAdminAction(session.user.id, "submission.retry", { targetId: id });

  // Fire the AI pipeline. Errors are swallowed here so the UI surfaces the
  // row transitioning to FEEDBACK_FAILED rather than a 500 — matches the
  // cron behaviour.
  try {
    await generateFeedback(id);
  } catch {
    // Intentional — status ends up FEEDBACK_FAILED, visible in the table.
  }

  revalidatePath("/admin/submissions");
}

export async function archiveSubmission(id: string): Promise<void> {
  const session = await requireAdmin();
  await db.submission.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  await logAdminAction(session.user.id, "submission.archive", { targetId: id });
  revalidatePath("/admin/submissions");
}

export async function deleteSubmission(id: string): Promise<void> {
  const session = await requireAdmin();
  await db.submission.delete({ where: { id } });
  await logAdminAction(session.user.id, "submission.delete", { targetId: id });
  revalidatePath("/admin/submissions");
}
