-- AlterTable
ALTER TABLE "submissions" ADD COLUMN "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "submission_likes" (
    "userId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_likes_pkey" PRIMARY KEY ("userId", "submissionId")
);

-- CreateIndex
CREATE INDEX "submission_likes_submissionId_idx" ON "submission_likes"("submissionId");

-- AddForeignKey
ALTER TABLE "submission_likes" ADD CONSTRAINT "submission_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_likes" ADD CONSTRAINT "submission_likes_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
