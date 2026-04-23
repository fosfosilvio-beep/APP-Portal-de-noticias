"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Colunista {
  id: string;
  nome: string;
  cargo_descricao: string;
  foto_perfil: string;
  slug: string;
}

export default function ColunistasWidget() {
  const [colunistas, setColunistas] = useState<Colunista[]>([]);

  useEffect(() => {
    async function fetchColunistas() {
      const { data } = await supabase
        .from("colunistas")
        .select("id, nome, cargo_descricao, foto_perfil, slug")
        .limit(6);
      if (data) setColunistas(data);
    }
    fetchColunistas();
  }, []);

  if (colunistas.length === 0) return null;

  return (
    <section className="py-12 border-y border-slate-100 bg-white/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
              Nossos <span className="text-blue-600">Colunistas</span>
            </h2>
            <div className="h-1 w-12 bg-blue-600 rounded-full mt-1" />
          </div>
          <Link href="/colunistas" className="flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-6 no-scrollbar snap-x">
          {colunistas.map((colunista) => (
            <Link key={colunista.id} href={`/colunistas/${colunista.slug}`} className="flex-none snap-start group">
              <div className="flex flex-col items-center text-center space-y-4 w-32 md:w-40">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                    {colunista.foto_perfil ? (
                      <img src={colunista.foto_perfil} alt={colunista.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
                    <User size={14} />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-slate-900 font-black uppercase tracking-tighter leading-tight text-sm group-hover:text-blue-600 transition-colors">
                    {colunista.nome}
                  </h4>
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-1 line-clamp-1">
                    {colunista.cargo_descricao}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
