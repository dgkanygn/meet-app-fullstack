import { api } from "@/lib/apiClient";
import type {
  MeetingResponse,
  MeetingDetailResponse,
  IceServersResponse,
  MeetingParticipantStatus,
} from "@/lib/types";

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  scheduledAt?: string;
  isInstant: boolean;
  password?: string;
  maxParticipants?: number;
}

export interface UpdateMeetingPayload {
  title?: string;
  description?: string;
  scheduledAt?: string;
  password?: string;
  maxParticipants?: number;
}

export const meetingService = {
  getMyMeetings(
    scope?: "hosted" | "upcoming" | "past" | "live"
  ): Promise<MeetingResponse[]> {
    const qs = scope ? `?scope=${scope}` : "";
    return api.get<MeetingResponse[]>(`/api/meetings${qs}`);
  },

  getById(id: string): Promise<MeetingDetailResponse> {
    return api.get<MeetingDetailResponse>(`/api/meetings/${id}`);
  },

  create(payload: CreateMeetingPayload): Promise<MeetingResponse> {
    return api.post<MeetingResponse>("/api/meetings", payload);
  },

  update(id: string, payload: UpdateMeetingPayload): Promise<MeetingResponse> {
    return api.put<MeetingResponse>(`/api/meetings/${id}`, payload);
  },

  delete(id: string): Promise<void> {
    return api.delete(`/api/meetings/${id}`);
  },

  join(id: string, password?: string): Promise<{ status: MeetingParticipantStatus }> {
    return api.post<{ status: MeetingParticipantStatus }>(`/api/meetings/${id}/join`, { password });
  },

  leave(id: string): Promise<void> {
    return api.post<void>(`/api/meetings/${id}/leave`);
  },

  getIceServers(): Promise<IceServersResponse> {
    return api.get<IceServersResponse>("/api/meetings/ice-servers");
  },
};
