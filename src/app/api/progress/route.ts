import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/auth-guard";
import { getAllTracks } from "@/lib/content";
import type { Track, BloomsLevel } from "@prisma/client";
import type { TrackSlug } from "@/lib/tracks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugRe = /^[a-z0-9-]+$/;
const progressBodySchema = z.object({
  lessonSlug: z.string().min(1).max(100).regex(slugRe),
  topicSlug: z.string().min(1).max(100).regex(slugRe),
  completed: z.boolean(),
});

/**
 * GET /api/progress?lessonSlug=&topicSlug= — return current row + streak info.
 * If lessonSlug/topicSlug omitted, returns just streak summary.
 */
export async function GET(req: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  const { searchParams } = new URL(req.url);
  const lessonSlug = searchParams.get("lessonSlug");
  const topicSlug = searchParams.get("topicSlug");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastStreakDay: true,
    },
  });

  let progress: { completed: boolean; completedAt: string | null } | null = null;
  if (lessonSlug && topicSlug) {
    const row = await db.userProgress.findUnique({
      where: {
        userId_lessonSlug_topicSlug: {
          userId: session.user.id,
          lessonSlug,
          topicSlug,
        },
      },
    });
    if (row) {
      progress = {
        completed: row.completed,
        completedAt: row.completedAt?.toISOString() ?? null,
      };
    }
  }

  return NextResponse.json({
    progress,
    streak: {
      current: user?.currentStreak ?? 0,
      longest: user?.longestStreak ?? 0,
      lastDay: user?.lastStreakDay?.toISOString() ?? null,
    },
  });
}

/**
 * POST /api/progress — upsert completion state and update streaks.
 * Track + blooms level are denormalized onto the row for fast per-track queries.
 */
export async function POST(req: Request) {
  let session;
  try {
    session = await requireAuth();
  } catch {
    return unauthorized();
  }

  let body;
  try {
    body = progressBodySchema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Некорректные данные", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Неверный JSON" }, { status: 400 });
  }

  // --- Resolve track + level from content for denormalization
  let trackSlug: TrackSlug | null = null;
  let bloomsLevel: BloomsLevel | null = null;
  for (const t of getAllTracks()) {
    for (const l of t.lessons) {
      if (l.slug !== body.lessonSlug) continue;
      const topic = l.topics.find((x) => x.slug === body.topicSlug);
      if (topic) {
        trackSlug = t.slug;
        bloomsLevel = topic.bloomsLevel as BloomsLevel;
        break;
      }
    }
    if (trackSlug) break;
  }
  if (!trackSlug || !bloomsLevel) {
    return NextResponse.json({ error: "Тема не найдена" }, { status: 404 });
  }

  const trackEnum = trackSlug.toUpperCase() as Track;

  const today = startOfUTCDay(new Date());

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.userProgress.findUnique({
      where: {
        userId_lessonSlug_topicSlug: {
          userId: session.user.id,
          lessonSlug: body.lessonSlug,
          topicSlug: body.topicSlug,
        },
      },
    });

    const progressRow = await tx.userProgress.upsert({
      where: {
        userId_lessonSlug_topicSlug: {
          userId: session.user.id,
          lessonSlug: body.lessonSlug,
          topicSlug: body.topicSlug,
        },
      },
      create: {
        userId: session.user.id,
        lessonSlug: body.lessonSlug,
        topicSlug: body.topicSlug,
        track: trackEnum,
        level: bloomsLevel!,
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      },
      update: {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      },
    });

    let streakChanged = false;
    let streak = {
      current: 0,
      longest: 0,
      lastDay: null as string | null,
    };

    // Only touch streaks on positive completion AND only if this row wasn't
    // already completed (avoid double-incrementing).
    const isNewCompletion = body.completed && !existing?.completed;

    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastStreakDay: true,
      },
    });

    if (isNewCompletion && user) {
      const lastDay = user.lastStreakDay
        ? startOfUTCDay(user.lastStreakDay)
        : null;
      const dayMs = 24 * 60 * 60_000;

      let newCurrent = 1;
      if (lastDay) {
        const diff = Math.round(
          (today.getTime() - lastDay.getTime()) / dayMs,
        );
        if (diff === 0) {
          // Already counted today — leave streak as-is.
          newCurrent = user.currentStreak || 1;
        } else if (diff === 1) {
          newCurrent = (user.currentStreak || 0) + 1;
        } else {
          newCurrent = 1;
        }
      }

      const newLongest = Math.max(user.longestStreak, newCurrent);

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newCurrent,
          longestStreak: newLongest,
          lastStreakDay: today,
        },
      });

      streakChanged = true;
      streak = {
        current: newCurrent,
        longest: newLongest,
        lastDay: today.toISOString(),
      };
    } else if (user) {
      streak = {
        current: user.currentStreak,
        longest: user.longestStreak,
        lastDay: user.lastStreakDay?.toISOString() ?? null,
      };
    }

    return {
      progress: progressRow,
      streak,
      streakChanged,
    };
  });

  return NextResponse.json({
    progress: {
      completed: result.progress.completed,
      completedAt: result.progress.completedAt?.toISOString() ?? null,
    },
    streak: result.streak,
    streakChanged: result.streakChanged,
  });
}

function startOfUTCDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
