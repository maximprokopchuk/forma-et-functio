import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoMark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";

/**
 * Editorial header — 72px paper band, logo left, sparse nav right.
 * One 0.5px hairline along the bottom. No shadow, no chrome.
 */
export async function Header() {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session?.user?.id);

  return (
    <header className="relative w-full bg-paper">
      <div className="grid-16" style={{ height: "72px" }}>
        <div className="col-span-full flex h-full items-center justify-between">
          <Link
            href="/"
            aria-label="Forma et Functio — на главную"
            className="text-ink motion-micro hover:text-cinnabar"
          >
            <LogoMark size={32} />
          </Link>
          <nav
            aria-label="Основная навигация"
            className="flex items-center gap-8"
          >
            <Link
              href="/lessons"
              className="text-caption text-ink motion-micro hover:text-cinnabar"
            >
              Уроки
            </Link>
            <Link
              href="/widgets"
              className="text-caption text-ink motion-micro hover:text-cinnabar"
            >
              Виджеты
            </Link>
            {isAuthed ? (
              <Link
                href="/profile"
                className="text-caption text-ink motion-micro hover:text-cinnabar"
              >
                Профиль
              </Link>
            ) : null}
            <ThemeToggle />
          </nav>
        </div>
      </div>
      {/* 0.5px hairline — true half-pixel via scaleY transform */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-rule"
        style={{ transform: "scaleY(0.5)", transformOrigin: "bottom" }}
      />
    </header>
  );
}
