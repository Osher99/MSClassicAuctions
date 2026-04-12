import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/features/auth";
import {
  subscribeToMessages,
  subscribeToConversations,
  sendMessage,
  markConversationRead,
  getConversation,
  getOrCreateConversation,
  subscribeToUnreadCount,
} from "@/services";
import type { Conversation, ChatMessage } from "@/types";
import toast from "react-hot-toast";

/** Real-time messages for a conversation */
export const useChatMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return unsub;
  }, [conversationId]);

  return { messages, loading };
};

/** Real-time conversations list for current user */
export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { conversations, loading };
};

/** Hook for the chat page — loads conversation, messages, handles sending */
export const useChatPage = (conversationId: string) => {
  const { user, profile } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading: messagesLoading } = useChatMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation data
  useEffect(() => {
    getConversation(conversationId).then(setConversation);
  }, [conversationId]);

  // Mark as read when viewing
  useEffect(() => {
    if (!user || !conversationId || !conversation || !Array.isArray(conversation.participants)) return;
    if (conversation.participants.includes(user.uid)) {
      markConversationRead(conversationId, user.uid).catch((error) => {
        console.error("markConversationRead failed:", error);
      });
    } else {
      console.warn("[DEBUG] user.uid not in participants, skipping markConversationRead");
    }
  }, [conversationId, user, conversation, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const otherParticipantId = conversation?.participants.find((p) => p !== user?.uid) ?? "";

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || !otherParticipantId || sending || conversation?.blocked) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendMessage(conversationId, user.uid, text, otherParticipantId);
    } catch (error) {
      console.error("sendMessage failed:", error);
      setInput(text);
      toast.error("Could not send message right now.");
    } finally {
      setSending(false);
    }
  }, [input, user, otherParticipantId, conversationId, sending, conversation]);

  return {
    conversation,
    messages,
    messagesLoading,
    input,
    setInput,
    handleSend,
    sending,
    currentUserId: user?.uid ?? "",
    currentProfile: profile,
    otherParticipantId,
    messagesEndRef,
  };
};

/** Start or open a chat about a listing */
export const useStartChat = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startChat = useCallback(
    async (
      sellerId: string,
      listing: { id: string; itemName: string; itemIconUrl: string; price: number; server: string }
    ): Promise<string | null> => {
      if (!user) return null;
      setLoading(true);
      try {
        return await getOrCreateConversation(user.uid, sellerId, listing);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { startChat, loading };
};

/** Real-time total unread count for navbar badge */
export const useUnreadCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    const unsub = subscribeToUnreadCount(user.uid, setCount);
    return unsub;
  }, [user]);

  return count;
};
