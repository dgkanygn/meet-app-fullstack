"use client";

import Link from "next/link";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg";
  showText?: boolean;
  href?: string | null;
  className?: string;
  textClassName?: string;
}

export function LogoIcon({ size = "md" }: { size?: "xs" | "sm" | "md" | "lg" }) {
  const iconSizes = {
    xs: { box: "h-5 w-5 rounded-[5px]", svg: "w-3 h-3" },
    sm: { box: "h-6 w-6 rounded-[6px]", svg: "w-3.5 h-3.5" },
    md: { box: "h-7 w-7 rounded-[7px]", svg: "w-4 h-4" },
    lg: { box: "h-9 w-9 rounded-[9px]", svg: "w-5 h-5" },
  };

  const { box, svg } = iconSizes[size];

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br from-[#ea834c] to-[#cb5b25] text-[#171512] shadow-sm shadow-accent/20 transition-transform duration-200 group-hover:scale-105 ${box}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${svg} shrink-0`}
      >
        {/* Modern video camera body with aperture cut-out */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6 5.5C4.067 5.5 2.5 7.067 2.5 9V15C2.5 16.933 4.067 18.5 6 18.5H11C12.933 18.5 14.5 16.933 14.5 15V9C14.5 7.067 12.933 5.5 11 5.5H6ZM8.5 14C9.60457 14 10.5 13.1046 10.5 12C10.5 10.8954 9.60457 10 8.5 10C7.39543 10 6.5 10.8954 6.5 12C6.5 13.1046 7.39543 14 8.5 14Z"
          fill="currentColor"
        />
        {/* Camera projection cone */}
        <path
          d="M15.5 10.25L19.78 7.39C20.62 6.83 21.5 7.43 21.5 8.44V15.56C21.5 16.57 20.62 17.17 19.78 16.61L15.5 13.75V10.25Z"
          fill="currentColor"
        />
        {/* Pulse center core dot */}
        <circle cx="8.5" cy="12" r="1.15" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function Logo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
  textClassName = "",
}: LogoProps) {
  const fontSizes = {
    xs: "text-xs",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const content = (
    <div className={`group flex items-center gap-2.5 select-none ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span
          className={`font-bold tracking-tight text-foreground transition-colors ${fontSizes[size]} ${textClassName}`}
        >
          Pulse<span className="text-accent">Meet</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
