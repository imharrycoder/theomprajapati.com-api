/*
  Warnings:

  - Added the required column `city` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profession` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "instaId" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "location" TEXT,
    "device" TEXT,
    "token" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" DATETIME
);
INSERT INTO "new_User" ("createdAt", "device", "email", "id", "lastLogin", "location", "name", "password", "token") SELECT "createdAt", "device", "email", "id", "lastLogin", "location", "name", "password", "token" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
