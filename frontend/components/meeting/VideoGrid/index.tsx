"use client";

import VideoTile from "@/components/meeting/VideoTile";
import type { RemotePeer } from "@/lib/hooks/useWebRTC";

interface VideoGridProps {
  localStream: MediaStream | null;
  localLabel: string;
  isMicOn: boolean;
  remotePeers: RemotePeer[];
  /** profileId → görünen ad. Katılımcı listesinden gelir. */
  nameByUserId: Record<string, string>;
}

/**
 * Katılımcı sayısına göre sütun sayısı. Mobilde tek sütun kalır ki
 * karolar okunabilir boyutta olsun.
 */
function getGridClass(total: number): string {
  if (total <= 1) return "grid-cols-1";
  if (total === 2) return "grid-cols-1 sm:grid-cols-2";
  if (total <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (total <= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
}

export default function VideoGrid({
  localStream,
  localLabel,
  isMicOn,
  remotePeers,
  nameByUserId,
}: VideoGridProps) {
  const total = remotePeers.length + 1;

  return (
    <div
      className={[
        "min-h-0 flex-1 auto-rows-fr gap-2 overflow-y-auto p-3 sm:p-4",
        "grid",
        getGridClass(total),
      ].join(" ")}
    >
      <VideoTile
        stream={localStream}
        label={`${localLabel} (Sen)`}
        isLocal
        isMuted={!isMicOn}
      />

      {remotePeers.map((peer) => (
        <VideoTile
          key={peer.connectionId}
          stream={peer.stream}
          label={nameByUserId[peer.userId] ?? "Katılımcı"}
        />
      ))}

      {remotePeers.length === 0 && (
        <div className="flex min-h-[140px] items-center justify-center rounded-[8px] border border-dashed border-[#332F2A] p-4">
          <p className="text-center text-xs text-[#A39C93]">
            Henüz kimse katılmadı.
            <br />
            Toplantı bağlantısını paylaşarak davet edebilirsin.
          </p>
        </div>
      )}
    </div>
  );
}
