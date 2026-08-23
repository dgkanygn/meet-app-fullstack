import { api } from "@/lib/apiClient";
import type { ParticipantResponse, MeetingParticipantStatus } from "@/lib/types";

export const participantService = {
  getParticipants(meetingId: string): Promise<ParticipantResponse[]> {
    return api.get<ParticipantResponse[]>(
      `/api/meetings/${meetingId}/participants`
    );
  },

  invite(meetingId: string, profileId: string): Promise<ParticipantResponse> {
    return api.post<ParticipantResponse>(
      `/api/meetings/${meetingId}/participants`,
      { profileId }
    );
  },

  updateStatus(
    meetingId: string,
    participantId: string,
    status: MeetingParticipantStatus
  ): Promise<ParticipantResponse> {
    return api.put<ParticipantResponse>(
      `/api/meetings/${meetingId}/participants/${participantId}`,
      { status }
    );
  },

  remove(meetingId: string, participantId: string): Promise<void> {
    return api.delete(
      `/api/meetings/${meetingId}/participants/${participantId}`
    );
  },
};
