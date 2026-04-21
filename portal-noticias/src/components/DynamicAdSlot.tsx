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

  if (!ad || !ad.codigo_html_ou_imagem) {
    return fallback || null;
  }

  const isHtml = ad.codigo_html_ou_imagem.includes("<") && ad.codigo_html_ou_imagem.includes(">");

  return (
    // max-h-48 no mobile garante que o ad nunca ocupe 100% da viewport
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-md max-h-48 sm:max-h-64 md:max-h-none ${className}`}>
      {isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: ad.codigo_html_ou_imagem }} />
      ) : (
        <a href="#" target="_blank" className="relative block group">
          <img 
            src={ad.codigo_html_ou_imagem} 
            alt={ad.nome_slot} 
            className="w-full h-full object-contain max-h-48 sm:max-h-64 md:max-h-none group-hover:scale-[1.02] transition-transform duration-500" 
          />
          <div className="absolute top-1.5 right-1.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-white text-[7px] font-bold uppercase tracking-widest flex items-center gap-0.5">
             Publicidade <ExternalLink size={8} />
          </div>
        </a>
      )}
    </div>
  );
}
