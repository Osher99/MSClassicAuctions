import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  increment,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Conversation, ChatMessage } from "@/types";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_SUBCOLLECTION = "messages";

const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);

const isPermissionDeniedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "permission-denied" || code === "firestore/permission-denied";
};

/** Find an existing conversation between two users about a specific listing */
export const findConversation = async (
  userId: string,
  otherUserId: string,
  listingId: string
): Promise<Conversation | null> => {
  // Firestore 'array-contains' can only filter one participant at a time,
  // so we query for one and filter the rest client-side.
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    where("listing.id", "==", listingId)
  );
  const snap = await getDocs(q);
  const match = snap.docs.find((d) => {
    const data = d.data();
    return (data.participants as string[]).includes(otherUserId);
  });
  return match ? ({ id: match.id, ...match.data() } as Conversation) : null;
};

/** Create a new conversation */
export const createConversation = async (
  currentUserId: string,
  otherUserId: string,
  listing: Conversation["listing"]
): Promise<string> => {
  const now = Timestamp.now();
  const docRef = await addDoc(conversationsRef, {
    participants: [currentUserId, otherUserId],
    listing,
    lastMessage: "",
    lastMessageTime: now,
    lastMessageSender: "",
    unreadCount: { [currentUserId]: 0, [otherUserId]: 0 },
    blocked: false,
    createdAt: now,
  });
  return docRef.id;
};

/** Get or create a conversation for a listing between two users */
export const getOrCreateConversation = async (
  currentUserId: string,
  sellerId: string,
  listing: Conversation["listing"]
): Promise<string> => {
  try {
    const existing = await findConversation(currentUserId, sellerId, listing.id);
    if (existing) return existing.id;
  } catch (error) {
    // Some rule configurations can deny the pre-check query; we can still create safely.
    if (!isPermissionDeniedError(error)) {
      throw error;
    }
  }

  return createConversation(currentUserId, sellerId, listing);
};

/** Send a message in a conversation */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string,
  recipientId: string
): Promise<void> => {
  const messagesRef = collection(
    db,
    CONVERSATIONS_COLLECTION,
    conversationId,
    MESSAGES_SUBCOLLECTION
  );
  const now = Timestamp.now();

  await addDoc(messagesRef, {
    sender: senderId,
    text: text.trim(),
    timestamp: now,
  });

  // Update conversation metadata
  const convoRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(convoRef, {
    lastMessage: text.trim().slice(0, 100),
    lastMessageTime: now,
    lastMessageSender: senderId,
    [`unreadCount.${recipientId}`]: increment(1),
  });
};

/** Subscribe to messages in a conversation (real-time) */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe => {
  const messagesRef = collection(
    db,
    CONVERSATIONS_COLLECTION,
    conversationId,
    MESSAGES_SUBCOLLECTION
  );
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as ChatMessage)
    );
    callback(messages);
  });
};

/** Subscribe to conversations for a user (real-time) */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("lastMessageTime", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as Conversation)
    );
    callback(conversations);
  });
};

/** Get a single conversation by ID */
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  const snap = await getDoc(
    doc(db, CONVERSATIONS_COLLECTION, conversationId)
  );
  return snap.exists()
    ? ({ id: snap.id, ...snap.data() } as Conversation)
    : null;
};

/** Mark all messages as read for a user in a conversation */
export const markConversationRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const convoRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(convoRef, {
    [`unreadCount.${userId}`]: 0,
  });
};

/** Block a conversation for both participants */
export const blockConversation = async (
  conversationId: string,
  blockerId: string,
  reason: string
): Promise<void> => {
  const convoRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(convoRef, {
    blocked: true,
    blockedBy: blockerId,
    blockedAt: Timestamp.now(),
    blockReason: reason.trim().slice(0, 500),
  });
};

/** Subscribe to total unread count for a user (real-time) */
export const subscribeToUnreadCount = (
  userId: string,
  callback: (count: number) => void
): Unsubscribe => {
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId)
  );
  return onSnapshot(q, (snapshot) => {
    let total = 0;
    snapshot.docs.forEach((d) => {
      const data = d.data();
      total += (data.unreadCount?.[userId] as number) || 0;
    });
    callback(total);
  });
};
