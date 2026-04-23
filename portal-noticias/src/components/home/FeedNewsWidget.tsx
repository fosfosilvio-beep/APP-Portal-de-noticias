"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Zap, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

export default function FeedNewsWidget() {
  const [noticiasRapidas, setNoticiasRapidas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNoticiasRapidas() {
      // Buscar matérias recentes (publicadas) que vieram de RSS
      // Podemos identificar pelo trecho "Importado de" no conteúdo
      const { data } = await supabase
        .from("noticias")
        .select("id, titulo, slug, created_at, conteudo")
        .eq("status", "published")
        .ilike("conteudo", "%Importado de%")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setNoticiasRapidas(data);
      }
      setLoading(false);
    }
    fetchNoticiasRapidas();
  }, []);

  if (loading || noticiasRapidas.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-[50px] -z-10 opacity-50"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
          <Zap size={20} className="animate-pulse" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm">Notícias <span className="text-orange-500">Rápidas</span></h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giro de Notícias</p>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        {noticiasRapidas.map((noticia) => (
          <Link key={noticia.id} href={`/noticia/${noticia.slug}`} className="group/item flex flex-col gap-1 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
            <h4 className="font-bold text-sm text-slate-700 leading-snug group-hover/item:text-orange-500 transition-colors line-clamp-2">
              {noticia.titulo}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                Urgente
              </span>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {new Date(noticia.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
