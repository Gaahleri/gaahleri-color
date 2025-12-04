-- CreateTable
CREATE TABLE "PurchaseClick" (
    "id" TEXT NOT NULL,
    "colorId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseClick_colorId_idx" ON "PurchaseClick"("colorId");

-- CreateIndex
CREATE INDEX "PurchaseClick_userId_idx" ON "PurchaseClick"("userId");

-- CreateIndex
CREATE INDEX "PurchaseClick_createdAt_idx" ON "PurchaseClick"("createdAt");

-- AddForeignKey
ALTER TABLE "PurchaseClick" ADD CONSTRAINT "PurchaseClick_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE CASCADE ON UPDATE CASCADE;
