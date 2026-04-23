"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ExternalLink } from "lucide-react";

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
  fallback?: React.ReactNode;
}

export default function DynamicAdSlot({ position, className, fallback }: DynamicAdSlotProps) {
  const [ad, setAd] = useState<AdSlotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAd() {
      const { data } = await supabase
        .from("ad_slots")
        .select("*")
        .eq("posicao_html", position)
        .eq("status_ativo", true)
        .limit(1)
        .single();
      
      if (data) setAd(data);
      setLoading(false);
    }
    loadAd();
  }, [position]);

  if (loading) return <div className={`animate-pulse bg-slate-100 rounded-xl h-32 ${className}`} />;

  const defaultFallback = (
    <div className={`w-full overflow-hidden rounded-xl border-2 border-slate-200 border-dashed bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all duration-300 group ${className}`} style={{ minHeight: '90px' }}>
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
  if (ad.validade_ate && new Date(ad.validade_ate) < new Date()) {
    return fallback || defaultFallback;
  }

  const isHtml = ad.codigo_html_ou_imagem.includes("<") && ad.codigo_html_ou_imagem.includes(">");
  const hrefUrl = ad.link_destino ? `/api/ads/click?id=${ad.id}` : "#";

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-md max-h-32 sm:max-h-64 md:max-h-none ${className}`}>
      {isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: ad.codigo_html_ou_imagem }} />
      ) : (
        <a href={hrefUrl} target={ad.link_destino ? "_blank" : "_self"} className="relative block group">
          <img 
            src={ad.codigo_html_ou_imagem} 
            alt={ad.nome_slot} 
            className="w-full h-full object-contain max-h-32 sm:max-h-64 md:max-h-none group-hover:scale-[1.02] transition-transform duration-500" 
          />
          <div className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-white text-[7px] font-bold uppercase tracking-widest flex items-center gap-0.5">
             Publicidade <ExternalLink size={8} />
          </div>
        </a>
      )}
    </div>
  );
}
