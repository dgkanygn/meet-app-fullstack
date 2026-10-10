"use client";

import { useMemo } from "react";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeClasses = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-7 h-7 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-3xl",
  "2xl": "w-32 h-32 text-5xl",
};

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  const initial = useMemo(() => name.charAt(0).toUpperCase() || "?", [name]);

  return (
    <div
      className={[
        "rounded-full bg-accent/15 flex items-center justify-center shrink-0",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="font-semibold text-accent leading-none">{initial}</span>
    </div>
  );
}
