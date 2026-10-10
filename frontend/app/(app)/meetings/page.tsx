"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Video, Calendar, Clock, Users, ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { formatDateTime, parseApiDate } from "@/lib/utils/date";
import type { MeetingResponse, MeetingStatus } from "@/lib/types";

type FilterTab = "all" | "live" | "upcoming" | "past";

function deriveMeetingStatus(meeting: MeetingResponse): MeetingStatus {
  if (meeting.endedAt) return "ended";
  if (meeting.activeParticipantIds && meeting.activeParticipantIds.length > 0) {
    return "live";
  }
  if (meeting.isInstant) {
    // Anlık toplantı son 4 saat içinde ve bitmemişse canlı sayılır
    const createdDate = parseApiDate(meeting.createdAt);
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    return createdDate > fourHoursAgo ? "live" : "ended";
  }
  if (!meeting.scheduledAt) return "upcoming";
  const scheduledDate = parseApiDate(meeting.scheduledAt);
  return scheduledDate <= new Date() ? "ended" : "upcoming";
}

const statusBadgeConfig = {
  live: { label: "Canlı", variant: "success" as const },
  upcoming: { label: "Yakında", variant: "default" as const },
  ended: { label: "Bitti", variant: "error" as const },
};

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const { meetings, isLoading, error, refetch } = useMeetings();

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const status = deriveMeetingStatus(meeting);
      if (activeTab === "all") return true;
      if (activeTab === "live") return status === "live";
      if (activeTab === "upcoming") return status === "upcoming";
      if (activeTab === "past") return status === "ended";
      return true;
    });
  }, [meetings, activeTab]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Başlık ve Hızlı Aksiyonlar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Toplantılar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Mevcut, yaklaşan ve geçmiş tüm toplantılarını yönet.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/start"
            className="flex items-center gap-1.5 rounded-[6px] bg-accent px-3.5 py-2 text-xs font-medium text-accent-fg transition-colors hover:bg-accent/90"
          >
            <Video size={14} />
            Hemen Başlat
          </Link>
          <Link
            href="/schedule"
            className="flex items-center gap-1.5 rounded-[6px] border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-border/40"
          >
            <Plus size={14} />
            Planla
          </Link>
        </div>
      </div>

      {/* Filtre Sekmeleri */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("all")}
          className={[
            "cursor-pointer border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
            activeTab === "all"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground",
          ].join(" ")}
        >
          Tümü ({meetings.length})
        </button>
        <button
          onClick={() => setActiveTab("live")}
          className={[
            "cursor-pointer border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
            activeTab === "live"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground",
          ].join(" ")}
        >
          Mevcut / Canlı
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={[
            "cursor-pointer border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
            activeTab === "upcoming"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground",
          ].join(" ")}
        >
          Yaklaşan / Gelecek
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={[
            "cursor-pointer border-b-2 px-4 py-2.5 text-xs font-medium transition-colors",
            activeTab === "past"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground",
          ].join(" ")}
        >
          Geçmiş
        </button>
      </div>

      {/* Yükleme / Hata / Liste */}
      {isLoading && <p className="text-sm text-muted">Toplantılar yükleniyor...</p>}

      {!isLoading && error && (
        <div className="space-y-2">
          <p className="text-sm text-error">{error}</p>
          <button
            onClick={refetch}
            className="cursor-pointer text-sm text-accent hover:underline"
          >
            Yeniden dene
          </button>
        </div>
      )}

      {!isLoading && !error && filteredMeetings.length === 0 && (
        <div className="rounded-[8px] border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            {activeTab === "live" && "Şu anda devam eden canlı bir toplantı yok."}
            {activeTab === "upcoming" && "Planlanmış yaklaşan toplantı bulunmuyor."}
            {activeTab === "past" && "Geçmiş toplantı kaydı bulunmuyor."}
            {activeTab === "all" && "Kayıtlı toplantı bulunmuyor."}
          </p>
          <Link
            href="/start"
            className="mt-3 inline-block cursor-pointer text-xs font-medium text-accent hover:underline"
          >
            Yeni bir toplantı başlat &rarr;
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filteredMeetings.map((meeting) => {
          const status = deriveMeetingStatus(meeting);
          const { label: statusLabel, variant: statusVariant } =
            statusBadgeConfig[status];

          // Katılımcı listesi: Kabul edilmiş olanlar veya odadakiler
          const allParticipants = meeting.participants ?? [];
          const activeIdsSet = new Set(meeting.activeParticipantIds ?? []);

          // Canlı toplantıda o an odada olanlar öncelikli gösterilir
          const currentRoomParticipants = allParticipants.filter((p) =>
            activeIdsSet.has(p.profileId)
          );

          const attendedParticipants = allParticipants.filter(
            (p) => p.status === "Accepted"
          );

          // Gösterilecek katılımcılar:
          // Canlı toplantıda aktif olanlar varsa onlar, aksi halde kabul edenler
          const displayParticipants =
            status === "live" && currentRoomParticipants.length > 0
              ? currentRoomParticipants
              : attendedParticipants;

          const hasParticipants = displayParticipants.length > 0;

          return (
            <div
              key={meeting.id}
              className="flex flex-col justify-between rounded-[8px] border border-border bg-surface p-4 transition-colors duration-150 hover:border-foreground/20"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        {meeting.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusVariant}>{statusLabel}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {meeting.scheduledAt
                      ? formatDateTime(meeting.scheduledAt)
                      : meeting.endedAt
                        ? `${formatDateTime(meeting.endedAt)}`
                        : "Anlık toplantı"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {meeting.maxParticipants} kişilik oda
                  </span>
                </div>

                <div className="text-[11px] text-muted">
                  Oluşturan:{" "}
                  <span className="text-foreground">{meeting.hostFullName}</span>
                </div>

                {/* Katılımcılar bölümü */}
                {hasParticipants ? (
                  <div className="border-t border-border pt-2.5">
                    <p className="mb-1.5 text-[11px] font-medium text-muted">
                      {status === "live"
                        ? "Odadaki Katılımcılar"
                        : status === "ended"
                          ? "Katılmış Kişiler"
                          : "Katılımcılar"}{" "}
                      ({displayParticipants.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {displayParticipants.map((p) => {
                        const isOnline = activeIdsSet.has(p.profileId);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5 rounded-[4px] border border-border bg-background px-2 py-1 text-xs text-foreground"
                          >
                            <Avatar
                              name={p.profileUsername || p.profileFullName}
                              size="xs"
                            />
                            <span className="max-w-[120px] truncate text-[11px]">
                              {p.profileFullName}
                            </span>
                            {status === "live" && isOnline && (
                              <span
                                title="Odada aktif"
                                className="h-1.5 w-1.5 rounded-full bg-[#4C9770]"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border pt-2 text-[11px] text-muted">
                    Henüz katılımcı yok.
                  </div>
                )}
              </div>

              {/* Alt Buton / Aksiyon */}
              <div className="mt-4 flex items-center justify-end border-t border-border pt-3">
                {status === "ended" ? (
                  <span className="text-xs text-muted">Sona Erdi</span>
                ) : (
                  <Link
                    href={`/meeting/${meeting.id}`}
                    className="flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent/80"
                  >
                    {status === "live" ? "Odaya Katıl" : "Toplantıya Git"}
                    <ArrowUpRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
