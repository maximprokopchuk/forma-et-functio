"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/admin-audit";

const roleSchema = z.enum(["USER", "ADMIN"]);

/**
 * Flip a user's role. Admins can promote or demote, but can't demote
 * themselves — that would lock them out of the very page they're using.
 */
export async function setUserRole(userId: string, role: "USER" | "ADMIN"): Promise<void> {
  const session = await requireAdmin();
  const parsed = roleSchema.parse(role);

  if (userId === session.user.id && parsed === "USER") {
    throw new Error("Нельзя снять с себя роль ADMIN.");
  }

  await db.user.update({
    where: { id: userId },
    data: { role: parsed },
  });

  await logAdminAction(session.user.id, "user.set_role", {
    targetId: userId,
    metadata: { role: parsed },
  });

  revalidatePath("/admin/users");
}
