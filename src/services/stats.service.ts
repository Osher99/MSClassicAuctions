import { getFunctionsURL } from "./functions";

export interface MarketplaceStats {
  users: number;
  activeListings: number;
  totalListings: number;
}

export const getMarketplaceStats = async (): Promise<MarketplaceStats> => {
  const res = await fetch(getFunctionsURL("getMarketplaceStats"));
  if (!res.ok) throw new Error("Failed to load marketplace stats");
  return res.json();
};
