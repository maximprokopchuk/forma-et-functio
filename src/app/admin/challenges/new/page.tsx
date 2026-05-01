import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { createChallenge } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Новый челлендж — Админ-панель" };

export default async function NewChallengePage() {
  await requireAdmin();
  return (
    <article className="px-6 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-caption text-ink-muted">
          <Link href="/admin/challenges" className="motion-micro hover:text-cinnabar">
            Челленджи
          </Link>
          {" · "}Новый
        </p>
        <h1 className="text-h2 text-ink">Создать челлендж</h1>
      </header>
      <form
        action={createChallenge}
        className="flex flex-col"
        style={{ gap: "20px", maxWidth: "640px" }}
      >
        <Field label="Slug" name="slug" required mono placeholder="redesign-card-2026-05" />
        <Field label="Заголовок" name="title" required placeholder="Редизайн карточки курса" />
        <FieldText label="Бриф (markdown)" name="brief" required rows={10} />
        <div className="flex" style={{ gap: "16px" }}>
          <Field label="Начало (UTC)" name="startsAt" required type="date" />
          <Field label="Дедлайн (UTC)" name="endsAt" required type="date" />
        </div>
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="submit"
            className="text-caption text-ink motion-micro hover:text-cinnabar"
            style={{
              border: "0.5px solid var(--rule)",
              padding: "10px 18px",
              letterSpacing: "0.05em",
            }}
          >
            Создать (DRAFT) →
          </button>
          <Link
            href="/admin/challenges"
            className="text-caption text-ink-muted motion-micro hover:text-cinnabar"
          >
            Отмена
          </Link>
        </div>
      </form>
    </article>
  );
}

function Field({
  label,
  name,
  required,
  type,
  placeholder,
  mono,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="flex flex-col" style={{ gap: "6px", flex: "1 1 0" }}>
      <span className="text-caption text-ink">{label}</span>
      <input
        type={type ?? "text"}
        name={name}
        required={required}
        placeholder={placeholder}
        className="bg-paper text-ink"
        style={{
          fontFamily: mono ? "var(--font-mono)" : "var(--font-display)",
          fontSize: mono ? "14px" : "17px",
          lineHeight: "26px",
          border: "0.5px solid var(--rule)",
          padding: "10px 12px",
          outline: "none",
        }}
      />
    </label>
  );
}

function FieldText({
  label,
  name,
  required,
  rows,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="flex flex-col" style={{ gap: "6px" }}>
      <span className="text-caption text-ink">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={rows ?? 6}
        className="bg-paper text-ink resize-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "15px",
          lineHeight: "24px",
          border: "0.5px solid var(--rule)",
          padding: "10px 12px",
          outline: "none",
        }}
      />
    </label>
  );
}
