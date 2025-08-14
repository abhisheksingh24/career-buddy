/*
  Warnings:

  - A unique constraint covering the columns `[storageKey]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Resume_storageKey_key" ON "public"."Resume"("storageKey");
