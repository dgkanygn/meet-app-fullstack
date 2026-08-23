"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X, Clock, StickyNote, Trash2, Plus } from "lucide-react";
import CalendarGrid, { type CalendarEntry } from "@/components/calendar/CalendarGrid";
import Button from "@/components/ui/Button";
import { useMeetings } from "@/lib/hooks/useMeetings";
import { useCalendarNotes } from "@/lib/hooks/useCalendarNotes";
import { parseApiDate, parseDateKey, toDateKey, formatTime } from "@/lib/utils/date";

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { meetings, isLoading: meetingsLoading, error: meetingsError } = useMeetings();
  const {
    notes,
    isLoading: notesLoading,
    error: notesError,
    createNote,
    deleteNote,
  } = useCalendarNotes(year, month + 1);

  const [noteDraft, setNoteDraft] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteActionError, setNoteActionError] = useState<string | null>(null);

  // Toplantılar ve notlar tek bir "gün → kayıtlar" haritasında birleştirilir.
  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};

    for (const meeting of meetings) {
      if (!meeting.scheduledAt) continue; // anlık toplantıların takvimde yeri yok
      const key = toDateKey(parseApiDate(meeting.scheduledAt));
      (map[key] ??= []).push({
        id: meeting.id,
        title: meeting.title,
        kind: "meeting",
        time: formatTime(meeting.scheduledAt),
      });
    }

    for (const note of notes) {
      // Backend DateOnly döndürür: "2026-08-23" ya da "2026-08-23T00:00:00"
      const key = note.date.slice(0, 10);
      (map[key] ??= []).push({
        id: note.id,
        title: note.content,
        kind: "note",
      });
    }

    return map;
  }, [meetings, notes]);

  const selectedEntries = selectedDate ? (entriesByDate[selectedDate] ?? []) : [];
  const isLoading = meetingsLoading || notesLoading;
  const loadError = meetingsError ?? notesError;

  async function handleAddNote() {
    if (!selectedDate || !noteDraft.trim()) return;
    setIsSavingNote(true);
    setNoteActionError(null);
    try {
      await createNote({ date: selectedDate, content: noteDraft.trim() });
      setNoteDraft("");
    } catch (err) {
      setNoteActionError(err instanceof Error ? err.message : "Not eklenemedi.");
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleDeleteNote(id: string) {
    setNoteActionError(null);
    try {
      await deleteNote(id);
    } catch (err) {
      setNoteActionError(err instanceof Error ? err.message : "Not silinemedi.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Takvim</h1>
        <p className="mt-1 text-sm text-muted">
          Toplantılarını takip et, günlere not ekle.
        </p>
      </div>

      {loadError && <p className="text-sm text-error">{loadError}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_260px]">
        <CalendarGrid
          year={year}
          month={month}
          entriesByDate={entriesByDate}
          selectedDate={selectedDate}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m);
            setSelectedDate(null);
          }}
          onDaySelect={(dateKey) => {
            setSelectedDate(dateKey);
            setNoteDraft("");
            setNoteActionError(null);
          }}
        />

        {/* Seçili gün paneli */}
        <div className="min-h-[200px] overflow-hidden rounded-[8px] border border-border bg-surface">
          {!selectedDate ? (
            <div className="flex h-[200px] items-center justify-center">
              <p className="px-4 text-center text-xs text-muted">
                {isLoading
                  ? "Yükleniyor..."
                  : "Detayları görmek için bir güne tıkla"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {parseDateKey(selectedDate).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  aria-label="Paneli kapat"
                  className="cursor-pointer text-muted transition-colors hover:text-foreground"
                >
                  <X size={14} />
                </button>
              </div>

              {selectedEntries.length === 0 ? (
                <p className="text-xs text-muted">Bu gün için kayıt yok.</p>
              ) : (
                <ul className="space-y-2">
                  {selectedEntries.map((entry) =>
                    entry.kind === "meeting" ? (
                      <li key={entry.id}>
                        <Link
                          href={`/meeting/${entry.id}`}
                          className="flex items-start gap-2 text-sm text-foreground transition-colors hover:text-accent"
                        >
                          <Clock size={13} className="mt-0.5 shrink-0 text-muted" />
                          <span className="min-w-0">
                            <span className="block break-words">{entry.title}</span>
                            {entry.time && (
                              <span className="text-xs text-muted">{entry.time}</span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={entry.id}
                        className="group flex items-start gap-2 text-sm text-foreground"
                      >
                        <StickyNote size={13} className="mt-1 shrink-0 text-muted" />
                        <span className="min-w-0 flex-1 break-words">
                          {entry.title}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(entry.id)}
                          aria-label="Notu sil"
                          className="cursor-pointer text-muted transition-colors hover:text-error"
                        >
                          <Trash2 size={13} />
                        </button>
                      </li>
                    )
                  )}
                </ul>
              )}

              {/* Not ekleme */}
              <div className="space-y-2 border-t border-border pt-3">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Bu güne not ekle..."
                  rows={2}
                  className="w-full resize-none rounded-[6px] border border-border bg-background px-2.5 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground"
                />
                {noteActionError && (
                  <p className="text-xs text-error">{noteActionError}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddNote}
                  disabled={!noteDraft.trim() || isSavingNote}
                  isLoading={isSavingNote}
                  className="w-full"
                >
                  <Plus size={14} />
                  Not Ekle
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
