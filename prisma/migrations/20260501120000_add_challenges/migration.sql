-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "challenges_slug_key" ON "challenges"("slug");

-- CreateIndex
CREATE INDEX "challenges_status_endsAt_idx" ON "challenges"("status", "endsAt");

-- AlterTable — link Submission rows back to a Challenge (nullable).
ALTER TABLE "submissions" ADD COLUMN "challengeId" TEXT;

-- CreateIndex — leaderboard query (top public, sorted by likesCount desc).
CREATE INDEX "submissions_challengeId_isPublic_likesCount_idx"
  ON "submissions"("challengeId", "isPublic", "likesCount");

-- AddForeignKey — onDelete: SetNull keeps the Submission row when an admin
-- archives or deletes a challenge; it just unlinks.
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "challenges"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
