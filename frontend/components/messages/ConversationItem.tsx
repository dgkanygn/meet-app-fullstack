"use client";

import Avatar from "@/components/ui/Avatar";
import { parseApiDate, formatTime } from "@/lib/utils/date";
import type { ConversationSummaryResponse } from "@/lib/types";

interface ConversationItemProps {
  conversation: ConversationSummaryResponse;
  isSelected: boolean;
  currentUserId?: string;
  onClick: () => void;
}

function formatChatDate(isoString: string): string {
  const date = parseApiDate(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return formatTime(isoString);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "Dün";
  }

  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const isMeSender = currentUserId === conversation.lastMessageSenderId;

  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer relative",
        isSelected
          ? "bg-accent/10 text-foreground font-medium"
          : "hover:bg-border/40 text-foreground",
      ].join(" ")}
    >
      <div className="relative shrink-0">
        <Avatar name={conversation.otherUserFullName || conversation.otherUserUsername} size="md" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p
            className={[
              "text-sm truncate",
              conversation.unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground",
            ].join(" ")}
          >
            {conversation.otherUserFullName}
          </p>
          <span className="text-[11px] text-muted shrink-0">
            {formatChatDate(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={[
              "text-xs truncate",
              conversation.unreadCount > 0
                ? "font-medium text-foreground"
                : "text-muted",
            ].join(" ")}
          >
            {isMeSender && <span className="text-muted mr-1">Siz:</span>}
            {conversation.lastMessage}
          </p>

          {conversation.unreadCount > 0 && (
            <span className="shrink-0 flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold rounded-full bg-accent text-accent-fg">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
