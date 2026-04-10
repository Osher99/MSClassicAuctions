import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useConversations } from "../hooks/useChat";
import { useAuth } from "@/features/auth";
import { getUserProfiles } from "@/services";
import { Spinner, PageHeader, Card, EmptyState } from "@/components/ui";
import type { UserProfile } from "@/types";

export const ChatListPage = () => {
  const { user } = useAuth();
  const { conversations, loading } = useConversations();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  // Fetch profiles for all other participants
  useEffect(() => {
    if (!user || conversations.length === 0) return;
    const otherIds = [
      ...new Set(
        conversations.flatMap((c) =>
          c.participants.filter((p) => p !== user.uid)
        )
      ),
    ];
    if (otherIds.length > 0) {
      getUserProfiles(otherIds).then(setProfiles);
    }
  }, [conversations, user]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="💬 Messages" subtitle="Your conversations" />

      {conversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No messages yet"
          subtitle="Start a conversation from a listing page by clicking 'Contact Seller'"
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((convo) => {
            const otherId = convo.participants.find((p) => p !== user?.uid) ?? "";
            const otherProfile = profiles[otherId];
            const unread = convo.unreadCount?.[user?.uid ?? ""] || 0;
            const time = convo.lastMessageTime?.toDate();

            return (
              <Link key={convo.id} to={`/chats/${convo.id}`}>
                <Card className="hover:border-maple-orange transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {otherProfile?.avatarUrl ? (
                        <img
                          src={otherProfile.avatarUrl}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover ring-1 ring-maple-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-maple-orange/20 flex items-center justify-center text-maple-orange font-bold">
                          ?
                        </div>
                      )}
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white truncate">
                          {otherProfile?.username ?? "User"}
                        </span>
                        {time && (
                          <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                            {formatChatTime(time)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <img
                          src={convo.listing.itemIconUrl}
                          alt=""
                          className="w-4 h-4 object-contain flex-shrink-0"
                        />
                        <span className="text-xs text-maple-orange truncate">
                          {convo.listing.itemName}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-0.5 truncate ${
                          unread > 0 ? "text-white font-medium" : "text-slate-400"
                        }`}
                      >
                        {convo.lastMessageSender === user?.uid && "You: "}
                        {convo.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const formatChatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 86400000;

  if (diff < oneDay && now.getDate() === date.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 2 * oneDay) return "Yesterday";
  if (diff < 7 * oneDay) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};
