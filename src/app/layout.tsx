import type { Metadata } from "next";
import { Newsreader, PT_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthSessionProvider } from "@/components/session-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

// Display — serif with expressive italic, used for wordmark and headlines.
// Newsreader doesn't ship Cyrillic; we chain PT Serif after it (Cyrillic-
// complete, similar proportions, also from Google Fonts) so Russian glyphs
// resolve to PT Serif rather than Georgia. Latin still falls to Newsreader.
const newsreader = Newsreader({
  variable: "--font-display-latin",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Cyrillic-complete serif fallback. Pairs cleanly with Newsreader: both are
// text-serif with moderate contrast and comparable x-height.
const ptSerif = PT_Serif({
  variable: "--font-display-cyr",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// UI / body sans.
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Mono — code playground, terms, tabular numerals.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Forma et Functio — Учебник цифрового дизайна",
    template: "%s | Forma et Functio",
  },
  description:
    "Самоучитель веб-дизайна с интерактивной практикой и AI-фидбеком — для тех, кто хочет дизайнить и понимать, как это работает в коде.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${newsreader.variable} ${ptSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <AuthSessionProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
