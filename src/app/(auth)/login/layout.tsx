import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход",
  description:
    "Войдите в Forma et Functio, чтобы продолжить обучение и получать AI-фидбек по своим работам.",
  openGraph: {
    title: "Вход — Forma et Functio",
    description:
      "Войдите в Forma et Functio, чтобы продолжить обучение и получать AI-фидбек по своим работам.",
    type: "website",
    locale: "ru_RU",
    siteName: "Forma et Functio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Вход — Forma et Functio",
    description:
      "Войдите в Forma et Functio, чтобы продолжить обучение и получать AI-фидбек по своим работам.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
