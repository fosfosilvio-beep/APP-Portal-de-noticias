"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface ConfiguracaoPortal {
  id?: number;
  is_live: boolean;
  url_live_facebook: string | null;
  fake_viewers_boost: number;
}

export default function SmartPlayer() {
  const [config, setConfig] = useState<ConfiguracaoPortal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("configuracao_portal")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        console.error("Erro ao buscar configuração:", error);
      } else if (data) {
        setConfig(data);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

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
        (payload) => {
          // Atualiza o estado com a nova configuração
          setConfig(payload.new as ConfiguracaoPortal);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="animate-pulse flex flex-col space-y-4 w-full max-w-4xl">
          <div className="h-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  // Falha de carregamento ou sem configuração
  if (!config) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto my-6 font-sans">
      {/* Cabeçalho do Player */}
      <div className="flex justify-end mb-2">
        {config.is_live && (
          <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-sm shadow-sm animate-pulse">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span className="text-white font-bold text-sm tracking-wide">
              AO VIVO: {config.fake_viewers_boost?.toLocaleString() || 0}
            </span>
          </div>
        )}
      </div>

      {/* Área do Player (Proporção 16:9) */}
      <div className="relative w-full overflow-hidden rounded-md shadow-lg bg-black group" style={{ paddingTop: "56.25%" }}>
        {config.is_live && config.url_live_facebook ? (
          <iframe
            src={config.url_live_facebook}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            title="Transmissão ao vivo"
          ></iframe>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
            {/* Imagem de Capa Elegante (Fallback) */}
            <div className="absolute inset-0 opacity-50">
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
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 tracking-tight">Portal de Notícias</h3>
              <p className="text-gray-300 text-sm md:text-base max-w-md">
                No momento não há nenhuma transmissão ao vivo. Acompanhe nossas últimas atualizações e reportagens pelo site.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
