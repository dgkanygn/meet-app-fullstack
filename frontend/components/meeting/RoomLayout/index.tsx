"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Copy, Check, X, ArrowLeft } from "lucide-react";
import VideoGrid from "@/components/meeting/VideoGrid";
import ControlBar from "@/components/meeting/ControlBar";
import Avatar from "@/components/ui/Avatar";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import { useMeeting } from "@/lib/hooks/useMeeting";
import { meetingService } from "@/lib/services/meetingService";
import { profileService } from "@/lib/services/profileService";
import type { ProfileResponse } from "@/lib/types";

interface RoomLayoutProps {
  meetingId: string;
}

export default function RoomLayout({ meetingId }: RoomLayoutProps) {
  const router = useRouter();
  const { meeting, isLoading: meetingLoading, error: meetingError } = useMeeting(meetingId);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Hub, katılımcı olmayan bağlantıları reddediyor. Paylaşılan bir bağlantıyla
  // gelen kullanıcı için önce katılım kaydı oluşturulur; ancak bu bittikten
  // sonra sinyalleşme başlatılır.
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [admissionError, setAdmissionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    meetingService
      .join(meetingId)
      .then(() => !cancelled && setIsAdmitted(true))
      .catch((err: unknown) => {
        if (cancelled) return;
        // 403 → şifreli toplantı; kullanıcıyı katılım formuna yönlendiriyoruz.
        const status = (err as { status?: number })?.status;
        if (status === 403) {
          router.replace(`/join?meetingId=${meetingId}`);
          return;
        }
        setAdmissionError(
          err instanceof Error ? err.message : "Toplantıya katılınamadı."
        );
      });
    return () => {
      cancelled = true;
    };
  }, [meetingId, router]);

  const {
    localStream,
    remotePeers,
    isConnecting,
    error: rtcError,
    mediaWarning,
    isMicOn,
    isCamOn,
    isScreenSharing,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  } = useWebRTC(isAdmitted ? meetingId : "");

  // Oda (app) layout'unun dışında olduğu için profil burada ayrıca çekilir.
  useEffect(() => {
    let cancelled = false;
    profileService
      .getMe()
      .then((p) => !cancelled && setProfile(p))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // profileId → görünen ad eşlemesi; uzak karoları isimlendirmek için.
  const nameByUserId = useMemo(() => {
    const map: Record<string, string> = {};
    meeting?.participants.forEach((p) => {
      map[p.profileId] = p.profileFullName;
    });
    if (meeting) map[meeting.hostId] ??= meeting.hostFullName;
    return map;
  }, [meeting]);

  const acceptedParticipants = useMemo(
    () => meeting?.participants.filter((p) => p.status === "Accepted") ?? [],
    [meeting]
  );

  // Odada gerçekten bağlı olan kullanıcılar (kendimiz dahil).
  const onlineUserIds = useMemo(
    () => new Set([profile?.id, ...remotePeers.map((p) => p.userId)].filter(Boolean)),
    [profile?.id, remotePeers]
  );

  const connectionState: "connecting" | "live" | "failed" = rtcError
    ? "failed"
    : !isAdmitted || isConnecting
      ? "connecting"
      : "live";

  async function handleLeave() {
    try {
      await meetingService.leave(meetingId);
    } catch {
      // Ayrılma kaydı tutulamasa da kullanıcıyı odadan çıkar.
    }
    router.push("/dashboard");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      /* pano erişimi yoksa sessizce geç */
    }
  }

  // Toplantı bulunamadı / erişim yok
  const fatalError = meetingError ?? admissionError;
  if (fatalError && !meetingLoading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#171512] px-6 text-center">
        <p className="text-sm text-[#D9695C]">{fatalError}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#332F2A] px-4 py-2 text-sm text-[#F2EFEA] transition-colors hover:bg-[#332F2A]"
        >
          <ArrowLeft size={14} />
          Dashboard&apos;a dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-[#171512]">
      {/* Üst bar */}
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-[#332F2A] px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[#E07A45]">
            <Zap size={10} className="text-[#171512]" />
          </div>
          <span className="hidden text-xs font-medium text-[#F2EFEA] sm:inline">
            Meet
          </span>
          <span className="ml-1 truncate text-xs text-[#A39C93]">
            {meeting?.title ?? "Yükleniyor..."}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleCopyLink}
            title="Davet bağlantısını kopyala"
            className="flex cursor-pointer items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs text-[#A39C93] transition-colors hover:bg-[#332F2A] hover:text-[#F2EFEA]"
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            <span className="hidden sm:inline">
              {isCopied ? "Kopyalandı" : "Bağlantıyı kopyala"}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div
              className={[
                "h-1.5 w-1.5 rounded-full",
                connectionState === "live"
                  ? "animate-pulse bg-[#4C9770]"
                  : connectionState === "failed"
                    ? "bg-[#D9695C]"
                    : "bg-[#A39C93]",
              ].join(" ")}
            />
            <span className="text-xs text-[#A39C93]">
              {connectionState === "live"
                ? "Canlı"
                : connectionState === "failed"
                  ? "Bağlantı yok"
                  : "Bağlanıyor"}
            </span>
          </div>
        </div>
      </header>

      {(rtcError || mediaWarning) && (
        <div
          className={[
            "shrink-0 px-4 py-2 text-center text-xs",
            rtcError ? "bg-[#B23A2E]/20 text-[#D9695C]" : "bg-[#332F2A] text-[#A39C93]",
          ].join(" ")}
        >
          {rtcError ?? mediaWarning}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <VideoGrid
          localStream={localStream}
          localLabel={profile?.fullName ?? "Sen"}
          isMicOn={isMicOn}
          remotePeers={remotePeers}
          nameByUserId={nameByUserId}
        />

        {/* Katılımcı paneli — mobilde tam ekran örtü, masaüstünde yan panel */}
        {isParticipantsOpen && (
          <>
            <div
              className="fixed inset-0 z-20 bg-black/50 md:hidden"
              onClick={() => setIsParticipantsOpen(false)}
            />
            <aside className="fixed inset-y-0 right-0 z-30 flex w-72 max-w-[85vw] flex-col border-l border-[#332F2A] bg-[#201E1B] md:static md:z-auto md:w-64 md:max-w-none">
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#332F2A] px-4">
                <h2 className="text-xs font-semibold text-[#F2EFEA]">
                  Katılımcılar ({acceptedParticipants.length})
                </h2>
                <button
                  onClick={() => setIsParticipantsOpen(false)}
                  aria-label="Katılımcı panelini kapat"
                  className="cursor-pointer text-[#A39C93] transition-colors hover:text-[#F2EFEA]"
                >
                  <X size={14} />
                </button>
              </div>

              <ul className="flex-1 space-y-1 overflow-y-auto p-2">
                {acceptedParticipants.length === 0 && (
                  <li className="px-2 py-3 text-xs text-[#A39C93]">
                    Katılımcı bilgisi yüklenemedi.
                  </li>
                )}
                {acceptedParticipants.map((participant) => {
                  const isOnline = onlineUserIds.has(participant.profileId);
                  return (
                    <li
                      key={participant.id}
                      className="flex items-center gap-2.5 rounded-[6px] px-2 py-2"
                    >
                      <Avatar name={participant.profileUsername} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-[#F2EFEA]">
                          {participant.profileFullName}
                          {participant.profileId === profile?.id && " (Sen)"}
                        </p>
                        <p className="truncate text-[10px] text-[#A39C93]">
                          @{participant.profileUsername}
                        </p>
                      </div>
                      <span
                        title={isOnline ? "Odada" : "Bağlı değil"}
                        className={[
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          isOnline ? "bg-[#4C9770]" : "bg-[#544E47]",
                        ].join(" ")}
                      />
                    </li>
                  );
                })}
              </ul>
            </aside>
          </>
        )}
      </div>

      <ControlBar
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        isScreenSharing={isScreenSharing}
        participantCount={remotePeers.length + 1}
        isParticipantsOpen={isParticipantsOpen}
        hasLocalMedia={!!localStream}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleScreenShare={toggleScreenShare}
        onToggleParticipants={() => setIsParticipantsOpen((o) => !o)}
        onLeave={handleLeave}
      />
    </div>
  );
}
