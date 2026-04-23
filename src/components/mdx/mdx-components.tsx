import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { DropCap } from "@/components/mdx/drop-cap";
import { SectionBreak } from "@/components/mdx/section-break";
import { MarginNote } from "@/components/mdx/margin-note";
import { FigureDidactic } from "@/components/mdx/figure-didactic";
import { Exercise } from "@/components/mdx/exercise";
import { Quiz } from "@/components/mdx/quiz";
import { HierarchyReorder } from "@/components/widgets/hierarchy-reorder";
import { ColorContrastSandbox } from "@/components/widgets/color-contrast-sandbox";
import { TypePairingLab } from "@/components/widgets/type-pairing-lab";
import { SpacingTuner } from "@/components/widgets/spacing-tuner";

/**
 * Component map exposed to MDX content.
 * Custom components are pascal-case (authored directly as JSX in MDX);
 * built-in element overrides (p, h2, a, …) apply the editorial type
 * scale and palette automatically.
 *
 * `mdxComponents` returns the map directly; `useMDXComponents` is kept as
 * the Next.js MDX convention entry-point and simply wraps the same map.
 */

export function mdxComponents(components: MDXComponents = {}): MDXComponents {
  return {
    // --- Content components authored in MDX:
    DropCap,
    SectionBreak,
    MarginNote,
    FigureDidactic,
    Exercise,
    Quiz,
    HierarchyReorder,
    ColorContrastSandbox,
    TypePairingLab,
    SpacingTuner,

    // --- HTML element overrides (editorial typography):
    h1: ({ children, ...props }) => (
      <h1 className="text-display-m text-ink" style={{ marginBlock: "32px 16px" }} {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-h2 text-ink" style={{ marginBlock: "32px 12px" }} {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-h3 text-ink" style={{ marginBlock: "24px 8px" }} {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p
        className="text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "17px",
          lineHeight: "28px",
          marginBlock: "12px",
        }}
        {...props}
      >
        {children}
      </p>
    ),
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-lapis underline decoration-lapis/50 underline-offset-2 motion-micro hover:decoration-lapis"
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href ?? "#"}
          className="text-lapis underline decoration-lapis/50 underline-offset-2 motion-micro hover:decoration-lapis"
        >
          {children}
        </Link>
      );
    },
    ul: ({ children, ...props }) => (
      <ul
        className="list-disc text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "17px",
          lineHeight: "28px",
          marginBlock: "12px",
          paddingLeft: "24px",
        }}
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="list-decimal text-ink"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "17px",
          lineHeight: "28px",
          marginBlock: "12px",
          paddingLeft: "24px",
        }}
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li style={{ marginBlock: "4px" }} {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="text-ink-muted"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "19px",
          lineHeight: "28px",
          borderLeft: "2px solid var(--cinnabar)",
          paddingLeft: "16px",
          marginBlock: "24px",
        }}
        {...props}
      >
        {children}
      </blockquote>
    ),
    strong: ({ children, ...props }) => (
      <strong className="text-ink" style={{ fontWeight: 600 }} {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    code: ({ children, ...props }) => (
      <code
        className="text-ink bg-paper-hover"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.88em",
          padding: "0 4px",
          borderRadius: "2px",
        }}
        {...props}
      >
        {children}
      </code>
    ),
    hr: () => (
      <hr
        className="border-0 text-center text-ink-muted"
        style={{
          marginBlock: "40px",
          fontFamily: "var(--font-display)",
          fontSize: "19px",
          letterSpacing: "0.5em",
        }}
      >
        · · ·
      </hr>
    ),
    ...components,
  };
}

export function useMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return mdxComponents(components);
}
