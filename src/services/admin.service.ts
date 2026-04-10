import {
  collection, getDocs, query, orderBy, doc, updateDoc, where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile, UserStatus } from "@/types";
import type { Listing } from "@/types";
import { deleteListing } from "./listings.service";

const USERS_COLLECTION = "users";
const LISTINGS_COLLECTION = "listings";

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const q = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
};

export const getAllListings = async (): Promise<Listing[]> => {
  const q = query(collection(db, LISTINGS_COLLECTION), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Listing);
};

const deleteUserListings = async (uid: string): Promise<number> => {
  const q = query(collection(db, LISTINGS_COLLECTION), where("userId", "==", uid));
  const snap = await getDocs(q);
  let deleted = 0;
  for (const d of snap.docs) {
    await deleteListing(d.id);
    deleted++;
  }
  return deleted;
};

export const updateUserStatus = async (uid: string, status: UserStatus): Promise<number> => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), { status });
  if (status === "banned") {
    return deleteUserListings(uid);
  }
  return 0;
};

export const adminDeleteListing = async (id: string): Promise<void> => {
  await deleteListing(id);
};
