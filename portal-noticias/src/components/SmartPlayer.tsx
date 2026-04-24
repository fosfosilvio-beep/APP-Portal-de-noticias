"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
export interface ConfiguracaoPortal {
  id?: number;
  is_live: boolean;
  url_live_facebook: string | null;
  url_live_youtube: string | null;
  mostrar_live_facebook: boolean;
  fake_viewers_boost: number;
  live_last_ended_at?: string | null;
  titulo_live?: string | null;
  descricao_live?: string | null;
  organic_views_enabled?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitário: converte URL "raw" → URL de embed
// ─────────────────────────────────────────────────────────────────────────────
export const convertEmbedUrl = (rawUrl: string | null, startTime?: number, endTime?: number): string => {
  if (!rawUrl) return "";
  
  // Tratamento nativo para YouTube
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    // Se já for embed, mantém
    if (rawUrl.includes("/embed/")) return rawUrl;

    let videoId = "";
    
    try {
      const urlObj = new URL(rawUrl);
      if (urlObj.searchParams.has("v")) {
        videoId = urlObj.searchParams.get("v") || "";
      } else if (urlObj.hostname === "youtu.be") {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.pathname.includes("/live/")) {
        videoId = urlObj.pathname.split("/live/")[1].split("?")[0];
      } else if (urlObj.pathname.includes("/shorts/")) {
        videoId = urlObj.pathname.split("/shorts/")[1].split("?")[0];
      }
    } catch (e) {
      // Fallback manual se a URL for malformada
      if (rawUrl.includes("watch?v=")) videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
      else if (rawUrl.includes("youtu.be/")) videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
      else if (rawUrl.includes("/live/")) videoId = rawUrl.split("/live/")[1]?.split("?")[0];
    }
    
    if (videoId) {
      let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
      if (startTime) embedUrl += `&start=${startTime}`;
      if (endTime) embedUrl += `&end=${endTime}`;
      return embedUrl;
    }
  }
  
