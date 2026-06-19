CREATE TABLE "Entry" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "kicker" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "coverImage" TEXT NOT NULL,
  "galleryImages" TEXT NOT NULL DEFAULT '[]',
  "readMinutes" INTEGER NOT NULL DEFAULT 5,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "section" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Entry_slug_key" ON "Entry"("slug");
CREATE INDEX "Entry_section_status_publishedAt_idx" ON "Entry"("section", "status", "publishedAt");
CREATE INDEX "Entry_status_publishedAt_idx" ON "Entry"("status", "publishedAt");
