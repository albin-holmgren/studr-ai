-- CreateTable
CREATE TABLE "GradingCriteria" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradingCriteria_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GradingCriteria" ADD CONSTRAINT "GradingCriteria_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
