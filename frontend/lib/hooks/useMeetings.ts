"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  meetingService,
  type CreateMeetingPayload,
} from "@/lib/services/meetingService";
import type { MeetingResponse } from "@/lib/types";

type Scope = "hosted" | "upcoming" | "past" | "live" | undefined;

/**
 * Toplantı listesini yükler.
 *
 * `isLoading` ayrı bir state değil; "istenen sorgu" ile "yüklenmiş sorgu"
 * karşılaştırmasından türetilir. Böylece efekt içinde senkron setState
 * yapmadan, scope değiştiğinde de doğru şekilde yükleniyor durumuna geçilir.
 */
export function useMeetings(scope?: Scope) {
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${scope ?? "all"}:${reloadKey}`;
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await meetingService.getMyMeetings(scope);
        if (cancelled) return;
        setMeetings(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoadedKey(requestKey);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scope, requestKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { meetings, isLoading, error, refetch };
}

interface CreateMeetingOptions {
  /**
   * Oluşturduktan sonra nereye gidilecek.
   *  - "room": doğrudan toplantı odasına (anlık toplantılar)
   *  - "dashboard": listeye dön (planlanmış toplantılar)
   */
  redirectTo?: "room" | "dashboard";
}

export function useCreateMeeting({
  redirectTo = "room",
}: CreateMeetingOptions = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createMeeting(payload: CreateMeetingPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const meeting = await meetingService.create(payload);
      router.push(redirectTo === "room" ? `/meeting/${meeting.id}` : "/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  }

  return { createMeeting, isLoading, error };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Bilinmeyen bir hata oluştu.";
}
