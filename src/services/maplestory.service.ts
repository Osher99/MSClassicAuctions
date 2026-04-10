import type { MapleItemResult } from "@/types";

const BASE_URL = "https://maplestory.io/api/GMS";

export const searchItems = async (query: string): Promise<MapleItemResult[]> => {
  const res = await fetch(
    `${BASE_URL}/62/item?searchFor=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to search items");
  return res.json();
};

export const getItemIconUrl = (itemId: number): string =>
  `${BASE_URL}/83/item/${itemId}/icon`;
