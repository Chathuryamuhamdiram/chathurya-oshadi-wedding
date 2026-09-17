"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  name?: string;
  defaultValue?: string | null;
  className?: string;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
}

function parseManualTime(input: string): string | null {
  if (!input) return null;
  const normalized = input.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);
  
  if (!match) return null;
  
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3];

  if (isNaN(h) || isNaN(m)) return null;
  if (m < 0 || m > 59) return null;
  
  if (ampm) {
    if (h < 1 || h > 12) return null;
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
  } else {
    if (h < 0 || h > 23) return null;
  }

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatDisplayValue(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":");
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const hourStr = hour.toString().padStart(2, "0");
  return `${hourStr}:${m} ${ampm}`;
}

export function TimePicker({ name, defaultValue, className, onChange, required, disabled }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>(defaultValue || "");
  const [inputValue, setInputValue] = useState<string>(formatDisplayValue(defaultValue || ""));
  
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [tempHour, setTempHour] = useState<number>(12);
  const [tempMinute, setTempMinute] = useState<number>(0);
  const [tempAmPm, setTempAmPm] = useState<"AM" | "PM">("AM");

  // Keep value in sync if defaultValue prop changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      setValue(defaultValue || "");
      setInputValue(formatDisplayValue(defaultValue || ""));
    }
  }, [defaultValue]);

  useEffect(() => {
    if (open) {
      setMode("hour");
      if (value) {
        const [h, m] = value.split(":");
        let hour = parseInt(h, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        setTempHour(hour);
        setTempMinute(parseInt(m, 10));
        setTempAmPm(ampm);
      } else {
        setTempHour(12);
        setTempMinute(0);
        setTempAmPm("AM");
      }
    }
  }, [open, value]);

  const handleApply = () => {
    let h = tempHour;
    if (tempAmPm === "PM" && h !== 12) h += 12;
    if (tempAmPm === "AM" && h === 12) h = 0;
    
    const val = `${h.toString().padStart(2, "0")}:${tempMinute.toString().padStart(2, "0")}`;
    setValue(val);
    setInputValue(formatDisplayValue(val));
    onChange?.({ target: { value: val } });
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      setValue("");
      onChange?.({ target: { value: "" } });
      return;
    }
    const parsed = parseManualTime(inputValue);
    if (parsed) {
      setValue(parsed);
      setInputValue(formatDisplayValue(parsed));
      onChange?.({ target: { value: parsed } });
    } else {
      // Revert to last valid value
      setInputValue(formatDisplayValue(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
    }
  };

  // Clock generation
  const renderClock = () => {
    const radius = 95; // px
    const items = mode === "hour" 
      ? Array.from({ length: 12 }, (_, i) => ({ value: i === 0 ? 12 : i, label: (i === 0 ? 12 : i).toString() }))
      : Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: (i * 5).toString().padStart(2, '0') }));
      
    return (
      <div className="relative w-[220px] h-[220px] rounded-full bg-black/20 mx-auto border border-white/5 shadow-inner select-none">
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-purple-500 rounded-full z-20" />
        
        {items.map((item, index) => {
          // 12 is at top (0 deg). In our array: index 0 is 12 for hours, 0 for minutes (top).
          const angle = (index * 30 - 90) * (Math.PI / 180);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const isSelected = mode === "hour" ? tempHour === item.value : tempMinute === item.value;
          
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                if (mode === "hour") {
                  setTempHour(item.value);
                  setTimeout(() => setMode("minute"), 250);
                } else {
                  setTempMinute(item.value);
                }
              }}
              className={cn(
                "absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-sm font-medium transition-all z-10",
                isSelected 
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
            >
              {item.label}
            </button>
          );
        })}
        {/* Hand line */}
        {(() => {
           let selectedIndex = 0;
           if (mode === "hour") {
             selectedIndex = tempHour === 12 ? 0 : tempHour;
           } else {
             // For minutes, we point to the closest 5 minute tick
             selectedIndex = Math.round(tempMinute / 5) % 12;
           }
           const angle = (selectedIndex * 30 - 90) * (Math.PI / 180);
           const length = radius - 15;
           return (
             <div 
               className="absolute top-1/2 left-1/2 h-[2px] bg-purple-500 origin-left transition-transform duration-300 ease-out z-0 pointer-events-none"
               style={{ 
                 width: length,
                 transform: `rotate(${angle}rad)`,
               }}
             />
           )
        })()}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={value} />}
      <div className={cn("relative flex items-center", className)}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="00:00 AM"
          disabled={disabled}
          required={required}
          className={cn(
            "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-3 pr-10 py-2 text-sm text-white",
            "focus:outline-none focus:ring-1 focus:ring-purple-500/50 hover:bg-white/10 transition-colors placeholder:text-white/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <PopoverTrigger 
          disabled={disabled}
          className="absolute right-0 h-11 w-11 flex items-center justify-center rounded-r-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          <Clock className="h-4 w-4" />
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-[320px] p-0 bg-[#111827] border-white/10 rounded-3xl shadow-2xl overflow-hidden" align="start" sideOffset={8}>
        {/* Header */}
        <div className="bg-gradient-to-b from-[#1e2333] to-[#111827] p-6 text-center border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-center gap-1 text-4xl font-light text-white tracking-widest relative z-10">
            <button 
              type="button"
              onClick={() => setMode("hour")}
              className={cn("px-2 py-1 rounded-xl transition-all", mode === "hour" ? "bg-white/10 text-white font-medium shadow-inner" : "text-white/40 hover:text-white/80")}
            >
              {tempHour.toString().padStart(2, "0")}
            </button>
            <span className="text-white/20 mb-1">:</span>
            <button 
              type="button"
              onClick={() => setMode("minute")}
              className={cn("px-2 py-1 rounded-xl transition-all", mode === "minute" ? "bg-white/10 text-white font-medium shadow-inner" : "text-white/40 hover:text-white/80")}
            >
              {tempMinute.toString().padStart(2, "0")}
            </button>
          </div>
          
          <div className="flex justify-center gap-2 mt-5 relative z-10">
            <button
              type="button"
              onClick={() => setTempAmPm("AM")}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all border",
                tempAmPm === "AM" 
                  ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25" 
                  : "bg-black/20 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
              )}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setTempAmPm("PM")}
              className={cn(
                "px-5 py-2 rounded-full text-xs font-bold transition-all border",
                tempAmPm === "PM" 
                  ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/25" 
                  : "bg-black/20 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
              )}
            >
              PM
            </button>
          </div>
        </div>

        {/* Clock Body */}
        <div className="p-6 bg-[#111827]">
          {renderClock()}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-4 bg-[#0d1117] border-t border-white/5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-400 rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            OK
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
