import { ImageResponse } from "next/og";
import { getTopic, getLesson, getTrack } from "@/lib/content";
import { TRACKS } from "@/lib/tracks";

/**
 * Per-topic OG image — plan §23 Phase 7.
 * Paper background, cinnabar hairline, topic title in display type.
 * Breadcrumb "TRACK · LESSON" in small-caps across the top.
 *
 * Returns a fallback image if topic lookup fails (broken link from social share).
 */

// Content loader uses node `fs`; stay on node runtime.
export const runtime = "nodejs";
export const alt = "Forma et Functio — тема";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F4F1EA";
const INK = "#14110F";
const CINNABAR = "#D8412F";
const RULE = "#C8C3B8";

export default async function TopicOgImage({
  params,
}: {
  params: Promise<{ track: string; lesson: string; topic: string }>;
}) {
  const { track: trackSlug, lesson: lessonSlug, topic: topicSlug } = await params;
  const track = getTrack(trackSlug);
  const lesson = getLesson(trackSlug, lessonSlug);
  const topic = getTopic(trackSlug, lessonSlug, topicSlug);

  const breadcrumbParts: string[] = [];
  if (track) breadcrumbParts.push(track.shortTitle);
  if (lesson) breadcrumbParts.push(`РАЗДЕЛ ${String(lesson.order).padStart(2, "0")}`);
  const breadcrumb = breadcrumbParts.join(" · ");

  const title = topic?.title ?? "Forma et Functio";
  const trackTitle = track?.title ?? "";
  const accentHex = track ? accentColor(track.colorToken) : CINNABAR;

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
        {/* Top row — tiny wordmark and breadcrumb. */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.3em",
              fontSize: "26px",
              letterSpacing: "0.02em",
            }}
          >
            <span>forma</span>
            <span style={{ fontStyle: "italic", color: CINNABAR, fontSize: "0.82em" }}>et</span>
            <span>functio</span>
          </div>
          <div
            style={{
              fontSize: "18px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: INK,
              opacity: 0.65,
            }}
          >
            {breadcrumb}
          </div>
        </div>

        {/* Hairline below the header. */}
        <div
          style={{
            marginTop: "32px",
            height: "1px",
            background: RULE,
          }}
        />

        {/* Topic title — display type, left-aligned. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "32px",
            paddingRight: "80px",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: INK,
              opacity: 0.6,
            }}
          >
            {trackTitle}
          </div>
          <div
            style={{
              fontSize: title.length > 40 ? "78px" : "104px",
              lineHeight: 1.05,
              letterSpacing: "-0.01em",
              color: INK,
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* Cinnabar hairline at the bottom — the track's accent colour. */}
        <div
          style={{
            height: "4px",
            width: "120px",
            background: accentHex,
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}

function accentColor(token: string): string {
  switch (token) {
    case "cinnabar":
      return "#D8412F";
    case "lapis":
      return "#2C4F8C";
    case "ochre":
      return "#B47B2B";
    case "ink":
      return "#14110F";
    default:
      return "#D8412F";
  }
}

// Track colour tokens used for bottom hairline — kept in sync with lib/tracks.
void TRACKS;
