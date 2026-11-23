-- CreateEnum
CREATE TYPE "SwagMovementType" AS ENUM ('SET_COUNT', 'RESTOCK', 'HANDOUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "SwagItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "unitLabel" TEXT NOT NULL DEFAULT 'pcs',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "receivedTotal" INTEGER NOT NULL DEFAULT 0,
    "distributedTotal" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwagItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwagMovement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "SwagMovementType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "beforeQty" INTEGER NOT NULL,
    "afterQty" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "recipient" TEXT,
    "actorEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwagMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SwagItem_slug_key" ON "SwagItem"("slug");

-- CreateIndex
CREATE INDEX "SwagItem_category_idx" ON "SwagItem"("category");

-- CreateIndex
CREATE INDEX "SwagItem_name_idx" ON "SwagItem"("name");

-- CreateIndex
CREATE INDEX "SwagMovement_itemId_createdAt_idx" ON "SwagMovement"("itemId", "createdAt");

-- CreateIndex
CREATE INDEX "SwagMovement_createdAt_idx" ON "SwagMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "SwagMovement" ADD CONSTRAINT "SwagMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "SwagItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
