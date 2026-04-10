import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Listing, ListingFormData } from "@/types";
import { deleteListingImage } from "./storage.service";

const LISTINGS_COLLECTION = "listings";
const listingsRef = collection(db, LISTINGS_COLLECTION);
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_ACTIVE_LISTINGS = 5;

const sanitizeListingData = <T extends Partial<ListingFormData>>(data: T): T => {
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && !Number.isNaN(value))
  ) as T;

  if (!cleaned.isInStore) {
    delete cleaned.storeChannel;
    delete cleaned.fmRoom;
    delete cleaned.sellerIgn;
  }

  if (cleaned.sellerIgn === "") {
    delete cleaned.sellerIgn;
  }

  return cleaned;
};

const prepareListingUpdateData = (data: Partial<ListingFormData>): Record<string, unknown> => {
  const nextData: Record<string, unknown> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || Number.isNaN(value)) return;
    nextData[key] = value;
  });

  if (nextData.isInStore === false) {
    nextData.storeChannel = deleteField();
    nextData.fmRoom = deleteField();
    nextData.sellerIgn = deleteField();
  } else if ("sellerIgn" in nextData && !nextData.sellerIgn) {
    nextData.sellerIgn = deleteField();
  }

  if ("listingImageUrl" in nextData && !nextData.listingImageUrl) {
    nextData.listingImageUrl = deleteField();
  }

  if ("listingImagePath" in nextData && !nextData.listingImagePath) {
    nextData.listingImagePath = deleteField();
  }

  return nextData;
};

/** Get all active (non-expired) listings */
export const getListings = async (): Promise<Listing[]> => {
  const q = query(listingsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const now = Date.now();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Listing)
    .filter((l) => l.isActive && l.expiresAt && l.expiresAt.toMillis() > now);
};

export const getListingById = async (id: string): Promise<Listing | null> => {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Listing;
};

/** Get ALL listings for a user (active + expired) */
export const getUserListings = async (userId: string): Promise<Listing[]> => {
  const q = query(
    listingsRef,
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Listing)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
};

/** Count active (non-expired) listings for a user */
export const getActiveListingCount = async (userId: string): Promise<number> => {
  const q = query(
    listingsRef,
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const now = Date.now();
  return snapshot.docs.filter((d) => {
    const data = d.data();
    return data.isActive && data.expiresAt && (data.expiresAt as Timestamp).toMillis() > now;
  }).length;
};

export const createListing = async (
  data: ListingFormData,
  userId: string,
  userEmail: string,
  username: string = "",
  userAvatarUrl: string = ""
): Promise<string> => {
  // Check limit
  const activeCount = await getActiveListingCount(userId);
  if (activeCount >= MAX_ACTIVE_LISTINGS) {
    throw new Error("MAX_LISTINGS_REACHED");
  }

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + ONE_WEEK_MS);
  const sanitizedData = sanitizeListingData(data);

  const docRef = await addDoc(listingsRef, {
    ...sanitizedData,
    userId,
    userEmail,
    username,
    userAvatarUrl,
    createdAt: serverTimestamp(),
    expiresAt,
    isActive: true,
  });
  return docRef.id;
};

export const updateListing = async (
  id: string,
  data: Partial<ListingFormData>
): Promise<void> => {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(docRef, prepareListingUpdateData(data) as any);
};

/** Backfill username/avatar on listings that are missing them */
export const backfillListingProfile = async (
  listingId: string,
  username: string,
  userAvatarUrl: string
): Promise<void> => {
  const docRef = doc(db, LISTINGS_COLLECTION, listingId);
  await updateDoc(docRef, { username, userAvatarUrl });
};

/** Reactivate an expired listing for another week */
export const reactivateListing = async (id: string, userId: string): Promise<void> => {
  // Check limit before reactivating
  const activeCount = await getActiveListingCount(userId);
  if (activeCount >= MAX_ACTIVE_LISTINGS) {
    throw new Error("MAX_LISTINGS_REACHED");
  }

  const docRef = doc(db, LISTINGS_COLLECTION, id);
  const now = Timestamp.now();
  await updateDoc(docRef, {
    expiresAt: Timestamp.fromMillis(now.toMillis() + ONE_WEEK_MS),
    isActive: true,
  });
};

export const deleteListing = async (id: string): Promise<void> => {
  const docRef = doc(db, LISTINGS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  const listing = snapshot.exists() ? (snapshot.data() as Listing) : null;

  if (listing?.listingImagePath) {
    await deleteListingImage(listing.listingImagePath).catch(() => undefined);
  }

  await deleteDoc(docRef);
};
