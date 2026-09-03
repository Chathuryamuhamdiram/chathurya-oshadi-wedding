"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  name?: string;
  defaultValue?: string | null;
  className?: string;
}

export function TimePicker({ name, defaultValue, className }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  
  // The value kept in the hidden input for formData (HH:mm in 24h format)
  const [value, setValue] = useState<string>(defaultValue || "");
  
  // Temporary state for the popover selections
  const [tempHour, setTempHour] = useState<string>("12");
  const [tempMinute, setTempMinute] = useState<string>("00");
  const [tempAmPm, setTempAmPm] = useState<"AM" | "PM">("AM");

  // Format a 24h "HH:mm" string into a readable "hh:mm A" format
  const formatDisplayValue = (time24: string) => {
    if (!time24) return "Select Time";
    const [h, m] = time24.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const hourStr = hour.toString().padStart(2, "0");
    return `${hourStr}:${m} ${ampm}`;
  };

  // Sync temp state when opening
  useEffect(() => {
    if (open && value) {
      const [h, m] = value.split(":");
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12 || 12;
      
      setTempHour(hour.toString().padStart(2, "0"));
      setTempMinute(m);
      setTempAmPm(ampm);
    } else if (open && !value) {
      setTempHour("12");
      setTempMinute("00");
      setTempAmPm("AM");
    }
  }, [open, value]);

  // Keep value in sync if defaultValue prop changes (like when switching edited events)
  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue || "");
    }
  }, [defaultValue]);

  const handleApply = () => {
    let h = parseInt(tempHour, 10);
    if (tempAmPm === "PM" && h !== 12) h += 12;
    if (tempAmPm === "AM" && h === 12) h = 0;
    
    const hStr = h.toString().padStart(2, "0");
    const mStr = tempMinute.padStart(2, "0");
    
    setValue(`${hStr}:${mStr}`);
    setOpen(false);
  };

  const handlePreset = (time24: string) => {
    setValue(time24);
    setOpen(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
  // Make sure current tempMinute is in the list (e.g. if default was 08:53)
  if (!minutes.includes(tempMinute) && tempMinute !== "") {
    minutes.push(tempMinute);
    minutes.sort((a, b) => parseInt(a) - parseInt(b));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverTrigger
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50 hover:bg-white/10 transition-colors",
          !value && "text-white/40",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white/50" />
          <span>{formatDisplayValue(value)}</span>
        </div>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 bg-[#111827] border-white/10 rounded-2xl shadow-2xl" align="start">
        <div className="flex flex-col gap-4">
          <div className="text-center font-serif text-sm text-white/70 tracking-widest uppercase">
            Select Time
          </div>

          {/* Time Scrollers */}
          <div className="flex items-center justify-center gap-2">
            {/* Hour */}
            <div className="flex flex-col gap-1 w-16 h-32 overflow-y-auto custom-scrollbar bg-black/20 rounded-xl p-1 border border-white/5 snap-y">
              {hours.map(h => (
                <button
                  key={`h-${h}`}
                  type="button"
                  onClick={() => setTempHour(h)}
                  className={cn(
                    "flex-shrink-0 h-8 rounded-lg text-sm transition-colors snap-center",
                    tempHour === h ? "bg-purple-500 text-white font-medium" : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>

            <span className="text-white/50 font-bold">:</span>

            {/* Minute */}
            <div className="flex flex-col gap-1 w-16 h-32 overflow-y-auto custom-scrollbar bg-black/20 rounded-xl p-1 border border-white/5 snap-y">
              {minutes.map(m => (
                <button
                  key={`m-${m}`}
                  type="button"
                  onClick={() => setTempMinute(m)}
                  className={cn(
                    "flex-shrink-0 h-8 rounded-lg text-sm transition-colors snap-center",
                    tempMinute === m ? "bg-purple-500 text-white font-medium" : "text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="flex flex-col gap-2 ml-2">
              <button
                type="button"
                onClick={() => setTempAmPm("AM")}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                  tempAmPm === "AM" ? "bg-purple-500 text-white" : "bg-black/20 text-white/50 border border-white/5 hover:bg-white/10"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setTempAmPm("PM")}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                  tempAmPm === "PM" ? "bg-purple-500 text-white" : "bg-black/20 text-white/50 border border-white/5 hover:bg-white/10"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] text-white/40 uppercase mb-2">Quick Select</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "08:00 AM", val: "08:00" },
                { label: "09:00 AM", val: "09:00" },
                { label: "10:30 AM", val: "10:30" },
                { label: "12:00 PM", val: "12:00" },
                { label: "04:00 PM", val: "16:00" },
                { label: "06:30 PM", val: "18:30" },
              ].map(preset => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => handlePreset(preset.val)}
                  className="text-xs py-1.5 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2 text-xs font-medium text-white bg-purple-500 hover:bg-purple-400 rounded-lg shadow-lg shadow-purple-500/20 transition-colors"
            >
              APPLY
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
