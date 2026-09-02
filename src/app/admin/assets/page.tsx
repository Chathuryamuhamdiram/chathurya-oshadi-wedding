import { prisma } from "@/lib/db";
import { AssetUploader } from "./AssetUploader";

export default async function SiteAssetsPage() {
  const assets = await prisma.siteAsset.findMany({
    select: { id: true, key: true, createdAt: true, updatedAt: true }
  });
  
  // Create a quick lookup map using API route
  const assetMap = assets.reduce((acc, asset) => {
    acc[asset.key] = `/api/image/asset/${asset.key}`;
    return acc;
  }, {} as Record<string, string>);

  const assetConfigs = [
    {
      key: "HERO_IMAGE",
      title: "Hero Background Image",
      description: "The main background image shown at the very top of the website.",
      defaultUrl: "/hero_image_new.jpg",
    },
    {
      key: "STORY_1",
      title: "Our Story: First Hello",
      description: "The first image in the 'Our Story' timeline.",
      defaultUrl: "/first_hello.jpg",
    },
    {
      key: "STORY_2",
      title: "Our Story: The Engagement",
      description: "The second image in the 'Our Story' timeline.",
      defaultUrl: "/engagement.jpg",
    },
    {
      key: "STORY_3",
      title: "Our Story: Forever Begins",
      description: "The third image in the 'Our Story' timeline.",
      defaultUrl: "/forever_begins.jpg",
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif text-white tracking-wide">Site Assets</h1>
        <p className="text-white/40 text-sm font-sans mt-1">Manage the core imagery for your public website and digital invitations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {assetConfigs.map((config) => (
          <AssetUploader 
            key={config.key}
            assetKey={config.key}
            title={config.title}
            description={config.description}
            currentUrl={assetMap[config.key] || config.defaultUrl}
            isDefault={!assetMap[config.key]}
          />
        ))}
      </div>
    </div>
  );
}
