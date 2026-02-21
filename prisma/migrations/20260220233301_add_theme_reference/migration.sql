-- CreateTable
CREATE TABLE "ThemeReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "line" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ThemeReference_shop_idx" ON "ThemeReference"("shop");

-- CreateIndex
CREATE INDEX "ThemeReference_shop_namespace_key_idx" ON "ThemeReference"("shop", "namespace", "key");
