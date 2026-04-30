"use client";

import { useEffect, useState, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreakingNewsMarqueeProps {
  text: string;
  speed?: "slow" | "normal" | "fast" | number;
  fontSize?: number;
  textColor?: string;
  visible?: boolean;
}

const SPEED_MAP = {
  slow: 40,
  normal: 22,
  fast: 12,
};

/**
 * BreakingNewsMarquee - v2.2 (Responsive Speed)
 * Exibe uma faixa de notícias urgentes com animação de marquee.
 */
export default function BreakingNewsMarquee({ 
  text, 
  speed = 5, 
  fontSize = 14, 
  textColor = "#ffffff",
  visible = true 
}: BreakingNewsMarqueeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!visible || dismissed || !text?.trim() || !mounted) return null;

  // Lógica de Velocidade: Menor valor de speed = mais lento
  // 60s base / speed (1-10) 
  const duration = (60 / (Number(speed) || 5));

  return (
    <div className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center overflow-hidden relative z-[100] shadow-xl border-b border-white/10 h-10 select-none">
      <div className="shrink-0 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 h-full font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap border-r border-white/10 z-10">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <AlertCircle size={14} className="text-white/80" />
        URGENTE
      </div>
      
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div
          className="flex whitespace-nowrap will-change-transform"
          style={{
            animation: `marquee-scroll ${duration}s linear infinite`,
            fontSize: `${fontSize}px`,
            color: textColor,
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {/* Texto duplicado para loop infinito perfeito */}
          <div className="flex items-center gap-12 pr-12">
            {[1, 2].map((i) => (
              <span key={i} className="flex items-center gap-12">
                <span className="font-bold uppercase tracking-wide">{text}</span>
                <span className="text-white/30">•</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-12 pr-12">
            {[1, 2].map((i) => (
              <span key={i} className="flex items-center gap-12">
                <span className="font-bold uppercase tracking-wide">{text}</span>
                <span className="text-white/30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 px-4 h-full hover:bg-white/10 transition-colors border-l border-white/10 z-10"
        aria-label="Fechar alerta"
      >
        <X size={16} className="text-white/70" />
      </button>

      <style jsx global>{`
        @keyframes marquee-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
