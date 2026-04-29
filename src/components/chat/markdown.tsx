import { Fragment, type ReactElement, type ReactNode } from "react";

/**
 * Tiny editorial markdown renderer for assistant replies. Hand-rolled — no
 * react-markdown dep — because we only need a small subset:
 *   - paragraphs separated by blank lines
 *   - fenced ``` code blocks
 *   - inline `code`, **bold**, *italic*
 *   - bulleted (- ) and numbered (1. ) lists
 *   - hard line breaks within a paragraph
 *
 * Nothing else (no headings, no links — assistant replies are conversational,
 * not structured docs). Strips raw HTML — input is rendered as text only.
 */

export function Markdown({ source }: { source: string }) {
  if (!source) return null;
  const blocks = parseBlocks(source);
  return (
    <>
      {blocks.map((block, i) => renderBlock(block, i))}
    </>
  );
}

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "code"; lang?: string; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

function parseBlocks(source: string): Block[] {
  const lines = source.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    // Fenced code block.
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1];
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i] ?? "")) {
        buf.push(lines[i] ?? "");
        i++;
      }
      // skip closing fence (or EOF if author didn't close it)
      if (i < lines.length) i++;
      blocks.push({ kind: "code", lang, text: buf.join("\n") });
      continue;
    }

    // List (- or 1.).
    const ulMatch = line.match(/^[-*+] (.+)/);
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const items: string[] = [];
      while (i < lines.length) {
        const cur = lines[i] ?? "";
        const ulCur = cur.match(/^[-*+] (.+)/);
        const olCur = cur.match(/^\d+\.\s+(.+)/);
        if (ordered ? olCur : ulCur) {
          items.push((ordered ? olCur![1] : ulCur![1]) ?? "");
          i++;
        } else {
          break;
        }
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    // Paragraph — accumulate non-blank lines until next blank.
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() !== "") {
      const cur = lines[i] ?? "";
      // Stop on a fence or list marker so they get their own block.
      if (/^```/.test(cur) || /^[-*+] /.test(cur) || /^\d+\.\s/.test(cur)) {
        break;
      }
      para.push(cur);
      i++;
    }
    if (para.length > 0) {
      blocks.push({ kind: "paragraph", text: para.join("\n") });
    }
  }

  return blocks;
}

function renderBlock(block: Block, key: number): ReactElement {
  switch (block.kind) {
    case "code":
      return (
        <pre
          key={key}
          className="bg-paper-hover text-ink"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            lineHeight: "20px",
            padding: "12px 14px",
            margin: "8px 0",
            border: "0.5px solid var(--rule)",
            overflow: "auto",
            whiteSpace: "pre",
          }}
        >
          <code>{block.text}</code>
        </pre>
      );
    case "list":
      return block.ordered ? (
        <ol
          key={key}
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            lineHeight: "24px",
            margin: "8px 0",
            paddingLeft: "20px",
            listStyle: "decimal",
          }}
        >
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      ) : (
        <ul
          key={key}
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            lineHeight: "24px",
            margin: "8px 0",
            paddingLeft: "20px",
            listStyle: "disc",
          }}
        >
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "paragraph":
      return (
        <p
          key={key}
          className="text-ink"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            lineHeight: "24px",
            margin: "0 0 8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {renderInline(block.text)}
        </p>
      );
  }
}

/**
 * Render bold / italic / inline code within a text fragment. Walks the
 * string in one pass; nested formatting (e.g. **bold within *italic*)
 * is intentionally not supported — overkill for chat replies.
 */
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let buf = "";
  let key = 0;

  const flush = () => {
    if (buf) {
      parts.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];
    // Inline code `…`
    if (ch === "`") {
      const close = text.indexOf("`", i + 1);
      if (close > i) {
        flush();
        parts.push(
          <code
            key={key++}
            className="bg-paper-hover text-ink"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              padding: "1px 4px",
              borderRadius: "2px",
            }}
          >
            {text.slice(i + 1, close)}
          </code>,
        );
        i = close + 1;
        continue;
      }
    }
    // Bold **…**
    if (ch === "*" && text[i + 1] === "*") {
      const close = text.indexOf("**", i + 2);
      if (close > i) {
        flush();
        parts.push(
          <strong key={key++} style={{ fontWeight: 600 }}>
            {text.slice(i + 2, close)}
          </strong>,
        );
        i = close + 2;
        continue;
      }
    }
    // Italic *…*
    if (ch === "*") {
      const close = text.indexOf("*", i + 1);
      if (close > i) {
        flush();
        parts.push(
          <em key={key++} className="italic">
            {text.slice(i + 1, close)}
          </em>,
        );
        i = close + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return parts.map((p, idx) => <Fragment key={idx}>{p}</Fragment>);
}
