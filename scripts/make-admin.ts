#!/usr/bin/env tsx
/**
 * Promote a registered user to ADMIN role.
 *
 * Usage: pnpm make-admin email@example.com
 *
 * Idempotent — if the user is already an admin, it prints "already admin"
 * and exits 0. If the user doesn't exist, it exits 1 with a clear message
 * (register at /register first, then run this script).
 *
 * This is the bootstrap path for the first admin: there is no UI to
 * promote the first user, so this script is how you get out of the
 * empty-admin state.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: pnpm make-admin <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    console.error(
      `No user with email ${email}. Register at /register first, then re-run.`,
    );
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`${email} is already ADMIN. No-op.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });
  console.log(
    `Promoted ${user.name ?? email} (${user.id}) to ADMIN. Sign out and back in to pick up the new role claim.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
