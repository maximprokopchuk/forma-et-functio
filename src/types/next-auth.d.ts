import "next-auth";
import type { Track, BloomsLevel } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      preferredTrack?: Track | null;
      preferredLevel?: BloomsLevel | null;
      showAllLevels?: boolean;
      onboardingCompleted?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    preferredTrack?: Track | null;
    preferredLevel?: BloomsLevel | null;
    showAllLevels?: boolean;
    onboardingCompleted?: boolean;
  }
}
