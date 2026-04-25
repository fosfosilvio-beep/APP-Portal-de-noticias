"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Category {
  id: string;
  nome: string;
  slug: string;
}

interface CategoryNavProps {
  categoriaAtiva: string;
  setCategoriaAtiva: (cat: string) => void;
}

export default function CategoryNav({ categoriaAtiva, setCategoriaAtiva }: CategoryNavProps) {
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCategorias = async () => {
      const supabase = createClient();
      const allowedNormalized = ['geral', 'arapongas', 'esportes', 'policia', 'politica', 'economia', 'entretenimento'];
      
      const { data } = await supabase
        .from("categorias")
        .select("id, nome, slug")
        .eq("ativa", true)
        .order("ordem", { ascending: true });

      if (data) {
        // Garantir "Início" no começo
        const base = [{ id: "inicio", nome: "Início", slug: "inicio" }, ...data] as Category[];
        setCategorias(base);
      }
    };

    fetchCategorias();
  }, []);

  if (!mounted) return null;

  return (
    <nav className="lg:hidden sticky top-[68px] z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
      <div className="relative flex items-center overflow-hidden">
        {/* Gradiente Esquerda */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
        
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide py-3.5 px-6 gap-3">
            {categorias.map((cat) => {
              const isActive = categoriaAtiva.toLowerCase() === cat.nome.toLowerCase();
              const isArapongas = cat.nome.toLowerCase() === "arapongas";
              
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoriaAtiva(cat.nome);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-[10px] uppercase font-black tracking-[0.15em] transition-all px-4 py-1.5 rounded-full border ${
                    isActive
                      ? "text-white bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      : isArapongas 
                        ? "text-sky-400 border-sky-400/20 bg-sky-400/5 hover:bg-sky-400/10"
                        : "text-zinc-500 hover:text-zinc-300 border-transparent"
                  }`}
                >
                  {cat.nome}
                </button>
              );
            })}
        </div>

        {/* Gradiente Direita */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
      </div>
    </nav>
  );
}
