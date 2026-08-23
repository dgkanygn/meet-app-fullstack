"use client";

import { useCallback, useEffect, useState } from "react";
import {
  calendarNoteService,
  type CreateCalendarNotePayload,
} from "@/lib/services/calendarNoteService";
import type { CalendarNoteResponse } from "@/lib/types";

/** @param month 1-12 (backend takvim ayı bekler, JS'in 0 tabanlı ayı değil). */
export function useCalendarNotes(year: number, month: number) {
  const [notes, setNotes] = useState<CalendarNoteResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = `${year}-${month}:${reloadKey}`;
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await calendarNoteService.getNotesByMonth(year, month);
        if (cancelled) return;
        setNotes(data);
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
  }, [year, month, requestKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  async function createNote(payload: CreateCalendarNotePayload) {
    const note = await calendarNoteService.create(payload);
    setNotes((prev) => [...prev, note]);
    return note;
  }

  async function updateNote(id: string, content: string) {
    const note = await calendarNoteService.update(id, content);
    setNotes((prev) => prev.map((n) => (n.id === id ? note : n)));
    return note;
  }

  async function deleteNote(id: string) {
    await calendarNoteService.delete(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return { notes, isLoading, error, refresh, createNote, updateNote, deleteNote };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Bilinmeyen bir hata oluştu.";
}
