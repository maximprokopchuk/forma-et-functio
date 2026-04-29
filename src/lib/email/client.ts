import { Resend } from "resend";

/**
 * Lazily-instantiated Resend client. Returns a `mock` flag when the API key
 * isn't configured so callers can log instead of send (dev / preview).
 *
 * From-address is resolved from EMAIL_FROM, which must be a verified sender
 * on the Resend account in production. In dev with mock=true the value is
 * irrelevant.
 */

type EmailClient =
  | { mock: true; from: string; resend: null }
  | { mock: false; from: string; resend: Resend };

let cached: EmailClient | null = null;

export function getEmailClient(): EmailClient {
  if (cached) return cached;

  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Forma et Functio <noreply@forma-et-functio.dev>";

  if (!key) {
    cached = { mock: true, from, resend: null };
    return cached;
  }
  cached = { mock: false, from, resend: new Resend(key) };
  return cached;
}

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  /** Plain-text fallback for clients that strip HTML. Strongly recommended. */
  text: string;
};

/**
 * Single send. In mock mode, logs the recipient + subject and resolves; the
 * caller doesn't need to branch.
 */
export async function sendEmail(args: SendArgs): Promise<void> {
  const client = getEmailClient();
  if (client.mock) {
    console.info(
      `[email:mock] would send to ${args.to} — "${args.subject}"`,
    );
    return;
  }
  const { error } = await client.resend.emails.send({
    from: client.from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message ?? String(error)}`);
  }
}
