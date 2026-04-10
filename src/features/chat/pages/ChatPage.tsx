import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { useChatPage } from "../hooks/useChat";
import { useAuth } from "@/features/auth";
import { Spinner } from "@/components/ui";
import { getUserProfile } from "@/services";
import { createReport, blockConversation } from "@/services";
import { useEffect } from "react";
import type { UserProfile } from "@/types";
import toast from "react-hot-toast";

export const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  if (!conversationId) return null;

  const {
    conversation,
    messages,
    messagesLoading,
    input,
    setInput,
    handleSend,
    sending,
    currentUserId,
    otherParticipantId,
    messagesEndRef,
  } = useChatPage(conversationId);

  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSending, setReportSending] = useState(false);

  useEffect(() => {
    if (otherParticipantId) {
      getUserProfile(otherParticipantId).then(setOtherProfile);
    }
  }, [otherParticipantId]);

  // Verify user is participant (admins can still inspect for moderation)
  if (
    conversation &&
    user &&
    !conversation.participants.includes(user.uid) &&
    profile?.role !== "admin"
  ) {
    navigate("/chats");
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  if (!conversation || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Spinner />
      </div>
    );
  }

  const listing = conversation.listing;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat Header */}
      <div className="bg-maple-card border border-maple-border rounded-t-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/chats"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {otherProfile ? (
            <div className="flex items-center gap-2">
              <img
                src={otherProfile.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-1 ring-maple-border"
              />
              <span className="text-sm font-medium text-white">
                {otherProfile.username}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-400">Loading...</span>
          )}
        </div>
        {profile?.role !== "admin" && !conversation.blocked && (
          <button
            onClick={() => setShowReport(true)}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10"
          >
            ⚠️ Report & Block
          </button>
        )}
      </div>

      {/* Item Preview Banner */}
      <div className="bg-slate-800/90 border-x border-maple-border px-4 py-3">
        <p className="text-[11px] text-slate-300 uppercase tracking-wide mb-2">
          About this item
        </p>
        <Link
          to={`/listings/${listing.id}`}
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <img
            src={listing.itemIconUrl}
            alt={listing.itemName}
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-5 break-words">
              {listing.itemName}
            </p>
            <p className="text-xs text-slate-300 mt-0.5 md:hidden">{listing.server}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-maple-gold">
              {listing.price.toLocaleString()} mesos
            </p>
            <p className="text-xs text-slate-300 hidden md:block">{listing.server}</p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[#0b1120] border-x border-maple-border px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-center text-slate-500 text-sm mt-8">
            No messages yet. Say hello! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMe
                    ? "bg-maple-orange text-white rounded-br-md"
                    : "bg-slate-700 text-slate-100 rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMe ? "text-orange-200" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp?.toDate().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {conversation.blocked ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-b-2xl px-4 py-3 text-sm text-red-300">
          This conversation was blocked after a report. Messaging is disabled for both users.
        </div>
      ) : (
        <div className="bg-maple-card border border-maple-border rounded-b-2xl px-3 py-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 bg-slate-800 border border-maple-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-maple-orange transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-maple-orange hover:bg-maple-gold disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div
          onClick={() => setShowReport(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-maple-card border border-maple-border rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-lg font-bold text-white">⚠️ Report & Block User</h3>
            <p className="text-sm text-slate-400">
              Report <span className="text-white font-medium">{otherProfile?.username}</span> for inappropriate behavior.
              After submitting, this conversation will be blocked for both users and messaging will be disabled.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              maxLength={500}
              rows={4}
              className="w-full bg-slate-800 border border-maple-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-maple-orange transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowReport(false)}
                className="flex-1 px-4 py-2 text-sm rounded-lg border border-maple-border text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim() || reportSending}
                className="flex-1 px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-medium transition-colors"
              >
                {reportSending ? "Submitting..." : "Submit Report & Block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
