"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  recordName?: string;
  loading?: boolean;
  requiresTypedConfirmation?: boolean;
  confirmationText?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isArchive?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  recordName,
  loading = false,
  requiresTypedConfirmation = false,
  confirmationText = "DELETE",
  confirmButtonText,
  onConfirm,
  onCancel,
  isArchive = false
}: DeleteConfirmationDialogProps) {
  const [typedText, setTypedText] = useState("");

  const handleClose = () => {
    if (loading) return;
    setTypedText("");
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (requiresTypedConfirmation && typedText.trim() !== confirmationText) return;
    onConfirm();
  };

  const isConfirmDisabled = loading || (requiresTypedConfirmation && typedText.trim() !== confirmationText);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full flex-shrink-0 ${isArchive ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"}`}>
              {isArchive ? <AlertTriangle className="h-5 w-5" /> : <Trash2 className="h-5 w-5" />}
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <DialogDescription className="text-base text-foreground space-y-4">
            {description}
          </DialogDescription>
          
          {recordName && (
            <div className="bg-muted/50 p-3 rounded-md border border-border/50 text-center font-medium">
              {recordName}
            </div>
          )}

          {requiresTypedConfirmation && (
            <div className="space-y-2 mt-4 bg-muted/30 p-4 rounded-lg border border-destructive/20">
              <label className="text-sm font-medium text-foreground block text-center">
                Type <span className="font-bold select-all text-destructive">{confirmationText}</span> to confirm.
              </label>
              <Input
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder={confirmationText}
                className="font-mono text-center border-destructive/30 focus-visible:ring-destructive/20"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant={isArchive ? "default" : "destructive"} 
            onClick={handleConfirm} 
            disabled={isConfirmDisabled}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {confirmButtonText || (isArchive ? "Archive" : "Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
