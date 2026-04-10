import { Link } from "react-router-dom";
import { useMyListingsPage, formatExpiry } from "../hooks/useMyListingsPage";
import { ListingGrid } from "../components/ListingGrid";
import {
  Button,
  Spinner,
  Card,
  Badge,
  PageHeader,
  EmptyState,
} from "@/components/ui";
import { MAX_ACTIVE_LISTINGS } from "@/services";

export const MyListingsPage = () => {
  const {
    listings,
    isLoading,
    active,
    expired,
    handleDelete,
    handleReactivate,
    isDeleting,
    isReactivating,
  } = useMyListingsPage();

  return (
    <div>
      <PageHeader
        title="📋 My Listings"
        subtitle={`Manage your marketplace listings (${active.length}/${MAX_ACTIVE_LISTINGS} active)`}
        action={
          <Link to="/listings/new">
            <Button>+ New Listing</Button>
          </Link>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : !listings || listings.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No listings yet"
          subtitle="Create your first listing to start selling!"
          action={
            <Link to="/listings/new">
              <Button>Create Your First Listing</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Active Listings */}
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">🟢 Active Listings</h2>
              <div className="space-y-3">
                {active.map((listing) => (
                  <Card
                    key={listing.id}
                    padding="none"
                    className="p-4 !rounded-lg space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={listing.itemIconUrl} alt={listing.itemName} className="w-10 h-10 object-contain flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{listing.itemName}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge variant="blue" size="sm">{listing.server}</Badge>
                          <span className="text-sm text-slate-400">{listing.price.toLocaleString()} Mesos</span>
                          {listing.expiresAt && (
                            <span className="text-green-400 text-xs">⏱ {formatExpiry(listing.expiresAt)}</span>
                          )}
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <Link to={`/listings/${listing.id}/edit`}>
                          <Button variant="secondary" size="sm" className="px-6">Edit</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(listing.id)}
                          loading={isDeleting}
                          className="px-6"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:hidden">
                      <Link to={`/listings/${listing.id}/edit`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full">Edit</Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(listing.id)}
                        loading={isDeleting}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Expired Listings */}
          {expired.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">🔴 Expired Listings</h2>
              <div className="space-y-3">
                {expired.map((listing) => (
                  <Card
                    key={listing.id}
                    padding="none"
                    className="p-4 !rounded-lg opacity-70 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img src={listing.itemIconUrl} alt={listing.itemName} className="w-10 h-10 object-contain grayscale flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{listing.itemName}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <Badge variant="orange" size="sm">Expired</Badge>
                          <span className="text-sm text-slate-400">{listing.price.toLocaleString()} Mesos</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleReactivate(listing.id)}
                          loading={isReactivating}
                          className="px-6"
                        >
                          🔄 Reactivate
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(listing.id)}
                          loading={isDeleting}
                          className="px-6"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:hidden">
                      <Button
                        size="sm"
                        onClick={() => handleReactivate(listing.id)}
                        loading={isReactivating}
                        className="flex-1"
                      >
                        🔄 Reactivate
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(listing.id)}
                        loading={isDeleting}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Active grid preview */}
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Preview (as seen by buyers)</h2>
              <ListingGrid listings={active} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
