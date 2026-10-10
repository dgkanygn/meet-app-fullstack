"use client";

/**
 * NotificationContext — bildirimleri REST ile yükler, SignalR ile canlı dinler.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notificationService } from "@/lib/services/notificationService";
import { createHubConnection } from "@/lib/signalr";
import type { NotificationResponse } from "@/lib/types";

interface NotificationContextValue {
  notifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  /** Bir bildirime aksiyon alındıktan sonra listeden ve backend'den düşürmek için. */
  dismiss: (id: string) => Promise<void> | void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<number | null>(null);

  const isLoading = loadedKey !== reloadKey;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await notificationService.getNotifications();
        if (cancelled) return;
        setNotifications(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Bildirimler yüklenemedi.");
      } finally {
        if (!cancelled) setLoadedKey(reloadKey);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Canlı bildirim akışı
  useEffect(() => {
    const connection = createHubConnection("/hubs/notifications");

    connection.on("ReceiveNotification", (notification: NotificationResponse) => {
      setNotifications((prev) =>
        prev.some((n) => n.id === notification.id)
          ? prev
          : [notification, ...prev]
      );
    });

    // Canlı akış kurulamazsa sayfa REST'ten gelen listeyle çalışmaya devam eder.
    const started = connection.start().catch(() => {});

    return () => {
      // stop(), start() tamamlanmadan çağrılırsa SignalR
      // "connection was stopped during negotiation" hatası fırlatır.
      // Bu özellikle StrictMode'un çift mount'unda tetikleniyor.
      started.finally(() => connection.stop().catch(() => {}));
    };
  }, []);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationService.delete(id);
    } catch {
      // Silme isteği başarısız olsa da yerel listeden kaldırılmış kalır
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      markAllAsRead,
      dismiss,
      refresh,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      markAllAsRead,
      dismiss,
      refresh,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications, NotificationProvider içinde kullanılmalıdır."
    );
  }
  return ctx;
}
