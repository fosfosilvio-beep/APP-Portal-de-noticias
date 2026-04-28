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
        className="group flex flex-col md:flex-row gap-4 md:gap-6 py-6 transition-all duration-300"
      >
        {/* Conteúdo Textual - Mobile: Topo | Desktop: Direita */}
        <div className="flex flex-col flex-1 order-1 md:order-2">
          {/* Tag / Categoria */}
          <div className="mb-2">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#00AEE0]">
              {getVisualCategory(noticia.categorias?.nome || noticia.categoria)}
            </span>
          </div>

          <h3 className="text-lg md:text-2xl font-bold text-slate-900 leading-tight group-hover:text-[#00AEE0] transition-colors line-clamp-3 mb-2">
            {noticia?.titulo || "Sem título"}
          </h3>

          <div className="flex items-center gap-2 mt-auto">
            <span className="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wider">
              {noticia?.created_at ? new Date(noticia.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Sem data"}
            </span>
            {noticia.is_sponsored && (
              <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-200">
                Patrocinado
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail - Mobile: Baixo | Desktop: Esquerda */}
        <div className="relative aspect-video w-full md:w-[33%] shrink-0 overflow-hidden rounded-lg sm:rounded-xl bg-slate-100 order-2 md:order-1">
          <FallbackImage 
            src={noticia.imagem_capa} 
            alt={noticia.titulo} 
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          
          {/* Play icon flutuante sobre a imagem se houver vídeo */}
          {(noticia.video_url || noticia.mostrar_no_player) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                <Play size={18} fill="currentColor" />
              </div>
            </div>
          )}
        </div>
      </Link>
      </m.div>
    </LazyMotion>
  );
}
