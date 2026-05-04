"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import NewsCard from "./NewsCard";

interface NewsGridProps {
  title: string;
  icon?: React.ReactNode;
  news: any[];
  limit?: number;
  paginated?: boolean;
}

export default function NewsGrid({ title, icon, news, limit = 18, paginated = false }: NewsGridProps) {
  const [visibleCount, setVisibleCount] = useState(8);

  // Auditoria de contagem solicitada
  useEffect(() => {
    if (paginated) {
      console.log(`[NewsGrid Audit] Total no Banco: ${news.length} | Exibindo: ${Math.min(visibleCount, news.length)}`);
    }
  }, [news.length, visibleCount, paginated]);

  if (!news || news.length === 0) return null;
  
  const effectiveLimit = paginated ? visibleCount : limit;
  const displayNews = news.slice(0, effectiveLimit);
  const totalNews = news.length;
  const hasMore = totalNews > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  return (
    <section className="flex flex-col mt-4">
      {/* Cabeçalho Principal */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
          <span className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_12px_#06b6d4]"></span> 
          {icon && <span className="text-cyan-500">{icon}</span>}
          {title}
        </h2>
      </div>

      <div className="flex flex-col divide-y divide-slate-200">
        {displayNews.map((noticia, index) => {
          const isEndOfBlock = (index + 1) % 8 === 0;
          
          return (
            <div key={noticia.id}>
              <NewsCard noticia={noticia} index={index} />
              
              {/* Divisor de Bloco (Apenas visual, sem botão interno para evitar sumiço precoce) */}
              {paginated && isEndOfBlock && (index + 1) < totalNews && (
                <div className="py-12 flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{title}</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão de Ação Centralizado (Sempre visível se houver mais notícias) */}
      {paginated && hasMore && (
         <div className="py-16 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Divisor final se o último item não foi um múltiplo de 8 */}
            {visibleCount % 8 !== 0 && (
              <div className="w-full flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{title}</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
            )}
            
            <button 
              onClick={loadMore}
              className="group flex items-center gap-4 bg-white border-2 border-slate-200 hover:border-cyan-500 px-12 py-4 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 active:scale-95"
            >
              <span className="text-sm font-black uppercase tracking-widest text-slate-600 group-hover:text-cyan-600 transition-colors">
                Ver Mais Notícias
              </span>
              <div className="w-8 h-8 bg-slate-100 group-hover:bg-cyan-500 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-90">
                <Plus size={18} className="text-slate-500 group-hover:text-white" />
              </div>
            </button>
            <p className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Mostrando {displayNews.length} de {totalNews} matérias
            </p>
         </div>
      )}
    </section>
  );
}
