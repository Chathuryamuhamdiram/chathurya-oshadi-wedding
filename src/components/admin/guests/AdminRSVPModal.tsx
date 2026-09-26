"use client";

import { useState, useEffect } from "react";
import { updateGuestRSVPAction } from "@/app/admin/guests/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";

interface AdminRSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: any;
  activeEventId: string;
}

export function AdminRSVPModal({ isOpen, onClose, guest, activeEventId }: AdminRSVPModalProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [rsvpStatus, setRsvpStatus] = useState<string>("PENDING");
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [liquorCount, setLiquorCount] = useState<number>(0);
  const [responseSource, setResponseSource] = useState<string>("Admin Update");
  const [internalNote, setInternalNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && guest) {
      setError(null);
      
      let initialEventId = "";
      if (activeEventId !== "all") {
        initialEventId = activeEventId;
      } else if (guest.eventGuests && guest.eventGuests.length > 0) {
        initialEventId = guest.eventGuests[0].eventId;
      }
      setSelectedEventId(initialEventId);
    }
  }, [isOpen, guest, activeEventId]);

  useEffect(() => {
    if (guest && selectedEventId) {
      const eg = guest.eventGuests?.find((e: any) => e.eventId === selectedEventId);
      
      // If we have event-specific RSVP data, use it. Otherwise fallback to guest data.
      setRsvpStatus(eg?.rsvpStatus || guest.rsvpStatus || "PENDING");
      setConfirmedCount(eg?.confirmedCount ?? guest.confirmedGuestCount ?? 0);
      setLiquorCount(eg?.liquorCount ?? guest.liquorCount ?? 0);
      setResponseSource(eg?.responseSource || "Admin Update");
      setInternalNote(eg?.notes || "");
    }
  }, [selectedEventId, guest]);

  if (!guest) return null;

  const handleStatusChange = (val: string) => {
    setRsvpStatus(val);
    if (val === "DECLINED" || val === "NOT_ATTENDING") {
      setConfirmedCount(0);
      setLiquorCount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedEventId) {
      setError("Please select an event.");
      return;
    }

    if (confirmedCount > guest.allowedGuestCount) {
      setError("Confirmed guest count cannot exceed the invited guest count.");
      return;
    }

    if (liquorCount > confirmedCount) {
      setError("Liquor count cannot exceed confirmed guest count.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("guestId", guest.id);
      formData.set("eventId", selectedEventId);
      formData.set("rsvpStatus", rsvpStatus);
      formData.set("confirmedCount", confirmedCount.toString());
      formData.set("liquorCount", liquorCount.toString());
      formData.set("responseSource", responseSource);
      formData.set("notes", internalNote);

      const res = await updateGuestRSVPAction(formData);
      if (!res.success) {
        throw new Error(res.error || "Failed to update RSVP");
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEventName = guest.eventGuests?.find((e: any) => e.eventId === selectedEventId)?.event?.name || "Event";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#1e2333] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#d7b56d]">UPDATE RSVP</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          
          <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg border border-white/5">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Guest</label>
              <div className="text-sm font-medium">{guest.displayName}</div>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Type</label>
              <div className="text-sm font-medium">{guest.invitationType}</div>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Allowed Guests</label>
              <div className="text-sm font-medium">{guest.allowedGuestCount}</div>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Event</label>
              {activeEventId === "all" && guest.eventGuests && guest.eventGuests.length > 1 ? (
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="h-7 text-xs bg-black/20 border-white/10 mt-1">
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                    {guest.eventGuests.map((eg: any) => (
                      <SelectItem key={eg.eventId} value={eg.eventId}>
                        {eg.event?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium text-emerald-400">{selectedEventName}</div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/70 mb-1.5 block">RSVP Status</label>
              <Select value={rsvpStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white w-full h-10">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ATTENDING">Confirmed</SelectItem>
                  <SelectItem value="NOT_ATTENDING">Declined</SelectItem>
                  <SelectItem value="NOT_SURE">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/70 mb-1.5 block">Confirmed Guest Count</label>
                <Input
                  type="number"
                  min="0"
                  max={guest.allowedGuestCount}
                  value={confirmedCount}
                  onChange={(e) => setConfirmedCount(parseInt(e.target.value) || 0)}
                  disabled={rsvpStatus === "NOT_ATTENDING"}
                  className="bg-black/20 border-white/10 h-10"
                />
              </div>
              <div>
                <label className="text-xs text-white/70 mb-1.5 block">Liquor Count</label>
                <Input
                  type="number"
                  min="0"
                  max={confirmedCount}
                  value={liquorCount}
                  onChange={(e) => setLiquorCount(parseInt(e.target.value) || 0)}
                  disabled={rsvpStatus === "NOT_ATTENDING"}
                  className="bg-black/20 border-white/10 h-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Response Source</label>
              <Select value={responseSource} onValueChange={setResponseSource}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white w-full h-10">
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2333] border-white/10 text-white">
                  <SelectItem value="Admin Update">Admin Update</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Phone Call">Phone Call</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="In Person">In Person</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-white/70 mb-1.5 block">Internal Note (Optional)</label>
              <textarea 
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="e.g. Confirmed by phone"
                className="bg-black/20 border-white/10 resize-none h-20 w-full rounded-md border px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 leading-tight">{error}</p>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#d7b56d] hover:bg-[#c4a25e] text-[#10233b] font-medium"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save RSVP
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
