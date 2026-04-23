"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/admin-audit";

/**
 * Toggle a report between resolved/open. The caller passes the current
 * `resolved` value so we know which way to flip without re-reading the
 * row from the DB.
 */
export async function toggleResolved(id: string, resolved: boolean): Promise<void> {
  const session = await requireAdmin();
  const next = !resolved;
  await db.errorReport.update({
    where: { id },
    data: { resolved: next },
  });
  await logAdminAction(session.user.id, "error_report.toggle_resolved", {
    targetId: id,
    metadata: { resolved: next },
  });
  revalidatePath("/admin/error-reports");
}

export async function deleteReport(id: string): Promise<void> {
  const session = await requireAdmin();
  await db.errorReport.delete({ where: { id } });
  await logAdminAction(session.user.id, "error_report.delete", {
    targetId: id,
  });
  revalidatePath("/admin/error-reports");
}
