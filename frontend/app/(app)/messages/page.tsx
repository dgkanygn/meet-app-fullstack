"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Search,
  MessageSquare,
  Users,
  X,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/lib/context/SessionContext";
import { useConnections } from "@/lib/hooks/useConnections";
import { messageService } from "@/lib/services/messageService";
import { profileService } from "@/lib/services/profileService";
import { createHubConnection } from "@/lib/signalr";
import ConversationItem from "@/components/messages/ConversationItem";
import ContactItem from "@/components/messages/ContactItem";
import ChatWindow from "@/components/messages/ChatWindow";
import type {
  ConversationSummaryResponse,
  DirectMessageResponse,
  ProfileSearchResponse,
} from "@/lib/types";
import type { HubConnection } from "@microsoft/signalr";

interface ChatPartner {
  id: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
}

export default function MessagesPage() {
  const { profile: currentProfile } = useSession();
  const { connections, isLoading: isConnectionsLoading } = useConnections("Accepted");

  const [activeTab, setActiveTab] = useState<"conversations" | "contacts">("conversations");
  const [conversations, setConversations] = useState<ConversationSummaryResponse[]>([]);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);

  // Active chat
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<DirectMessageResponse[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  // SignalR
  const hubRef = useRef<HubConnection | null>(null);

  // 1. Initial Load of Conversations
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsConversationsLoading(true);
        const data = await messageService.getConversations();
        if (cancelled) return;
        setConversations(data);

        // Varsayılan olarak ilk sohbeti seç (masaüstünde)
        if (data.length > 0 && !selectedPartner && typeof window !== "undefined" && window.innerWidth >= 1024) {
          const first = data[0];
          setSelectedPartner({
            id: first.otherUserId,
            fullName: first.otherUserFullName,
            username: first.otherUserUsername,
            avatarUrl: first.otherUserAvatarUrl,
          });
        }
      } catch (err) {
        console.error("Sohbetler yüklenemedi:", err);
      } finally {
        if (!cancelled) setIsConversationsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Load Messages when Selected Partner changes
  useEffect(() => {
    if (!selectedPartner) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsMessagesLoading(true);
        const data = await messageService.getConversation(selectedPartner.id);
        if (cancelled) return;
        setMessages(data);

        // Okundu olarak işaretle
        await messageService.markAsRead(selectedPartner.id);

        // Sohbet listesindeki okunmamış sayacını sıfırla
        setConversations((prev) =>
          prev.map((c) =>
            c.otherUserId === selectedPartner.id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        console.error("Mesajlar yüklenemedi:", err);
      } finally {
        if (!cancelled) setIsMessagesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPartner?.id]);

  // 3. SignalR Realtime Hub Connection
  useEffect(() => {
    const connection = createHubConnection("/hubs/chat");
    hubRef.current = connection;

    // Mesaj alındığında
    connection.on("ReceiveDirectMessage", (msg: DirectMessageResponse) => {
      // Eğer açık sohbete ait bir mesajsa
      if (
        selectedPartner &&
        (msg.senderId === selectedPartner.id ||
          (msg.senderId === currentProfile?.id && msg.receiverId === selectedPartner.id))
      ) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );

        // Gelen mesaj ise okundu yap
        if (msg.senderId === selectedPartner.id) {
          messageService.markAsRead(selectedPartner.id).catch(() => {});
        }
      }

      // Sohbet listesini güncelle
      const isMe = msg.senderId === currentProfile?.id;
      const otherId = isMe ? msg.receiverId : msg.senderId;
      const otherName = isMe ? msg.receiverFullName : msg.senderFullName;
      const otherUsername = isMe ? msg.receiverUsername : msg.senderUsername;
      const otherAvatar = isMe ? msg.receiverAvatarUrl : msg.senderAvatarUrl;

      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.otherUserId === otherId);
        const isCurrentOpen = selectedPartner?.id === otherId;

        if (existingIdx !== -1) {
          const updated = [...prev];
          const item = updated[existingIdx];
          updated.splice(existingIdx, 1);
          updated.unshift({
            ...item,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            lastMessageSenderId: msg.senderId,
            unreadCount:
              !isMe && !isCurrentOpen
                ? item.unreadCount + 1
                : isCurrentOpen
                ? 0
                : item.unreadCount,
          });
          return updated;
        } else {
          return [
            {
              otherUserId: otherId,
              otherUserFullName: otherName,
              otherUserUsername: otherUsername,
              otherUserAvatarUrl: otherAvatar,
              lastMessage: msg.content,
              lastMessageAt: msg.createdAt,
              lastMessageSenderId: msg.senderId,
              unreadCount: !isMe && !isCurrentOpen ? 1 : 0,
            },
            ...prev,
          ];
        }
      });
    });

    // Mesajlar okunduğunda
    connection.on("MessagesRead", ({ readerId }: { readerId: string }) => {
      if (selectedPartner?.id === readerId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentProfile?.id ? { ...m, isRead: true } : m
          )
        );
      }
    });

    // Yazıyor bildirimi
    connection.on(
      "UserTyping",
      ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
        if (selectedPartner?.id === senderId) {
          setIsPartnerTyping(isTyping);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
              setIsPartnerTyping(false);
            }, 3000);
          }
        }
      }
    );

    const started = connection.start().catch((err) => {
      console.warn("SignalR bağlantısı kurulamadı:", err);
    });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      started.finally(() => connection.stop().catch(() => {}));
    };
  }, [selectedPartner?.id, currentProfile?.id]);

  // 4. Search Handler with Debounce
  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await profileService.search(term, 10);
        startTransition(() => {
          setSearchResults(results.filter((p) => p.id !== currentProfile?.id));
          setIsSearching(false);
        });
      } catch (err) {
        console.error("Arama hatası:", err);
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentProfile?.id]);

  // 5. Send Message Action
  const handleSendMessage = async (content: string) => {
    if (!selectedPartner || !content.trim()) return;

    try {
      setIsSending(true);
      const newMsg = await messageService.sendMessage(selectedPartner.id, content);

      // İstemci tarafı optimistik mesaj ekleme
      setMessages((prev) =>
        prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
      );

      // Sohbet listesini başa taşı ve güncelle
      setConversations((prev) => {
        const existingIdx = prev.findIndex((c) => c.otherUserId === selectedPartner.id);
        if (existingIdx !== -1) {
          const updated = [...prev];
          const item = updated[existingIdx];
          updated.splice(existingIdx, 1);
          updated.unshift({
            ...item,
            lastMessage: content,
            lastMessageAt: newMsg.createdAt,
            lastMessageSenderId: currentProfile?.id ?? "",
            unreadCount: 0,
          });
          return updated;
        } else {
          return [
            {
              otherUserId: selectedPartner.id,
              otherUserFullName: selectedPartner.fullName,
              otherUserUsername: selectedPartner.username,
              otherUserAvatarUrl: selectedPartner.avatarUrl,
              lastMessage: content,
              lastMessageAt: newMsg.createdAt,
              lastMessageSenderId: currentProfile?.id ?? "",
              unreadCount: 0,
            },
            ...prev,
          ];
        }
      });
    } catch (err) {
      console.error("Mesaj gönderilemedi:", err);
    } finally {
      setIsSending(false);
    }
  };

  // 6. Typing Signal Dispatch
  const handleTyping = () => {
    if (!selectedPartner || !hubRef.current) return;
    const now = Date.now();
    // Her 2 saniyede en fazla 1 kez ilet
    if (now - lastTypingSentRef.current > 2000) {
      lastTypingSentRef.current = now;
      hubRef.current
        .invoke("SendTyping", selectedPartner.id, true)
        .catch(() => {});
    }
  };

  // 7. Select Partner from list or search
  const handleSelectPartner = (partner: ChatPartner) => {
    setSelectedPartner(partner);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Filtered conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUserFullName.toLowerCase().includes(q) ||
      c.otherUserUsername.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // Extract accepted connection partners
  const acceptedContacts: ChatPartner[] = connections
    .map((conn) => {
      const isMeRequester = conn.requesterId === currentProfile?.id;
      return {
        id: isMeRequester ? conn.addresseeId : conn.requesterId,
        fullName: isMeRequester ? conn.addresseeFullName : conn.requesterFullName,
        username: isMeRequester ? conn.addresseeUsername : conn.requesterUsername,
        avatarUrl: isMeRequester ? conn.addresseeAvatarUrl : conn.requesterAvatarUrl,
      };
    })
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
      );
    });

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="h-[calc(100dvh-5.5rem)] flex flex-col">
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Pane: Conversations / Contacts / Search */}
        <div
          className={[
            "w-full lg:w-80 xl:w-96 flex flex-col bg-surface rounded-xl border border-border shrink-0 overflow-hidden",
            selectedPartner ? "hidden lg:flex" : "flex",
          ].join(" ")}
        >
          {/* Top Bar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-foreground tracking-tight">
                  Mesajlar
                </h1>
                {totalUnread > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-accent text-accent-fg">
                    {totalUnread} yeni
                  </span>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kişi veya sohbet ara..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-background border border-border rounded-lg outline-none text-foreground placeholder:text-muted focus:border-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Tab switchers (when not searching all users) */}
            {!searchQuery.trim() && (
              <div className="flex gap-1 p-1 bg-background rounded-lg mt-3 border border-border/50">
                <button
                  onClick={() => setActiveTab("conversations")}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                    activeTab === "conversations"
                      ? "bg-surface text-foreground shadow-xs"
                      : "text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <MessageSquare size={14} />
                  <span>Sohbetler</span>
                  {conversations.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-border text-muted">
                      {conversations.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("contacts")}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                    activeTab === "contacts"
                      ? "bg-surface text-foreground shadow-xs"
                      : "text-muted hover:text-foreground",
                  ].join(" ")}
                >
                  <Users size={14} />
                  <span>Kişiler</span>
                  {acceptedContacts.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-border text-muted">
                      {acceptedContacts.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Search Mode */}
            {searchQuery.trim().length >= 2 ? (
              <div className="space-y-3">
                {/* Filtered Active Conversations */}
                {filteredConversations.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-2 py-1">
                      Mevcut Sohbetler
                    </p>
                    {filteredConversations.map((conv) => (
                      <ConversationItem
                        key={conv.otherUserId}
                        conversation={conv}
                        isSelected={selectedPartner?.id === conv.otherUserId}
                        currentUserId={currentProfile?.id}
                        onClick={() =>
                          handleSelectPartner({
                            id: conv.otherUserId,
                            fullName: conv.otherUserFullName,
                            username: conv.otherUserUsername,
                            avatarUrl: conv.otherUserAvatarUrl,
                          })
                        }
                      />
                    ))}
                  </div>
                )}

                {/* Profiles found in system */}
                <div>
                  <div className="flex items-center justify-between px-2 py-1">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                      Tüm Kullanıcılar
                    </p>
                    {isSearching && (
                      <span className="text-[11px] text-accent animate-pulse">
                        Aranıyor...
                      </span>
                    )}
                  </div>

                  {searchResults.length === 0 && !isSearching ? (
                    <p className="text-xs text-muted text-center py-4">
                      Eşleşen kullanıcı bulunamadı.
                    </p>
                  ) : (
                    searchResults.map((user) => (
                      <ContactItem
                        key={user.id}
                        id={user.id}
                        fullName={user.fullName}
                        username={user.username}
                        badge={
                          user.connectionStatus === "Accepted"
                            ? "Bağlantınız"
                            : undefined
                        }
                        isSelected={selectedPartner?.id === user.id}
                        onSelect={() =>
                          handleSelectPartner({
                            id: user.id,
                            fullName: user.fullName,
                            username: user.username,
                            avatarUrl: user.avatarUrl,
                          })
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            ) : activeTab === "conversations" ? (
              /* Conversations Tab */
              isConversationsLoading ? (
                <div className="flex items-center justify-center py-12 text-muted text-sm">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" />
                  Yükleniyor...
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 text-muted">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
                    <MessageSquare size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Henüz sohbetiniz yok
                  </p>
                  <p className="text-xs text-muted max-w-xs mb-3">
                    Bağlantılarınızdan birini seçerek veya kişi arayarak ilk mesajınızı gönderin.
                  </p>
                  <button
                    onClick={() => setActiveTab("contacts")}
                    className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Kişilerime Göz At</span>
                  </button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.otherUserId}
                    conversation={conv}
                    isSelected={selectedPartner?.id === conv.otherUserId}
                    currentUserId={currentProfile?.id}
                    onClick={() =>
                      handleSelectPartner({
                        id: conv.otherUserId,
                        fullName: conv.otherUserFullName,
                        username: conv.otherUserUsername,
                        avatarUrl: conv.otherUserAvatarUrl,
                      })
                    }
                  />
                ))
              )
            ) : (
              /* Contacts Tab */
              isConnectionsLoading ? (
                <div className="flex items-center justify-center py-12 text-muted text-sm">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" />
                  Kişiler yükleniyor...
                </div>
              ) : acceptedContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 text-muted">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-2">
                    <Users size={20} />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Kayıtlı bağlantınız yok
                  </p>
                  <p className="text-xs text-muted max-w-xs">
                    Yukarıdaki arama çubuğunu kullanarak yeni kişiler bulabilir ve doğrudan mesaj gönderebilirsiniz.
                  </p>
                </div>
              ) : (
                acceptedContacts.map((contact) => (
                  <ContactItem
                    key={contact.id}
                    id={contact.id}
                    fullName={contact.fullName}
                    username={contact.username}
                    badge="Bağlantı"
                    isSelected={selectedPartner?.id === contact.id}
                    onSelect={() => handleSelectPartner(contact)}
                  />
                ))
              )
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        <div
          className={[
            "flex-1 h-full min-w-0",
            !selectedPartner ? "hidden lg:block" : "block",
          ].join(" ")}
        >
          <ChatWindow
            partner={selectedPartner}
            currentUserId={currentProfile?.id}
            messages={messages}
            isLoading={isMessagesLoading}
            isSending={isSending}
            isPartnerTyping={isPartnerTyping}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onBack={() => setSelectedPartner(null)}
          />
        </div>
      </div>
    </div>
  );
}
