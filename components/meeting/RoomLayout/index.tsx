import VideoGrid from "@/components/meeting/VideoGrid";
import ControlBar from "@/components/meeting/ControlBar";
import { Zap } from "lucide-react";

interface RoomLayoutProps {
  meetingId: string;
}

export default function RoomLayout({ meetingId }: RoomLayoutProps) {
  return (
    <div className="h-dvh flex flex-col bg-[#171512]">
      {/* Top bar */}
      <header className="h-11 flex items-center justify-between px-4 border-b border-[#332F2A] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[4px] bg-[#E07A45] flex items-center justify-center">
            <Zap size={10} className="text-[#171512]" />
          </div>
          <span className="text-xs font-medium text-[#F2EFEA]">Meet</span>
          <span className="text-xs text-[#A39C93] ml-2 font-mono">
            {meetingId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4C9770] animate-pulse" />
          <span className="text-xs text-[#A39C93]">Canlı</span>
        </div>
      </header>

      {/* Video grid */}
      <VideoGrid />

      {/* Control bar */}
      <ControlBar />
    </div>
  );
}
