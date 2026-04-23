"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPublicUrl } from "@/components/FallbackImage";

export default function EdicoesWidget() {
  const [edicao, setEdicao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEdicao() {
      const supabase = createClient();
      const { data } = await supabase
        .from("edicoes_digitais")
        .select("*")
        .eq("is_destaque", true)
        .order("data_publicacao", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setEdicao(data);
      } else {
        // Fallback to latest if no destaque
        const { data: latest } = await supabase
          .from("edicoes_digitais")
          .select("*")
          .order("data_publicacao", { ascending: false })
          .limit(1)
          .single();
        if (latest) setEdicao(latest);
      }
      setLoading(false);
    }
    fetchEdicao();
  }, []);

  if (loading || !edicao) return null;

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[50px] -z-10"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm">Edição <span className="text-blue-600">Digital</span></h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leia online</p>
        </div>
      </div>

      <Link href={`/edicoes-digitais/${edicao.id}`} className="block relative aspect-[3/4] rounded-[1.5rem] overflow-hidden bg-slate-100 mb-4 border border-slate-200 shadow-inner group-hover:shadow-lg transition-all group-hover:-translate-y-1">
        <img 
          src={getPublicUrl(edicao.capa_url) || ""} 
          alt={edicao.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
          <span className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-1">
            Ler agora <ArrowRight size={14} />
          </span>
        </div>
      </Link>

      <h4 className="font-black text-slate-900 text-sm leading-tight text-center line-clamp-2">{edicao.titulo}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">
        {new Date(edicao.data_publicacao).toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}
