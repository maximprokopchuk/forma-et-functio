import { ImageResponse } from "next/og";

/**
 * Root-level OG image — plan §23 Phase 7.
 * 1200×630 on paper with cinnabar italic accent. Editorial register:
 * no gradients, no shadows. One hairline, one wordmark, one caption.
 *
 * Fonts are system serif fallback. Loading Newsreader via fetch is fragile
 * on edge and not worth the complexity for v1 — a good system serif on
 * paper is already on-brand.
 */

export const runtime = "edge";
export const alt = "Forma et Functio — Учебник цифрового дизайна";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F4F1EA";
const INK = "#14110F";
const CINNABAR = "#D8412F";
const RULE = "#C8C3B8";

export default function RootOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: PAPER,
          color: INK,
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* F·F ligature top-left — two strokes and a shared crossbar. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "22px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: INK,
          }}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke={INK}
            strokeWidth="1.5"
            strokeLinecap="square"
          >
            <line x1="5" y1="4" x2="5" y2="20" />
            <line x1="5" y1="4" x2="10" y2="4" />
            <line x1="14" y1="4" x2="14" y2="20" />
            <line x1="14" y1="4" x2="19" y2="4" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>F · F</span>
        </div>

        {/* Centered wordmark — the brand mark. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "40px",
          }}
        >
          <div
            style={{
              fontSize: "128px",
              lineHeight: 1,
              letterSpacing: "0.02em",
              color: INK,
              display: "flex",
              alignItems: "baseline",
              gap: "0.3em",
            }}
          >
            <span>forma</span>
            <span
              style={{
                fontStyle: "italic",
                color: CINNABAR,
                fontSize: "0.82em",
              }}
            >
              et
            </span>
            <span>functio</span>
          </div>

          <div
            style={{
              width: "280px",
              height: "1px",
              background: RULE,
            }}
          />

          <div
            style={{
              fontSize: "30px",
              color: INK,
              fontStyle: "italic",
              letterSpacing: "0.01em",
            }}
          >
            Учебник цифрового дизайна
          </div>
        </div>

        {/* Bottom-left domain caption — tiny mono-ish tag. */}
        <div
          style={{
            fontSize: "18px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: INK,
            opacity: 0.6,
          }}
        >
          forma-et-functio
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
