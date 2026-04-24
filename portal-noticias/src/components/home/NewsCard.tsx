"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import FallbackImage from "../FallbackImage";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { getVisualCategory } from "@/lib/category-utils";

interface NewsCardProps {
  noticia: any; // Ideally we should use Database['public']['Tables']['noticias']['Row']
  index?: number;
}

export default function NewsCard({ noticia, index = 0 }: NewsCardProps) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
      >
      <Link 
        href={`/noticia/${noticia.slug || noticia.id}`} 
        className="group flex flex-col h-full bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-900/10 transition-shadow duration-300"
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-slate-800 isolate">
          <FallbackImage 
            src={noticia.imagem_capa} 
            alt={noticia.titulo} 
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0"
          />
          <div className="absolute inset-x-0 bottom-0 h-[80%] bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none"></div>
          
          {/* Play icon */}
          {(noticia.video_url || noticia.mostrar_no_player) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                <Play size={14} fill="currentColor" className="text-white drop-shadow-[0_0_10px_#00AEE0] sm:w-5 sm:h-5" />
              </div>
            </div>
          )}

          {/* Tag compacta */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
            <span className="bg-slate-900/80 backdrop-blur-md text-slate-50 text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-full shadow-lg border border-white/10">
              {getVisualCategory(noticia.categorias?.nome || noticia.categoria)}
            </span>
          </div>

          {/* Patrocinado */}
          {noticia.is_sponsored && (
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
              <span className="bg-amber-500/90 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow border border-amber-400/30">
                ⭐
              </span>
            </div>
          )}
          
          {/* Conteúdo sobre thumbnail */}
          <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4 flex flex-col z-30">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[7px] sm:text-[9px] text-slate-300 font-bold uppercase tracking-widest bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/5">
                {noticia?.created_at ? new Date(noticia.created_at).toLocaleDateString() : "Sem data"}
              </span>
            </div>
            <h3 className="text-xs sm:text-base md:text-lg font-bold text-slate-50 leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2 sm:line-clamp-3">
              {noticia?.titulo || "Sem título"}
            </h3>
          </div>
        </div>
      </Link>
      </m.div>
    </LazyMotion>
  );
}
