import type { Metadata } from "next";
import Script from "next/script";
import {
  Newsreader,
  PT_Serif,
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Fraunces,
  Space_Grotesk,
} from "next/font/google";
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

// --- Fonts loaded only for the TypePairingLab widget (plan §7 #3). ---
// Kept to three extras so total Google-Fonts surface stays at 7. All have
// Cyrillic coverage where possible; Playfair and Fraunces are Latin-only but
// still useful as display specimens for English-set examples.
const playfair = Playfair_Display({
  variable: "--font-pair-playfair",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-pair-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-pair-space-grotesk",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Forma et Functio — Учебник цифрового дизайна",
    template: "%s | Forma et Functio",
  },
  description:
    "Самоучитель веб-дизайна с интерактивной практикой и AI-фидбеком — для тех, кто хочет дизайнить и понимать, как это работает в коде.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "Forma et Functio — Учебник цифрового дизайна",
    description:
      "Самоучитель веб-дизайна с интерактивной практикой и AI-фидбеком.",
    type: "website",
    locale: "ru_RU",
    siteName: "Forma et Functio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forma et Functio — Учебник цифрового дизайна",
    description:
      "Самоучитель веб-дизайна с интерактивной практикой и AI-фидбеком.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Plausible is optional. It only loads when NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  // is set in the environment — keeps the dev/self-host path free of a
  // third-party request and lets the user enable it without a code change.
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html
      lang="ru"
      className={`${newsreader.variable} ${ptSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} ${fraunces.variable} ${spaceGrotesk.variable} h-full antialiased`}
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
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
