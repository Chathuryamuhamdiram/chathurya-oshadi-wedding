export interface GiftMoneyEvent {
  id: string;
  name: string;
  eventType: "WEDDING" | "HOMECOMING" | string;
}

export interface GiftMoneyItem {
  id: string;
  eventId: string;
  name: string;
  amount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdById?: string | null;
  event: GiftMoneyEvent;
}

export type EventFilterType = "ALL" | "WEDDING" | "HOMECOMING";

export type SortOrderType = "RECENT" | "NAME_ASC" | "AMOUNT_DESC" | "AMOUNT_ASC";
