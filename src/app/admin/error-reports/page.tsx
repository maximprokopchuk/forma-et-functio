import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { ErrorReportsTable } from "./error-reports-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Репорты ошибок — Админ-панель" };

export default async function ErrorReportsPage() {
  await requireAdmin();

  const reports = await db.errorReport.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Dates serialised so the client component receives plain values.
  const serialised = reports.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ErrorReportsTable reports={serialised} />;
}
