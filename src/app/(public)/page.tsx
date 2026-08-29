import { Hero } from "@/components/public/Hero";
import { OurStory } from "@/components/public/OurStory";
import { EventSchedule } from "@/components/public/EventSchedule";
import { Gallery } from "@/components/public/Gallery";
import { Guestbook } from "@/components/public/Guestbook";
import { FloatingNav } from "@/components/public/FloatingNav";
import { prisma } from "@/lib/db";

export const revalidate = 60; // Cache for 60 seconds

export default async function PublicHomePage() {
  const [guestbookEntries, galleryImages, siteAssets] = await Promise.all([
    prisma.guestbookEntry.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.siteAsset.findMany()
  ]);

  const assetMap = siteAssets.reduce((acc, asset) => {
    acc[asset.key] = asset.url;
    return acc;
  }, {} as Record<string, string>);

  return (
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
      <FloatingNav />
    </div>
  );
}
