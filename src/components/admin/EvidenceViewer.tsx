"use client";

import { useState } from "react";
import { Paperclip, X, Download, FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { deleteExpenseAttachment } from "@/app/admin/budget/actions";
import { FileUpload } from "./FileUpload";

interface Attachment {
  id: string;
  expenseId: string;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  uploadedAt: Date;
}

export function EvidenceViewer({ attachments = [], expenseId }: { attachments: Attachment[], expenseId: string }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this evidence?")) return;
    setIsDeleting(id);
    await deleteExpenseAttachment(id);
    setIsDeleting(null);
  };

  if (attachments.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 text-white/70 px-1.5 py-0.5 rounded transition-colors mt-1">
          <Paperclip className="w-3 h-3" />
          {attachments.length} file{attachments.length !== 1 ? 's' : ''}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-[#0d1117] border-white/10 text-white max-h-[85vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wide flex items-center gap-2">
            Payment Evidence
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {attachments.map((file) => (
            <div key={file.id} className="bg-[#1e2333] border border-white/10 rounded-xl overflow-hidden group flex flex-col">
              <div className="aspect-square bg-black/40 flex items-center justify-center relative overflow-hidden">
                {file.mimeType.startsWith('image/') ? (
                  <img src={file.storagePath} alt={file.originalFileName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <FileText className="w-12 h-12 text-blue-400" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a href={file.storagePath} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Open">
                    <Download className="w-5 h-5" />
                  </a>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    disabled={isDeleting === file.id}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-3 text-sm flex-1 flex flex-col justify-between">
                <div className="truncate text-white/80 font-medium" title={file.originalFileName}>{file.originalFileName}</div>
                <div className="text-xs text-white/40 mt-1 flex justify-between items-center">
                  <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
