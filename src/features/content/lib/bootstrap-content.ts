import type { ContentEntry } from "@/features/content/lib/sections";
import { prisma } from "@/lib/prisma";

type StarterEntry = Omit<
  ContentEntry,
  "id" | "createdAt" | "updatedAt"
>;

const starterEntries: StarterEntry[] = [
  {
    slug: "the-forest-speaks",
    title: "The Forest Speaks",
    kicker: "Chapter I",
    excerpt: "On listening to what grows in silence.",
    content:
      "The forest never begins with noise. It begins with noticing.\n\nEvery branch becomes a sentence once you stop asking it to perform. Moss keeps time better than clocks, and the clearing only reveals itself when you stop trying to arrive first.\n\nThis entry gathers the sounds, markings, and small permissions that turned a path into a conversation.",
    coverImage: "/media/journal-image-1.png",
    galleryImages: ["/media/journal-image-1.png", "/media/journal-image-2.png"],
    readMinutes: 8,
    featured: true,
    section: "JOURNAL",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-06T09:00:00.000Z"),
  },
  {
    slug: "beneath-the-surface",
    title: "Beneath the Surface",
    kicker: "Chapter II",
    excerpt: "Discovering life and patterns in the deep.",
    content:
      "Water edits the world slowly enough to hide its own labor.\n\nBelow the visible surface, the rules soften. Light becomes rumor, movement becomes shape, and entire systems breathe in gradients instead of edges.\n\nThese notes track what becomes visible only after patience replaces speed.",
    coverImage: "/media/journal-image-2.png",
    galleryImages: ["/media/journal-image-2.png", "/media/journal-image-3.png"],
    readMinutes: 12,
    featured: false,
    section: "JOURNAL",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-08T09:00:00.000Z"),
  },
  {
    slug: "when-stars-awaken",
    title: "When Stars Awaken",
    kicker: "Chapter III",
    excerpt: "Night observations from a mountain observatory.",
    content:
      "At altitude, darkness feels constructive rather than empty.\n\nThe mountain removes enough interference that the sky starts behaving like an annotated manuscript. Constellations stop being distant decorations and start reading like a set of recurring instructions.\n\nThis entry records the night when the map finally answered back.",
    coverImage: "/media/journal-image-3.png",
    galleryImages: ["/media/journal-image-3.png", "/media/ImageWithFallback.png"],
    readMinutes: 10,
    featured: false,
    section: "JOURNAL",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-10T09:00:00.000Z"),
  },
  {
    slug: "nebula-birth",
    title: "Nebula Birth",
    kicker: "Cosmos",
    excerpt: "Where stars begin their long and luminous journey.",
    content:
      "A nebula is not merely where stars are made. It is where disorder learns how to organize its own radiance.\n\nThe forms in this realm are provisional and dramatic. Every contour suggests a future body, and every cloud contains the outline of a system not yet committed to shape.",
    coverImage: "/media/realms-image-1.png",
    galleryImages: ["/media/realms-image-1.png", "/media/realms-image-3.png"],
    readMinutes: 7,
    featured: true,
    section: "REALMS",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-09T09:00:00.000Z"),
  },
  {
    slug: "desert-wisdom",
    title: "Desert Wisdom",
    kicker: "Terra",
    excerpt: "What the sand remembers after the footprints vanish.",
    content:
      "Deserts archive change without clutter. Wind is both editor and witness.\n\nThis realm focuses on how repetition becomes knowledge, and how emptiness can still hold instruction when you learn its pace.",
    coverImage: "/media/realms-image-2.png",
    galleryImages: ["/media/realms-image-2.png", "/media/realms-image-4.png"],
    readMinutes: 6,
    featured: false,
    section: "REALMS",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-11T09:00:00.000Z"),
  },
  {
    slug: "cloud-kingdoms",
    title: "Cloud Kingdoms",
    kicker: "Summit",
    excerpt: "Aerial sketches from the edge of weather.",
    content:
      "Above the tree line, scale becomes unreliable in the best possible way.\n\nCloud systems move like sovereign nations. They fold, negotiate, and separate with the precision of a language you almost understand.",
    coverImage: "/media/realms-image-3.png",
    galleryImages: ["/media/realms-image-3.png", "/media/ImageWithFallback.png"],
    readMinutes: 9,
    featured: false,
    section: "REALMS",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-12T09:00:00.000Z"),
  },
  {
    slug: "liquid-thoughts",
    title: "Liquid Thoughts",
    kicker: "Abstract",
    excerpt: "Color studies and motion notes from the laboratory.",
    content:
      "Some experiments start not with a question, but with a texture.\n\nLiquid Thoughts studies what happens when we allow color and movement to lead interpretation. Instead of explaining the image, the experiment watches what the image makes possible.",
    coverImage: "/media/realms-image-4.png",
    galleryImages: ["/media/realms-image-4.png", "/media/realms-image-1.png"],
    readMinutes: 5,
    featured: true,
    section: "EXPERIMENTS",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-13T09:00:00.000Z"),
  },
  {
    slug: "pattern-recognition-practice",
    title: "Pattern Recognition Practice",
    kicker: "Lab prompt",
    excerpt: "Train your eye to trace recurrence across unrelated scenes.",
    content:
      "The exercise is simple: collect five forms that should not belong together, then make them confess what they share.\n\nA good experiment does not prove a point. It changes what you are capable of noticing next.",
    coverImage: "/media/journal-image-2.png",
    galleryImages: ["/media/journal-image-2.png", "/media/realms-image-4.png"],
    readMinutes: 4,
    featured: false,
    section: "EXPERIMENTS",
    status: "PUBLISHED",
    publishedAt: new Date("2026-06-14T09:00:00.000Z"),
  },
];

let bootstrapped = false;

export function getStarterEntries(): ContentEntry[] {
  return starterEntries.map((entry, index) => {
    const createdAt = entry.publishedAt ?? new Date("2026-06-01T09:00:00.000Z");
    const updatedAt = entry.publishedAt ?? createdAt;

    return {
      ...entry,
      id: `starter-${index + 1}`,
      createdAt,
      updatedAt,
    };
  });
}

export async function ensureSeedContent() {
  const shouldSeed =
    process.env.ENABLE_SEED_CONTENT === "true" ||
    process.env.NODE_ENV !== "production";

  if (!shouldSeed) {
    return;
  }

  if (bootstrapped) {
    return;
  }

  let count = 0;

  try {
    count = await prisma.entry.count();
  } catch {
    return;
  }

  if (count === 0) {
    try {
      await prisma.entry.createMany({
        data: starterEntries.map((entry) => ({
          ...entry,
          galleryImages: JSON.stringify(entry.galleryImages),
        })),
      });
    } catch {
      // Another request may have initialized the content first.
    }
  }

  let entriesWithoutGallery: Array<{ id: string; slug: string }> = [];

  try {
    entriesWithoutGallery = await prisma.entry.findMany({
      where: { galleryImages: "[]" },
      select: { id: true, slug: true },
    });
  } catch {
    return;
  }

  if (entriesWithoutGallery.length > 0) {
    await Promise.all(
      entriesWithoutGallery.map((entry) => {
        const starter = starterEntries.find((item) => item.slug === entry.slug);

        if (!starter || starter.galleryImages.length === 0) {
          return Promise.resolve();
        }

        return prisma.entry.update({
          where: { id: entry.id },
          data: {
            galleryImages: JSON.stringify(starter.galleryImages),
          },
        });
      }),
    );
  }

  bootstrapped = true;
}
