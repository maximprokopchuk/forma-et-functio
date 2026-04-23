import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * AdminAuditLog writer — plan §10.
 *
 * Every admin mutation (server action that changes state) must call this
 * helper. The log is append-only and serves forensic purposes: who did what,
 * to which target, and when. It is NOT exposed as a user-facing UI in v1.
 *
 * Conventions:
 *  - `action` uses "<resource>.<verb>" naming, e.g. "user.set_role".
 *  - `targetId` points at the row being mutated (may be null for coarse
 *    actions like "content.import").
 *  - `metadata` carries anything useful for replay (new role, old status, …).
 *
 * We intentionally don't wrap the mutation + log in a single Prisma
 * transaction: Prisma's `$transaction` requires batching the calls and
 * complicates the existing action shape. Instead we write the log AFTER
 * the mutation succeeds. The tradeoff: if the log write fails, the mutation
 * still happened — which is acceptable because (a) the mutation is the
 * source of truth and (b) we surface the log-write error to the caller so
 * the admin sees something went wrong. If forensic integrity becomes
 * critical, this is the place to switch to `db.$transaction([...])`.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  opts: {
    targetId?: string | null;
    metadata?: Record<string, unknown>;
  } = {},
): Promise<void> {
  await db.adminAuditLog.create({
    data: {
      adminId,
      action,
      targetId: opts.targetId ?? null,
      metadata:
        opts.metadata === undefined
          ? Prisma.JsonNull
          : (opts.metadata as Prisma.InputJsonValue),
    },
  });
}
