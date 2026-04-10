import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getCountFromServer,
  collectionGroup,
  query,
  where,
  documentId,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const getLikeDocRef = (listingId: string, userId: string) =>
  doc(db, "listings", listingId, "likes", userId);

const getLikesColRef = (listingId: string) =>
  collection(db, "listings", listingId, "likes");

export const hasUserLiked = async (listingId: string, userId: string): Promise<boolean> => {
  const snap = await getDoc(getLikeDocRef(listingId, userId));
  return snap.exists();
};

export const toggleLike = async (
  listingId: string,
  userId: string
): Promise<boolean> => {
  const likeRef = getLikeDocRef(listingId, userId);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    return false;
  }

  await setDoc(likeRef, {
    createdAt: serverTimestamp(),
    userId,
  });
  return true;
};

export const getLikeCount = async (listingId: string): Promise<number> => {
  const snap = await getCountFromServer(getLikesColRef(listingId));
  return snap.data().count;
};

export const getUserLikedListingIds = async (userId: string): Promise<Set<string>> => {
  const likesQ = query(collectionGroup(db, "likes"), where(documentId(), "==", userId));
  const likesSnap = await getDocs(likesQ);
  const listingIds = new Set<string>();

  likesSnap.docs.forEach((likeDoc) => {
    const parentListingRef = likeDoc.ref.parent.parent;
    if (parentListingRef) {
      listingIds.add(parentListingRef.id);
    }
  });

  return listingIds;
};
