"use client";

import { useState, useEffect, useCallback } from "react";
import { Tv } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import SmartPlayer from "../SmartPlayer";
import LiveChat from "../LiveChat";

interface HeroSectionProps {
  initialIsLive: boolean;
  initialLiveUrl?: string | null;
}

export default function HeroSection({ initialIsLive, initialLiveUrl }: HeroSectionProps) {
  const [isLive, setIsLive] = useState(initialIsLive);
  const [liveUrl, setLiveUrl] = useState<string | null>(initialLiveUrl || null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  const handleLiveChange = useCallback((live: boolean, url: string | null) => {
    setIsLive(live);
    setLiveUrl(url);
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Força checagem imediata ao montar (bypass Next.js e Browser cache)
    const fetchCurrentState = async () => {
      // Adicionar um header customizado ou query param faria o Supabase ignorar cache HTTP
      const { data } = await supabase.from("configuracao_portal").select("is_live, url_live_youtube, url_live_facebook").limit(1).single();
      if (data && data.is_live !== isLive) {
        setIsLive(data.is_live);
        setLiveUrl(data.url_live_youtube || data.url_live_facebook);
      }
    };
    fetchCurrentState();

    const configChannel = supabase
      .channel("hero_config_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "configuracao_portal" },
        (payload: any) => {
          setIsLive(payload.new.is_live);
          if (payload.new.url_live_youtube || payload.new.url_live_facebook) {
            setLiveUrl(payload.new.url_live_youtube || payload.new.url_live_facebook);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
    };
  }, []);

  // Renderiza apenas após montagem para evitar erros de hidratação (#418)
  if (!mounted) return null;

  return (
    <div className={isLive ? "block" : "hidden"}>
      {isLive && (
        <section className="w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-full transition-all duration-700 ease-in-out">
            {/* Banner de alerta ativo */}
            <div className="flex items-center gap-3 bg-red-600/10 border border-red-500/20 rounded-2xl px-5 py-3 mb-4">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
              </span>
              <p className="text-red-400 font-black text-xs uppercase tracking-widest">
                Transmissão ao Vivo em andamento — Assista agora!
              </p>
              <Tv className="ml-auto text-red-500/60 shrink-0" size={18} />
            </div>

            {/* Player + Chat lado a lado */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="min-w-0 w-full lg:w-[65%] overflow-hidden bg-slate-950 rounded-2xl lg:rounded-3xl shadow-2xl shadow-red-900/20 border border-red-900/30">
                <SmartPlayer
                  customVideoUrl={undefined}
                  onLiveChange={handleLiveChange}
                />
              </div>

              <div className="w-full lg:w-[35%] min-w-0 min-h-[320px] lg:min-h-0">
                <LiveChat liveUrl={liveUrl} />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
