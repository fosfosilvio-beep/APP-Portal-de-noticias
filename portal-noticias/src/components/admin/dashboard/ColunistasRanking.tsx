"use client";

import { User, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ColunistaRank {
  id: string;
  nome: string;
  foto_perfil: string;
  totalViews: number;
  countMaterias: number;
}

interface ColunistasRankingProps {
  ranking: ColunistaRank[];
}

export default function ColunistasRanking({ ranking }: ColunistasRankingProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl italic">
            Ranking de <span className="text-blue-600">Colunistas</span>
          </h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Engajamento total por autor
          </p>
        </div>
        <Link href="/admin/colunistas" className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:translate-x-1 transition-transform">
          Gerenciar <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-4">
        {ranking.length === 0 ? (
          <p className="text-slate-400 text-sm font-medium italic py-4">Nenhum dado de colunista disponível.</p>
        ) : (
          ranking.map((col, i) => (
            <div key={col.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="text-slate-300 font-black text-xl italic w-6">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                  {col.foto_perfil ? (
                    <img src={col.foto_perfil} alt={col.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-slate-900 font-black uppercase tracking-tighter text-sm group-hover:text-blue-600 transition-colors">
                    {col.nome}
                  </h4>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    {col.countMaterias} colunas escritas
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-slate-900 font-black italic">
                  <Eye size={14} className="text-blue-600" />
                  {col.totalViews.toLocaleString()}
                </div>
                <p className="text-slate-300 text-[9px] font-black uppercase tracking-widest">Visualizações</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
