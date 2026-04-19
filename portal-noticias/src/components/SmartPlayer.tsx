"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ConfiguracaoPortal {
  id?: number;
  is_live: boolean;
  url_live_facebook: string | null;
  fake_viewers_boost: number;
  live_last_ended_at?: string | null;
}

const convertEmbedUrl = (rawUrl: string | null): string => {
  if (!rawUrl) return "";
  
  // Tratamento YouTube
  if (rawUrl.includes("youtube.com") || rawUrl.includes("youtu.be")) {
    let videoId = "";
    if (rawUrl.includes("watch?v=")) {
      videoId = rawUrl.split("watch?v=")[1]?.split("&")[0];
    } else if (rawUrl.includes("youtu.be/")) {
      videoId = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
    }
  }

  // Tratamento Facebook
  if (rawUrl.includes("facebook.com")) {
    if (!rawUrl.includes("plugins/video.php")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&width=auto`;
    }
  }

  return rawUrl;
};

export default function SmartPlayer({ customVideoUrl }: { customVideoUrl?: string }) {
  const [config, setConfig] = useState<ConfiguracaoPortal | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoAutomatico, setVideoAutomatico] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      if (!supabase) {
        throw new Error("Client Supabase não encontrado.");
      }

      const { data, error } = await supabase
        .from("configuracao_portal")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Erro ao buscar configuração:", error);
      } else if (data) {
        setConfig(data);
        await verificarAutomacao(data);
      }
    } catch (err) {
      console.error("Erro inesperado no SmartPlayer:", err);
    } finally {
      setLoading(false);
    }
  };

  const verificarAutomacao = async (conf: ConfiguracaoPortal) => {
    if (!conf.is_live) {
      // 1. Prioridade: Notícia em Destaque no Player
      const { data: noticia } = await supabase
        .from("noticias")
        .select("titulo, video_url")
        .eq("mostrar_no_player", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (noticia?.video_url) {
        setVideoAutomatico(noticia.video_url);
        return;
      }

      // 2. Novo Acervo: biblioteca_webtv (Uploads Manuais)
      const { data: acervo } = await supabase
        .from("biblioteca_webtv")
        .select("titulo, url_video")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (acervo?.url_video) {
        setVideoAutomatico(acervo.url_video);
        return;
      }

      // 3. Fallback: Gravações de Lives anteriores
      const { data: lives } = await supabase
        .from("biblioteca_lives")
        .select("titulo, url")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lives?.url) {
        setVideoAutomatico(lives.url);
      } else {
        setVideoAutomatico(null);
      }
    } else {
      setVideoAutomatico(null);
    }
  };

  useEffect(() => {
    fetchConfig();

    if (!supabase) return;

    // Inscrição para atualizações em tempo real
    const channel = supabase
      .channel("configuracao_portal_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "configuracao_portal",
        },
        async (payload) => {
          const newConf = payload.new as ConfiguracaoPortal;
          setConfig(newConf);
          await verificarAutomacao(newConf);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center">
        <div className="animate-pulse w-full rounded-2xl shadow-md bg-zinc-200" style={{ paddingTop: "56.25%" }}></div>
      </div>
    );
  }

  // Fallback caso não carregue a configuração
  if (!config) {
    return (
      <div className="w-full mx-auto font-sans">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-md bg-zinc-900" style={{ paddingTop: "56.25%" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-zinc-600 text-xl font-medium">Player indisponível no momento.</h3>
            <p className="text-zinc-700 text-sm mt-2">Nossas transmissões retornam em breve.</p>
          </div>
        </div>
      </div>
    );
  }

  const isAcervo = !config.is_live && (customVideoUrl || videoAutomatico);

  // Determinar qual vídeo exibir baseado na Prioridade Mestra
  // 1. Live (Sempre vence)
  // 2. Seleção Manual (Carrossel)
  // 3. Automático (Acervo/Notícia)
  const activeVideoUrl = config.is_live ? config.url_live_facebook : (customVideoUrl || videoAutomatico);

  return (
    <div className="w-full mx-auto font-sans transition-all duration-700 ease-in-out">
      {/* Etiquetas de Status (Live ou Acervo) */}
      <div className="flex justify-end mb-3 h-6 absolute top-4 left-4 z-20 gap-2">
        {config.is_live && (
          <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full shadow-md animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-white font-black text-xs tracking-wider uppercase">
              AO VIVO: {config.fake_viewers_boost?.toLocaleString() || 0}
            </span>
          </div>
        )}
        {isAcervo && (
          <div className="flex items-center space-x-2 bg-cyan-600/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-white/20 transition-all duration-500">
             <div className="w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.8)]"></div>
             <span className="text-white font-black text-[10px] tracking-widest uppercase">
               {customVideoUrl ? "REPRODUZINDO" : "ACERVO WEB TV"}
             </span>
          </div>
        )}
      </div>

      {/* Área do Player (Proporção 16:9) */}
      <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl bg-black group transition-all duration-700 ease-in-out shadow-black/40" style={{ paddingTop: "56.25%" }}>
        {config.is_live && config.url_live_facebook ? (
          <iframe
            src={convertEmbedUrl(config.url_live_facebook)}
            className="absolute top-0 left-0 w-full h-full border-0 transition-opacity duration-700"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="Transmissão ao vivo"
          ></iframe>
        ) : activeVideoUrl ? (
          <video
            key={activeVideoUrl} // Forçar re-montagem ao trocar vídeo
            src={activeVideoUrl}
            className="absolute top-0 left-0 w-full h-full object-contain transition-all duration-700"
            controls
            autoPlay={!!customVideoUrl} // Só auto-play se for seleção manual
            muted={!customVideoUrl} // Mudo apenas no automático
            loop={!customVideoUrl}
          ></video>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
            {/* Imagem de Capa Elegante (Fallback) */}
            <div className="absolute inset-0 opacity-50 bg-zinc-800">
               <img 
                 src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                 alt="Capa de notícias" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center p-6 mt-16">
              <div className="bg-red-600/10 p-4 rounded-full mb-4">
                <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 tracking-tight">Portal Nossa Web TV</h3>
              <p className="text-gray-300 text-sm md:text-base max-w-md">
                Nenhuma transmissão ao vivo iniciada. Acompanhe nossas atualizações nas notícias abaixo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
