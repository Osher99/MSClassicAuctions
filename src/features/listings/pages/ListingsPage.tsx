import { useListingsPage } from "../hooks/useListingsPage";
import { ListingGrid } from "../components/ListingGrid";
import { MAPLE_SERVERS } from "../constants";
import { Spinner, Input, Select, PageHeader, Button } from "@/components/ui";

const serverOptions = MAPLE_SERVERS.map((s) => ({ value: s, label: s }));

export const ListingsPage = () => {
  const {
    isLoading,
    search,
    setSearch,
    serverFilter,
    setServerFilter,
    paginated,
    filtered,
    currentPage,
    totalPages,
    setPage,
  } = useListingsPage();

  return (
    <div>
      <PageHeader
        icon={<img src="/assets/maple-icon.png" alt="" className="w-8 h-8" />}
        title="Marketplace"
        subtitle="Browse MapleStory Classic items for sale"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={serverFilter}
          onChange={(e) => setServerFilter(e.target.value)}
          options={serverOptions}
          placeholder="All Servers"
        />
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
