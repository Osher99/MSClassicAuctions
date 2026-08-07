import { useState, useMemo, useEffect } from "react";
import { useListings } from "./useListings";
import {
  THROWING_WEAPON_SUB_CATEGORY,
  SCROLL_SUB_CATEGORY,
  getItemCategoryIndex,
  type ItemCategoryInfo,
} from "@/services/itemsData.service";
import type { Listing } from "@/types";

const ITEMS_PER_PAGE = 20;

export type SortOption =
  | "recent"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
];

// Equipment sub-categories as they appear in the item catalog (see
// equip_slot/sub_category breakdown in items.json).
const EQUIP_SUBTYPES = [
  "Hat", "Cape", "Top", "Glove",
  "Overall", "Bottom", "Shield", "Shoes", "Earring",
] as const;

// Real weapon_type values present in the catalog (equipment_meta lists a
// couple more, e.g. "Knuckle"/"Cash Weapon", that no current item uses —
// left out so the filter list doesn't show dead checkboxes), in the
// source's own canonical order.
const WEAPON_TYPES = [
  "1H Sword", "Dagger", "1H Axe", "1H Blunt Weapon",
  "2H Sword", "2H Axe", "2H Blunt Weapon", "Spear", "Polearm",
  "Wand", "Staff", "Bow", "Crossbow", "Claw",
] as const;

export type CategoryFilterKey =
  | "equip-all"
  | "equip-Weapon"
  | `equip-Weapon:${(typeof WEAPON_TYPES)[number]}`
  | `equip-${(typeof EQUIP_SUBTYPES)[number]}`
  | "use-scroll"
  | "use-throwing"
  | "etc";

export interface CategoryFilterOption {
  value: CategoryFilterKey;
  label: string;
  children?: CategoryFilterOption[];
}

export const CATEGORY_FILTER_GROUPS: { label: string; options: CategoryFilterOption[] }[] = [
  {
    label: "⚔️ Equip",
    options: [
      { value: "equip-all", label: "All Equip" },
      {
        value: "equip-Weapon",
        label: "Weapon",
        children: WEAPON_TYPES.map((weaponType) => ({
          value: `equip-Weapon:${weaponType}` as CategoryFilterKey,
          label: weaponType,
        })),
      },
      ...EQUIP_SUBTYPES.map((subtype) => ({
        value: `equip-${subtype}` as CategoryFilterKey,
        label: subtype,
      })),
    ],
  },
  {
    label: "🧪 Use",
    options: [
      { value: "use-scroll", label: "Scrolls" },
      { value: "use-throwing", label: "Throwing Stars" },
    ],
  },
  {
    label: "📦 Etc",
    options: [{ value: "etc", label: "Etc" }],
  },
];

const EQUIP_SUBTYPE_SET: ReadonlySet<string> = new Set(EQUIP_SUBTYPES);

/**
 * Category filtering uses the item catalog's CURRENT classification for a
 * listing's itemId (when available) rather than the listing's own stored
 * overallCategory/subCategory snapshot — those go stale whenever the
 * catalog's classification changes or the data source itself changes, so
 * matching against the live catalog lets old listings "self-heal" without
 * a data migration. Falls back to the listing's stored fields if the
 * itemId isn't found (e.g. a custom item this private server added, which
 * was never in the public catalog to begin with).
 */
const matchesCategoryFilter = (
  listing: Listing,
  key: CategoryFilterKey,
  categoryIndex: Map<number, ItemCategoryInfo> | null
): boolean => {
  const info = categoryIndex?.get(listing.itemId);
  const overallCategory = info?.overallCategory ?? listing.overallCategory;
  let subCategory = info?.subCategory ?? listing.subCategory;
  let weaponType = info?.weaponType;

  // No catalog entry at all (e.g. a private-server-only item) — the old
  // data model stored the weapon type itself as subCategory (e.g.
  // subCategory: "Claw"), rather than "Weapon" + a separate weapon type.
  // If it's an Equip item whose subCategory isn't one of the known
  // non-weapon slots, treat that stored value as its weapon type.
  if (!info && overallCategory === "Equip" && !EQUIP_SUBTYPE_SET.has(subCategory)) {
    weaponType = subCategory;
    subCategory = "Weapon";
  }

  if (key === "equip-all") return overallCategory === "Equip";
  if (key.startsWith("equip-Weapon:")) {
    return overallCategory === "Equip" && subCategory === "Weapon" && weaponType === key.slice(13);
  }
  if (key.startsWith("equip-")) return overallCategory === "Equip" && subCategory === key.slice(6);
  if (key === "use-scroll") return overallCategory === "Use" && subCategory === SCROLL_SUB_CATEGORY;
  if (key === "use-throwing") return overallCategory === "Use" && subCategory === THROWING_WEAPON_SUB_CATEGORY;
  return overallCategory === "Etc";
};

const sortListings = (listings: Listing[], sort: SortOption): Listing[] => {
  const sorted = [...listings];
  switch (sort) {
    case "recent":
      return sorted.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
    case "oldest":
      return sorted.sort((a, b) => (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0));
    case "name-asc":
      return sorted.sort((a, b) => a.itemName.localeCompare(b.itemName));
    case "name-desc":
      return sorted.sort((a, b) => b.itemName.localeCompare(a.itemName));
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
};

export const useListingsPage = () => {
  const { data: listings, isLoading } = useListings();
  const [search, setSearch] = useState("");
  const [serverFilter, setServerFilter] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<Set<CategoryFilterKey>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);
  const [categoryIndex, setCategoryIndex] = useState<Map<number, ItemCategoryInfo> | null>(null);

  useEffect(() => {
    getItemCategoryIndex().then(setCategoryIndex).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const base =
      listings?.filter((listing) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          listing.itemName.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q);
        const matchesServer = !serverFilter || listing.server === serverFilter;
        const matchesCategory =
          categoryFilters.size === 0 ||
          [...categoryFilters].some((key) => matchesCategoryFilter(listing, key, categoryIndex));
        return matchesSearch && matchesServer && matchesCategory;
      }) ?? [];
    return sortListings(base, sortBy);
  }, [listings, search, serverFilter, categoryFilters, sortBy, categoryIndex]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const setSearchAndReset = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const setServerFilterAndReset = (value: string) => {
    setServerFilter(value);
    setPage(1);
  };

  const toggleCategoryFilter = (key: CategoryFilterKey) => {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setPage(1);
  };

  const setSortAndReset = (value: SortOption) => {
    setSortBy(value);
    setPage(1);
  };

  return {
    isLoading,
    search,
    setSearch: setSearchAndReset,
    serverFilter,
    setServerFilter: setServerFilterAndReset,
    categoryFilters,
    toggleCategoryFilter,
    sortBy,
    setSortBy: setSortAndReset,
    paginated,
    filtered,
    currentPage,
    totalPages,
    setPage,
  };
}
