"use client";

import { useState, useEffect } from "react";
import SmartPlayer from "../SmartPlayer";
import { useLiveStatus } from "../../hooks/useLiveStatus";
import LiveChat from "../LiveChat";

export default function HeroSection() {
  const { status, loading } = useLiveStatus();
  const [mounted, setMounted] = useState(false);
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulação de Viewers
  useEffect(() => {
    if (!status?.is_live) return;
    
    // Início com o boost configurado ou valor base
    const baseViewers = (status as any).fake_viewers_boost || Math.floor(Math.random() * 500) + 100;
    setViewers(baseViewers);

    const interval = setInterval(() => {
      setViewers(prev => {
        const variation = Math.floor(baseViewers * 0.05);
        const change = Math.floor(Math.random() * (variation * 2 + 1)) - variation;
        return Math.max(10, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [status?.is_live, (status as any)?.fake_viewers_boost]);

  if (!mounted || loading || !status?.is_live) return null;

  return (
    <section className="w-full animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col lg:grid lg:grid-cols-10 gap-4 lg:gap-6">
        
        {/* LADO ESQUERDO: PLAYER (7 colunas) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative group">
            
            {/* SELO AO VIVO OFICIAL (ABSOLUTO SOBRE O VÍDEO) */}
            <div className="absolute top-4 left-4 z-30 pointer-events-none">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-lg shadow-lg shadow-red-900/40 border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="font-black text-white text-[10px] uppercase tracking-widest">AO VIVO</span>
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
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-slate-950 border-t border-white/5 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight line-clamp-1">
                  {status.titulo || "Acompanhe nossa programação"}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {viewers.toLocaleString("pt-BR")} Assistindo
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">•</span>
                  <p className="text-slate-400 text-[10px] sm:text-xs font-medium line-clamp-1 opacity-80">
                    {status.descricao || "Fique por dentro das principais notícias em tempo real."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: CHAT (3 colunas) */}
        <div className="lg:col-span-3 flex flex-col h-[450px] lg:h-auto">
          <LiveChat liveUrl={status.url_youtube || status.url_facebook} />
        </div>

      </div>
    </section>
  );
}
