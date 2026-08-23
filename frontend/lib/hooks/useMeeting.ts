"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { meetingService } from "@/lib/services/meetingService";
import type { MeetingDetailResponse } from "@/lib/types";

/** Tekil toplantı detayını yükler. */
export function useMeeting(id: string) {
  const [meeting, setMeeting] = useState<MeetingDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  const isLoading = !!id && loadedId !== id;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        const data = await meetingService.getById(id);
        if (cancelled) return;
        setMeeting(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadedId(id);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { meeting, isLoading, error };
}

/** Join formunda kullanılır: kod/id ile toplantıya katılma. */
export function useJoinMeeting() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function joinMeeting(meetingId: string, password?: string) {
    setIsLoading(true);
    setError(null);
    try {
      await meetingService.join(meetingId, password);
      router.push(`/meeting/${meetingId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  return { joinMeeting, isLoading, error };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Bilinmeyen bir hata oluştu.";
}
