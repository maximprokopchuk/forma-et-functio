import type {
  User,
  UserProgress,
  ChatMessage,
  Submission,
  Track,
  BloomsLevel,
} from "@prisma/client";

export type { User, UserProgress, ChatMessage, Submission, Track, BloomsLevel };

export type SafeUser = Omit<User, "hashedPassword">;
