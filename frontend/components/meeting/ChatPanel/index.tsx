"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import type { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  currentUserId?: string;
}

export default function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserId,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(trimmed);
      setInputText("");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(isoString: string) {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  return (
    <>
      {/* Masaüstünde hafif karartma gerekmez; mobilde tam ekran kaplar */}
      <aside
        className={[
          "fixed inset-0 z-50 flex flex-col bg-[#201E1B]", // Mobilde tam ekran
          "md:static md:z-auto md:w-80 md:max-w-none md:border-l md:border-[#332F2A]", // Masaüstünde yan panel
        ].join(" ")}
      >
        {/* Başlık */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#332F2A] px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#E07A45]/15 text-[#E07A45]">
              <MessageSquare size={14} />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#F2EFEA]">Toplantı Sohbeti</h2>
              <p className="text-[10px] text-[#A39C93]">
                {messages.length} mesaj
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Sohbet panelini kapat"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[4px] text-[#A39C93] transition-colors hover:bg-[#332F2A] hover:text-[#F2EFEA]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mesaj Listesi */}
        <div className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-[#A39C93]">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#332F2A] bg-[#171512] text-[#A39C93]">
                <MessageSquare size={20} />
              </div>
              <p className="text-xs font-medium text-[#F2EFEA]">Henüz mesaj yok</p>
              <p className="mt-1 max-w-[200px] text-[11px] text-[#A39C93]">
                İlk mesajı yazarak toplantıdaki herkesle sohbet etmeye başlayın.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={[
                  "flex flex-col gap-1",
                  isMe ? "items-end" : "items-start",
                ].join(" ")}
              >
                {!isMe && (
                  <div className="flex items-center gap-1.5 px-1">
                    <Avatar name={msg.senderUsername || msg.senderFullName} size="xs" />
                    <span className="text-[11px] font-medium text-[#F2EFEA]">
                      {msg.senderFullName}
                    </span>
                    <span className="text-[10px] text-[#706B63]">
                      {formatTime(msg.sentAt)}
                    </span>
                  </div>
                )}

                {isMe && (
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] text-[#706B63]">
                      {formatTime(msg.sentAt)}
                    </span>
                    <span className="text-[11px] font-medium text-[#E07A45]">Sen</span>
                  </div>
                )}

                <div
                  className={[
                    "max-w-[85%] rounded-[8px] px-3 py-2 text-xs break-words leading-relaxed",
                    isMe
                      ? "bg-[#E07A45]/15 border border-[#E07A45]/30 text-[#F2EFEA] rounded-tr-none"
                      : "bg-[#2A2621] border border-[#332F2A] text-[#F2EFEA] rounded-tl-none",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Mesaj Giriş Alanı */}
        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-[#332F2A] bg-[#171512] p-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Bir mesaj yazın..."
              className="flex-1 rounded-[6px] border border-[#332F2A] bg-[#201E1B] px-3 py-2 text-xs text-[#F2EFEA] placeholder-[#706B63] transition-colors focus:border-[#E07A45] focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              aria-label="Mesaj gönder"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] bg-[#E07A45] text-[#171512] transition-colors hover:bg-[#D06935] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
