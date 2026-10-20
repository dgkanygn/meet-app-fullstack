"use client";

/**
 * useWebRTC — MeetingHub üzerinden mesh topolojili görüntülü görüşme,
 * canlı sohbet ve oda bildirimleri.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { createHubConnection } from "@/lib/signalr";
import { meetingService } from "@/lib/services/meetingService";
import type { IceServer, ChatMessage } from "@/lib/types";

export interface RemotePeer {
  connectionId: string;
  userId: string;
  stream: MediaStream;
}

interface SignalPayload {
  fromConnectionId: string;
  fromUserId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface PeerEntry {
  pc: RTCPeerConnection;
  userId: string;
  /** setRemoteDescription öncesi gelen adaylar burada bekletilir. */
  pendingCandidates: RTCIceCandidateInit[];
}

export interface WaitingUser {
  meetingId: string;
  profileId: string;
  participantId: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
}

export interface UseWebRTCOptions {
  currentUserId?: string;
  onWaitingRoomUpdated?: () => void;
  onUserWaiting?: (user: WaitingUser) => void;
  onParticipantApproved?: (payload: { participantId: string; profileId: string }) => void;
  onParticipantRemoved?: (payload: { participantId: string; profileId: string }) => void;
}

const FALLBACK_ICE: IceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export function useWebRTC(meetingId: string, options?: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Canlı sohbet ve katılımcı durumu
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isKicked, setIsKicked] = useState(false);

  const connectionRef = useRef<HubConnection | null>(null);
  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const iceConfigRef = useRef<RTCConfiguration>({ iceServers: FALLBACK_ICE });

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const removePeer = useCallback((connectionId: string) => {
    const entry = peersRef.current.get(connectionId);
    if (!entry) return;
    entry.pc.onicecandidate = null;
    entry.pc.ontrack = null;
    entry.pc.onconnectionstatechange = null;
    entry.pc.close();
    peersRef.current.delete(connectionId);
    setRemotePeers((prev) => prev.filter((p) => p.connectionId !== connectionId));
  }, []);

  /** Var olan peer'ı döner, yoksa kurar. */
  const ensurePeer = useCallback(
    (connectionId: string, userId: string): PeerEntry => {
      const existing = peersRef.current.get(connectionId);
      if (existing) return existing;

      const pc = new RTCPeerConnection(iceConfigRef.current);
      const entry: PeerEntry = { pc, userId, pendingCandidates: [] };
      peersRef.current.set(connectionId, entry);

      // Yerel medyayı bağlantıya ekle
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          connectionRef.current
            ?.invoke("SendIceCandidate", connectionId, event.candidate.toJSON())
            .catch(() => {});
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (!remoteStream) return;
        setRemotePeers((prev) => {
          const without = prev.filter((p) => p.connectionId !== connectionId);
          return [...without, { connectionId, userId, stream: remoteStream }];
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          removePeer(connectionId);
        }
      };

      return entry;
    },
    [removePeer]
  );

  /** Beklemedeki ICE adaylarını remote description hazır olunca uygular. */
  async function flushCandidates(entry: PeerEntry) {
    const queued = entry.pendingCandidates.splice(0);
    for (const candidate of queued) {
      await entry.pc.addIceCandidate(candidate).catch(() => {});
    }
  }

  // ─── Bağlantı kurulumu ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingId) return;

    let isCancelled = false;
    let startPromise: Promise<void> | null = null;
    const peers = peersRef.current;

    async function connect() {
      setIsConnecting(true);
      setError(null);
      setIsKicked(false);

      // 1) ICE sunucuları — alınamazsa public STUN ile devam edilir.
      try {
        const { iceServers } = await meetingService.getIceServers();
        if (iceServers?.length) {
          iceConfigRef.current = { iceServers };
        }
      } catch {
        /* fallback zaten ayarlı */
      }

      // 2) Kamera ve mikrofon
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch {
        // Kamera/mikrofon reddedilse bile odaya izleyici olarak girilebilir.
        setMediaWarning(
          "Kamera veya mikrofona erişilemedi. Diğer katılımcıları görebilirsin ama seni göremezler."
        );
      }

      if (isCancelled) return;

      // 3) Sinyalleşme kanalı
      const connection = createHubConnection("/hubs/meeting", { meetingId });
      connectionRef.current = connection;

      connection.on("UserJoined", async (payload: { userId: string; connectionId: string }) => {
        // Odada zaten bulunan taraf teklifi başlatır.
        const entry = ensurePeer(payload.connectionId, payload.userId);
        try {
          const offer = await entry.pc.createOffer();
          await entry.pc.setLocalDescription(offer);
          await connection.invoke("SendOffer", payload.connectionId, offer);
        } catch {
          removePeer(payload.connectionId);
        }
      });

      connection.on("ReceiveOffer", async (payload: SignalPayload) => {
        if (!payload.offer) return;
        const entry = ensurePeer(payload.fromConnectionId, payload.fromUserId);
        try {
          await entry.pc.setRemoteDescription(payload.offer);
          await flushCandidates(entry);
          const answer = await entry.pc.createAnswer();
          await entry.pc.setLocalDescription(answer);
          await connection.invoke("SendAnswer", payload.fromConnectionId, answer);
        } catch {
          removePeer(payload.fromConnectionId);
        }
      });

      connection.on("ReceiveAnswer", async (payload: SignalPayload) => {
        if (!payload.answer) return;
        const entry = peersRef.current.get(payload.fromConnectionId);
        if (!entry) return;
        try {
          await entry.pc.setRemoteDescription(payload.answer);
          await flushCandidates(entry);
        } catch {
          removePeer(payload.fromConnectionId);
        }
      });

      connection.on("ReceiveIceCandidate", async (payload: SignalPayload) => {
        if (!payload.candidate) return;
        const entry = peersRef.current.get(payload.fromConnectionId);
        if (!entry) return;

        // Remote description henüz set edilmediyse aday sıraya alınır.
        if (!entry.pc.remoteDescription) {
          entry.pendingCandidates.push(payload.candidate);
          return;
        }
        await entry.pc.addIceCandidate(payload.candidate).catch(() => {});
      });

      connection.on("UserLeft", (payload: { connectionId?: string; userId?: string }) => {
        if (payload.connectionId) {
          removePeer(payload.connectionId);
        } else if (payload.userId) {
          peersRef.current.forEach((entry, connId) => {
            if (entry.userId === payload.userId) {
              removePeer(connId);
            }
          });
        }
      });

      // ─── Sohbet Mesajı ──────────────────────────────────────────────────────
      connection.on("ReceiveChatMessage", (msg: ChatMessage) => {
        setChatMessages((prev) => [...prev, msg]);
      });

      // ─── Toplantıdan Atılma ────────────────────────────────────────────────
      connection.on("KickedFromMeeting", (payload?: { kickedUserId?: string }) => {
        const myId = optionsRef.current?.currentUserId;
        if (!payload?.kickedUserId || !myId || payload.kickedUserId === myId) {
          // Yerel medyayı ve bağlantıları kapat
          localStreamRef.current?.getTracks().forEach((t) => t.stop());
          localStreamRef.current = null;
          setLocalStream(null);

          screenStreamRef.current?.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;

          peersRef.current.forEach((entry) => {
            entry.pc.close();
          });
          peersRef.current.clear();
          setRemotePeers([]);

          setIsKicked(true);
        }
      });

      // ─── Bekleme Odası ve Katılımcı Olayları ──────────────────────────────
      connection.on("WaitingRoomUpdated", () => {
        optionsRef.current?.onWaitingRoomUpdated?.();
      });

      connection.on("UserWaiting", (user: WaitingUser) => {
        optionsRef.current?.onUserWaiting?.(user);
      });

      connection.on("ParticipantApproved", (payload: { participantId: string; profileId: string }) => {
        optionsRef.current?.onParticipantApproved?.(payload);
      });

      connection.on("ParticipantRemoved", (payload: { participantId: string; profileId: string }) => {
        optionsRef.current?.onParticipantRemoved?.(payload);
      });

      startPromise = connection.start();
      try {
        await startPromise;
        if (!isCancelled) setIsConnecting(false);
      } catch {
        if (!isCancelled) {
          setError(
            "Toplantıya bağlanılamadı. Toplantıya katılma yetkin olduğundan emin ol."
          );
          setIsConnecting(false);
        }
      }
    }

    connect();

    return () => {
      isCancelled = true;

      peers.forEach((entry) => {
        entry.pc.onicecandidate = null;
        entry.pc.ontrack = null;
        entry.pc.onconnectionstatechange = null;
        entry.pc.close();
      });
      peers.clear();
      setRemotePeers([]);

      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);

      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;

      const connection = connectionRef.current;
      connectionRef.current = null;
      if (connection) {
        Promise.resolve(startPromise)
          .catch(() => {})
          .finally(() => connection.stop().catch(() => {}));
      }
    };
  }, [meetingId, ensurePeer, removePeer]);

  // ─── Kontroller ────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    if (tracks.length === 0) return;
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setIsMicOn(next);
  }, []);

  const toggleCam = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    if (tracks.length === 0) return;
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setIsCamOn(next);
  }, []);

  /** Tüm peer'larda giden video izini değiştirir. */
  const replaceVideoTrackForAllPeers = useCallback((track: MediaStreamTrack | null) => {
    peersRef.current.forEach((entry) => {
      const sender = entry.pc.getSenders().find((s) => s.track?.kind === "video");
      sender?.replaceTrack(track).catch(() => {});
    });
  }, []);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] ?? null;
    replaceVideoTrackForAllPeers(cameraTrack);
    setIsScreenSharing(false);
  }, [replaceVideoTrackForAllPeers]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;

      const [screenTrack] = screenStream.getVideoTracks();
      replaceVideoTrackForAllPeers(screenTrack);
      setIsScreenSharing(true);

      // Tarayıcının kendi "paylaşımı durdur" düğmesi de dinlenir.
      screenTrack.addEventListener("ended", stopScreenShare, { once: true });
    } catch {
      // Kullanıcı paylaşım penceresini iptal etti — sessizce yoksay.
    }
  }, [isScreenSharing, replaceVideoTrackForAllPeers, stopScreenShare]);

  const sendChatMessage = useCallback(async (text: string) => {
    if (!text.trim() || !connectionRef.current) return;
    await connectionRef.current.invoke("SendChatMessage", text.trim());
  }, []);

  return {
    localStream,
    remotePeers,
    isConnecting,
    error,
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
  };
}
