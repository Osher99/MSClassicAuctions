import { useState, useMemo } from "react";
import { useListings } from "./useListings";

const ITEMS_PER_PAGE = 20;

export type SortOption =
  | "recent"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "category";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "category", label: "Category (Equip / Use / Etc)" },
];

const sortListings = (listings: ReturnType<typeof useListings>["data"], sort: SortOption) => {
  if (!listings) return [];
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
    case "category":
      return sorted.sort((a, b) => a.overallCategory.localeCompare(b.overallCategory) || a.itemName.localeCompare(b.itemName));
    default:
      return sorted;
  }
};

export const useListingsPage = () => {
  const { data: listings, isLoading } = useListings();
  const [search, setSearch] = useState("");
  const [serverFilter, setServerFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const base =
      listings?.filter((listing) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          listing.itemName.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q);
        const matchesServer = !serverFilter || listing.server === serverFilter;
        return matchesSearch && matchesServer;
      }) ?? [];
    return sortListings(base, sortBy);
  }, [listings, search, serverFilter, sortBy]);

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
    sortBy,
    setSortBy: setSortAndReset,
    paginated,
    filtered,
    currentPage,
    totalPages,
    setPage,
  };
}
