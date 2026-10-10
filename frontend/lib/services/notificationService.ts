import { api } from "@/lib/apiClient";
import type { NotificationResponse } from "@/lib/types";

export const notificationService = {
  getNotifications(isRead?: boolean): Promise<NotificationResponse[]> {
    const qs = isRead !== undefined ? `?isRead=${isRead}` : "";
    return api.get<NotificationResponse[]>(`/api/notifications${qs}`);
  },

  markAsRead(id: string): Promise<void> {
    return api.put<void>(`/api/notifications/${id}/read`);
  },

  markAllAsRead(): Promise<void> {
    return api.put<void>("/api/notifications/read-all");
  },

  delete(id: string): Promise<void> {
    return api.delete<void>(`/api/notifications/${id}`);
  },
};
