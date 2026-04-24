"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { Megaphone } from "lucide-react";

interface AdSlotProps {
  posicao: 'home_topo' | 'home_meio' | 'noticia_lateral' | 'noticia_meio';
  className?: string;
}

export default function AdSlot({ posicao, className = "" }: AdSlotProps) {
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchBanner();
  }, [posicao]);

  const fetchBanner = async () => {
    // Busca o banner mais recente (ou randômico se houvesse lógica) que esteja ativo na posição X
    const { data } = await supabase
      .from("publicidade_banners")
      .select("*")
      .eq("status", true)
      .eq("posicao", posicao)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setBanner(data);
      // Registrar visualização sem travar o render
      supabase.rpc("incrementar_visualizacao_banner", { banner_id: data.id }).catch(() => {});
    }
    setLoading(false);
  };

  const handleClick = () => {
    if (banner) {
      supabase.rpc("incrementar_clique_banner", { banner_id: banner.id }).catch(() => {});
    }
  };

  if (loading) {
    return (
      <div className={`w-full bg-slate-50 animate-pulse rounded-2xl border border-slate-100 ${className}`}></div>
    );
  }

  if (!banner) {
    return (
      <div className={`w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 ${className}`}>
        <Megaphone className="text-slate-300 mb-2" size={24} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Anuncie Aqui</span>
      </div>
    );
  }

  return (
    <div className={`w-full relative overflow-hidden rounded-2xl group ${className}`}>
      {banner.link_destino ? (
        <a href={banner.link_destino} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block w-full h-full">
          <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
        </a>
      ) : (
        <img src={banner.imagem_url} alt={banner.titulo} className="w-full h-full object-cover" />
      )}
      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Patrocinado
      </div>
    </div>
  );
}
