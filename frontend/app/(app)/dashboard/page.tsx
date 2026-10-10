"use client";

import Link from "next/link";
import MeetingCard from "@/components/dashboard/MeetingCard";
import QuickActions from "@/components/dashboard/QuickActions";
import UserInvite from "@/components/ui/UserInvite";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { useSession } from "@/lib/context/SessionContext";
import { formatDateTime } from "@/lib/utils/date";

export default function DashboardPage() {
  const { profile } = useSession();
  const { meetings, isLoading, error, refetch } = useMeetings("past");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Merhaba, {profile?.fullName ?? "..."}
        </h1>
        <p className="mt-1 text-sm text-muted">İşlerini hızlıca yönet.</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Kişi Ekleyin</h2>
          <UserInvite />

          <div className="flex items-center justify-between pt-4">
            <h2 className="text-sm font-semibold text-foreground">
              Geçmiş Toplantılar
            </h2>
            <Link
              href="/meetings"
              className="text-xs text-muted transition-colors hover:text-foreground"
            >
              Tüm Toplantılar &rarr;
            </Link>
          </div>

          {isLoading && <p className="text-sm text-muted">Yükleniyor...</p>}

          {!isLoading && error && (
            <div className="space-y-2">
              <p className="text-sm text-error">{error}</p>
              <button
                onClick={refetch}
                className="cursor-pointer text-sm text-accent hover:underline"
              >
                Tekrar dene
              </button>
            </div>
          )}

          {!isLoading && !error && meetings.length === 0 && (
            <div className="rounded-[8px] border border-border bg-surface p-6 text-center">
              <p className="text-sm text-muted">Henüz tamamlanmış bir toplantı bulunmuyor.</p>
              <Link
                href="/start"
                className="mt-2 inline-block cursor-pointer text-sm text-accent hover:underline"
              >
                Yeni bir toplantı başlat
              </Link>
            </div>
          )}

          {meetings.map((meeting) => {
            // Katılan kişiler: Kabul edilmiş katılımcılar ve host
            const attendees = (meeting.participants ?? [])
              .filter((p) => p.status === "Accepted")
              .map((p) => ({
                id: p.profileId,
                fullName: p.profileFullName,
                username: p.profileUsername,
                avatarUrl: p.profileAvatarUrl,
              }));

            // Host listede yoksa ekle
            if (meeting.hostId && !attendees.some((a) => a.id === meeting.hostId)) {
              attendees.unshift({
                id: meeting.hostId,
                fullName: meeting.hostFullName,
                username: meeting.hostFullName.toLowerCase().replace(/\s+/g, ""),
                avatarUrl: null,
              });
            }

            return (
              <MeetingCard
                key={meeting.id}
                id={meeting.id}
                title={meeting.title}
                time={
                  meeting.endedAt
                    ? `${formatDateTime(meeting.endedAt)}`
                    : meeting.scheduledAt
                      ? formatDateTime(meeting.scheduledAt)
                      : formatDateTime(meeting.createdAt)
                }
                participants={meeting.maxParticipants}
                status="ended"
                attendees={attendees}
              />
            );
          })}
        </div>

        <QuickActions />
      </div>
    </div>
  );
}
