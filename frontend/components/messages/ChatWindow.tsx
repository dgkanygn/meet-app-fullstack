"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Video,
  Check,
  CheckCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { formatTime, parseApiDate } from "@/lib/utils/date";
import type { DirectMessageResponse } from "@/lib/types";

interface ChatPartner {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
}

interface ChatWindowProps {
  partner: ChatPartner | null;
  currentUserId?: string;
  messages: DirectMessageResponse[];
  isLoading: boolean;
  isSending: boolean;
  isPartnerTyping: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onTyping: () => void;
  onBack?: () => void;
}

function formatDateSeparator(isoDate: string): string {
  const date = parseApiDate(isoDate);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Bugün";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Dün";

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateKey(isoDate: string): string {
  const date = parseApiDate(isoDate);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default function ChatWindow({
  partner,
  currentUserId,
  messages,
  isLoading,
  isSending,
  isPartnerTyping,
  onSendMessage,
  onTyping,
  onBack,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  // Focus textarea when partner changes
  useEffect(() => {
    if (partner) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [partner]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;
    setInputText("");
    await onSendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    onTyping();
  };

  if (!partner) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface rounded-xl border border-border">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
          <MessageSquare size={32} />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Mesajlaşmaya Başlayın
        </h3>
        <p className="text-sm text-muted max-w-sm">
          Soldaki listeden mevcut bir sohbeti seçin veya kişi arayarak yeni bir
          mesajlaşma başlatın.
        </p>
      </div>
    );
  }

  // Group messages by day
  const groupedMessages: { dateKey: string; dateLabel: string; items: DirectMessageResponse[] }[] = [];
  messages.forEach((msg) => {
    const key = getDateKey(msg.createdAt);
    const existingGroup = groupedMessages.find((g) => g.dateKey === key);
    if (existingGroup) {
      existingGroup.items.push(msg);
    } else {
      groupedMessages.push({
        dateKey: key,
        dateLabel: formatDateSeparator(msg.createdAt),
        items: [msg],
      });
    }
  });

  return (
    <div className="h-full flex flex-col bg-surface rounded-xl border border-border overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 shrink-0 px-4 sm:px-6 border-b border-border flex items-center justify-between gap-3 bg-surface/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden -ml-1 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-border/50 transition-colors cursor-pointer"
              aria-label="Geri Dön"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="relative">
            <Avatar name={partner.fullName || partner.username} size="md" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-surface" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {partner.fullName}
            </h2>
            <div className="flex items-center gap-1.5">
              {isPartnerTyping ? (
                <span className="text-xs text-accent font-medium flex items-center gap-1 animate-pulse">
                  <span>yazıyor</span>
                  <span className="inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </span>
              ) : (
                <span className="text-xs text-muted truncate">
                  @{partner.username}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action button: Start Meeting */}
        <div className="flex items-center gap-2">
          <Link
            href="/start"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-border/40 hover:border-border transition-colors cursor-pointer"
          >
            <Video size={14} className="text-accent" />
            <span className="hidden sm:inline">Toplantı Başlat</span>
          </Link>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-muted">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span>Mesajlar yükleniyor...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
              <Sparkles size={24} />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {partner.fullName} ile sohbetiniz başlıyor
            </p>
            <p className="text-xs text-muted max-w-xs">
              Henüz mesajlaşmadınız. Merhaba diyerek ilk mesajı gönderin!
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.dateKey} className="space-y-3">
              {/* Date divider pill */}
              <div className="flex justify-center my-3">
                <span className="text-[11px] font-medium text-muted bg-border/50 px-3 py-0.5 rounded-full">
                  {group.dateLabel}
                </span>
              </div>

              {/* Messages in group */}
              {group.items.map((msg) => {
                const isMe = msg.senderId === currentUserId;

                return (
                  <div
                    key={msg.id}
                    className={[
                      "flex items-end gap-2 group",
                      isMe ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {!isMe && (
                      <div className="shrink-0 mb-0.5">
                        <Avatar name={partner.fullName || partner.username} size="xs" />
                      </div>
                    )}

                    <div
                      className={[
                        "max-w-[80%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words shadow-sm",
                        isMe
                          ? "bg-accent text-accent-fg rounded-tr-xs"
                          : "bg-surface border border-border text-foreground rounded-tl-xs",
                      ].join(" ")}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      <div
                        className={[
                          "flex items-center justify-end gap-1 mt-1 text-[10px]",
                          isMe ? "text-accent-fg/80" : "text-muted",
                        ].join(" ")}
                      >
                        <span>{formatTime(msg.createdAt)}</span>
                        {isMe && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck size={13} className="text-accent-fg" />
                            ) : (
                              <Check size={13} className="text-accent-fg/70" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <div className="p-3 sm:p-4 border-t border-border bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2 bg-background border border-border rounded-xl p-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all"
        >
          <textarea
            id="message-input"
            name="messageContent"
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`${partner.fullName} kullanıcısına mesaj yazın... (Gönder: Enter)`}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-foreground placeholder:text-muted max-h-32 min-h-6 py-1 px-1.5"
          />

          <button
            id="message-send-btn"
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="shrink-0 h-8 w-8 rounded-lg bg-accent text-accent-fg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 active:opacity-80"
            aria-label="Gönder"
          >
            {isSending ? (
              <div className="w-3.5 h-3.5 border-2 border-accent-fg border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
