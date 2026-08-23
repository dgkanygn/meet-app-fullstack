"use client";

import { useEffect, useRef } from "react";
import { MicOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  /** Kendi görüntümüz aynalanır ve sesi geri beslememek için susturulur. */
  isLocal?: boolean;
  isMuted?: boolean;
}

export default function VideoTile({
  stream,
  label,
  isLocal = false,
  isMuted = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // srcObject bir DOM özelliği; JSX attribute'u olarak verilemez.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = !!stream && stream.getVideoTracks().some((t) => t.enabled);
  const initial = label.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative flex min-h-[140px] items-center justify-center overflow-hidden rounded-[8px] border border-[#332F2A] bg-[#201E1B]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={[
          "h-full w-full object-cover",
          isLocal ? "-scale-x-100" : "",
          hasVideo ? "" : "invisible",
        ].join(" ")}
      />

      {/* Kamera kapalıysa baş harf gösterilir */}
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E07A45]/20 bg-[#E07A45]/15">
            <span className="text-lg font-semibold text-[#E07A45]">{initial}</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-[4px] bg-[#171512]/80 px-2 py-0.5">
        {isMuted && <MicOff size={11} className="shrink-0 text-[#D9695C]" />}
        <span className="truncate text-xs text-[#F2EFEA]">{label}</span>
      </div>
    </div>
  );
}
