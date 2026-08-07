import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth";
import { useListings } from "@/features/listings";
import { updateUserProfile, getItemById } from "@/services";
import type { MapleItemResult } from "@/types";
import toast from "react-hot-toast";

export const MAX_WISHLIST_ITEMS = 5;

export const useWishlist = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { data: listings } = useListings();
  const [items, setItems] = useState<MapleItemResult[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [saving, setSaving] = useState(false);

  const wishlistItemIds = profile?.wishlistItemIds ?? [];
  const idsKey = wishlistItemIds.join(",");

  useEffect(() => {
    let cancelled = false;
    setLoadingItems(true);
    Promise.all(wishlistItemIds.map((id) => getItemById(id))).then((results) => {
      if (cancelled) return;
      setItems(results.filter((r): r is MapleItemResult => !!r));
      setLoadingItems(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const matchingListings = useMemo(() => {
    if (!listings || wishlistItemIds.length === 0) return [];
    return listings.filter((l) => wishlistItemIds.includes(l.itemId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, idsKey]);

  const addItem = useCallback(
    async (item: MapleItemResult) => {
      if (!user) return;
      if (wishlistItemIds.includes(item.id)) return;
      if (wishlistItemIds.length >= MAX_WISHLIST_ITEMS) {
        toast.error(`You can wishlist up to ${MAX_WISHLIST_ITEMS} items`);
        return;
      }
      setSaving(true);
      try {
        await updateUserProfile(user.uid, {
          wishlistItemIds: [...wishlistItemIds, item.id],
        });
        await refreshProfile();
      } catch {
        toast.error("Could not add item to wishlist");
      } finally {
        setSaving(false);
      }
    },
    [user, wishlistItemIds, refreshProfile]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!user) return;
      setSaving(true);
      try {
        await updateUserProfile(user.uid, {
          wishlistItemIds: wishlistItemIds.filter((id) => id !== itemId),
        });
        await refreshProfile();
      } catch {
        toast.error("Could not remove item from wishlist");
      } finally {
        setSaving(false);
      }
    },
    [user, wishlistItemIds, refreshProfile]
  );

  return {
    items,
    loadingItems,
    saving,
    matchingListings,
    isFull: wishlistItemIds.length >= MAX_WISHLIST_ITEMS,
    addItem,
    removeItem,
  };
};
