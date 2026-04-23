"use client";

import dynamic from "next/dynamic";
import { WidgetSkeleton } from "./lazy";

/**
 * Code-split entry points for the interactive widgets. Each widget is
 * rendered only on the client (`ssr: false`) and bundled in its own chunk —
 * the topic page ships none of this JS until the reader reaches the exercise.
 *
 * Note: `next/dynamic` with `ssr: false` must live in a client module, which
 * is why this file is `"use client"` and `.tsx` (not `.ts`).
 */

export const ColorContrastSandbox = dynamic(
  () =>
    import("./color-contrast-sandbox").then((m) => m.ColorContrastSandbox),
  {
    ssr: false,
    loading: () => <WidgetSkeleton label="Загрузка виджета…" />,
  },
);

export const TypePairingLab = dynamic(
  () => import("./type-pairing-lab").then((m) => m.TypePairingLab),
  {
    ssr: false,
    loading: () => <WidgetSkeleton label="Загрузка виджета…" />,
  },
);

export const SpacingTuner = dynamic(
  () => import("./spacing-tuner").then((m) => m.SpacingTuner),
  {
    ssr: false,
    loading: () => <WidgetSkeleton label="Загрузка виджета…" />,
  },
);

export const A11ySimulator = dynamic(
  () => import("./a11y-simulator").then((m) => m.A11ySimulator),
  {
    ssr: false,
    loading: () => <WidgetSkeleton label="Загрузка виджета…" />,
  },
);

export const HierarchyReorder = dynamic(
  () => import("./hierarchy-reorder").then((m) => m.HierarchyReorder),
  {
    ssr: false,
    loading: () => <WidgetSkeleton label="Загрузка виджета…" />,
  },
);
