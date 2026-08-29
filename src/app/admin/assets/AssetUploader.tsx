"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadSiteAsset } from "./actions";

interface AssetUploaderProps {
  assetKey: string;
  title: string;
  description: string;
  currentUrl: string;
  isDefault: boolean;
}

export function AssetUploader({ assetKey, title, description, currentUrl, isDefault }: AssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadSiteAsset(assetKey, formData);
      if (!res.success) {
        alert(res.error || "Upload failed");
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col relative group">
      {/* Image Preview */}
      <div className="w-full h-48 md:h-64 relative bg-black/50 border-b border-white/[0.08]">
        {currentUrl.startsWith('data:') || currentUrl.endsWith('.svg') ? (
          // For SVG fallbacks (like wedding card default)
          <div 
            className="w-full h-full opacity-60"
            style={{ 
              backgroundImage: `url("${currentUrl}")`, 
              backgroundPosition: 'center', 
              backgroundSize: 'contain', 
              backgroundRepeat: 'no-repeat' 
            }}
          />
        ) : (
          <Image 
            src={currentUrl} 
            alt={title}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            unoptimized // Just in case external or SVGs
          />
        )}
        
        {isDefault && (
          <div className="absolute top-4 left-4 bg-black/60 text-white/70 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
            Default
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-white/20 border-t-purple-400 rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest text-white/70">Uploading...</span>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-serif text-white/90 mb-2">{title}</h3>
        <p className="text-sm font-sans text-white/50 mb-6 flex-1">{description}</p>

        <div className="relative">
          <input 
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <div className="w-full py-2.5 rounded-lg border border-white/20 text-white text-sm font-sans font-medium text-center hover:bg-white/5 transition-colors">
            {isDefault ? "Upload Custom Image" : "Replace Image"}
          </div>
        </div>
      </div>
    </div>
  );
}
