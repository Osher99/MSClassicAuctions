import { useWishlist, MAX_WISHLIST_ITEMS } from "../hooks/useWishlist";
import { useSearchDropdown } from "@/features/listings";
import { getItemIconUrl, searchItems } from "@/services";
import { PageHeader, Card, Spinner, EmptyState, PriceTag, Button, TruncatedText } from "@/components/ui";
import type { MapleItemResult } from "@/types";
import { Link } from "react-router-dom";

export const WishlistPage = () => {
  const { items, loadingItems, saving, matchingListings, isFull, addItem, removeItem } =
    useWishlist();
  const { query, setQuery, results, isOpen, wrapperRef, reset } =
    useSearchDropdown<MapleItemResult>(searchItems);

  const handleAdd = (item: MapleItemResult) => {
    addItem(item);
    reset();
  };

  const wishlistedIds = new Set(items.map((i) => i.id));

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        icon="⭐"
        title="Wishlist"
        subtitle={`Get notified when items you want go up for sale (up to ${MAX_WISHLIST_ITEMS})`}
      />

      {matchingListings.length > 0 && (
        <div className="mb-6 space-y-2">
          <h2 className="text-sm font-semibold text-green-400">
            🎉 Available now!
          </h2>
          {matchingListings.map((listing) => (
            <Link key={listing.id} to={`/listings/${listing.id}`}>
              <Card padding="sm" className="border-green-500/40 hover:border-green-500 transition-colors flex items-center gap-3">
                <img src={listing.itemIconUrl} alt={listing.itemName} className="w-10 h-10 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <TruncatedText as="p" text={listing.itemName} className="text-white font-medium" />
                  <PriceTag amount={listing.price} size="sm" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card padding="sm" className="mb-6">
        <div ref={wrapperRef} className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Add an item to your wishlist
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isFull}
            placeholder={isFull ? `Wishlist full (${MAX_WISHLIST_ITEMS}/${MAX_WISHLIST_ITEMS})` : "Type at least 2 characters to search..."}
            className="w-full px-4 py-2.5 bg-slate-800 border border-maple-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-maple-orange/50 focus:border-maple-orange transition-all disabled:opacity-50"
          />

          {isOpen && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 max-h-72 overflow-y-auto bg-slate-800 border border-maple-border rounded-lg shadow-xl">
              {results.map((item) => {
                const already = wishlistedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={already}
                    onClick={() => handleAdd(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <img src={getItemIconUrl(item.id)} alt={item.name} className="w-8 h-8 object-contain flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <TruncatedText as="p" text={item.name} className="text-white text-sm font-medium" />
                      <TruncatedText
                        as="p"
                        text={`${item.typeInfo.category} · ${item.typeInfo.subCategory}${already ? " · Already wishlisted" : ""}`}
                        className="text-slate-400 text-xs"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {loadingItems ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon="⭐" title="Your wishlist is empty" subtitle="Search for an item above to get started" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} padding="sm" className="flex items-center gap-3">
              <img src={getItemIconUrl(item.id)} alt={item.name} className="w-10 h-10 object-contain flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <TruncatedText as="p" text={item.name} className="text-white font-medium" />
                <TruncatedText
                  as="p"
                  text={`${item.typeInfo.category} · ${item.typeInfo.subCategory}`}
                  className="text-slate-400 text-xs"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => removeItem(item.id)}
                disabled={saving}
              >
                ✕ Remove
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
