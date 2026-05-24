"use client";

import { signOut } from "next-auth/react";

export function SignOutLink() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-caption text-ink-muted motion-micro hover:text-cinnabar"
    >
      Выйти
    </button>
  );
}
