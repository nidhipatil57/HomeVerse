ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "originalPrice" TEXT;
ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "condition" TEXT DEFAULT 'Good';
ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "flatNumber" TEXT;
ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "building" TEXT;
ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "contactPreference" TEXT DEFAULT 'In-app';
ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE "MarketplaceItem" ADD COLUMN IF NOT EXISTS "soldAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "MarketplaceEnquiry" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "itemTitle" TEXT,
  "sellerId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "buyerName" TEXT NOT NULL,
  "buyerFlat" TEXT,
  "buyerPhone" TEXT,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketplaceEnquiry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketplaceEnquiry_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MarketplaceSavedItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "MarketplaceSavedItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MarketplaceSavedItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MarketplaceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "MarketplaceSavedItem_userId_itemId_key" ON "MarketplaceSavedItem"("userId", "itemId");
CREATE INDEX IF NOT EXISTS "MarketplaceEnquiry_itemId_idx" ON "MarketplaceEnquiry"("itemId");
CREATE INDEX IF NOT EXISTS "MarketplaceEnquiry_sellerId_idx" ON "MarketplaceEnquiry"("sellerId");
CREATE INDEX IF NOT EXISTS "MarketplaceEnquiry_buyerId_idx" ON "MarketplaceEnquiry"("buyerId");
CREATE INDEX IF NOT EXISTS "MarketplaceSavedItem_userId_idx" ON "MarketplaceSavedItem"("userId");
CREATE INDEX IF NOT EXISTS "MarketplaceItem_status_idx" ON "MarketplaceItem"("status");

