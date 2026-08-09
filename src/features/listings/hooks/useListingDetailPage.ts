import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useStartChat } from "@/features/chat";
import { useListing, useDeleteListing, useIncrementListingView } from "./useListings";
import { useListingLike } from "./useListingLike";
import toast from "react-hot-toast";

const VIEWED_LISTINGS_KEY = "viewedListingIds";

const hasViewedThisSession = (id: string): boolean => {
  try {
    const viewed = JSON.parse(sessionStorage.getItem(VIEWED_LISTINGS_KEY) ?? "[]");
    return Array.isArray(viewed) && viewed.includes(id);
  } catch {
    return false;
  }
};

const markViewedThisSession = (id: string): void => {
  try {
    const viewed = JSON.parse(sessionStorage.getItem(VIEWED_LISTINGS_KEY) ?? "[]");
    const next = Array.isArray(viewed) ? viewed : [];
    sessionStorage.setItem(VIEWED_LISTINGS_KEY, JSON.stringify([...next, id]));
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — skip dedup silently
  }
};

export const useListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(id!);
  const deleteMutation = useDeleteListing();
  const { startChat, loading: chatLoading } = useStartChat();
  const { liked, likeCount, toggle: toggleLike } = useListingLike(listing?.id ?? "");

  const [showImageModal, setShowImageModal] = useState(false);
  const [whisperCopied, setWhisperCopied] = useState(false);

  const isOwner = user?.uid === listing?.userId;
  const incrementView = useIncrementListingView();

  // Count a view once auth has resolved, skipping the owner's own visits and
  // deduping repeat visits within the same browser session.
  const viewCountedRef = useRef(false);
  useEffect(() => {
    if (!listing || authLoading || isOwner || viewCountedRef.current) return;
    if (hasViewedThisSession(listing.id)) return;
    viewCountedRef.current = true;
    markViewedThisSession(listing.id);
    incrementView.mutate(listing.id);
  }, [listing, authLoading, isOwner, incrementView.mutate]);

  const handleDelete = useCallback(async () => {
    if (!listing || !window.confirm("Are you sure you want to delete this listing?")) return;
    await deleteMutation.mutateAsync(listing.id);
    navigate("/my-listings");
  }, [listing, deleteMutation, navigate]);

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

  const handleCopyWhisper = useCallback(async () => {
    if (!listing?.sellerIgn) return;
    const command = `/whisper ${listing.sellerIgn} Hey I'm contacting you about ${listing.itemName} you posted at ms-classic-fm`;
    try {
      await navigator.clipboard.writeText(command);
      setWhisperCopied(true);
      setTimeout(() => setWhisperCopied(false), 2000);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }, [listing]);

  // Close the screenshot lightbox on ESC
  useEffect(() => {
    if (!showImageModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowImageModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal]);

  const activeStats = listing?.stats
    ? Object.entries(listing.stats).filter(
        ([key, val]) => val > 0 && key !== "availableSlots"
      )
    : [];

  return {
    listing,
    isLoading,
    isOwner,
    activeStats,
    handleDelete,
    isDeleting: deleteMutation.isPending,
    chatLoading,
    handleContactSeller,
    liked,
    likeCount,
    toggleLike,
    showImageModal,
    setShowImageModal,
    whisperCopied,
    handleCopyWhisper,
  };
}
