"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, X, FileText } from "lucide-react";

interface FileUploadProps {
  name: string;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onFilesChange?: (files: File[]) => void;
}

export function FileUpload({
  name,
  maxFiles = 5,
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  onFilesChange
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    setError(null);
    const validFiles: File[] = [];
    const newPreviews: Record<string, string> = { ...previews };
    
    let hasError = false;

    for (const file of newFiles) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`File type not supported: ${file.name}`);
        hasError = true;
        continue;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${maxSizeMB}MB: ${file.name}`);
        hasError = true;
        continue;
      }

      // Check for duplicates
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        continue; // silently ignore duplicate selections
      }

      validFiles.push(file);
      
      if (file.type.startsWith("image/")) {
        newPreviews[file.name] = URL.createObjectURL(file);
      }
    }

    if (!hasError) {
      setFiles(prev => {
        const updated = [...prev, ...validFiles].slice(0, maxFiles);
        if (updated.length < prev.length + validFiles.length) {
          setError(`Maximum ${maxFiles} files allowed.`);
        }
        if (onFilesChange) onFilesChange(updated);
        return updated;
      });
      setPreviews(newPreviews);
    }
  }, [acceptedTypes, maxFiles, maxSizeMB, onFilesChange, previews, files]);

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => {
      const fileToRemove = prev[indexToRemove];
      if (fileToRemove && previews[fileToRemove.name]) {
        URL.revokeObjectURL(previews[fileToRemove.name]);
        const newPreviews = { ...previews };
        delete newPreviews[fileToRemove.name];
        setPreviews(newPreviews);
      }
      const updated = prev.filter((_, i) => i !== indexToRemove);
      if (onFilesChange) onFilesChange(updated);
      return updated;
    });
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5 ${files.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <UploadCloud className="w-8 h-8 text-white/40 mx-auto mb-2" />
        <div className="text-sm font-medium text-white/80">
          Drag & Drop Files or <span className="text-emerald-400">Browse</span>
        </div>
        <div className="text-xs text-white/40 mt-1">
          JPG, PNG, WEBP, PDF up to {maxSizeMB}MB
        </div>
        <input 
          type="file"
          name={name}
          ref={inputRef}
          className="hidden"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
            e.target.value = ''; // Reset to allow selecting the same file again
          }}
        />
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-sans uppercase tracking-widest text-white/40 flex justify-between">
            <span>Attached Evidence ({files.length}/{maxFiles})</span>
          </div>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 shrink-0 bg-white/5 rounded-md flex items-center justify-center overflow-hidden">
                    {file.type.startsWith("image/") ? (
                      <img src={previews[file.name]} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="text-sm text-white/80 truncate">{file.name}</div>
                    <div className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
