"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignGuestToTable } from "./actions";

export function AssignTableSelect({ guestId, currentTableId, tables }: { guestId: string, currentTableId: string | null, tables: any[] }) {
  const [isPending, startTransition] = useTransition();

  function onTableChange(value: string | null) {
    startTransition(async () => {
      await assignGuestToTable(guestId, value === "none" ? null : value);
    });
  }

  return (
    <Select defaultValue={currentTableId || "none"} onValueChange={onTableChange} disabled={isPending}>
      <SelectTrigger className="bg-white/5 border-white/10 focus:border-indigo-500/50 rounded-lg h-8 text-xs w-[130px]">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent className="bg-[#1e2333] border-white/10 text-white text-xs">
        <SelectItem value="none">Unassigned</SelectItem>
        {tables.map(t => (
          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
