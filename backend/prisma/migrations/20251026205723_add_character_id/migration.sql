-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIStudent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL DEFAULT 'jean',
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "personalityTraits" TEXT NOT NULL DEFAULT '{"curiosity":0.5,"confusionRate":0.5,"learningSpeed":0.5}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIStudent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIStudent" ("createdAt", "id", "level", "name", "ownerId", "personalityTraits", "totalXP") SELECT "createdAt", "id", "level", "name", "ownerId", "personalityTraits", "totalXP" FROM "AIStudent";
DROP TABLE "AIStudent";
ALTER TABLE "new_AIStudent" RENAME TO "AIStudent";
CREATE UNIQUE INDEX "AIStudent_ownerId_characterId_key" ON "AIStudent"("ownerId", "characterId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
