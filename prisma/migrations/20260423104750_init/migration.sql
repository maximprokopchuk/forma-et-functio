-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Track" AS ENUM ('FOUNDATIONS', 'INTERFACE', 'EXPERIENCE', 'CRAFT');

-- CreateEnum
CREATE TYPE "BloomsLevel" AS ENUM ('L1', 'L2', 'L3', 'L4', 'L5');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'FEEDBACK_READY', 'FEEDBACK_FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChatMessageStatus" AS ENUM ('PENDING', 'STREAMING', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "preferredTrack" "Track",
    "preferredLevel" "BloomsLevel",
    "showAllLevels" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStreakDay" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "track" "Track" NOT NULL,
    "level" "BloomsLevel" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ChatMessageStatus" NOT NULL DEFAULT 'COMPLETE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "figmaUrl" TEXT,
    "imageUrl" TEXT,
    "description" TEXT NOT NULL,
    "feedback" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "feedbackModel" TEXT,
    "feedbackTokens" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chat_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubrics" (
    "id" TEXT NOT NULL,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_dimensions" (
    "id" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "levels" JSONB NOT NULL,

    CONSTRAINT "rubric_dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_queue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "review_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_steps" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "topicSlug" TEXT NOT NULL,

    CONSTRAINT "path_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playground_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicSlug" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT NOT NULL,
    "js" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playground_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_log" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_reports" (
    "id" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "topicSlug" TEXT,
    "description" TEXT NOT NULL,
    "pageUrl" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "user_progress_userId_track_idx" ON "user_progress"("userId", "track");

-- CreateIndex
CREATE INDEX "user_progress_track_completed_idx" ON "user_progress"("track", "completed");

-- CreateIndex
CREATE INDEX "user_progress_userId_completedAt_idx" ON "user_progress"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_lessonSlug_topicSlug_key" ON "user_progress"("userId", "lessonSlug", "topicSlug");

-- CreateIndex
CREATE INDEX "chat_messages_userId_lessonSlug_topicSlug_createdAt_idx" ON "chat_messages"("userId", "lessonSlug", "topicSlug", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "submissions_userId_createdAt_idx" ON "submissions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "submissions_status_createdAt_idx" ON "submissions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "submissions_isPublic_status_createdAt_idx" ON "submissions"("isPublic", "status", "createdAt");

-- CreateIndex
CREATE INDEX "chat_usage_day_idx" ON "chat_usage"("day");

-- CreateIndex
CREATE UNIQUE INDEX "chat_usage_userId_day_key" ON "chat_usage"("userId", "day");

-- CreateIndex
CREATE INDEX "rubric_dimensions_rubricId_idx" ON "rubric_dimensions"("rubricId");

-- CreateIndex
CREATE INDEX "review_queue_userId_dueAt_idx" ON "review_queue"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "learning_paths_slug_key" ON "learning_paths"("slug");

-- CreateIndex
CREATE INDEX "path_steps_pathId_order_idx" ON "path_steps"("pathId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "playground_snapshots_userId_topicSlug_key" ON "playground_snapshots"("userId", "topicSlug");

-- CreateIndex
CREATE INDEX "admin_audit_log_adminId_createdAt_idx" ON "admin_audit_log"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "error_reports_resolved_createdAt_idx" ON "error_reports"("resolved", "createdAt");

-- CreateIndex
CREATE INDEX "error_reports_lessonSlug_idx" ON "error_reports"("lessonSlug");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_dimensions" ADD CONSTRAINT "rubric_dimensions_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_steps" ADD CONSTRAINT "path_steps_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playground_snapshots" ADD CONSTRAINT "playground_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
