-- CreateEnum
CREATE TYPE "CronRunStatus" AS ENUM ('SUCCESS', 'PARTIAL_FAILURE', 'FAILURE');

-- CreateTable
CREATE TABLE "CronRun" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" "CronRunStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "CronRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CronRun_jobName_startedAt_idx" ON "CronRun"("jobName", "startedAt");
