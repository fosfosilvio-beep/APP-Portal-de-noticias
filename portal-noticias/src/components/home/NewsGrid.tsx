import { ChevronRight } from "lucide-react";
import NewsCard from "./NewsCard";

interface NewsGridProps {
  title: string;
  icon?: React.ReactNode;
  news: any[];
  limit?: number;
}

export default function NewsGrid({ title, icon, news, limit = 18 }: NewsGridProps) {
  if (!news || news.length === 0) return null;
  
  const displayNews = news.slice(0, limit);

  return (
    <section className="flex flex-col mt-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
          <span className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_12px_#06b6d4]"></span> 
          {icon && <span className="text-cyan-500">{icon}</span>}
          {title}
        </h2>
        <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
          Ver mais <ChevronRight size={14} />
        </div>
      </div>

      <div className="flex flex-col divide-y divide-slate-200">
        {displayNews.map((noticia, index) => (
          <NewsCard key={noticia.id} noticia={noticia} index={index} />
        ))}
      </div>
    </section>
  );
}
