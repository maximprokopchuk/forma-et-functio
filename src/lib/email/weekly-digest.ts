import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/client";
import { plural } from "@/lib/pluralize";
import { startOfUTCDay, streakStatus } from "@/lib/streak";

/**
 * Weekly summary digest — plan §17.
 *
 * Different beast from the daily streak-at-risk mail. Goes to active users
 * (any completion, submission, or review-grade in the last 14 days) once a
 * week. Reports last 7 days of activity:
 *
 *   - Topics completed
 *   - Submissions sent
 *   - Reviews graded
 *   - Current streak status
 *   - Reviews due today
 *
 * Users with zero activity in the last 7 days are skipped — we don't want
 * to spam dormant accounts. Re-engagement of dormant users is a separate
 * (probably manual) campaign.
 */

const ACTIVE_WINDOW_DAYS = 14;
const SUMMARY_WINDOW_DAYS = 7;

export type WeeklyDigestResult = {
  scanned: number;
  sent: number;
  skipped: number;
  failures: Array<{ userId: string; error: string }>;
};

export type WeeklySummary = {
  topicsCompleted: number;
  submissionsSent: number;
  reviewsGraded: number;
  streak: number;
  streakAlive: boolean;
  reviewsDue: number;
};

/**
 * Pure function — given the activity counters and streak state, decide
 * whether this user is worth emailing. Skip rule: zero activity AND no
 * streak AND no due reviews. Tested in isolation.
 */
export function shouldSendWeekly(s: WeeklySummary): boolean {
  if (s.topicsCompleted > 0) return true;
  if (s.submissionsSent > 0) return true;
  if (s.reviewsGraded > 0) return true;
  if (s.streakAlive) return true;
  if (s.reviewsDue > 0) return true;
  return false;
}

