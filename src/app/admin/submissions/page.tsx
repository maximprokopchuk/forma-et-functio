import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { SubmissionsTable } from "./submissions-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Работы — Админ-панель" };

/**
 * Submissions queue — most recent first. Filters and sorting live in the
 * client component (no URL round-trips), so the server just hands over a
 * serialised, relationship-included list.
 */
export default async function AdminSubmissionsPage() {
  await requireAdmin();

  const submissions = await db.submission.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    take: 200,
  });

  const rows = submissions.map((s) => ({
    id: s.id,
    userId: s.userId,
    userName: s.user.name,
    userEmail: s.user.email,
    lessonSlug: s.lessonSlug,
    topicSlug: s.topicSlug,
    description: s.description,
    figmaUrl: s.figmaUrl,
    status: s.status,
    feedback: s.feedback,
    retryCount: s.retryCount,
    createdAt: s.createdAt.toISOString(),
  }));

  return <SubmissionsTable rows={rows} />;
}
