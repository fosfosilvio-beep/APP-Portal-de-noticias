"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

interface BreakingNewsMarqueeProps {
  text: string;
  speed?: "slow" | "normal" | "fast";
  visible?: boolean;
}

const SPEED_MAP = {
  slow: "40s",
  normal: "22s",
  fast: "12s",
};

export default function BreakingNewsMarquee({ text, speed = "normal", visible = true }: BreakingNewsMarqueeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed || !text?.trim()) return null;

  const duration = SPEED_MAP[speed] || SPEED_MAP.normal;

  return (
    <div className="w-full bg-red-600 text-white flex items-center overflow-hidden relative z-50 shadow-lg">
      <div className="shrink-0 flex items-center gap-2 bg-red-800 px-4 py-2 h-full font-black text-xs uppercase tracking-widest whitespace-nowrap">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        🚨 URGENTE
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div
          className="flex gap-24 py-2 text-sm font-bold whitespace-nowrap"
          style={{
            animation: `marquee ${duration} linear infinite`,
          }}
        >
          {/* Duplicate for seamless loop */}
          <span>{text}</span>
          <span>{text}</span>
          <span>{text}</span>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 px-3 py-2 hover:bg-red-700 transition-colors"
        aria-label="Fechar alerta"
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
