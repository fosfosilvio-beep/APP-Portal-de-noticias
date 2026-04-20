"use client";

import { useEffect, useMemo } from "react";
import { detectLivePlatform } from "./SmartPlayer";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extrai o videoId de uma URL de live do YouTube para montar o chat embed */
function extractYouTubeLiveId(url: string): string | null {
  // Suporta: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/live/ID
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/live\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Facebook SDK loader (singleton)
// ─────────────────────────────────────────────────────────────────────────────
function useFacebookSDK() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.FB) {
      window.FB.XFBML.parse();
      return;
    }
    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v18.0";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
interface LiveChatProps {
  /** URL completa da transmissão ao vivo (YouTube ou Facebook) */
  liveUrl?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveChat({ liveUrl }: LiveChatProps) {
  useFacebookSDK();

  const platform = useMemo(() => detectLivePlatform(liveUrl ?? null), [liveUrl]);
  const youtubeVideoId = useMemo(
    () => (liveUrl && platform === "youtube" ? extractYouTubeLiveId(liveUrl) : null),
    [liveUrl, platform]
  );

  return (
    <div className="w-full h-full min-h-[480px] flex flex-col bg-[#0f172a] rounded-2xl overflow-hidden border border-white/5 shadow-2xl font-sans">
      {/* Header */}
      <div className="bg-slate-900 py-4 px-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <h3 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          Chat ao Vivo
        </h3>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {platform === "youtube" ? "Via YouTube" : "Via Facebook"}
        </span>
      </div>

      {/* Área de conteúdo */}
      <div className="flex-1 overflow-hidden relative">
        {platform === "youtube" && youtubeVideoId ? (
          /* Chat nativo do YouTube Live */
          <iframe
            src={`https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=${
              typeof window !== "undefined" ? window.location.hostname : "localhost"
            }`}
            className="w-full h-full border-0"
            title="Chat ao Vivo – YouTube"
            allow="camera *; microphone *"
          />
        ) : (
          /* Fallback: Comentários do Facebook */
          <div className="flex flex-col h-full overflow-y-auto p-4 bg-white">
            <div id="fb-root" />
            <div
              className="fb-comments"
              data-href={
                liveUrl ??
                (typeof window !== "undefined" ? window.location.href : "https://portalnossawebtv.com.br")
              }
              data-width="100%"
              data-numposts="20"
              data-colorscheme="light"
            />

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
              <span className="text-[10px] font-bold uppercase">
                Chat moderado pelo Facebook
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <div className="bg-slate-900/80 border-t border-white/5 px-5 py-3 shrink-0">
        <p className="text-slate-500 text-[10px] font-medium text-center uppercase tracking-widest">
          Nossa Web TV · Interação em Tempo Real
        </p>
      </div>
    </div>
  );
}

// Declarar o objeto FB no window para o TypeScript
declare global {
  interface Window {
    FB: {
      XFBML: { parse: () => void };
      [key: string]: unknown;
    };
  }
}
