/**
 * Backend DTO'larinin birebir karsiligi.
 * Kaynak: api/src/MeetApp.Application/Dtos/*
 *
 * Not: Enum'lar API tarafinda JsonStringEnumConverter ile string olarak
 * serialize edilir, bu yuzden burada da string union olarak tanimlidir.
 */

// ─── Profile ─────────────────────────────────────────────────────────────────
export interface ProfileResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface ProfileSearchResponse {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  /** Arayan kullanici ile bu profil arasindaki baglanti durumu; yoksa null. */
  connectionStatus: ConnectionStatus | null;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  /** Refresh token'in son kullanma tarihi (ISO). */
  expiresAt: string;
  profile: ProfileResponse;
}

// ─── Meeting ─────────────────────────────────────────────────────────────────
export interface MeetingResponse {
  id: string;
  title: string;
  description?: string | null;
  hostId: string;
  hostFullName: string;
  scheduledAt?: string | null;
  isInstant: boolean;
  hasPassword: boolean;
  maxParticipants: number;
  createdAt: string;
  endedAt?: string | null;
  participants?: ParticipantResponse[];
  activeParticipantIds?: string[];
}

export type MeetingParticipantStatus =
  | "Invited"
  | "Accepted"
  | "Rejected"
  | "Removed";

export interface ParticipantResponse {
  id: string;
  meetingId: string;
  profileId: string;
  profileFullName: string;
  profileUsername: string;
  profileAvatarUrl?: string | null;
  status: MeetingParticipantStatus;
  invitedAt: string;
  respondedAt?: string | null;
}

export interface MeetingDetailResponse extends MeetingResponse {
  participants: ParticipantResponse[];
  activeParticipantIds?: string[];
}

/** UI tarafinda turetilen durum — backend'de boyle bir alan yok. */
export type MeetingStatus = "live" | "upcoming" | "ended";

// ─── Connection ───────────────────────────────────────────────────────────────
export type ConnectionStatus = "Pending" | "Accepted" | "Rejected" | "Blocked";

export interface ConnectionResponse {
  id: string;
  requesterId: string;
  requesterFullName: string;
  requesterUsername: string;
  requesterAvatarUrl?: string | null;
  addresseeId: string;
  addresseeFullName: string;
  addresseeUsername: string;
  addresseeAvatarUrl?: string | null;
  status: ConnectionStatus;
  createdAt: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType =
  | "MeetingInvite"
  | "ConnectionRequest"
  | "ConnectionAccepted"
  | "MeetingReminder";

export interface NotificationResponse {
  id: string;
  recipientId: string;
  type: NotificationType;
  message: string;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── Calendar Note ────────────────────────────────────────────────────────────
export interface CalendarNoteResponse {
  id: string;
  profileId: string;
  /** DateOnly — "YYYY-MM-DD" formatinda. */
  date: string;
  content: string;
  createdAt: string;
}

// ─── ICE Servers ─────────────────────────────────────────────────────────────
export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

export interface IceServersResponse {
  iceServers: IceServer[];
}

// ─── Generic API Error ────────────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
}
