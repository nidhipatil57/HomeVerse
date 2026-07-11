-- CreateTable
CREATE TABLE "ResidentWorkerAssignment" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "workingDays" TEXT[],
    "arrivalTime" TEXT NOT NULL,
    "exitTime" TEXT NOT NULL,
    "services" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResidentWorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ResidentWorkerAssignment" ADD CONSTRAINT "ResidentWorkerAssignment_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentWorkerAssignment" ADD CONSTRAINT "ResidentWorkerAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
