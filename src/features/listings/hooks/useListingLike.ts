import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/features/auth";
import { hasUserLiked, toggleLike, getLikeCount } from "@/services";
import toast from "react-hot-toast";

export const useListingLike = (listingId: string) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const toggledRef = useRef(false);

  // Fetch initial like count from subcollection
  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    getLikeCount(listingId).then((count) => {
      if (!cancelled && !toggledRef.current) setLikeCount(count);
    });
    return () => { cancelled = true; };
  }, [listingId]);

  // Check if current user already liked
  useEffect(() => {
    if (!user || !listingId) return;
    let cancelled = false;
    hasUserLiked(listingId, user.uid).then((val) => {
      if (!cancelled && !toggledRef.current) setLiked(val);
    });
    return () => { cancelled = true; };
  }, [listingId, user]);

  const toggle = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!user || loading) return;
    toggledRef.current = true;
    setLoading(true);
    const nowLiked = !liked;
    setLiked(nowLiked);
    setLikeCount((c) => c + (nowLiked ? 1 : -1));
    try {
      await toggleLike(listingId, user.uid);
    } catch (err) {
      console.error("toggleLike failed:", err);
      toast.error("Could not update like. Please try again.");
      setLiked(!nowLiked);
      setLikeCount((c) => c + (nowLiked ? -1 : 1));
    } finally {
      setLoading(false);
    }
  }, [user, liked, loading, listingId]);

  return { liked, likeCount, toggle, loading };
};
