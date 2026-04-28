"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ExternalLink } from "lucide-react";
import DOMPurify from "dompurify";
import { formatExternalUrl } from "@/lib/utils";

interface AdSlotData {
  id: string;
  nome_slot: string;
  posicao_html: string;
  dimensoes: string;
  codigo_html_ou_imagem: string | null;
  status_ativo: boolean;
  validade_ate?: string | null;
  link_destino?: string | null;
}

interface DynamicAdSlotProps {
  position: string;
  className?: string;
  noticiaId?: string;
  fallback?: React.ReactNode;
  initialData?: AdSlotData;
}

export default function DynamicAdSlot({ position, className, noticiaId, fallback, initialData }: DynamicAdSlotProps) {
  const [ad, setAd] = useState<AdSlotData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    // Se já temos dados iniciais e eles correspondem à posição, não buscamos novamente
    if (initialData && initialData.posicao_html === position) {
       setLoading(false);
       return;
    }
    
    async function loadAd() {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("ad_slots")
        .select("*")
        .eq("posicao_html", position)
        .eq("status_ativo", true)
        .limit(1)
        .maybeSingle();
      
      if (data) setAd(data as AdSlotData);
      setLoading(false);
    }
    loadAd();
  }, [position]);

  // Tracking de Impressão
  useEffect(() => {
    if (ad && !tracked) {
      const trackImpression = async () => {
        try {
          await fetch("/api/ads/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              impressions: [{
                slot_id: ad.id,
                noticia_id: noticiaId || null,
                viewport_w: window.innerWidth,
                viewport_h: window.innerHeight,
                viewed_at: new Date().toISOString()
              }]
            })
          });
          setTracked(true);
        } catch (err) {
          console.error("[Ad Tracking] Failed to track impression:", err);
        }
      };

      // Pequeno delay para garantir que o banner foi renderizado
      const timer = setTimeout(trackImpression, 1000);
      return () => clearTimeout(timer);
    }
  }, [ad, tracked, noticiaId]);

  if (loading) return <div className={`animate-pulse bg-transparent h-32 ${className}`} />;

  const defaultFallback = (
    <div className={`w-full overflow-hidden rounded-xl border-2 border-slate-200 border-dashed bg-transparent hover:border-slate-300 transition-all duration-300 group ${className}`} style={{ minHeight: '90px' }}>
      <a href="/anuncie" className="w-full h-full flex flex-col items-center justify-center py-4 px-2 text-slate-400 group-hover:text-cyan-600 transition-colors">
         <span className="font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs mb-1">Anuncie Aqui</span>
         <span className="text-[9px] sm:text-[10px] font-bold">Ver planos disponíveis</span>
      </a>
    </div>
  );

  // If no ad is found, or it has no content, return fallback
  if (!ad || !ad.codigo_html_ou_imagem) {
    return fallback || defaultFallback;
  }

  // Check expiration
  const expirationDate = ad.validade_ate || (ad as any).end_date;
  if (expirationDate && new Date(expirationDate) < new Date()) {
    return fallback || defaultFallback;
  }


  const isHtml = ad.codigo_html_ou_imagem.includes("<") && ad.codigo_html_ou_imagem.includes(">");
  const clickUrl = ad.link_destino || (ad as any).click_url;
  const hrefUrl = (clickUrl && clickUrl !== "#") 
    ? `/api/ads/click?id=${ad.id}${noticiaId ? `&noticia_id=${noticiaId}` : ""}` 
    : "#";

  return (
    <div className={`w-full overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}>
      {isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ad.codigo_html_ou_imagem, {
          ADD_TAGS: ['iframe', 'script'],
          ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'loading']
        }) }} />
      ) : (
        <a 
          href={hrefUrl} 
          target={clickUrl ? "_blank" : "_self"} 
          className="relative block group w-full"
        >
          <img 
            src={ad.codigo_html_ou_imagem} 
            alt={ad.nome_slot} 
            className="w-full h-auto object-cover group-hover:scale-[1.01] transition-transform duration-500" 
          />
          <div className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-white text-[7px] font-bold uppercase tracking-widest flex items-center gap-0.5">
             Publicidade <ExternalLink size={8} />
          </div>
        </a>
      )}
    </div>
  );
}
