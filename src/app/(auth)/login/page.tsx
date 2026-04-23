"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/layout/wordmark";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/lessons");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-paper">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <Wordmark size="md" />
          </Link>
          <p className="text-caption mt-4">ВХОД</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <p className="text-body-s text-cinnabar border-b border-cinnabar/40 pb-2">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-caption block">
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full bg-transparent border-0 border-b border-rule focus:border-ink focus:outline-none py-2 text-body text-ink placeholder:text-ink-muted transition-colors motion-micro"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-caption block">
              ПАРОЛЬ
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-transparent border-0 border-b border-rule focus:border-ink focus:outline-none py-2 text-body text-ink placeholder:text-ink-muted transition-colors motion-micro"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ink text-paper text-caption tracking-wider disabled:opacity-50 hover:bg-cinnabar transition-colors motion-small"
          >
            {loading ? "ВХОДИМ…" : "ВОЙТИ"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-8">
          <div className="flex-1 h-px bg-rule" />
          <span className="text-caption">ИЛИ</span>
          <div className="flex-1 h-px bg-rule" />
        </div>

        <button
          type="button"
          onClick={() => {
            setGoogleLoading(true);
            signIn("google", { callbackUrl: "/lessons" });
          }}
          disabled={googleLoading}
          className="w-full py-3 flex items-center justify-center gap-3 border border-rule hover:border-ink text-body-s text-ink disabled:opacity-50 transition-colors motion-small"
        >
          <GoogleIcon />
          {googleLoading ? "Перенаправление…" : "Войти через Google"}
        </button>

        <p className="text-body-s text-ink-muted text-center mt-10">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-lapis underline underline-offset-4 hover:text-cinnabar transition-colors motion-micro">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
