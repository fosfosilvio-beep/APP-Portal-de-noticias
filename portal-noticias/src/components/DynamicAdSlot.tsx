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

  if (loading) return <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`} />;

  if (!ad || !ad.codigo_html_ou_imagem) {
    return fallback || null;
  }

  const isHtml = ad.codigo_html_ou_imagem.includes("<") && ad.codigo_html_ou_imagem.includes(">");

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-200 transition-all duration-300 hover:shadow-lg ${className}`}>
      {isHtml ? (
        <div dangerouslySetInnerHTML={{ __html: ad.codigo_html_ou_imagem }} />
      ) : (
        <a href="#" target="_blank" className="relative block group">
          <img 
            src={ad.codigo_html_ou_imagem} 
            alt={ad.nome_slot} 
            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700" 
          />
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
             Publicidade <ExternalLink size={10} />
          </div>
        </a>
      )}
    </div>
  );
}
