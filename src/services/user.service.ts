import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "@/types";

const USERS_COLLECTION = "users";

export const createUserProfile = async (
  profile: UserProfile
): Promise<void> => {
  await setDoc(doc(db, USERS_COLLECTION, profile.uid), profile);
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<Pick<UserProfile, "username" | "avatarUrl" | "ign">>
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), data);
};

export const getUserProfileByUserId = getUserProfile;

/** Batch-fetch profiles for a list of user IDs */
export const getUserProfiles = async (
  uids: string[]
): Promise<Record<string, UserProfile>> => {
  if (uids.length === 0) return {};
  // Firestore 'in' queries support max 30 items
  const chunks: string[][] = [];
  for (let i = 0; i < uids.length; i += 30) {
    chunks.push(uids.slice(i, i + 30));
  }
  const profiles: Record<string, UserProfile> = {};
  for (const chunk of chunks) {
    const q = query(
      collection(db, USERS_COLLECTION),
      where("uid", "in", chunk)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const p = d.data() as UserProfile;
      profiles[p.uid] = p;
    });
  }
  return profiles;
};
