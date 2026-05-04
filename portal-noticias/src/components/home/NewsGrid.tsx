"use client";

import { useState } from "react";
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
      {/* Cabeçalho Principal (Bloco 1) */}
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
          const isLastVisible = (index + 1) === visibleCount;
          
          return (
            <div key={noticia.id}>
              <NewsCard noticia={noticia} index={index} />
              
              {/* Lógica de Divisor e Botão Dinâmico */}
              {paginated && isEndOfBlock && (index + 1) < totalNews && (
                <div className="py-12 flex flex-col items-center">
                  <div className="w-full flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{title}</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                  </div>
                  
                  {/* O botão aparece se for o fim do bloco visível atual E houver mais no banco */}
                  {isLastVisible && hasMore && (
                    <button 
                      onClick={loadMore}
                      className="group flex items-center gap-3 bg-white border-2 border-slate-100 hover:border-cyan-500 px-8 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                    >
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-600">Ver Mais Notícias</span>
                      <div className="w-6 h-6 bg-slate-50 group-hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-colors">
                        <Plus size={14} className="text-slate-400 group-hover:text-white" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão de Contingência: Se o total de notícias não for múltiplo de 8, 
          garantimos que o botão apareça no fim da lista atual se houver mais */}
      {paginated && hasMore && visibleCount % 8 !== 0 && (
         <div className="py-12 flex flex-col items-center">
            <div className="w-full flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{title}</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>
            <button 
              onClick={loadMore}
              className="group flex items-center gap-3 bg-white border-2 border-slate-100 hover:border-cyan-500 px-8 py-3 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
            >
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-cyan-600">Ver Mais Notícias</span>
              <div className="w-6 h-6 bg-slate-50 group-hover:bg-cyan-500 rounded-lg flex items-center justify-center transition-colors">
                <Plus size={14} className="text-slate-400 group-hover:text-white" />
              </div>
            </button>
         </div>
      )}
    </section>
  );
}
