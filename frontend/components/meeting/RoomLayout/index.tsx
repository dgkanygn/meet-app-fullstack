"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Copy,
  Check,
  X,
  ArrowLeft,
  Clock,
  UserX,
  ShieldAlert,
  Users,
} from "lucide-react";
import VideoGrid from "@/components/meeting/VideoGrid";
import ControlBar from "@/components/meeting/ControlBar";
import ChatPanel from "@/components/meeting/ChatPanel";
import WaitingRoom from "@/components/meeting/WaitingRoom";
import Avatar from "@/components/ui/Avatar";
import { useWebRTC, WaitingUser } from "@/lib/hooks/useWebRTC";
import { useMeeting } from "@/lib/hooks/useMeeting";
import { meetingService } from "@/lib/services/meetingService";
import { participantService } from "@/lib/services/participantService";
import { profileService } from "@/lib/services/profileService";
import { createHubConnection } from "@/lib/signalr";
import type { ProfileResponse, ParticipantResponse } from "@/lib/types";

interface RoomLayoutProps {
  meetingId: string;
}

export default function RoomLayout({ meetingId }: RoomLayoutProps) {
  const router = useRouter();
  const { meeting, isLoading: meetingLoading, error: meetingError } = useMeeting(meetingId);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Bekleme odası ve onay durumları
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [admissionError, setAdmissionError] = useState<string | null>(null);

  // Oda kurucusu için bekleme bildirimleri
  const [participantsList, setParticipantsList] = useState<ParticipantResponse[]>([]);
  const [newWaitingToast, setNewWaitingToast] = useState<WaitingUser | null>(null);

  // Profil bilgisi
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

  // Toplantı yüklendiğinde katılımcı listesini başlat
  useEffect(() => {
    if (meeting?.participants) {
      setParticipantsList(meeting.participants);
    }
  }, [meeting?.participants]);

  const isHost = useMemo(
    () => !!profile?.id && !!meeting?.hostId && profile.id === meeting.hostId,
    [profile?.id, meeting?.hostId]
  );

  // Toplantıya katılma isteği başlatma
  useEffect(() => {
    let cancelled = false;
    meetingService
      .join(meetingId)
      .then((res) => {
        if (cancelled) return;
        if (res?.status === "Waiting") {
          setIsWaiting(true);
          setIsAdmitted(false);
        } else {
          setIsWaiting(false);
          setIsAdmitted(true);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
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

  // Bekleme odasındayken host onayını / reddini dinle
  useEffect(() => {
    if (!isWaiting) return;
    const connection = createHubConnection("/hubs/meeting", { meetingId });

    connection.on("JoinApproved", () => {
      setIsWaiting(false);
      setIsAdmitted(true);
    });

    connection.on("JoinRejected", () => {
      setIsWaiting(false);
      setIsRejected(true);
    });

    connection.start().catch(() => {});

    return () => {
      connection.stop().catch(() => {});
    };
  }, [isWaiting, meetingId]);

  // Katılımcıları backend'den yenile
  const refreshParticipants = useCallback(() => {
    participantService
      .getParticipants(meetingId)
      .then((pts) => {
        setParticipantsList(pts);
      })
      .catch(() => {});
  }, [meetingId]);

  // WebRTC ve Realtime Oda Sinyalleşmesi
  const {
    localStream,
    remotePeers,
    isConnecting,
    error: rtcError,
    mediaWarning,
    isMicOn,
    isCamOn,
    isScreenSharing,
    chatMessages,
    isKicked,
    sendChatMessage,
    toggleMic,
    toggleCam,
    toggleScreenShare,
  } = useWebRTC(isAdmitted ? meetingId : "", {
    currentUserId: profile?.id,
    onWaitingRoomUpdated: refreshParticipants,
    onUserWaiting: (user) => {
      refreshParticipants();
      setNewWaitingToast(user);
    },
    onParticipantApproved: () => {
      refreshParticipants();
      setNewWaitingToast(null);
    },
    onParticipantRemoved: () => {
      refreshParticipants();
    },
  });

  // Yeni gelen okunmamış mesajları say
  const prevMessagesLengthRef = useRef(0);
  useEffect(() => {
    if (chatMessages.length > prevMessagesLengthRef.current) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (!isChatOpen && lastMsg && lastMsg.senderId !== profile?.id) {
        setUnreadChatCount((prev) => prev + 1);
      }
    }
    prevMessagesLengthRef.current = chatMessages.length;
  }, [chatMessages, isChatOpen, profile?.id]);

  // Panel geçişleri
  function handleToggleParticipants() {
    setIsParticipantsOpen((open) => {
      if (!open) setIsChatOpen(false);
      return !open;
    });
  }

  function handleToggleChat() {
    setIsChatOpen((open) => {
      if (!open) {
        setIsParticipantsOpen(false);
        setUnreadChatCount(0);
      }
      return !open;
    });
  }

  // Host onay / red işlemleri
  async function handleApprove(participantId: string) {
    try {
      await participantService.approve(meetingId, participantId);
      refreshParticipants();
      setNewWaitingToast(null);
    } catch (err) {
      console.error("Katılımcı onaylanamadı", err);
    }
  }

  async function handleReject(participantId: string) {
    try {
      await participantService.reject(meetingId, participantId);
      refreshParticipants();
      setNewWaitingToast(null);
    } catch (err) {
      console.error("Katılımcı reddedilemedi", err);
    }
  }

  // Host katılımcıyı odadan atma
  async function handleKick(participantId: string, participantName: string) {
    if (!window.confirm(`${participantName} adlı kullanıcıyı odadan atmak istediğinize emin misiniz?`)) {
      return;
    }
    try {
      await participantService.remove(meetingId, participantId);
      refreshParticipants();
    } catch (err) {
      console.error("Katılımcı odadan atılamadı", err);
    }
  }

  // profileId → görünen ad eşlemesi; uzak karoları isimlendirmek için
  const nameByUserId = useMemo(() => {
    const map: Record<string, string> = {};
    participantsList.forEach((p) => {
      map[p.profileId] = p.profileFullName;
    });
    if (meeting) map[meeting.hostId] ??= meeting.hostFullName;
    return map;
  }, [participantsList, meeting]);

  const acceptedParticipants = useMemo(
    () => participantsList.filter((p) => p.status === "Accepted"),
    [participantsList]
  );

  const waitingParticipants = useMemo(
    () => participantsList.filter((p) => p.status === "Waiting"),
    [participantsList]
  );

  // Odada gerçekten bağlı olan kullanıcılar
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
      /* sessizce geç */
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

  // Toplantıdan çıkarılan kullanıcı görünümü
  if (isKicked) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-[#171512] px-6 text-center select-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D9695C]/30 bg-[#D9695C]/10 text-[#D9695C]">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h1 className="text-base font-semibold text-[#F2EFEA]">
            Toplantıdan Çıkarıldınız
          </h1>
          <p className="text-xs text-[#A39C93] leading-relaxed">
            Oda kurucusu tarafından bu toplantıdan çıkarıldınız.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#332F2A] bg-[#201E1B] px-4 py-2 text-xs font-medium text-[#F2EFEA] transition-colors hover:bg-[#332F2A]"
        >
          <ArrowLeft size={14} />
          Dashboard&apos;a dön
        </button>
      </div>
    );
  }

  // Bekleme odası (Host onayı bekleniyor veya istek reddedildi)
  if (isWaiting || isRejected) {
    return (
      <WaitingRoom
        meetingTitle={meeting?.title}
        hostFullName={meeting?.hostFullName}
        isRejected={isRejected}
        onCancel={handleLeave}
      />
    );
  }

  // Toplantı süresi dolmuş / sona ermiş
  const isExpired =
    !!meeting?.endedAt ||
    admissionError === "Bu davet bağlantısı eskimiş." ||
    meetingError === "Bu davet bağlantısı eskimiş.";

  if (isExpired && !meetingLoading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-[#171512] px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#332F2A] bg-[#201E1B] text-[#A39C93]">
          <Clock size={20} />
        </div>
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-[#F2EFEA]">
            Bu davet bağlantısı eskimiş
          </h1>
          <p className="max-w-sm text-xs text-[#A39C93]">
            Toplantı sona erdi veya tüm katılımcılar ayrıldı. Bu bağlantı artık kullanılamaz.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#332F2A] bg-[#201E1B] px-4 py-2 text-xs font-medium text-[#F2EFEA] transition-colors hover:bg-[#332F2A]"
        >
          <ArrowLeft size={14} />
          Dashboard&apos;a dön
        </button>
      </div>
    );
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

      <div className="relative flex min-h-0 flex-1">
        {/* Oda Kurucusu için Yüzen Katılma Bildirimi */}
        {isHost && newWaitingToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-[8px] border border-[#E07A45]/40 bg-[#201E1B]/95 px-4 py-2.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex h-2.5 w-2.5 rounded-full bg-[#E07A45] animate-pulse shrink-0" />
            <div className="text-xs text-[#F2EFEA]">
              <span className="font-semibold">{newWaitingToast.fullName}</span> odaya katılmak istiyor
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => handleApprove(newWaitingToast.participantId)}
                className="flex cursor-pointer items-center gap-1 rounded-[4px] bg-[#4C9770] px-2.5 py-1 text-xs font-medium text-[#171512] transition-colors hover:bg-[#3D7C5C]"
              >
                <Check size={12} />
                Kabul Et
              </button>
              <button
                onClick={() => handleReject(newWaitingToast.participantId)}
                className="flex cursor-pointer items-center gap-1 rounded-[4px] bg-[#332F2A] px-2 py-1 text-xs text-[#A39C93] transition-colors hover:bg-[#D9695C]/20 hover:text-[#D9695C]"
              >
                <X size={12} />
                Reddet
              </button>
            </div>
          </div>
        )}

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
            <aside className="fixed inset-y-0 right-0 z-30 flex w-72 max-w-[85vw] flex-col border-l border-[#332F2A] bg-[#201E1B] md:static md:z-auto md:w-72 md:max-w-none">
              <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#332F2A] px-4">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-[#E07A45]" />
                  <h2 className="text-xs font-semibold text-[#F2EFEA]">
                    Katılımcılar ({acceptedParticipants.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsParticipantsOpen(false)}
                  aria-label="Katılımcı panelini kapat"
                  className="cursor-pointer text-[#A39C93] transition-colors hover:text-[#F2EFEA]"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Host İçin Bekleme Odası Bölümü */}
              {isHost && waitingParticipants.length > 0 && (
                <div className="border-b border-[#332F2A] bg-[#171512]/60 p-2.5">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E07A45]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E07A45] animate-pulse" />
                      Bekleme Odası ({waitingParticipants.length})
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {waitingParticipants.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-[6px] border border-[#332F2A] bg-[#201E1B] p-2"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Avatar name={p.profileUsername} size="xs" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-[#F2EFEA]">
                              {p.profileFullName}
                            </p>
                            <p className="truncate text-[10px] text-[#A39C93]">
                              @{p.profileUsername}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => handleApprove(p.id)}
                            title="Kabul Et"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] bg-[#4C9770]/20 text-[#4C9770] transition-colors hover:bg-[#4C9770]/40"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            title="Reddet"
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[4px] bg-[#D9695C]/20 text-[#D9695C] transition-colors hover:bg-[#D9695C]/40"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kabul Edilmiş Katılımcılar Listesi */}
              <ul className="flex-1 space-y-1 overflow-y-auto p-2">
                {acceptedParticipants.length === 0 && (
                  <li className="px-2 py-3 text-xs text-[#A39C93]">
                    Katılımcı bilgisi yüklenemedi.
                  </li>
                )}
                {acceptedParticipants.map((participant) => {
                  const isOnline = onlineUserIds.has(participant.profileId);
                  const isParticipantHost = participant.profileId === meeting?.hostId;
                  const canKick = isHost && participant.profileId !== profile?.id;

                  return (
                    <li
                      key={participant.id}
                      className="group flex items-center gap-2.5 rounded-[6px] px-2 py-2 transition-colors hover:bg-[#2A2621]"
                    >
                      <Avatar name={participant.profileUsername} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs text-[#F2EFEA]">
                            {participant.profileFullName}
                            {participant.profileId === profile?.id && " (Sen)"}
                          </p>
                          {isParticipantHost && (
                            <span className="rounded bg-[#E07A45]/20 px-1 py-0.2 text-[9px] font-semibold text-[#E07A45]">
                              Kurucu
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[10px] text-[#A39C93]">
                          @{participant.profileUsername}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          title={isOnline ? "Odada" : "Bağlı değil"}
                          className={[
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            isOnline ? "bg-[#4C9770]" : "bg-[#544E47]",
                          ].join(" ")}
                        />

                        {/* Oda Kurucusu Odadan Atma Düğmesi */}
                        {canKick && (
                          <button
                            onClick={() => handleKick(participant.id, participant.profileFullName)}
                            title={`${participant.profileFullName} adlı katılımcıyı odadan at`}
                            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[4px] text-[#A39C93] transition-colors hover:bg-[#D9695C]/20 hover:text-[#D9695C]"
                          >
                            <UserX size={13} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </>
        )}

        {/* Canlı Sohbet Paneli — Mobilde ekranı tam kaplar, masaüstünde sağ yan panel */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={chatMessages}
          onSendMessage={sendChatMessage}
          currentUserId={profile?.id}
        />
      </div>

      <ControlBar
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        isScreenSharing={isScreenSharing}
        participantCount={remotePeers.length + 1}
        isParticipantsOpen={isParticipantsOpen}
        isChatOpen={isChatOpen}
        unreadChatCount={unreadChatCount}
        hasLocalMedia={!!localStream}
        onToggleMic={toggleMic}
        onToggleCam={toggleCam}
        onToggleScreenShare={toggleScreenShare}
        onToggleParticipants={handleToggleParticipants}
        onToggleChat={handleToggleChat}
        onLeave={handleLeave}
      />
    </div>
  );
}
