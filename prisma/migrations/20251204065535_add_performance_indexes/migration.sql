-- CreateIndex
CREATE INDEX "Color_hex_idx" ON "Color"("hex");

-- CreateIndex
CREATE INDEX "Recipe_userId_createdAt_idx" ON "Recipe"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserRecord_userId_isFavorite_idx" ON "UserRecord"("userId", "isFavorite");
