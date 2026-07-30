"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  PhoneOff,
} from "lucide-react";
import Link from "next/link";

export default function ControlBar() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  return (
    <div className="h-16 shrink-0 flex items-center justify-center gap-2 px-6 border-t border-[#332F2A] bg-[#171512]">
      {/* Mic */}
      <button
        onClick={() => setMicOn((v) => !v)}
        title={micOn ? "Mikrofonu Kapat" : "Mikrofonu Aç"}
        className={[
          "w-10 h-10 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors",
          micOn
            ? "text-[#F2EFEA] border border-[#332F2A] hover:bg-[#332F2A]"
            : "text-[#D9695C] bg-[#D9695C]/10 border border-[#D9695C]/30",
        ].join(" ")}
      >
        {micOn ? <Mic size={18} /> : <MicOff size={18} />}
      </button>

      {/* Camera */}
      <button
        onClick={() => setCamOn((v) => !v)}
        title={camOn ? "Kamerayı Kapat" : "Kamerayı Aç"}
        className={[
          "w-10 h-10 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors",
          camOn
            ? "text-[#F2EFEA] border border-[#332F2A] hover:bg-[#332F2A]"
            : "text-[#D9695C] bg-[#D9695C]/10 border border-[#D9695C]/30",
        ].join(" ")}
      >
        {camOn ? <Video size={18} /> : <VideoOff size={18} />}
      </button>

      {/* Screen share */}
      <button
        title="Ekran Paylaş"
        className="w-10 h-10 rounded-[6px] text-[#A39C93] border border-[#332F2A] hover:bg-[#332F2A] hover:text-[#F2EFEA] flex items-center justify-center cursor-pointer transition-colors"
      >
        <Monitor size={18} />
      </button>

      {/* Participants */}
      <button
        title="Katılımcılar"
        className="w-10 h-10 rounded-[6px] text-[#A39C93] border border-[#332F2A] hover:bg-[#332F2A] hover:text-[#F2EFEA] flex items-center justify-center cursor-pointer transition-colors"
      >
        <Users size={18} />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-[#332F2A] mx-1" />

      {/* Leave */}
      <Link href="/dashboard">
        <button
          title="Ayrıl"
          className="w-10 h-10 rounded-[6px] bg-[#B23A2E]/20 text-[#D9695C] border border-[#B23A2E]/30 hover:bg-[#B23A2E]/40 flex items-center justify-center cursor-pointer transition-colors"
        >
          <PhoneOff size={18} />
        </button>
      </Link>
    </div>
  );
}
