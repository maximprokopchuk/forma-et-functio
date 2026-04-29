"use client";

import { useCallback, useId, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

/**
 * Screenshot upload — Vercel Blob signed PUT via the /api/submissions/upload
 * handler. Caller owns the URL state and passes it back into the submission
 * POST body so the AI prompt can attach the image as multimodal content.
 *
 * UX:
 *   - native <input type=file accept=image/*> for keyboard / a11y baseline
 *   - on select: upload starts immediately, progress reads back through onUploadProgress
 *   - on success: thumbnail with "Заменить" / "Убрать" controls
 *   - on 503: render "Загрузка не настроена" hint (token missing in env)
 */

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

export function ImageUpload({ value, onChange, disabled = false }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > 5 * 1024 * 1024) {
        setError("Файл больше 5 МБ. Уменьшите перед загрузкой.");
        reset();
        return;
      }
      setProgress(0);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/submissions/upload",
          onUploadProgress: ({ percentage }) => setProgress(percentage),
        });
        onChange(blob.url);
        setProgress(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Не удалось загрузить файл";
        // 503 surfaces here as a generic upload error; the route returns a
        // structured body but @vercel/blob client wraps it. Show the hint
        // path explicitly when the message looks like a misconfiguration.
        if (/not configured|not.+set|503/i.test(message)) {
          setError(
            "Загрузка изображений ещё не настроена в этом окружении.",
          );
        } else {
          setError(message);
        }
        setProgress(null);
      }
    },
    [onChange, reset],
  );

  const remove = useCallback(() => {
    onChange(null);
    reset();
  }, [onChange, reset]);

  if (value) {
    return (
      <div className="flex flex-col" style={{ gap: "8px" }}>
        <span className="text-caption text-ink">Скриншот</span>
        {/* Native img — Vercel Blob URLs are already optimised; next/image
            would require remotePatterns config and adds no benefit for a
            small thumbnail. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="Загруженный скриншот"
          className="bg-paper"
          style={{
            maxWidth: "320px",
            maxHeight: "240px",
            objectFit: "contain",
            border: "0.5px solid var(--rule)",
          }}
        />
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="text-caption text-ink motion-micro hover:text-cinnabar"
            style={{
              border: "0.5px solid var(--rule)",
              padding: "6px 14px",
              letterSpacing: "0.05em",
            }}
          >
            Заменить
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={disabled}
            className="text-caption text-ink-muted motion-micro hover:text-cinnabar"
          >
            Убрать
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) void handleFile(f);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "6px" }}>
      <label
        htmlFor={inputId}
        className="text-caption text-ink"
      >
        Скриншот · до 5 МБ
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        disabled={disabled || progress !== null}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) void handleFile(f);
        }}
        className="self-start text-caption text-ink"
        style={{
          border: "0.5px dashed var(--rule)",
          padding: "10px 14px",
          fontFamily: "var(--font-mono)",
        }}
      />
      {progress !== null ? (
        <p className="text-caption text-ink-muted tabular-nums">
          Загрузка · {Math.round(progress)}%
        </p>
      ) : null}
      {error ? (
        <p className="text-caption text-cinnabar">{error}</p>
      ) : null}
    </div>
  );
}
