import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Регистрация",
  description:
    "Создайте аккаунт в Forma et Functio — самоучителе цифрового дизайна с интерактивной практикой и AI-фидбеком.",
  openGraph: {
    title: "Регистрация — Forma et Functio",
    description:
      "Создайте аккаунт в Forma et Functio — самоучителе цифрового дизайна с интерактивной практикой и AI-фидбеком.",
    type: "website",
    locale: "ru_RU",
    siteName: "Forma et Functio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Регистрация — Forma et Functio",
    description:
      "Создайте аккаунт в Forma et Functio — самоучителе цифрового дизайна с интерактивной практикой и AI-фидбеком.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
