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
export const convertEmbedUrl = (rawUrl: string | null): string => {
  if (!rawUrl) return "";

  // YouTube (watch, youtu.be e live direto)
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    let videoId = "";
    if (rawUrl.includes("watch?v=")) {
      videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
    } else if (rawUrl.includes("youtu.be/")) {
      videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    } else if (rawUrl.includes("/live/")) {
      videoId = rawUrl.split("/live/")[1]?.split("?")[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
    }
  }

  // Facebook
  if (rawUrl.includes("facebook.com")) {
    if (!rawUrl.includes("plugins/video.php")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&width=auto`;
    }
  }

  return rawUrl;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: detectar plataforma da live
// ─────────────────────────────────────────────────────────────────────────────
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
  onLiveChange?: (isLive: boolean, liveUrl: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function SmartPlayer({ customVideoUrl, onLiveChange }: SmartPlayerProps) {
  const [config, setConfig] = useState<ConfiguracaoPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoAutomatico, setVideoAutomatico] = useState<string | null>(null);
  const [displayViewers, setDisplayViewers] = useState(0);

  // ── Estado do embed URL: controlado por React, não por DOM imperativo ──────
  // Isso é o coração do fix do áudio duplicado.
  // Ao setar null, o React desmonta o <iframe> de forma limpa, parando o áudio.
  // Ao setar uma nova URL, ele monta um iframe completamente novo e isolado.
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  // channelId estável — não recria a cada re-render (root cause do áudio duplo)
  const channelIdRef = useRef(`smart_player_${Math.random().toString(36).substring(2, 9)}`);

  // ─── Fallback chain ────────────────────────────────────────────────────────
  const resolverFallback = useCallback(async () => {
    const { data: acervo } = await supabase
      .from("biblioteca_webtv")
      .select("url_video")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (acervo?.url_video) {
      setVideoAutomatico(acervo.url_video);
      return;
    }

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

      if (error) {
        console.error("[SmartPlayer] Erro ao buscar configuração:", error);
      } else if (data) {
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

  // ─── Inicialização + Realtime (channelId estável via useRef) ───────────────
  useEffect(() => {
    fetchConfig();

    if (!supabase) return;

    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "configuracao_portal" },
        async (payload) => {
          const newConf = payload.new as ConfiguracaoPortal;
          setConfig(newConf);
          if (!newConf.is_live) {
            await resolverFallback();
            setVideoAutomatico(null); // Reseta antes de resolver
          } else {
            setVideoAutomatico(null);
          }
          const activeUrl = newConf.mostrar_live_facebook
            ? newConf.url_live_facebook
            : newConf.url_live_youtube;
          onLiveChange?.(newConf.is_live, activeUrl || newConf.url_live_facebook);
        }
      )
      .subscribe();

    // Cleanup: remove o canal do Realtime ao desmontar
    return () => { supabase.removeChannel(channel); };
  // fetchConfig e resolverFallback são memoizados com useCallback — safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Bifurcação de Sinal ───────────────────────────────────────────────────
  const isAcervo = !config?.is_live && (customVideoUrl || videoAutomatico);
  const activeVideoUrl = config?.is_live
    ? (config.mostrar_live_facebook
      ? (config.url_live_facebook || config.url_live_youtube)
      : (config.url_live_youtube || config.url_live_facebook))
    : (customVideoUrl || videoAutomatico);

  // ─── FIX CRÍTICO: Gerencia o embedUrl via estado React ──────────────────────
  // REGRA: Quando activeVideoUrl muda, PRIMEIRO seta null (desmonta o iframe = para áudio),
  // DEPOIS seta a nova URL (monta iframe limpo). Isso elimina o áudio fantasma.
  useEffect(() => {
    if (!activeVideoUrl || !config?.is_live) {
      // Modo Acervo: usa tag <video> controlada pelo React nativamente
      setEmbedUrl(null);
      return;
    }

    // Step 1: Destruição — seta null para desmontagem limpa do iframe anterior
    setEmbedUrl(null);

    // Step 2: Recriação com micro-delay para garantir desmontagem
    const timer = setTimeout(() => {
      setEmbedUrl(convertEmbedUrl(activeVideoUrl));
    }, 80);

    return () => {
      clearTimeout(timer);
      // Cleanup ao sair: para o áudio zerando o src antes do unmount
      setEmbedUrl(null);
    };
  }, [activeVideoUrl, config?.is_live]);

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
        <div className="w-full aspect-video animate-pulse rounded-2xl bg-slate-800" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="w-full min-w-0 aspect-video relative overflow-hidden rounded-2xl bg-zinc-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h3 className="text-zinc-400 text-xl font-medium">Player indisponível no momento.</h3>
          <p className="text-zinc-600 text-sm mt-2">Nossas transmissões retornam em breve.</p>
        </div>
      </div>
    );
  }

  return (
    // min-w-0 + overflow-hidden: garante que o player nunca transborde o flex pai
    <div className="w-full min-w-0 font-sans overflow-hidden">

      {/* ── CONTAINER PRINCIPAL: aspect-video = 16:9 perfeito, overflow-hidden ── */}
      <div className="relative w-full aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/40">

        {/* ── PLACEHOLDER: exibido quando não há URL ── */}
        {!activeVideoUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <img
                src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80"
                alt="Capa Nossa Web TV"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center p-6">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-full mb-4 border border-white/10">
                <svg className="w-12 h-12 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h3 className="text-white text-lg sm:text-2xl font-bold mb-2 tracking-tight">Portal Nossa Web TV</h3>
              <p className="text-gray-400 text-xs sm:text-sm max-w-md">
                Nenhuma transmissão ao vivo. Acompanhe nossas notícias abaixo.
              </p>
            </div>
          </div>
        )}

        {/* ── LIVE: iframe controlado por estado React (FIX de áudio duplo) ──
            Quando embedUrl é null, o React DESMONTA o iframe completamente,
            parando qualquer áudio residual antes de montar o próximo.
        ── */}
        {config.is_live && embedUrl && (
          <iframe
            key={embedUrl}                    // key vinculada à URL, não ao tempo
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="Transmissão ao vivo – Nossa Web TV"
          />
        )}

        {/* ── ACERVO: tag <video> nativa do React — sem manipulação DOM ── */}
        {isAcervo && activeVideoUrl && (
          <video
            key={activeVideoUrl}
            src={activeVideoUrl}
            className="absolute top-0 left-0 w-full h-full object-contain bg-black"
            controls
            autoPlay={!!customVideoUrl}
            muted={!customVideoUrl}
            loop={!customVideoUrl}
            playsInline
          />
        )}

        {/* ── OVERLAYS: estritamente DENTRO do container relative ── */}

        {/* Barra de selos — topo */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {config.is_live && (
              <div className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg border border-red-500/50 w-fit pointer-events-auto">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <span className="text-white font-black text-[10px] sm:text-xs tracking-wider uppercase">
                  REC <span className="mx-1 text-red-200">·</span> {displayViewers.toLocaleString("pt-BR")}
                </span>
              </div>
            )}
            {isAcervo && (
              <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full shadow-md border border-white/10 w-fit pointer-events-auto">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-white font-bold text-[9px] sm:text-[10px] tracking-widest uppercase">
                  {customVideoUrl ? "REPRODUZINDO" : "ACERVO REGIONAL"}
                </span>
              </div>
            )}
          </div>

          {config.is_live && (
            <div className="bg-gradient-to-r from-orange-500 to-pink-600 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg border border-white/20 pointer-events-auto">
              <span className="text-white font-black text-[9px] sm:text-[11px] tracking-widest uppercase drop-shadow-md">
                EXCLUSIVO
              </span>
            </div>
          )}
        </div>

        {/* Metadados da live — rodapé */}
        {config.is_live && (config.titulo_live || config.descricao_live) && (
          <div className="absolute bottom-2 sm:bottom-6 left-2 sm:left-6 right-2 sm:right-6 z-20 pointer-events-none transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-3 sm:p-5 rounded-xl sm:rounded-2xl max-w-xl shadow-2xl">
              {config.titulo_live && (
                <h4 className="text-white font-black text-sm sm:text-lg leading-tight mb-1 drop-shadow-md">
                  {config.titulo_live}
                </h4>
              )}
              {config.descricao_live && (
                <p className="text-zinc-300 text-[10px] sm:text-xs font-medium line-clamp-2 opacity-90">
                  {config.descricao_live}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
