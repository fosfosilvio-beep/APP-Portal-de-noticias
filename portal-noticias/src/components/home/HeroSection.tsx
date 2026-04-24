"use client";

import { useState, useEffect } from "react";
import SmartPlayer from "../SmartPlayer";
import { useLiveStatus } from "../../hooks/useLiveStatus";

export default function HeroSection() {
  const { status, loading } = useLiveStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || !status?.is_live) return null;

  return (
    <section className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-full transition-all duration-700 ease-in-out">
        <div className="bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group">
          
          {/* Badge AO VIVO */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-lg shadow-lg shadow-red-900/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="font-black text-white text-xs uppercase tracking-widest">AO VIVO</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                Transmissão Oficial
              </span>
            </div>
          </div>

          <div className="aspect-video w-full bg-black relative">
            <SmartPlayer 
              url={status.url_youtube || status.url_facebook || ""} 
              isLive={true}
              title={status.titulo || "Transmissão Ao Vivo"}
            />
          </div>

          {/* Info Bar */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-950 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight line-clamp-1">
                {status.titulo || "Acompanhe nossa programação"}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium line-clamp-1 mt-0.5">
                {status.descricao || "Fique por dentro das principais notícias em tempo real."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
