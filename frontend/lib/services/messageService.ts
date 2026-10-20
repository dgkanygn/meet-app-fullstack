import { api } from "@/lib/apiClient";
import type {
  DirectMessageResponse,
  SendMessageRequest,
  ConversationSummaryResponse,
} from "@/lib/types";

export const messageService = {
  getConversations(): Promise<ConversationSummaryResponse[]> {
    return api.get<ConversationSummaryResponse[]>("/api/messages/conversations");
  },

  getConversation(
    otherUserId: string,
    limit = 100
  ): Promise<DirectMessageResponse[]> {
    return api.get<DirectMessageResponse[]>(
      `/api/messages/${otherUserId}?limit=${limit}`
    );
  },

  sendMessage(
    receiverId: string,
    content: string
  ): Promise<DirectMessageResponse> {
    const payload: SendMessageRequest = { receiverId, content };
    return api.post<DirectMessageResponse>("/api/messages", payload);
  },

  markAsRead(otherUserId: string): Promise<void> {
    return api.post<void>(`/api/messages/${otherUserId}/read`);
  },

  getUnreadCount(): Promise<{ unreadCount: number }> {
    return api.get<{ unreadCount: number }>("/api/messages/unread-count");
  },
};
