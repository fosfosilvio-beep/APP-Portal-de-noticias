"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";

interface NewsNarratorProps {
  newsId: string;
  title: string;
  subtitle?: string;
  content: string;
}

export default function NewsNarrator({ newsId, title, subtitle, content }: NewsNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(1.05);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Efeito para mudar velocidade
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, [rate, audioUrl]);

  // Efeito de Limpeza Global - Para o áudio quando sair da página
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateProgress = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const p = (audio.currentTime / audio.duration) * 100;
    setProgress(p);
  };

  const handleEnd = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const togglePlay = async () => {
    // 1. Limpeza Total: Mata qualquer rastro da voz robótica antiga (speechSynthesis)
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }

    if (isPlaying) {
      audioRef.current?.pause();
      return;
    }

    // Se já temos a URL, apenas damos o play no elemento ref
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      return;
    }

    // Se não temos a URL, buscamos na API (Cache)
    try {
      setIsLoading(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          newsId, 
          title, 
          subtitle, 
          content,
          rate // A API também usa essa taxa no SSML para o corpo
        }),
      });

      const data = await res.json();
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
        // O play será disparado pelo useEffect ou automaticamente se usarmos autoPlay, 
        // mas aqui vamos esperar o próximo render ou disparar no ref.
        // Como o React é assíncrono, vamos usar a prop autoPlay na tag ou um useEffect.
      } else {
        throw new Error(data.error || "Falha ao obter URL do áudio");
      }
    } catch (error) {
      console.error("Erro ao carregar narração:", error);
      alert("Não foi possível carregar a narração premium agora. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara o play assim que a URL for carregada pela primeira vez
  useEffect(() => {
    if (audioUrl && audioRef.current && !isPlaying) {
      audioRef.current.play().catch(err => console.error("Erro ao iniciar áudio:", err));
    }
  }, [audioUrl]);

  const changeRate = () => {
    const nextRate = rate === 1.05 ? 1.25 : rate === 1.25 ? 1.5 : 1.05;
    setRate(nextRate);
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 mb-8 group transition-all hover:border-blue-400/50 hover:shadow-lg">
      
      {/* Elemento de Áudio Declarativo */}
      <audio 
        ref={audioRef}
        src={audioUrl || undefined}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnd}
        onTimeUpdate={updateProgress}
        preload="auto"
      />

      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Play Button */}
        <button 
          onClick={togglePlay}
          disabled={isLoading}
          className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-1" />
          )}
        </button>

        {/* Info & Waveform Container */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                <Volume2 size={12} />
                Narração Studio
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-[#005a78] text-[8px] font-bold uppercase tracking-wider">Premium Neural2</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {isLoading ? "Gerando áudio HD..." : isPlaying ? "Narrando..." : "Audiofone Ativo"}
            </span>
          </div>

          {/* Waveform Visualization (Simulated with Bars) */}
          <div className="flex items-center gap-1.5 h-10 w-full px-1 overflow-hidden relative">
            {[...Array(40)].map((_, i) => (
              <div 
                key={i}
                className={`w-1 rounded-full bg-slate-200 transition-all duration-300 ${isPlaying ? 'animate-waveform' : ''}`}
                style={{ 
                  height: `${Math.random() * 80 + 20}%`,
                  animationDelay: `${i * 0.05}s`,
                  backgroundColor: progress > (i / 40) * 100 ? '#2563eb' : '#e2e8f0'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Speed Selector */}
        <button 
          onClick={changeRate}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm min-w-[60px]"
        >
          {rate.toFixed(2)}x
        </button>
      </div>

      <style jsx>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
        .animate-waveform {
          animation: waveform 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
