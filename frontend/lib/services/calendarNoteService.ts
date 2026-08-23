import { api } from "@/lib/apiClient";
import type { CalendarNoteResponse } from "@/lib/types";

export interface CreateCalendarNotePayload {
  /** "YYYY-MM-DD" — backend DateOnly bekler. */
  date: string;
  content: string;
}

export const calendarNoteService = {
  getNotesByMonth(year: number, month: number): Promise<CalendarNoteResponse[]> {
    return api.get<CalendarNoteResponse[]>(
      `/api/calendar-notes?year=${year}&month=${month}`
    );
  },

  create(payload: CreateCalendarNotePayload): Promise<CalendarNoteResponse> {
    return api.post<CalendarNoteResponse>("/api/calendar-notes", payload);
  },

  /** Backend yalnızca içeriği günceller; tarih değiştirilemez. */
  update(id: string, content: string): Promise<CalendarNoteResponse> {
    return api.put<CalendarNoteResponse>(`/api/calendar-notes/${id}`, { content });
  },

  delete(id: string): Promise<void> {
    return api.delete(`/api/calendar-notes/${id}`);
  },
};
