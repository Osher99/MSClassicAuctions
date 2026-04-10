import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

const getFileExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension || "jpg";
};

export const uploadListingImage = async (file: File, userId: string) => {
  const extension = getFileExtension(file);
  const path = `listing-images/${userId}/${crypto.randomUUID()}-${Date.now()}.${extension}`;
  const storageRef = ref(storage, path);

  try {
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    const url = await getDownloadURL(storageRef);
    return { url, path };
  } catch {
    throw new Error(
      "Screenshot upload failed. Check Firebase Storage setup: create the default Storage bucket, use the exact bucket name from Firebase Console, make sure the project is on Blaze, and allow authenticated uploads in Storage rules."
    );
  }
};

export const deleteListingImage = async (path: string) => {
  if (!path) return;
  await deleteObject(ref(storage, path));
};