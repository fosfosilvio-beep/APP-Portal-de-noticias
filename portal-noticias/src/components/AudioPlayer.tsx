"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, FastForward, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean;
}

export default function AudioPlayer({ audioUrl, autoPlay = false }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("00:00");
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Formatar tempo
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Inicialização do WaveSurfer
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#D1D5DB", // Cinza claro (slate-300)
      progressColor: "#EF4444", // Vermelho (red-500)
      barWidth: 2,
      barGap: 3,
      height: 40,
      cursorWidth: 0,
      normalize: true,
      fillParent: true,
      url: audioUrl,
    });

    waveSurferRef.current = ws;

    // Eventos
    ws.on("ready", () => {
      setIsLoading(false);
      setDuration(formatTime(ws.getDuration()));
      if (autoPlay) {
        ws.play().catch(err => console.error("AutoPlay failed:", err));
      }
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    
    ws.on("audioprocess", () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on("finish", () => {
      setIsPlaying(false);
      ws.setTime(0);
    });

    // Responsividade
    const handleResize = () => ws.drawBuffer();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ws.destroy();
    };
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  }, []);

  const changeSpeed = () => {
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (waveSurferRef.current) {
      waveSurferRef.current.setPlaybackRate(nextSpeed);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl p-4 md:px-6 py-4 flex items-center gap-4 md:gap-6 group">
      {/* Botão Play/Pause */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-slate-50 text-slate-800 hover:bg-slate-100 transition-all active:scale-95 shrink-0 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="animate-spin text-slate-400" size={20} />
        ) : isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      {/* Gráfico de Onda */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center gap-1">
             {[...Array(20)].map((_, i) => (
               <div key={i} className="w-1 h-2 bg-slate-100 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
             ))}
          </div>
        )}
      </div>

      {/* Info Direita (Tempo e Velocidade) */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        <span className="text-[11px] md:text-xs font-mono font-bold text-slate-400 tabular-nums">
          {duration}
        </span>

        <button
          onClick={changeSpeed}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] md:text-xs font-black text-slate-600 hover:border-red-200 hover:text-red-600 transition-all min-w-[55px] justify-center"
        >
          <FastForward size={12} className={speed > 1 ? "text-red-500" : "text-slate-400"} />
          {speed}x
        </button>
      </div>
    </div>
  );
}
