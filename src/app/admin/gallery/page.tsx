import { prisma } from "@/lib/db";
import { uploadGalleryImage, deleteGalleryImage, toggleGalleryImageStatus, updateGalleryImageOrder } from "./actions";
import { revalidatePath } from "next/cache";
import Image from "next/image";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { sortOrder: "asc" },
  });

  // Basic inline server actions for the form
  async function moveUp(id: string, currentSort: number) {
    "use server";
    const previous = await prisma.galleryImage.findFirst({
      where: { sortOrder: { lt: currentSort } },
      orderBy: { sortOrder: "desc" }
    });
    if (previous) {
      await updateGalleryImageOrder([
        { id, sortOrder: previous.sortOrder },
        { id: previous.id, sortOrder: currentSort }
      ]);
    }
  }

  async function moveDown(id: string, currentSort: number) {
    "use server";
    const next = await prisma.galleryImage.findFirst({
      where: { sortOrder: { gt: currentSort } },
      orderBy: { sortOrder: "asc" }
    });
    if (next) {
      await updateGalleryImageOrder([
        { id, sortOrder: next.sortOrder },
        { id: next.id, sortOrder: currentSort }
      ]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif text-primary">Manage Gallery</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload New Photo</h2>
        <form action={async (formData) => { "use server"; await uploadGalleryImage(formData); }} className="flex items-center gap-4">
          <input 
            type="file" 
            name="file" 
            accept="image/*"
            required 
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-secondary/10 file:text-secondary-foreground
              hover:file:bg-secondary/20
            "
          />
          <button 
            type="submit" 
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium whitespace-nowrap"
          >
            Upload Image
          </button>
        </form>
      </div>

      {/* Grid Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Current Gallery ({images.length} photos)</h2>
        
        {images.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No images uploaded yet. The public gallery will show the default layout.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <div key={img.id} className="group relative border rounded-lg overflow-hidden bg-gray-50 shadow-sm transition-all hover:shadow-md flex flex-col">
                <div className="relative aspect-square w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={img.url} 
                    alt={img.altText || "Gallery Image"} 
                    className={`w-full h-full object-cover ${!img.isActive ? 'opacity-50 grayscale' : ''}`}
                  />
                  {!img.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-black/75 text-white text-xs px-3 py-1 rounded-full font-bold">HIDDEN</span>
                    </div>
                  )}
                </div>
                
                <div className="p-3 flex justify-between items-center bg-white border-t">
                  <div className="flex gap-1">
                    <form action={moveUp.bind(null, img.id, img.sortOrder)}>
                      <button disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30">↑</button>
                    </form>
                    <form action={moveDown.bind(null, img.id, img.sortOrder)}>
                      <button disabled={index === images.length - 1} className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30">↓</button>
                    </form>
                  </div>
                  <div className="flex gap-2">
                    <form action={async () => {
                      "use server";
                      await toggleGalleryImageStatus(img.id, !img.isActive);
                    }}>
                      <button className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200">
                        {img.isActive ? "Hide" : "Show"}
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await deleteGalleryImage(img.id);
                    }}>
                      <button className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
