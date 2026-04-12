import { useEffect, useMemo, useRef, useState } from "react";
import { useListingsPage } from "../hooks/useListingsPage";
import { SORT_OPTIONS } from "../hooks/useListingsPage";
import { ListingGrid } from "../components/ListingGrid";
import { Spinner, Input, PageHeader, Button } from "@/components/ui";

export const ListingsPage = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const {
    isLoading,
    search,
    setSearch,
    sortBy,
    setSortBy,
    paginated,
    filtered,
    currentPage,
    totalPages,
    setPage,
  } = useListingsPage();

  const selectedSortLabel = useMemo(
    () => SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? "Sort",
    [sortBy]
  );

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div>
      <PageHeader
        icon={<img src="/assets/free-market-logo.png" alt="" className="w-8 h-8" />}
        title="Marketplace"
        subtitle="Browse MapleStory Classic items for sale"
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <Input
            className="pr-11"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/70 transition-colors"
              aria-label="Clear search"
              title="Clear search"
            >
              <svg className="w-4 h-4 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="relative shrink-0" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setSortOpen((prev) => !prev)}
            className="h-[42px] px-3 rounded-lg bg-slate-800 border border-maple-border text-slate-200 hover:text-white hover:border-maple-orange/60 transition-colors text-sm font-medium"
            aria-haspopup="menu"
            aria-expanded={sortOpen}
            title={`Sort: ${selectedSortLabel}`}
          >
            Sort
          </button>

          {sortOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-maple-border bg-maple-card shadow-2xl z-20 p-1.5">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSortBy(option.value);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === option.value
                      ? "bg-maple-orange/20 text-maple-orange"
                      : "text-slate-200 hover:bg-slate-700/70"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <ListingGrid listings={paginated} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </Button>
              <span className="text-slate-400 text-sm">
                Page {currentPage} of {totalPages}
                <span className="text-slate-500 ml-2">
                  ({filtered.length} items)
                </span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
