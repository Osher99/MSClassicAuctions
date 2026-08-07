import type { MapleItemResult } from "@/types";

const DATA_BASE_URL = "https://osmsdataexplorer.com/data/current";

interface RawItem {
  id: number;
  name: string;
  category: "Equipment" | "Consumable" | "Etc" | "Setup";
  sub_category: string;
  description?: string;
  stats?: { reqLevel?: number; unitPrice?: number };
  /** e.g. "1H Sword", "Claw" — present when sub_category is "Weapon" */
  weapon_type?: string;
}

// The source flattens all consumables to sub_category "Consume" — throwing
// stars/knives/snowballs etc. are only distinguishable by having a
// per-unit price (they're sold/used as stacked ammo). Re-tag them so the
// marketplace can filter "Throwing Stars" separately from potions/elixirs.
export const THROWING_WEAPON_SUB_CATEGORY = "Throwing Star";
export const SCROLL_SUB_CATEGORY = "Scroll";

interface RawScroll {
  id: number;
  name: string;
  description: string;
}

interface ItemsPayload {
  items: RawItem[];
  scrolls: RawScroll[];
}

const OVERALL_CATEGORY_MAP: Record<RawItem["category"], string> = {
  Equipment: "Equip",
  Consumable: "Use",
  Etc: "Etc",
  Setup: "Etc",
};

let cache: Promise<MapleItemResult[]> | null = null;

const toResultFromItem = (item: RawItem): MapleItemResult => {
  const isThrowingWeapon = item.category === "Consumable" && item.stats?.unitPrice != null;

  return {
    id: item.id,
    name: item.name,
    desc: item.description ?? "",
    requiredJobs: [],
    requiredLevel: item.stats?.reqLevel ?? 0,
    isCash: false,
    requiredGender: 2,
    typeInfo: {
      overallCategory: OVERALL_CATEGORY_MAP[item.category],
      category: item.category,
      subCategory: isThrowingWeapon ? THROWING_WEAPON_SUB_CATEGORY : item.sub_category,
      lowItemId: item.id,
      highItemId: item.id,
      weaponType: item.weapon_type,
    },
  };
};

const toResultFromScroll = (scroll: RawScroll): MapleItemResult => ({
  id: scroll.id,
  name: scroll.name,
  desc: scroll.description,
  requiredJobs: [],
  requiredLevel: 0,
  isCash: false,
  requiredGender: 2,
  typeInfo: {
    overallCategory: "Use",
    category: "Consumable",
    subCategory: SCROLL_SUB_CATEGORY,
    lowItemId: scroll.id,
    highItemId: scroll.id,
  },
});

const loadAllItems = (): Promise<MapleItemResult[]> => {
  if (!cache) {
    cache = fetch(`${DATA_BASE_URL}/items.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item data");
        return res.json() as Promise<ItemsPayload>;
      })
      .then((data) => [
        ...data.items.map(toResultFromItem),
        ...data.scrolls.map(toResultFromScroll),
      ])
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
};

// Warm the cache as soon as this module loads (e.g. when the listing form
// mounts) so the fetch is already resolving before the user finishes typing.
void loadAllItems().catch(() => {});

export const searchItems = async (query: string): Promise<MapleItemResult[]> => {
  const all = await loadAllItems();
  const q = query.toLowerCase();
  return all.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 50);
};

export const getItemIconUrl = (itemId: number): string =>
  `${DATA_BASE_URL}/images/items/${String(itemId).padStart(8, "0")}.png`;

export const getItemById = async (itemId: number): Promise<MapleItemResult | undefined> => {
  const all = await loadAllItems();
  return all.find((item) => item.id === itemId);
};

export interface ItemCategoryInfo {
  overallCategory: string;
  subCategory: string;
  weaponType?: string;
}

/**
 * itemId -> current classification, straight from the live catalog.
 *
 * Listings store a snapshot of overallCategory/subCategory at creation
 * time, which goes stale whenever the catalog's classification changes
 * (e.g. re-tagging throwing stars) or the data source itself changes —
 * old listings keep whatever was true when they were created. Category
 * *filtering* should reflect the current, correct classification instead,
 * so it "self-heals" for old listings without a data migration.
 */
export const getItemCategoryIndex = async (): Promise<Map<number, ItemCategoryInfo>> => {
  const all = await loadAllItems();
  const index = new Map<number, ItemCategoryInfo>();
  all.forEach((item) => {
    index.set(item.id, {
      overallCategory: item.typeInfo.overallCategory,
      subCategory: item.typeInfo.subCategory,
      weaponType: item.typeInfo.weaponType,
    });
  });
  return index;
};
