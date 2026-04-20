"use client";

import { useState } from "react";
import { Play, Loader2, Headphones } from "lucide-react";
import AudioPlayer from "./AudioPlayer";

interface NewsNarratorProps {
  newsId: string;
  title: string;
  subtitle?: string;
  content: string;
}

export default function NewsNarrator({ newsId, title, subtitle, content }: NewsNarratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const generateAudio = async () => {
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
          rate: 1.05 
        }),
      });

      const data = await res.json();
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
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

  return (
    <div className="w-full mb-8">
      {!audioUrl ? (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 group transition-all hover:border-blue-400/50 hover:shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md animate-pulse shrink-0">
               <Headphones size={20} />
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-0.5">Narração Premium</p>
              <h4 className="text-slate-800 font-bold text-sm md:text-base">Gostaria de ouvir esta notícia?</h4>
            </div>
          </div>
          
          <button 
            onClick={generateAudio}
            disabled={isLoading}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Gerando Áudio...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Ouvir Notícia
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 bg-blue-600 px-2 py-0.5 rounded">Player Ativo</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[#005a78] text-[8px] font-bold uppercase tracking-wider border border-blue-100">Neural2 Premium</span>
            </div>
          </div>
          <AudioPlayer audioUrl={audioUrl} autoPlay={true} />
        </div>
      )}
    </div>
  );
}
