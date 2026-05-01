"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/admin-audit";

/**
 * Admin server actions for Monthly Challenges.
 * No fancy form library — Next form action + Zod validation. Each action
 * logs to AdminAuditLog so changes are traceable.
 */

const slugRe = /^[a-z0-9-]+$/;

const createSchema = z.object({
  slug: z.string().trim().min(1).max(60).regex(slugRe, "только a-z0-9-"),
  title: z.string().trim().min(1).max(120),
  brief: z.string().trim().min(1).max(8000),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});

export async function createChallenge(formData: FormData) {
  const session = await requireAdmin();

  const parsed = createSchema.safeParse({
    slug: formData.get("slug") ?? "",
    title: formData.get("title") ?? "",
    brief: formData.get("brief") ?? "",
    startsAt: formData.get("startsAt") ?? "",
    endsAt: formData.get("endsAt") ?? "",
  });
  if (!parsed.success) {
    throw new Error(`Некорректные данные: ${parsed.error.issues[0]?.message ?? "?"}`);
  }
  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error("Некорректные даты");
  }
  if (endsAt <= startsAt) {
    throw new Error("Дата окончания должна быть позже даты начала");
  }

  const created = await db.challenge.create({
    data: {
      slug: parsed.data.slug,
      title: parsed.data.title,
      brief: parsed.data.brief,
      startsAt,
      endsAt,
      status: "DRAFT",
    },
  });
  await logAdminAction(session.user.id, "challenge.create", {
    targetId: created.id,
    metadata: { slug: created.slug },
  });
  revalidatePath("/admin/challenges");
  redirect("/admin/challenges");
}

const statusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export async function setChallengeStatus(
  id: string,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
) {
  const session = await requireAdmin();
  if (!statusSchema.safeParse(status).success) {
    throw new Error("Invalid status");
  }
  await db.challenge.update({
    where: { id },
    data: { status },
  });
  await logAdminAction(session.user.id, "challenge.status", {
    targetId: id,
    metadata: { status },
  });
  revalidatePath("/admin/challenges");
  revalidatePath("/challenges");
}