  // Tratamento nativo para Facebook
  if (rawUrl.includes("facebook.com") || rawUrl.includes("fb.watch")) {
    if (rawUrl.includes("plugins/video.php")) return rawUrl;
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&width=auto`;
  }
  
  return rawUrl;
};

export const detectLivePlatform = (url: string | null): "youtube" | "facebook" | "unknown" => {
  if (!url) return "unknown";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("facebook.com")) return "facebook";
  return "unknown";
};

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface SmartPlayerProps {
  customVideoUrl?: string;
  startTime?: number;
  endTime?: number;
  onLiveChange?: (isLive: boolean, liveUrl: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function SmartPlayer({ customVideoUrl, startTime, endTime, onLiveChange }: SmartPlayerProps) {
  const [config, setConfig] = useState<ConfiguracaoPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoAutomatico, setVideoAutomatico] = useState<string | null>(null);
  const [displayViewers, setDisplayViewers] = useState(0);

  // ── KEY FORCING: a chave para erradicar áudio fantasma ─────────────────────
  // Ao mudar playerKey, React desmonta o nó DOM antigo (iframe) por completo
  // e instancia um novo do zero. Nenhum useEffect de cleanup manual necessário.
  const [playerKey, setPlayerKey] = useState(Date.now());
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Efeito de limpeza forçada: ao desmontar, limpamos o conteúdo HTML do container do player.
  // Isso garante que qualquer iframe (que produz áudio) seja destruído imediatamente.
  useEffect(() => {
    return () => {
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = "";
      }
    };
  }, []);

  // channelId estável via useRef — não recria subscription a cada re-render
  const channelIdRef = useRef(`smart_player_${Math.random().toString(36).substring(2, 9)}`);

  // ─── Fallback chain ────────────────────────────────────────────────────────
  const resolverFallback = useCallback(async () => {
    const { data: acervo } = await supabase
      .from("biblioteca_webtv")
      .select("url_video")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (acervo?.url_video) { setVideoAutomatico(acervo.url_video); return; }

    const { data: lives } = await supabase
      .from("biblioteca_lives")
      .select("url")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setVideoAutomatico(lives?.url ?? null);
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      if (!supabase) throw new Error("Client Supabase não encontrado.");
      const { data, error } = await supabase
        .from("configuracao_portal")
        .select("id, is_live, url_live_facebook, url_live_youtube, mostrar_live_facebook, fake_viewers_boost, live_last_ended_at, titulo_live, descricao_live, organic_views_enabled")
        .limit(1)
        .single();

      if (error) console.error("[SmartPlayer] Erro:", error);
      else if (data) {
        setConfig(data);
        if (!data.is_live) await resolverFallback();
        onLiveChange?.(data.is_live, data.url_live_facebook);
      }
    } catch (err) {
      console.error("[SmartPlayer] Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  }, [resolverFallback, onLiveChange]);

  // ─── Inicialização + Realtime ──────────────────────────────────────────────
  useEffect(() => {
    fetchConfig();
    if (!supabase) return;

    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "configuracao_portal" },
        async (payload: any) => {
          const newConf = payload.new as ConfiguracaoPortal;
          setConfig(newConf);
          setVideoAutomatico(null);
          if (!newConf.is_live) await resolverFallback();
          const activeUrl = newConf.mostrar_live_facebook ? newConf.url_live_facebook : newConf.url_live_youtube;
          onLiveChange?.(newConf.is_live, activeUrl || newConf.url_live_facebook);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Bifurcação de Sinal ───────────────────────────────────────────────────
  const isAcervo = !config?.is_live && (customVideoUrl || videoAutomatico);
  const activeVideoUrl = config?.is_live
    ? (config.mostrar_live_facebook
      ? (config.url_live_facebook || config.url_live_youtube)
      : (config.url_live_youtube || config.url_live_facebook))
    : (customVideoUrl || videoAutomatico);

  const isYouTube = detectLivePlatform(activeVideoUrl) === 'youtube';
  const embedUrl = activeVideoUrl ? convertEmbedUrl(activeVideoUrl, startTime, endTime) : null;

  // ── KEY FORCING: atualiza a key APENAS quando a URL muda de fato ───────────
  const prevUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeVideoUrl !== prevUrlRef.current) {
      prevUrlRef.current = activeVideoUrl ?? null;
      setPlayerKey(Date.now());
    }
  }, [activeVideoUrl]);

  // ─── Simulação de Viewers ──────────────────────────────────────────────────
  useEffect(() => {
    if (!config) return;
    setDisplayViewers(config.fake_viewers_boost || 0);
    if (!config.is_live || !config.organic_views_enabled) return;

    const interval = setInterval(() => {
      setDisplayViewers(prev => {
        const base = config.fake_viewers_boost || 0;
        const variation = Math.floor(base * 0.05);
        const change = Math.floor(Math.random() * (variation * 2 + 1)) - variation;
        const newVal = prev + change;
        if (newVal < base - variation * 2) return base - variation;
        if (newVal > base + variation * 2) return base + variation;
        return newVal;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [config?.fake_viewers_boost, config?.is_live, config?.organic_views_enabled]);

  // ─── Estados de renderização ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full min-w-0">
        <div className="w-full aspect-video animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
        <div className="w-full aspect-video bg-zinc-900 flex flex-col items-center justify-center text-center p-6">
          <h3 className="text-zinc-400 text-xl font-medium">Player indisponível</h3>
          <p className="text-zinc-600 text-sm mt-2">Retornamos em breve.</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — Estrutura DESACOPLADA: overlays FORA do container do vídeo.
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200 font-sans">

      {/* ═══ BARRA DE STATUS — COMPLETAMENTE FORA DO PLAYER ═══ */}
      {config.is_live && (
        <div className="flex flex-row justify-between items-center px-3 sm:px-4 py-2.5 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
            </span>
            <span className="bg-red-600 text-white px-2.5 py-1 text-[10px] sm:text-xs rounded-full font-black uppercase tracking-wider">
              REC · {displayViewers.toLocaleString("pt-BR")}
            </span>
          </div>
          <span className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-3 py-1 text-[10px] sm:text-xs rounded-full font-black uppercase tracking-widest">
            EXCLUSIVO
          </span>
        </div>
      )}

      {isAcervo && (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-cyan-100 bg-cyan-50">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
          <span className="text-cyan-700 text-[10px] sm:text-xs font-black uppercase tracking-widest">
            {customVideoUrl ? "Reproduzindo Agora" : "Acervo Regional"}
          </span>
        </div>
      )}

      {/* ═══ CONTAINER DO VÍDEO — LIMPO, SEM NENHUM OVERLAY ═══ */}
      <div ref={playerContainerRef} className="relative w-full aspect-video bg-black">

        {/* Placeholder — sem vídeo */}
        {!activeVideoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
            <div className="bg-white/10 backdrop-blur-sm p-5 rounded-full mb-4 border border-white/10">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="text-white text-base sm:text-xl font-bold mb-1">Portal Nossa Web TV</h3>
            <p className="text-gray-500 text-xs sm:text-sm">Nenhuma transmissão no momento.</p>
          </div>
        )}

        {/* IFRAME PLAYER (YouTube ou Facebook) */}
        {((config.is_live && embedUrl) || (isAcervo && isYouTube && embedUrl)) && (
          <iframe
            key={playerKey}
            src={embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title={config.is_live ? "Transmissão ao vivo – Nossa Web TV" : "Episódio de Podcast"}
          />
        )}

        {/* NATIVE VIDEO PLAYER (Direto do Storage ou URL Raw) */}
        {isAcervo && !isYouTube && activeVideoUrl && (
          <video
            key={playerKey}
            src={activeVideoUrl}
            className="w-full h-full object-contain bg-black"
            controls
            autoPlay={!!customVideoUrl}
            muted={!customVideoUrl}
            loop={!customVideoUrl}
            playsInline
          />
        )}
      </div>

      {/* ═══ RODAPÉ DE METADADOS — FORA DO PLAYER ═══ */}
      {config.is_live && (config.titulo_live || config.descricao_live) && (
        <div className="px-4 py-3 sm:py-4 bg-slate-900 border-t border-slate-800">
          {config.titulo_live && (
            <h2 className="text-white font-black text-sm sm:text-lg leading-tight mb-0.5">{config.titulo_live}</h2>
          )}
          {config.descricao_live && (
            <p className="text-slate-400 text-xs sm:text-sm font-medium line-clamp-2">{config.descricao_live}</p>
          )}
        </div>
      )}
    </div>
  );
}
