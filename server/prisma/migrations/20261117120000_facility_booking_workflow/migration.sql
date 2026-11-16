CREATE TABLE "FacilityConfiguration" (
    "id" TEXT NOT NULL,
    "communityCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Operational',
    "maxAdvanceDays" INTEGER NOT NULL DEFAULT 7,
    "timeSlots" TEXT[] NOT NULL,
    "cancellationNoticeMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxSessionsPerDay" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "FacilityConfiguration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FacilityConfiguration_communityCode_name_key"
ON "FacilityConfiguration"("communityCode", "name");

CREATE INDEX "FacilityConfiguration_communityCode_idx"
ON "FacilityConfiguration"("communityCode");
