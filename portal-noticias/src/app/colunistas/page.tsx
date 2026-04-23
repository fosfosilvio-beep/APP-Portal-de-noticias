"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { User, ChevronRight, Loader2 } from "lucide-react";
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

export default function ColunistasPage() {
  const [colunistas, setColunistas] = useState<Colunista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchColunistas() {
      const { data } = await supabase.from("colunistas").select("*").order("nome");
      if (data) setColunistas(data);
      setLoading(false);
    }
    fetchColunistas();
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic">
            Nossos <span className="text-blue-600">Colunistas</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Conheça as vozes que trazem análises, opiniões e perspectivas exclusivas sobre Arapongas e o mundo.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {colunistas.map((colunista, index) => (
              <motion.div
                key={colunista.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/colunistas/${colunista.slug}`} className="group block">
                  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                        {colunista.foto_perfil ? (
                          <img src={colunista.foto_perfil} alt={colunista.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                            <User size={48} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                        {colunista.nome}
                      </h2>
                      <p className="text-blue-600 text-xs font-black uppercase tracking-widest mt-2">
                        {colunista.cargo_descricao}
                      </p>
                    </div>

                    <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">
                      {colunista.biografia}
                    </p>

                    <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest pt-2">
                      Ver colunas <ChevronRight size={14} />
                    </div>
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
