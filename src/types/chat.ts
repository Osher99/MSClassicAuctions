import { Timestamp } from "firebase/firestore";

export interface Conversation {
  id: string;
  participants: [string, string];
  listing: {
    id: string;
    itemName: string;
    itemIconUrl: string;
    price: number;
    server: string;
  };
  lastMessage: string;
  lastMessageTime: Timestamp;
  lastMessageSender: string;
  /** Map of participant uid → number of unread messages */
  unreadCount: Record<string, number>;
  blocked?: boolean;
  blockedBy?: string;
  blockedAt?: Timestamp;
  blockReason?: string;
  createdAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Timestamp;
  status?: "sent" | "delivered" | "read";
}

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  conversationId: string;
  reason: string;
  createdAt: Timestamp;
  status: "pending" | "reviewed" | "dismissed";
}
