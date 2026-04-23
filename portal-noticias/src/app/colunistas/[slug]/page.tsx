"use client";

import { useState, useEffect, use } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { User, Calendar, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Colunista {
  id: string;
  nome: string;
  cargo_descricao: string;
  foto_perfil: string;
  slug: string;
  biografia: string;
}

interface Materia {
  id: string;
  titulo: string;
  subtitulo: string;
  slug: string;
  imagem_capa: string;
  created_at: string;
}

export default function ColunistaProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [colunista, setColunista] = useState<Colunista | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch colunista
      const { data: colData } = await supabase
        .from("colunistas")
        .select("*")
        .eq("slug", slug)
        .single();

      if (colData) {
        setColunista(colData);
        // Fetch materias do colunista
        const { data: matData } = await supabase
          .from("noticias")
          .select("id, titulo, subtitulo, slug, imagem_capa, created_at")
          .eq("colunista_id", colData.id)
          .order("created_at", { ascending: false });
        
        if (matData) setMaterias(matData);
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!colunista) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <h1 className="text-2xl font-black text-slate-900 uppercase italic">Colunista não encontrado</h1>
        <Link href="/colunistas" className="text-blue-600 font-bold mt-4">Voltar para listagem</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      {/* Bio Section */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative shrink-0"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-8 border-slate-50 shadow-2xl">
                {colunista.foto_perfil ? (
                  <img src={colunista.foto_perfil} alt={colunista.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <User size={80} />
                  </div>
                )}
              </div>
            </motion.div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <p className="text-blue-600 text-sm font-black uppercase tracking-widest leading-none">
                  {colunista.cargo_descricao}
                </p>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-[0.9]">
                  {colunista.nome}
                </h1>
              </div>
              <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-2xl">
                {colunista.biografia}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feed de Matérias */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px bg-slate-200 flex-1" />
          <h2 className="text-slate-400 font-black uppercase tracking-widest text-xs flex items-center gap-2">
            <BookOpen size={14} /> Colunas Publicadas ({materias.length})
          </h2>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {materias.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 p-12">
            <p className="text-slate-400 font-bold italic">Nenhuma coluna publicada ainda.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {materias.map((materia) => (
              <motion.div
                key={materia.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Link href={`/noticia/${materia.slug}`} className="group flex flex-col md:flex-row gap-8 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
                  <div className="w-full md:w-64 h-48 shrink-0 rounded-3xl overflow-hidden relative">
                    {materia.imagem_capa ? (
                      <img src={materia.imagem_capa} alt={materia.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-50" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(materia.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                      {materia.titulo}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2">
                      {materia.subtitulo}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
