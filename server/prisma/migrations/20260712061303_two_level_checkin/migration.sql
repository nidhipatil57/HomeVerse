-- AlterTable
ALTER TABLE "HelperAttendance" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'checked-in';

-- CreateTable
CREATE TABLE "FlatAttendance" (
    "id" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "helperName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "flatNumber" TEXT NOT NULL,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "duration" INTEGER,
    "servicePerformed" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'working',

    CONSTRAINT "FlatAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlatAttendance_helperId_idx" ON "FlatAttendance"("helperId");

-- CreateIndex
CREATE INDEX "FlatAttendance_residentId_idx" ON "FlatAttendance"("residentId");

-- CreateIndex
CREATE INDEX "FlatAttendance_date_idx" ON "FlatAttendance"("date");
