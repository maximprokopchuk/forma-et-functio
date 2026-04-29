import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { plural } from "@/lib/pluralize";

/**
 * Daily streak-at-risk digest — plan §17.
 *
 * Picks users whose `lastStreakDay` is exactly yesterday (UTC) — the streak
 * is alive but will burn at next UTC midnight if they don't complete a topic
 * today. Sends a quiet editorial nudge. Users whose lastStreakDay is today
 * already counted; users older than yesterday have already lost the streak
 * (separate "your streak burned" mail is out of scope for v1).
 *
 * Returns counters for the cron job to surface in its response payload.
 */

export type DigestResult = {
  scanned: number;
  sent: number;
  skipped: number;
  failures: Array<{ userId: string; error: string }>;
};

function startOfUTCDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export async function sendStreakDigest({
  origin,
  now = new Date(),
}: {
  origin: string;
  now?: Date;
}): Promise<DigestResult> {
  const today = startOfUTCDay(now);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60_000);
  const result: DigestResult = {
    scanned: 0,
    sent: 0,
    skipped: 0,
    failures: [],
  };

  // Scan users whose streak is alive AND whose last counted day is yesterday.
  // Index on lastStreakDay would speed this up at scale; for v1 the table
  // size makes a sequential scan fine.
  const users = await db.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      lastStreakDay: { gte: yesterday, lt: today },
      email: { not: "" },
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentStreak: true,
    },
  });
  result.scanned = users.length;

  for (const user of users) {
    if (!user.email) {
      result.skipped++;
      continue;
    }
    try {
      const { html, text } = renderDigest({
        name: user.name ?? "вы",
        streak: user.currentStreak,
        origin,
      });
      await sendEmail({
        to: user.email,
        subject: subjectFor(user.currentStreak),
        html,
        text,
      });
      result.sent++;
    } catch (err) {
      result.failures.push({
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

function subjectFor(streak: number): string {
  return `Серия ${streak} ${plural(streak, ["день", "дня", "дней"])} — может сгореть сегодня`;
}

/**
 * Editorial register — paper background, hairline, cinnabar number, no logos
 * or footer fluff. Three sentences plus a single CTA. Plain text mirrors
 * the visible content so non-HTML clients stay readable.
 */
function renderDigest({
  name,
  streak,
  origin,
}: {
  name: string;
  streak: number;
  origin: string;
}): { html: string; text: string } {
  const greeting = name === "вы" ? "Добрый день" : `Добрый день, ${escapeHtml(name)}`;
  const lessonsUrl = `${origin}/lessons`;
  const days = plural(streak, ["день", "дня", "дней"]);

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <title>Серия ${streak} ${days}</title>
  </head>
  <body style="margin:0;padding:0;background:#F4F1EA;color:#14110F;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="padding-bottom:24px;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;color:#5C5752;">
                Forma et Functio
              </td>
            </tr>
            <tr>
              <td style="border-top:0.5px solid #C8C3B8;padding-top:32px;">
                <p style="margin:0 0 24px;font-size:17px;line-height:28px;">${greeting}.</p>
                <p style="margin:0 0 24px;font-size:17px;line-height:28px;">
                  Ваша серия —
                  <strong style="font-size:32px;color:#D8412F;font-variant-numeric:tabular-nums;">${streak}</strong>
                  ${days}.
                </p>
                <p style="margin:0 0 24px;font-size:17px;line-height:28px;">
                  Сегодня вы её ещё не отметили. Если до полуночи UTC не пройдёте
                  ни одну тему — серия начнётся заново.
                </p>
                <p style="margin:0 0 32px;">
                  <a href="${lessonsUrl}" style="display:inline-block;padding:10px 18px;border:0.5px solid #C8C3B8;color:#14110F;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">Открыть уроки →</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:22px;color:#5C5752;">
                  Письмо отправлено автоматически, потому что у вас активна серия.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `${greeting}.`,
    "",
    `Ваша серия — ${streak} ${days}.`,
    "Сегодня вы её ещё не отметили. Если до полуночи UTC не пройдёте ни одну тему — серия начнётся заново.",
    "",
    `Открыть уроки: ${lessonsUrl}`,
    "",
    "Письмо отправлено автоматически, потому что у вас активна серия.",
  ].join("\n");

  return { html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
