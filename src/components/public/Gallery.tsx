"use client";

import { motion } from "framer-motion";

const defaultGalleryImages = [
  { src: "/hero_image_new.jpg", alt: "Golden Portrait" },
  { src: "/engagement.jpg", alt: "Pink Saree Engagement" },
  { src: "/first_hello.jpg", alt: "Graduation" },
  { src: "/forever_begins.jpg", alt: "Traditional Portrait" },
  { src: "/gallery_sunset_silhouette.jpeg", alt: "Sunset" },
  { src: "/gallery_floral_decor.jpeg", alt: "Florals" },
];

interface GalleryImage {
  id?: string;
  url?: string;
  src?: string;
  altText?: string | null;
  alt?: string;
}

export function Gallery({ images = [] }: { images?: GalleryImage[] }) {
  // Use DB images if available, else fallback to defaults
  const displayImages = images.length > 0 
    ? images.map(img => ({ src: img.url || '', alt: img.altText || 'Gallery Image' })) 
    : defaultGalleryImages;
  return (
    <section id="gallery" className="py-24 md:py-48 bg-background overflow-hidden border-t border-foreground/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="mb-16 md:mb-24 flex flex-col items-center justify-center text-center gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-foreground/50 mb-6 font-medium">
              Gallery
            </p>
            <h2 className="text-5xl md:text-7xl lg:text-[8rem] font-serif text-foreground font-light leading-[0.9]">
              Captured<br />
              <span className="italic text-secondary">Moments.</span>
            </h2>
          </motion.div>
        </div>

        {/* Quote Block (Optional touch of editorial elegance) */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5 }}
            className="text-center max-w-xl mx-auto mb-16 md:mb-32 px-4"
        >
            <p className="font-serif text-2xl md:text-3xl text-foreground italic mb-4 leading-relaxed">"In your light I learn how to love."</p>
            <span className="text-[10px] uppercase tracking-widest text-secondary font-sans font-bold">Rumi</span>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-8 space-y-6 md:space-y-8 pb-32">
          {displayImages.map((image, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: (idx % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="break-inside-avoid relative group overflow-hidden bg-foreground/5 shadow-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
