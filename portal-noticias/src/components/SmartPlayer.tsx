"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────
export interface ConfiguracaoPortal {
  id?: number;
  is_live: boolean;
  url_live_facebook: string | null;
  fake_viewers_boost: number;
  live_last_ended_at?: string | null;
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
  /** URL de vídeo selecionado manualmente no carrossel */
  customVideoUrl?: string;
  /** Callback chamado quando o estado da live muda (para o pai sincronizar o chat) */
  onLiveChange?: (isLive: boolean, liveUrl: string | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function SmartPlayer({ customVideoUrl, onLiveChange }: SmartPlayerProps) {
  const [config, setConfig] = useState<ConfiguracaoPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoAutomatico, setVideoAutomatico] = useState<string | null>(null);

  // ─── Fallback chain (sem noticias.mostrar_no_player) ──────────────────────
  const resolverFallback = async () => {
    // 1. biblioteca_webtv (uploads manuais — maior fidelidade editorial)
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

    // 2. biblioteca_lives (gravações de lives passadas)
    const { data: lives } = await supabase
      .from("biblioteca_lives")
      .select("url")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setVideoAutomatico(lives?.url ?? null);
  };

  const fetchConfig = async () => {
    try {
      if (!supabase) throw new Error("Client Supabase não encontrado.");

      const { data, error } = await supabase
        .from("configuracao_portal")
        .select("id, is_live, url_live_facebook, fake_viewers_boost, live_last_ended_at")
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
  };

  useEffect(() => {
    fetchConfig();

    if (!supabase) return;

    const channel = supabase
      .channel("smart_player_config")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "configuracao_portal" },
        async (payload) => {
          const newConf = payload.new as ConfiguracaoPortal;
          setConfig(newConf);
          if (!newConf.is_live) {
            await resolverFallback();
          } else {
            setVideoAutomatico(null);
          }
          onLiveChange?.(newConf.is_live, newConf.url_live_facebook);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Estados de renderização ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full flex justify-center">
        <div
          className="animate-pulse w-full rounded-2xl bg-slate-800"
          style={{ paddingTop: "56.25%" }}
        />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-900" style={{ paddingTop: "56.25%" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h3 className="text-zinc-400 text-xl font-medium">Player indisponível no momento.</h3>
          <p className="text-zinc-600 text-sm mt-2">Nossas transmissões retornam em breve.</p>
        </div>
      </div>
    );
  }

  const isAcervo = !config.is_live && (customVideoUrl || videoAutomatico);
  const activeVideoUrl = config.is_live
    ? config.url_live_facebook
    : (customVideoUrl || videoAutomatico);

  return (
    <div className="w-full mx-auto font-sans">
      {/* Badge de status */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        {config.is_live && (
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full shadow-lg animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-white font-black text-xs tracking-wider uppercase">
              AO VIVO · {config.fake_viewers_boost?.toLocaleString("pt-BR") ?? 0}
            </span>
          </div>
        )}
        {isAcervo && (
          <div className="flex items-center gap-2 bg-cyan-600/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-white/20">
            <div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
            <span className="text-white font-black text-[10px] tracking-widest uppercase">
              {customVideoUrl ? "REPRODUZINDO" : "ACERVO WEB TV"}
            </span>
          </div>
        )}
      </div>

      {/* Área do player 16:9 */}
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/40"
        style={{ paddingTop: "56.25%" }}
      >
        {config.is_live && config.url_live_facebook ? (
          <iframe
            key={config.url_live_facebook}
            src={convertEmbedUrl(config.url_live_facebook)}
            className="absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-700"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="Transmissão ao vivo – Nossa Web TV"
          />
        ) : activeVideoUrl ? (
          <video
            key={activeVideoUrl}
            src={activeVideoUrl}
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls
            autoPlay={!!customVideoUrl}
            muted={!customVideoUrl}
            loop={!customVideoUrl}
          />
        ) : (
          /* Placeholder elegante quando não há vídeo */
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
              <h3 className="text-white text-2xl font-bold mb-2 tracking-tight">Portal Nossa Web TV</h3>
              <p className="text-gray-400 text-sm max-w-md">
                Nenhuma transmissão ao vivo no momento. Acompanhe nossas notícias abaixo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
