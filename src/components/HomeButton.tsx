"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

interface HomeButtonProps {
  label?: string;
  href?: string;
}

export default function HomeButton({
  label = "Home",
  href = "/",
}: HomeButtonProps) {
  return (
    <Link
      href={href}
      aria-label="Go to Home"
      className="
        group
        inline-flex
        items-center
        gap-3
        rounded-2xl
        border
        border-white/10
        bg-zinc-900/70
        px-4
        py-3
        text-sm
        font-medium
        text-zinc-200
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-emerald-500/30
        hover:bg-zinc-900
        hover:text-white
        hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]
        active:scale-[0.98]
      "
    >
      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-white/[0.03]
          transition-all
          duration-300
          group-hover:border-emerald-400/30
          group-hover:bg-emerald-500/10
        "
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
      </div>

      <span>{label}</span>

      <Home className="ml-1 h-4 w-4 text-zinc-500 transition-colors duration-300 group-hover:text-emerald-400" />

      {/* Ambient glow */}
      <span
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-2xl
          opacity-0
          blur-2xl
          transition-opacity
          duration-500
          group-hover:opacity-100
          bg-emerald-500/5
        "
      />
    </Link>
  );
}