"use client";

import Link from "next/link";
import MeetingCard from "@/components/dashboard/MeetingCard";
import QuickActions from "@/components/dashboard/QuickActions";
import UserInvite from "@/components/ui/UserInvite";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { useSession } from "@/lib/context/SessionContext";
import { formatDateTime, parseApiDate } from "@/lib/utils/date";
import type { MeetingResponse, MeetingStatus } from "@/lib/types";

/**
 * Backend toplantı durumu tutmuyor; UI için tarihten türetiyoruz.
 * Anlık toplantılar oluşturuldukları an canlı sayılır.
 */
function getMeetingStatus(meeting: MeetingResponse): MeetingStatus {
  if (meeting.isInstant) return "live";
  if (!meeting.scheduledAt) return "upcoming";
  return parseApiDate(meeting.scheduledAt) <= new Date() ? "ended" : "upcoming";
}

export default function DashboardPage() {
  const { profile } = useSession();
  const { meetings, isLoading, error, refetch } = useMeetings("upcoming");

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

          <h2 className="pt-4 text-sm font-semibold text-foreground">
            Yaklaşan Toplantılar
          </h2>

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
              <p className="text-sm text-muted">Henüz toplantın yok.</p>
              <Link
                href="/start"
                className="mt-2 inline-block cursor-pointer text-sm text-accent hover:underline"
              >
                İlk toplantını başlat
              </Link>
            </div>
          )}

          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              id={meeting.id}
              title={meeting.title}
              time={
                meeting.scheduledAt
                  ? formatDateTime(meeting.scheduledAt)
                  : "Anlık toplantı"
              }
              participants={meeting.maxParticipants}
              status={getMeetingStatus(meeting)}
            />
          ))}
        </div>

        <QuickActions />
      </div>
    </div>
  );
}
