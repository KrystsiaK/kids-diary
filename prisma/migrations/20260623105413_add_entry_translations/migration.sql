-- CreateTable
CREATE TABLE "EntryTranslation" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kicker" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EntryTranslation_locale_idx" ON "EntryTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "EntryTranslation_entryId_locale_key" ON "EntryTranslation"("entryId", "locale");

-- AddForeignKey
ALTER TABLE "EntryTranslation" ADD CONSTRAINT "EntryTranslation_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
