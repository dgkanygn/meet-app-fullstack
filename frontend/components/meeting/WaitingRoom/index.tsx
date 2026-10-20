"use client";

import { Clock, ArrowLeft, ShieldAlert, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface WaitingRoomProps {
  meetingTitle?: string;
  hostFullName?: string;
  isRejected?: boolean;
  onCancel: () => void;
}

export default function WaitingRoom({
  meetingTitle,
  hostFullName,
  isRejected = false,
  onCancel,
}: WaitingRoomProps) {
  const router = useRouter();

  if (isRejected) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-[#171512] px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D9695C]/30 bg-[#D9695C]/10 text-[#D9695C]">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h1 className="text-base font-semibold text-[#F2EFEA]">
            Katılma İsteğin Reddedildi
          </h1>
          <p className="text-xs text-[#A39C93] leading-relaxed">
            {hostFullName ? `${hostFullName}` : "Oda kurucusu"} bu toplantıya katılma isteğinizi kabul etmedi.
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

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-[#171512] px-6 text-center select-none">
      {/* Üstte küçük Meet logosu */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#E07A45]">
          <Zap size={13} className="text-[#171512]" />
        </div>
        <span className="text-xs font-semibold text-[#F2EFEA]">MeetApp</span>
      </div>

      <div className="relative mb-6 flex items-center justify-center">
        {/* Radar / pulse halkaları */}
        <div className="absolute h-28 w-28 animate-ping rounded-full bg-[#E07A45]/10 duration-1000" />
        <div className="absolute h-20 w-20 rounded-full bg-[#E07A45]/15" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#E07A45]/40 bg-[#201E1B] text-[#E07A45] shadow-lg shadow-[#E07A45]/10">
          <Clock size={24} className="animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E07A45]/30 bg-[#E07A45]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#E07A45]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E07A45] animate-pulse" />
          Bekleme Odası
        </div>

        <h1 className="text-lg font-semibold text-[#F2EFEA]">
          {meetingTitle ?? "Toplantı"}
        </h1>

        <p className="text-xs text-[#A39C93] leading-relaxed">
          Toplantı sahibinin ({hostFullName ?? "oda kurucusu"}) seni içeri alması bekleniyor. Lütfen bu sayfayı kapatmadan bekleyin.
        </p>
      </div>

      <div className="mt-8">
        <button
          onClick={onCancel}
          className="flex cursor-pointer items-center gap-2 rounded-[6px] border border-[#332F2A] bg-[#201E1B] px-4 py-2 text-xs font-medium text-[#A39C93] transition-colors hover:bg-[#332F2A] hover:text-[#F2EFEA]"
        >
          <ArrowLeft size={14} />
          Ayrıl ve Dashboard&apos;a dön
        </button>
      </div>
    </div>
  );
}
