import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * PATCH / GET preferences for the current user.
 * Writes onboarding selections (track, level, name, goal) to `User`.
 */
const prefsSchema = z.object({
  preferredTrack: z
    .enum(["FOUNDATIONS", "INTERFACE", "EXPERIENCE", "CRAFT"])
    .nullable()
    .optional(),
  preferredLevel: z.enum(["L1", "L2", "L3", "L4", "L5"]).nullable().optional(),
  showAllLevels: z.boolean().optional(),
  name: z.string().trim().min(1).max(120).optional(),
  emailDigests: z.boolean().optional(),
  // `goal` isn't persisted yet (no column); accepted and ignored until
  // schema gets a `goal` field.
  goal: z.string().trim().min(1).max(2000).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      preferredTrack: true,
      preferredLevel: true,
      showAllLevels: true,
      name: true,
      emailDigests: true,
      onboardingCompleted: true,
    },
  });
  return NextResponse.json({
    preferredTrack: user?.preferredTrack ?? null,
    preferredLevel: user?.preferredLevel ?? null,
    showAllLevels: user?.showAllLevels ?? false,
    name: user?.name ?? null,
    emailDigests: user?.emailDigests ?? true,
    onboardingCompleted: user?.onboardingCompleted ?? false,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const { preferredTrack, preferredLevel, showAllLevels, name, emailDigests } =
    parsed.data;

  // Onboarding is only "completed" when the call carries an onboarding-shaped
  // field. Settings-page calls (toggling emailDigests) must not flip the flag.
  const setOnboarding =
    preferredTrack !== undefined ||
    preferredLevel !== undefined ||
    showAllLevels !== undefined;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(setOnboarding ? { onboardingCompleted: true } : {}),
      ...(preferredTrack !== undefined
        ? { preferredTrack: preferredTrack ?? null }
        : {}),
      ...(preferredLevel !== undefined
        ? { preferredLevel: preferredLevel ?? null }
        : {}),
      ...(showAllLevels !== undefined ? { showAllLevels } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(emailDigests !== undefined ? { emailDigests } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
