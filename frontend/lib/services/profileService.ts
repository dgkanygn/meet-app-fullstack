import { api } from "@/lib/apiClient";
import type { ProfileResponse, ProfileSearchResponse } from "@/lib/types";

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

export const profileService = {
  getMe(): Promise<ProfileResponse> {
    return api.get<ProfileResponse>("/api/profiles/me");
  },

  updateMe(payload: UpdateProfilePayload): Promise<ProfileResponse> {
    return api.put<ProfileResponse>("/api/profiles/me", payload);
  },

  getById(id: string): Promise<ProfileResponse> {
    return api.get<ProfileResponse>(`/api/profiles/${id}`);
  },

  /** En az 2 karakter gerekir; kısa terimlerde backend boş liste döner. */
  search(term: string, limit = 10): Promise<ProfileSearchResponse[]> {
    const qs = new URLSearchParams({ q: term, limit: String(limit) });
    return api.get<ProfileSearchResponse[]>(`/api/profiles/search?${qs}`);
  },

  deleteMe(password: string): Promise<void> {
    return api.delete<void>("/api/profiles/me", { password });
  },
};
