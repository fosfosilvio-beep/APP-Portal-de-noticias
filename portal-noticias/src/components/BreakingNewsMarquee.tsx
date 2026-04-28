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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!visible || dismissed || !text?.trim()) return null;

  // Lógica de Velocidade Inversa Proporcional
  // 30 / speed (1-10) -> Menor valor = Mais Rápido
  const baseDuration = (30 / (Number(speed) || 5));
  
  // No mobile (viewport < 768px), aumentamos a velocidade em 1.5x 
  // (reduzimos a duração dividindo pelo fator)
  const calculatedDuration = isMobile ? (baseDuration / 1.5) : baseDuration;

  return (
    <div className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-white flex items-center overflow-hidden relative z-[100] shadow-xl border-b border-white/10">
      <div className="shrink-0 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2.5 h-full font-black text-[10px] uppercase tracking-[0.2em] whitespace-nowrap border-r border-white/10">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <AlertCircle size={14} className="text-white/80" />
        URGENTE
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div
          key={`${calculatedDuration}-${text}`} // Força reinício da animação se mudar
          className="flex gap-32 py-2.5 uppercase tracking-wide whitespace-nowrap font-bold"
          style={{
            animation: `marquee ${calculatedDuration}s linear infinite`,
            fontSize: `${fontSize}px`,
            color: textColor
          }}
        >
          {/* Loop items para garantir continuidade visual */}
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className="flex items-center gap-4">
               {text}
               <span style={{ color: `${textColor}4D` }}>•</span>
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 px-4 py-2.5 hover:bg-white/10 transition-colors border-l border-white/10"
        aria-label="Fechar alerta"
      >
        <X size={16} className="text-white/70" />
      </button>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  );
}
