"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Users,
  PhoneOff,
} from "lucide-react";

interface ControlBarProps {
  isMicOn: boolean;
  isCamOn: boolean;
  isScreenSharing: boolean;
  participantCount: number;
  isParticipantsOpen: boolean;
  hasLocalMedia: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
}

const baseButton =
  "flex h-10 w-10 items-center justify-center rounded-[6px] cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const idleButton =
  "text-[#F2EFEA] border border-[#332F2A] hover:bg-[#332F2A]";
const offButton =
  "text-[#D9695C] bg-[#D9695C]/10 border border-[#D9695C]/30";
const activeButton =
  "text-[#E07A45] bg-[#E07A45]/10 border border-[#E07A45]/30";

export default function ControlBar({
  isMicOn,
  isCamOn,
  isScreenSharing,
  participantCount,
  isParticipantsOpen,
  hasLocalMedia,
  onToggleMic,
  onToggleCam,
  onToggleScreenShare,
  onToggleParticipants,
  onLeave,
}: ControlBarProps) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-center gap-2 border-t border-[#332F2A] bg-[#171512] px-3 sm:px-6">
      <button
        onClick={onToggleMic}
        disabled={!hasLocalMedia}
        title={isMicOn ? "Mikrofonu Kapat" : "Mikrofonu Aç"}
        aria-label={isMicOn ? "Mikrofonu Kapat" : "Mikrofonu Aç"}
        className={[baseButton, isMicOn ? idleButton : offButton].join(" ")}
      >
        {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
      </button>

      <button
        onClick={onToggleCam}
        disabled={!hasLocalMedia}
        title={isCamOn ? "Kamerayı Kapat" : "Kamerayı Aç"}
        aria-label={isCamOn ? "Kamerayı Kapat" : "Kamerayı Aç"}
        className={[baseButton, isCamOn ? idleButton : offButton].join(" ")}
      >
        {isCamOn ? <Video size={18} /> : <VideoOff size={18} />}
      </button>

      {/* Ekran paylaşımı mobil tarayıcılarda desteklenmiyor — küçük ekranda gizli */}
      <button
        onClick={onToggleScreenShare}
        title={isScreenSharing ? "Paylaşımı Durdur" : "Ekran Paylaş"}
        aria-label={isScreenSharing ? "Paylaşımı Durdur" : "Ekran Paylaş"}
        className={[
          baseButton,
          "hidden sm:flex",
          isScreenSharing ? activeButton : idleButton,
        ].join(" ")}
      >
        {isScreenSharing ? <MonitorOff size={18} /> : <Monitor size={18} />}
      </button>

      <button
        onClick={onToggleParticipants}
        title="Katılımcılar"
        aria-label="Katılımcılar"
        aria-pressed={isParticipantsOpen}
        className={[
          baseButton,
          "relative",
          isParticipantsOpen ? activeButton : idleButton,
        ].join(" ")}
      >
        <Users size={18} />
        {participantCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E07A45] px-1 text-[10px] font-semibold text-[#171512]">
            {participantCount}
          </span>
        )}
      </button>

      <div className="mx-1 h-6 w-px bg-[#332F2A]" />

      <button
        onClick={onLeave}
        title="Ayrıl"
        aria-label="Toplantıdan ayrıl"
        className={[
          baseButton,
          "border border-[#B23A2E]/30 bg-[#B23A2E]/20 text-[#D9695C] hover:bg-[#B23A2E]/40",
        ].join(" ")}
      >
        <PhoneOff size={18} />
      </button>
    </div>
  );
}
