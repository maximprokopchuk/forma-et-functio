"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Thin client wrapper around next-auth's `SessionProvider` so we can use
 * `useSession()` / `session.update()` inside client components like onboarding.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
