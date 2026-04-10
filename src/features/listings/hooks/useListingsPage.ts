import { useState, useMemo } from "react";
import { useListings } from "./useListings";

const ITEMS_PER_PAGE = 20;

export const useListingsPage = () => {
  const { data: listings, isLoading } = useListings();
  const [search, setSearch] = useState("");
  const [serverFilter, setServerFilter] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return (
      listings?.filter((listing) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          listing.itemName.toLowerCase().includes(q) ||
          listing.description.toLowerCase().includes(q);
        const matchesServer = !serverFilter || listing.server === serverFilter;
        return matchesSearch && matchesServer;
      }) ?? []
    );
  }, [listings, search, serverFilter]);

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

  return {
    isLoading,
    search,
    setSearch: setSearchAndReset,
    serverFilter,
    setServerFilter: setServerFilterAndReset,
    paginated,
    filtered,
    currentPage,
    totalPages,
    setPage,
  };
}
