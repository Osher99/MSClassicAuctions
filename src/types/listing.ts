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
  server: string;

  // Store info
  isInStore: boolean;
  storeChannel?: number;
  fmRoom?: number;
  sellerIgn?: string;
  listingImageUrl?: string;
  listingImagePath?: string;

  // Condition & stats
  condition: "clean" | "scrolled";
  stats: ItemStats;

  // Engagement
  likeCount: number;

  // System
  userId: string;
  userEmail: string;
  username: string;
  userAvatarUrl: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
}

export type ListingFormData = Omit<Listing, "id" | "likeCount" | "userId" | "userEmail" | "username" | "userAvatarUrl" | "createdAt" | "expiresAt" | "isActive">;
