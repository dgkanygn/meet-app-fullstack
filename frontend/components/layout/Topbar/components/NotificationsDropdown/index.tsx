"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useNotifications } from "@/lib/context/NotificationContext";
import { connectionService } from "@/lib/services/connectionService";
import { formatRelativeTime } from "@/lib/utils/date";
import type { NotificationResponse } from "@/lib/types";

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
  } = useNotifications();

  // Aynı isteğe arka arkaya basılmasını engellemek için işlenmekte olan bildirim.
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function respond(
    notification: NotificationResponse,
    status: "Accepted" | "Rejected"
  ) {
    if (!notification.referenceId) return;
    setPendingId(notification.id);
    setActionError(null);
    try {
      await connectionService.update(notification.referenceId, status);
      await dismiss(notification.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "İşlem başarısız.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Bildirimler (${unreadCount} okunmamış)`
            : "Bildirimler"
        }
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-border/50 hover:text-foreground"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-surface bg-accent" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 z-20 mt-2 w-[calc(100vw-2rem)] max-w-[320px] rounded-[8px] border border-border bg-surface shadow-[var(--shadow-floating)]"
            role="menu"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Bildirimler
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-muted transition-colors hover:text-foreground"
                >
                  <Check size={12} />
                  Tümünü okundu işaretle
                </button>
              )}
            </div>

            <div className="max-h-[320px] overflow-y-auto py-1">
              {isLoading && (
                <p className="px-4 py-6 text-center text-sm text-muted">
                  Yükleniyor...
                </p>
              )}

              {!isLoading && error && (
                <p className="px-4 py-6 text-center text-sm text-error">
                  {error}
                </p>
              )}

              {!isLoading && !error && notifications.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-muted">
                  Yeni bildirimin yok.
                </p>
              )}

              {actionError && (
                <p className="px-4 py-2 text-xs text-error">{actionError}</p>
              )}

              {notifications.map((notification) => {
                const isConnectionRequest =
                  notification.type === "ConnectionRequest" &&
                  !!notification.referenceId &&
                  !notification.isRead;
                const isPending = pendingId === notification.id;

                return (
                  <div
                    key={notification.id}
                    onClick={() =>
                      !notification.isRead && markAsRead(notification.id)
                    }
                    className={[
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-border/30",
                      notification.isRead ? "" : "bg-accent/5",
                    ].join(" ")}
                  >
                    <Avatar name={notification.message} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm break-words text-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatRelativeTime(notification.createdAt)}
                      </p>

                      {isConnectionRequest && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <button
                            disabled={isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              respond(notification, "Accepted");
                            }}
                            className="cursor-pointer rounded-[6px] bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg transition-colors hover:bg-accent/90 disabled:opacity-50"
                          >
                            Kabul Et
                          </button>
                          <button
                            disabled={isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              respond(notification, "Rejected");
                            }}
                            className="cursor-pointer rounded-[6px] border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border/50 disabled:opacity-50"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
