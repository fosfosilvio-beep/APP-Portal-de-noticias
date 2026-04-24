"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";
import { Megaphone } from "lucide-react";

interface AdSlotProps {
  posicao?: 'home_topo' | 'home_meio' | 'noticia_lateral' | 'noticia_meio';
  className?: string;
  bannerId?: string;
}

export default function AdSlot({ posicao, className = "", bannerId }: AdSlotProps) {
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchBanner();
  }, [posicao, bannerId]);

  const fetchBanner = async () => {
    const supabase = createClient();
    if (!supabase) return;
    
    let query = supabase.from("publicidade_banners").select("*").eq("status", true);
    
    if (bannerId) {
      query = query.eq("id", bannerId);
    } else if (posicao) {
      query = query.eq("posicao", posicao);
    } else {
      setLoading(false);
      return;
    }

    const { data, error } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (data) {
      setBanner(data);
      // Registrar visualização sem travar o render (usando then em vez de catch direto para evitar TypeError)
      supabase.rpc("incrementar_visualizacao_banner", { banner_id: data.id }).then((res: any) => {
        if (res.error) console.warn("Erro ao registrar visualização:", res.error);
      });
    }
    setLoading(false);
  };

  const handleClick = () => {
    if (banner) {
      const supabase = createClient();
      if (!supabase) return;
      supabase.rpc("incrementar_clique_banner", { banner_id: banner.id }).then((res: any) => {
        if (res.error) console.warn("Erro ao registrar clique:", res.error);
      });
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
