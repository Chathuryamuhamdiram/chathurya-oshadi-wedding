import { Hero } from "@/components/public/Hero";
import { OurStory } from "@/components/public/OurStory";
import { EventSchedule } from "@/components/public/EventSchedule";
import { Gallery } from "@/components/public/Gallery";
import { Guestbook } from "@/components/public/Guestbook";
import { WeddingPageClient } from "@/components/public/WeddingPageClient";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default async function PublicHomePage() {
  const [guestbookEntries, galleryImagesRaw, siteAssetsRaw] = await Promise.all([
    prisma.guestbookEntry.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.galleryImage.findMany({
      where: { isActive: true },
      select: { id: true, altText: true, sortOrder: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.siteAsset.findMany({
      select: { id: true, key: true, createdAt: true, updatedAt: true }
    })
  ]);

  const galleryImages = galleryImagesRaw.map(img => ({
    ...img,
    url: `/api/image/gallery/${img.id}`
  }));

  const assetMap = siteAssetsRaw.reduce((acc, asset) => {
    acc[asset.key] = `/api/image/asset/${asset.key}`;
    return acc;
  }, {} as Record<string, string>);

  return (
    <WeddingPageClient>
      <div className="min-h-screen flex flex-col bg-background">
        <Hero imageUrl={assetMap["HERO_IMAGE"]} />
        <OurStory 
          story1Url={assetMap["STORY_1"]} 
          story2Url={assetMap["STORY_2"]} 
          story3Url={assetMap["STORY_3"]} 
        />
        <EventSchedule />
        <Gallery images={galleryImages} />
        <Guestbook entries={guestbookEntries} />
      </div>
    </WeddingPageClient>
  );
}
