"use client";

import { Siren, Loader2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

interface PlantaoData {
  id: string;
  titulo: string;
  subtitulo: string;
  imagem_capa: string;
  slug: string;
  created_at: string;
}

export default function PlantaoPolicialWidget() {
  const [plantao, setPlantao] = useState<PlantaoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlantao();

    // Realtime para novas notícias policiais
    const channel = supabase
      .channel("realtime-plantao-noticias")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "noticias" },
        () => {
          fetchPlantao();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPlantao = async () => {
    try {
      // Busca a matéria mais recente da categoria Plantão Policial Arapongas
      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, subtitulo, imagem_capa, slug, created_at, categorias!inner(slug)")
        .eq("categorias.slug", "plantao-policial-arapongas")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("[PlantaoPolicial] Fetch error:", error.message);
        return;
      }
      
      if (data) {
        setPlantao(data as any);
      }
    } catch (err) {
      console.error("Erro ao buscar plantão policial:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCapaUrl = (path: string) => {
    if (!path) return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-3 px-1">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40"></span>
          <div className="relative inline-flex rounded-full h-8 w-8 bg-red-600 items-center justify-center border border-red-700 shadow-sm">
            <Siren size={18} className="text-white" />
          </div>
        </div>
        <h3 className="font-black text-red-600 uppercase tracking-tight text-sm">
          Plantão Policial <span className="text-black">Arapongas</span>
        </h3>
      </div>

      <Link 
        href={plantao ? `/noticia/${plantao.slug}` : "/categoria/plantao-policial-arapongas"}
        className="block group bg-white border border-red-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
      >
        <div className="relative h-40 overflow-hidden">
          {loading ? (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <Loader2 className="animate-spin text-red-600" size={24} />
            </div>
          ) : (
            <>
              <img 
                src={getCapaUrl(plantao?.imagem_capa || "")} 
                alt={plantao?.titulo || "Plantão Policial"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </>
          )}
        </div>

        <div className="p-4 border-l-4 border-red-600">
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-slate-50 rounded w-full animate-pulse"></div>
            </div>
          ) : plantao ? (
            <>
              <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                {plantao.titulo}
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 italic">
                {plantao.subtitulo}
              </p>
            </>
          ) : (
            <div className="py-4 text-center">
               <p className="text-xs text-slate-400 italic">Aguardando novas ocorrências...</p>
            </div>
          )}
        </div>
      </Link>

      <Link 
        href="/categoria/plantao-policial-arapongas"
        className="w-full py-3 bg-slate-900 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:shadow-red-200"
      >
        Ver Ocorrências <ExternalLink size={12} />
      </Link>
    </div>
  );
}
