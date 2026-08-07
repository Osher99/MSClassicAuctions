import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import {
  subscribeToMessages,
  subscribeToConversations,
  subscribeToConversation,
  sendMessage,
  markConversationRead,
  getOrCreateConversation,
  subscribeToUnreadCount,
  setTypingStatus,
  getUserProfile,
  createReport,
  blockConversation,
} from "@/services";
import type { Conversation, ChatMessage, UserProfile } from "@/types";
import toast from "react-hot-toast";

/** How long after a keystroke someone is still considered "typing" */
export const TYPING_EXPIRY_MS = 4000;
/** Minimum gap between typing-status writes, to avoid a write per keystroke */
const TYPING_WRITE_THROTTLE_MS = 2000;

/** Current time, re-rendering every `intervalMs` — lets "typing" status expire on its own */
export const useNow = (intervalMs = 1000): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

/**
 * Whether the other participant is "currently typing", given the raw
 * timestamp they last wrote (their device's clock).
 *
 * Deliberately does NOT compare that timestamp to our own `Date.now()` —
 * two different devices' clocks can drift by more than the expiry window,
 * which would silently hide the indicator. Instead, every time the
 * timestamp value changes (a fresh typing signal arrived), we start a
 * fresh expiry window measured entirely on our OWN clock.
 */
export const useOtherTypingExpiry = (
  typingTimestamp: number | null | undefined,
  now: number
): boolean => {
  const [expiresAt, setExpiresAt] = useState(0);

  useEffect(() => {
    // Explicitly cleared (e.g. they just sent a message) — stop showing it right away
    // instead of waiting out the rest of the expiry window.
    setExpiresAt(typingTimestamp == null ? 0 : Date.now() + TYPING_EXPIRY_MS);
  }, [typingTimestamp]);

  return now < expiresAt;
};

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

/** Hook for the chat page — loads conversation, messages, handles sending,
 * moderation (report/block), and desktop notifications. */
export const useChatPage = (conversationId: string) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading: messagesLoading } = useChatMessages(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTypingWriteRef = useRef(0);
  // Seed with the current length, not 0 — otherwise opening a chat that
  // already has history reads as "N new messages" on the very first
  // render and can fire a desktop notification for messages already seen.
  const prevMessagesLengthRef = useRef(messages.length);
  const now = useNow();

  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSending, setReportSending] = useState(false);

  // Live conversation data (also picks up typing status, blocked state, etc.)
  useEffect(() => {
    const unsub = subscribeToConversation(conversationId, setConversation);
    return unsub;
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

  const otherParticipantId = conversation?.participants.find((p) => p !== user?.uid) ?? "";
  const otherTyping = useOtherTypingExpiry(conversation?.typing?.[otherParticipantId], now);

  // Auto-scroll to bottom (also when the typing bubble appears)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  // Redirect anyone who isn't a participant (admins may still inspect for moderation)
  useEffect(() => {
    if (
      conversation &&
      user &&
      !conversation.participants.includes(user.uid) &&
      profile?.role !== "admin"
    ) {
      navigate("/chats");
    }
  }, [conversation, user, profile, navigate]);

  useEffect(() => {
    if (otherParticipantId) {
      getUserProfile(otherParticipantId).then(setOtherProfile);
    }
  }, [otherParticipantId]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Desktop notification for new messages while the tab isn't visible
  useEffect(() => {
    if (!conversation || !user) return;
    if (
      messages.length > prevMessagesLengthRef.current &&
      messages[messages.length - 1]?.sender !== user.uid &&
      document.visibilityState !== "visible" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      const msg = messages[messages.length - 1];
      new Notification(`New message from ${otherProfile?.username || "Chat"}`, {
        body: msg.text,
        icon: otherProfile?.avatarUrl || "/assets/maple-icon.png",
      });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, user, conversation, otherProfile]);

  const handleReport = useCallback(async () => {
    if (!reportReason.trim() || !user || !profile || !otherProfile || !conversationId) return;
    setReportSending(true);
    try {
      await createReport({
        reporterId: user.uid,
        reporterUsername: profile.username,
        reportedUserId: otherParticipantId,
        reportedUsername: otherProfile.username,
        conversationId,
        reason: reportReason.trim(),
      });
      await blockConversation(conversationId, user.uid, reportReason.trim());
      toast.success("Report submitted. This chat is now blocked for both users.");
      setShowReport(false);
      setReportReason("");
    } catch {
      toast.error("Failed to submit report and block");
    } finally {
      setReportSending(false);
    }
  }, [reportReason, user, profile, otherProfile, conversationId, otherParticipantId]);

  const notifyTyping = useCallback(() => {
    if (!user || !conversationId) return;
    const nowMs = Date.now();
    if (nowMs - lastTypingWriteRef.current < TYPING_WRITE_THROTTLE_MS) return;
    lastTypingWriteRef.current = nowMs;
    setTypingStatus(conversationId, user.uid).catch(() => {});
  }, [conversationId, user]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !user || !otherParticipantId || sending || conversation?.blocked) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await sendMessage(conversationId, user.uid, text, otherParticipantId);
      lastTypingWriteRef.current = 0;
      setTypingStatus(conversationId, user.uid, false).catch(() => {});
    } catch (error) {
      console.error("sendMessage failed:", error);
      setInput(text);
      toast.error("Could not send message right now.");
    } finally {
      setSending(false);
    }
  }, [input, user, otherParticipantId, conversationId, sending, conversation]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return {
    conversation,
    messages,
    messagesLoading,
    input,
    setInput,
    handleSend,
    handleKeyDown,
    sending,
    currentUserId: user?.uid ?? "",
    currentProfile: profile,
    otherParticipantId,
    otherTyping,
    notifyTyping,
    messagesEndRef,
    otherProfile,
    showReport,
    setShowReport,
    reportReason,
    setReportReason,
    reportSending,
    handleReport,
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
