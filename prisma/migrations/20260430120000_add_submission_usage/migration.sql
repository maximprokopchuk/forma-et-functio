-- CreateTable
CREATE TABLE "submission_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "submission_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "submission_usage_userId_day_key" ON "submission_usage"("userId", "day");

-- CreateIndex
CREATE INDEX "submission_usage_day_idx" ON "submission_usage"("day");
