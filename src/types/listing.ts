import { Timestamp } from "firebase/firestore";

export interface MapleItemResult {
  id: number;
  name: string;
  desc: string;
  requiredJobs: string[];
  requiredLevel: number;
  isCash: boolean;
  requiredGender: number;
  typeInfo: {
    overallCategory: string;
    category: string;
    subCategory: string;
    lowItemId: number;
    highItemId: number;
    /** e.g. "1H Sword", "Claw" — only present when subCategory is "Weapon" */
    weaponType?: string;
  };
}

export interface ItemStats {
  str: number;
  dex: number;
  int: number;
  luk: number;
  wepAtt: number;
  wepMagicAtt: number;
  wepDef: number;
  wepMDef: number;
  hp: number;
  mp: number;
  acc: number;
  avoid: number;
  availableSlots: number;
}

export interface Listing {
  id: string;

  // Item info (from MapleStory API)
  itemId: number;
  itemName: string;
  itemIconUrl: string;
  overallCategory: string;
  category: string;
  subCategory: string;
  requiredLevel: number;
  scrollSuccessRate?: number;
  amount?: number;

  // Listing details
  description: string;
  price: number;
  /** Current best offer the seller has received, kept up to date by them */
  currentOffer?: number;
  server: string;

  // Where to find the seller: Free Market store (isInStore), a specific map,
  // or a private sale (isPrivateSale, no location shown). sellerIgn applies
  // to all three — kept independent of which one is chosen.
  isInStore: boolean;
  isPrivateSale?: boolean;
  storeChannel?: number;
  fmRoom?: number;
  mapId?: number;
  mapName?: string;
  mapRegion?: string;
  mapReturnMapName?: string;
  /** Channel number, when the seller set up a private store on this map */
  mapChannel?: number;
  sellerIgn?: string;
  listingImageUrl?: string;
  listingImagePath?: string;

  // Condition & stats
  condition: "clean" | "scrolled";
  stats: ItemStats;

  // Engagement
  likeCount: number;
  viewCount?: number;

  // System
  userId: string;
  userEmail: string;
  username: string;
  userAvatarUrl: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
}

export type ListingFormData = Omit<Listing, "id" | "likeCount" | "viewCount" | "userId" | "userEmail" | "username" | "userAvatarUrl" | "createdAt" | "expiresAt" | "isActive">;
