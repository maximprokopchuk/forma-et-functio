-- AlterTable
ALTER TABLE "review_queue" ADD COLUMN "lessonSlug" TEXT NOT NULL DEFAULT '';

-- Drop the implicit default once the column exists; new rows must supply
-- lessonSlug explicitly via the application layer.
ALTER TABLE "review_queue" ALTER COLUMN "lessonSlug" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "review_queue_userId_topicSlug_key" ON "review_queue"("userId", "topicSlug");