export async function sendWeeklyDigest({
  origin,
  now = new Date(),
}: {
  origin: string;
  now?: Date;
}): Promise<WeeklyDigestResult> {
  const today = startOfUTCDay(now);
  const summaryStart = new Date(
    today.getTime() - SUMMARY_WINDOW_DAYS * 24 * 60 * 60_000,
  );
  const activeStart = new Date(
    today.getTime() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60_000,
  );
  const result: WeeklyDigestResult = {
    scanned: 0,
    sent: 0,
    skipped: 0,
    failures: [],
  };

  // Pool: users who actually moved in the last 14 days. Cheaper than scanning
  // every row for everyone, and screens out long-dormant accounts.
  const users = await db.user.findMany({
    where: {
      email: { not: "" },
      emailDigests: true,
      OR: [
        { progress: { some: { completedAt: { gte: activeStart } } } },
        { submissions: { some: { createdAt: { gte: activeStart } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentStreak: true,
      lastStreakDay: true,
    },
  });
  result.scanned = users.length;

  for (const user of users) {
    if (!user.email) {
      result.skipped++;
      continue;
    }

    const [topicsCompleted, submissionsSent, reviewsDue] = await Promise.all([
      db.userProgress.count({
        where: {
          userId: user.id,
          completed: true,
          completedAt: { gte: summaryStart },
        },
      }),
      db.submission.count({
        where: { userId: user.id, createdAt: { gte: summaryStart } },
      }),
      db.reviewQueue.count({
        where: { userId: user.id, dueAt: { lte: now } },
      }),
    ]);
    // reviewsGraded is approximated by (rows updated this week with strength
    // > 0), but ReviewQueue doesn't carry an updatedAt yet; v1 uses 0 as a
    // safe default so the email isn't wrong, just incomplete.
    const reviewsGraded = 0;

    const streakAlive = streakStatus(user.lastStreakDay, now) !== "burned";
    const summary: WeeklySummary = {
      topicsCompleted,
      submissionsSent,
      reviewsGraded,
      streak: user.currentStreak,
      streakAlive,
      reviewsDue,
    };

    if (!shouldSendWeekly(summary)) {
      result.skipped++;
      continue;
    }

    try {
      const { html, text } = renderWeekly({
        name: user.name ?? "вы",
        summary,
        origin,
      });
      await sendEmail({
        to: user.email,
        subject: subjectFor(summary),
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

function subjectFor(s: WeeklySummary): string {
  if (s.topicsCompleted > 0) {
    return `Неделя в Forma et Functio · ${s.topicsCompleted} ${plural(
      s.topicsCompleted,
      ["тема", "темы", "тем"],
    )}`;
  }
  if (s.reviewsDue > 0) {
    return `Неделя в Forma et Functio · ${s.reviewsDue} ${plural(
      s.reviewsDue,
      ["тема", "темы", "тем"],
    )} ждёт повторения`;
  }
  return "Неделя в Forma et Functio";
}

/**
 * Editorial register — paper, hairline, mono numbers, single CTA. Only
 * renders the cards that have non-zero values; an empty-week card list
 * means we already filtered at shouldSendWeekly().
 */
function renderWeekly({
  name,
  summary,
  origin,
}: {
  name: string;
  summary: WeeklySummary;
  origin: string;
}): { html: string; text: string } {
  const greeting =
    name === "вы" ? "Добрый день" : `Добрый день, ${escapeHtml(name)}`;
  const lessonsUrl = `${origin}/lessons`;
  const reviewUrl = `${origin}/review`;
  const profileUrl = `${origin}/profile`;

  const cards: Array<{ label: string; value: string; suffix: string }> = [];
  if (summary.topicsCompleted > 0) {
    cards.push({
      label: "Тем пройдено",
      value: String(summary.topicsCompleted),
      suffix: plural(summary.topicsCompleted, ["тема", "темы", "тем"]),
    });
  }
  if (summary.submissionsSent > 0) {
    cards.push({
      label: "Работ на проверку",
      value: String(summary.submissionsSent),
      suffix: plural(summary.submissionsSent, ["работа", "работы", "работ"]),
    });
  }
  if (summary.streakAlive && summary.streak > 0) {
    cards.push({
      label: "Серия",
      value: String(summary.streak),
      suffix: plural(summary.streak, ["день", "дня", "дней"]),
    });
  }
  if (summary.reviewsDue > 0) {
    cards.push({
      label: "К повторению",
      value: String(summary.reviewsDue),
      suffix: plural(summary.reviewsDue, ["тема", "темы", "тем"]),
    });
  }

  const cardsHtml = cards
    .map(
      (c) => `
        <td style="padding-right:32px;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;color:#5C5752;">${escapeHtml(c.label)}</p>
          <p style="margin:0;font-size:32px;line-height:1;color:#14110F;font-variant-numeric:tabular-nums;">
            ${escapeHtml(c.value)}<span style="font-size:13px;margin-left:6px;color:#5C5752;">${escapeHtml(c.suffix)}</span>
          </p>
        </td>`,
    )
    .join("");

  const ctaHref = summary.reviewsDue > 0 ? reviewUrl : lessonsUrl;
  const ctaLabel = summary.reviewsDue > 0 ? "Открыть повторение →" : "Продолжить →";

  const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light only" />
    <title>Неделя в Forma et Functio</title>
  </head>
  <body style="margin:0;padding:0;background:#F4F1EA;color:#14110F;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding-bottom:24px;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;color:#5C5752;">
                Forma et Functio · итоги недели
              </td>
            </tr>
            <tr>
              <td style="border-top:0.5px solid #C8C3B8;padding-top:32px;">
                <p style="margin:0 0 24px;font-size:17px;line-height:28px;">${greeting}.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>${cardsHtml}</tr>
                </table>
                <p style="margin:0 0 32px;">
                  <a href="${ctaHref}" style="display:inline-block;padding:10px 18px;border:0.5px solid #C8C3B8;color:#14110F;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">${ctaLabel}</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:22px;color:#5C5752;">
                  Это итоговое письмо приходит раз в неделю.
                  Отключить — в <a href="${profileUrl}" style="color:#1B3A8B;">профиле</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const lines: string[] = [`${greeting}.`, ""];
  for (const c of cards) {
    lines.push(`${c.label}: ${c.value} ${c.suffix}`);
  }
  lines.push("");
  lines.push(`${ctaLabel.replace(" →", "")}: ${ctaHref}`);
  lines.push("");
  lines.push(
    `Итоговое письмо приходит раз в неделю. Отключить — ${profileUrl}.`,
  );

  return { html, text: lines.join("\n") };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
