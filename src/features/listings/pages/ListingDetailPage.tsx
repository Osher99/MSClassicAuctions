import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useListingDetailPage } from "../hooks/useListingDetailPage";
import { useListingLike } from "../hooks/useListingLike";
import { useStartChat } from "@/features/chat";
import { useAuth } from "@/features/auth";
import {
  Button,
  Spinner,
  Card,
  Badge,
  PriceTag,
  ProfileBadge,
  EmptyState,
} from "@/components/ui";
import { getItemRequirementLabel } from "../utils/itemDisplay";
import toast from "react-hot-toast";

const statLabels: Record<string, string> = {
  str: "STR",
  dex: "DEX",
  int: "INT",
  luk: "LUK",
  wepAtt: "Weapon ATT",
  wepMagicAtt: "Weapon Magic ATT",
  wepDef: "Weapon DEF",
  wepMDef: "Weapon M.DEF",
  hp: "HP",
  mp: "MP",
  acc: "Accuracy",
  avoid: "Avoidability",
  availableSlots: "Available Slots",
};

export const ListingDetailPage = () => {
  const { listing, isLoading, isOwner, activeStats, handleDelete, isDeleting } =
    useListingDetailPage();
  const [showImageModal, setShowImageModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startChat, loading: chatLoading } = useStartChat();
  const { liked, likeCount, toggle } = useListingLike(listing?.id ?? "");
  const isOwnerListing = user && listing && user.uid === listing.userId;

  const handleContactSeller = useCallback(async () => {
    if (!listing) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (!listing.userId || listing.userId === user.uid) {
      toast.error("Unable to start chat for this listing");
      return;
    }

    try {
      const conversationId = await startChat(listing.userId, {
        id: listing.id,
        itemName: listing.itemName,
        itemIconUrl: listing.itemIconUrl,
        price: listing.price,
        server: listing.server,
      });
      if (conversationId) {
        navigate(`/chats/${conversationId}`);
      }
    } catch {
      toast.error("Could not open chat right now. Please try again.");
    }
  }, [listing, user, startChat, navigate]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowImageModal(false);
      }
    };
    if (showImageModal) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showImageModal]);

  if (isLoading) return <Spinner />;

  if (!listing) {
    return (
      <EmptyState
        icon="❓"
        title="Listing not found"
        subtitle="This listing may have been removed."
        action={
          <Link
            to="/"
            className="inline-block mt-4 text-maple-orange hover:text-maple-gold"
          >
            ← Back to marketplace
          </Link>
        }
      />
    );
  }

  const requirementLabel = getItemRequirementLabel({
    name: listing.itemName,
    requiredLevel: listing.requiredLevel,
    overallCategory: listing.overallCategory,
    category: listing.category,
    subCategory: listing.subCategory,
    scrollSuccessRate: listing.scrollSuccessRate,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
        className="text-slate-300 hover:text-maple-orange transition-colors text-sm mb-6 inline-block bg-maple-dark/80 backdrop-blur-sm px-3 py-1.5 rounded-lg"
      >
        ← Back to marketplace
      </Link>

      <Card padding="none">
        {/* Item Header */}
        <div className="p-6 md:p-8 border-b border-maple-border space-y-4">
          <div className="flex items-start gap-5">
            <img
              src={listing.itemIconUrl}
              alt={listing.itemName}
              className="w-20 h-20 object-contain flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {listing.itemName}
              </h1>
              <PriceTag amount={listing.price} size="lg" />
              {listing.amount != null && listing.amount > 1 && (
                <span className="text-sm text-slate-300 font-medium mt-1">
                  Quantity: <span className="text-maple-gold font-bold">x{listing.amount}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="blue">{listing.server}</Badge>
            <span className="text-xs px-2 py-0.5 rounded-full bg-maple-orange/20 text-maple-orange">
              {listing.overallCategory}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
              {listing.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
              {listing.subCategory}
            </span>
            {requirementLabel && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                {requirementLabel}
              </span>
            )}
            {listing.overallCategory === "Equip" && (
              <Badge variant={listing.condition === "scrolled" ? "purple" : "green"}>
                {listing.condition === "scrolled" ? "✨ Scrolled" : "🧼 Clean"}
              </Badge>
            )}
            {listing.isInStore && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                LIVE
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {listing.listingImageUrl && (
            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-3">🖼️ Seller Screenshot</h2>
              <div 
                onClick={() => setShowImageModal(true)}
                className="overflow-hidden rounded-2xl border border-maple-border bg-slate-900/70 cursor-pointer hover:border-maple-orange transition-colors group"
              >
                <img
                  src={listing.listingImageUrl}
                  alt={`${listing.itemName} screenshot`}
                  className="w-full object-contain group-hover:opacity-80 transition-opacity"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">✨ Click to enlarge</p>
            </div>
          )}

          {/* Store Info */}
          {listing.isInStore && (
            <div className="bg-slate-800/50 border border-maple-border rounded-lg p-4">
              <h2 className="text-sm font-semibold text-maple-orange mb-2">🏪 In Store Now</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {listing.storeChannel && (
                  <div>
                    <span className="text-slate-400">Channel</span>
                    <p className="text-white font-medium">{listing.storeChannel}</p>
                  </div>
                )}
                {listing.fmRoom && (
                  <div>
                    <span className="text-slate-400">FM Room</span>
                    <p className="text-white font-medium">{listing.fmRoom}</p>
                  </div>
                )}
                {listing.sellerIgn && (
                  <div>
                    <span className="text-slate-400">Seller IGN</span>
                    <p className="text-white font-medium">{listing.sellerIgn}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          {listing.overallCategory === "Equip" && listing.stats && (activeStats.length > 0 || listing.stats.availableSlots >= 0) && (
            <div>
              <h2 className="text-lg font-semibold text-slate-200 mb-3">⚔️ Item Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {activeStats.map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 border border-maple-border/50"
                  >
                    <span className="text-slate-400 text-sm">{statLabels[key] ?? key}</span>
                    <span className="text-green-400 font-semibold text-sm">+{val}</span>
                  </div>
                ))}
                {listing.stats.availableSlots >= 0 && (
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 border border-maple-border/50">
                    <span className="text-slate-400 text-sm">Available Slots</span>
                    <span className="text-yellow-400 font-semibold text-sm">{listing.stats.availableSlots}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="border-t border-maple-border pt-6">
              <h2 className="text-lg font-semibold text-slate-200 mb-3">
                Description
              </h2>
              <p className="text-slate-400 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          {/* Seller */}
          {listing.createdAt && (
            <div className="mt-6">
              <ProfileBadge
                email={listing.userEmail}
                username={listing.username}
                avatarUrl={listing.userAvatarUrl}
                subtitle={`Listed on ${listing.createdAt.toDate().toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}`}
                size="md"
              />
            </div>
          )}
          {/* Share */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 mb-2">📤 Share this listing</h2>
          <div className="flex gap-1">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${listing.itemName} - ${listing.price.toLocaleString()} Mesos on ${listing.server}\n${window.location.href}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
            <button
              onClick={toggle}
              disabled={isOwnerListing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-sm font-medium group/heart ${isOwnerListing ? "opacity-40 cursor-not-allowed" : ""}`}
              aria-label={isOwnerListing ? "Cannot like your own listing" : liked ? "Unlike" : "Like"}
              title={isOwnerListing ? "You cannot like your own listing" : ""}
            >
              <svg
                className={`w-4 h-4 transition-all duration-200 ${liked ? "text-red-500 scale-110" : "text-red-400 group-hover/heart:text-red-300"}`}
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                />
              </svg>
              {likeCount > 0 && likeCount}
            </button>
          </div>
          </div>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-3 mt-6 pt-6 border-t border-maple-border">
              <Link to={`/listings/${listing.id}/edit`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  ✏️ Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
                className="flex-1"
              >
                🗑️ Delete
              </Button>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-maple-border">
              <Button onClick={handleContactSeller} loading={chatLoading} className="w-full sm:w-auto">
                💬 Contact Seller
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Image Lightbox Modal */}
      {showImageModal && listing.listingImageUrl && (
        <div 
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 group"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <img
              src={listing.listingImageUrl}
              alt={`${listing.itemName} screenshot - enlarged`}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-maple-dark/80 hover:bg-maple-orange text-white p-3 rounded-full transition-colors"
              aria-label="Close image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="absolute bottom-4 left-0 right-0 text-center text-slate-300 text-sm">
              Click outside or press ESC to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
