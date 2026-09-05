"use client";

import { useState, useTransition } from "react";
import { setActiveEvent } from "@/app/admin/actions/eventContext";
import { ChevronDown, Calendar, CheckCircle2 } from "lucide-react";
import { ALL_EVENTS_VALUE } from "@/lib/event-constants";

type CeremonyEventOption = {
  id: string;
  name: string;
  eventType: string;
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  WEDDING: "💍",
  HOMECOMING: "🏠",
  PORUWA: "🪷",
  ENGAGEMENT: "💒",
  PRE_SHOOT: "📷",
  AFTER_PARTY: "🎉",
  OTHER: "📋",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  WEDDING: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  HOMECOMING: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  PORUWA: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  ENGAGEMENT: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  PRE_SHOOT: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  AFTER_PARTY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  OTHER: "text-white/50 bg-white/5 border-white/10",
};

export function EventSelector({
  events,
  activeEventId,
}: {
  events: CeremonyEventOption[];
  activeEventId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isAllEvents = activeEventId === ALL_EVENTS_VALUE;
  const activeEvent = events.find((e) => e.id === activeEventId);

  const activeLabel = isAllEvents
    ? "All Events"
    : activeEvent?.name ?? "Select Event";

  const activeIcon = isAllEvents
    ? "📋"
    : EVENT_TYPE_ICONS[activeEvent?.eventType ?? "OTHER"] ?? "📋";

  const activeColor = isAllEvents
    ? "text-white/70 bg-white/5 border-white/10"
    : EVENT_TYPE_COLORS[activeEvent?.eventType ?? "OTHER"];

  function handleSelect(eventId: string) {
    setOpen(false);
    startTransition(async () => {
      await setActiveEvent(eventId);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${activeColor} hover:opacity-90 disabled:opacity-50`}
        title="Switch active event"
      >
        <span className="text-base leading-none">{activeIcon}</span>
        <span className="hidden sm:inline max-w-[100px] truncate">{activeLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-2 z-50 w-52 bg-[#1e2333] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Active Event
              </p>
            </div>

            {/* All Events option */}
            <button
              onClick={() => handleSelect(ALL_EVENTS_VALUE)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${isAllEvents ? "text-white" : "text-white/60"}`}
            >
              <span className="text-base">📋</span>
              <span className="flex-1">All Events</span>
              {isAllEvents && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>

            <div className="h-px bg-white/5 mx-2" />

            {events.map((event) => {
              const isActive = event.id === activeEventId;
              const icon = EVENT_TYPE_ICONS[event.eventType] ?? "📋";
              const colorClass = EVENT_TYPE_COLORS[event.eventType] ?? "";
              return (
                <button
                  key={event.id}
                  onClick={() => handleSelect(event.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${isActive ? "text-white" : "text-white/60"}`}
                >
                  <span className="text-base">{icon}</span>
                  <span className="flex-1 truncate">{event.name}</span>
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}

            <div className="px-3 py-2 border-t border-white/5">
              <p className="text-[10px] text-white/30">
                Switching changes all module data
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
