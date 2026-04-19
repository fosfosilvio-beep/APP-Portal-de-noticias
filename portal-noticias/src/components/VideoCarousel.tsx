"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Play } from "lucide-react";

interface VideoItem {
  id: string;
  titulo: string;
  url_video: string;
  thumbnail: string;
  created_at: string;
}

interface VideoCarouselProps {
  onVideoSelect: (url: string) => void;
  activeUrl?: string | null;
}

export default function VideoCarousel({ onVideoSelect, activeUrl }: VideoCarouselProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("biblioteca_webtv")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Erro ao carregar carrossel:", error);
      } else if (data) {
        setVideos(data);
      }
      setLoading(false);
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex gap-4 overflow-hidden py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-w-[160px] md:min-w-[220px] aspect-video bg-slate-800 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full group/carousel">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
          Últimos Lançamentos
        </h3>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hidden md:block">Scroll para ver mais &rarr;</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar snap-x snap-proximity scroll-smooth items-stretch">
        {videos.map((video) => {
          const isActive = activeUrl === video.url_video;

          return (
            <button
              key={video.id}
              onClick={() => onVideoSelect(video.url_video)}
              className={`relative flex-none w-[180px] md:w-[240px] aspect-video rounded-xl overflow-hidden snap-start transition-all duration-500 flex flex-col items-start text-left group
                ${isActive ? 'ring-2 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'ring-1 ring-white/10 hover:ring-white/30'}
              `}
            >
              {/* Thumbnail */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={video.thumbnail || `https://picsum.photos/seed/${video.id}/400/225`} 
                  alt={video.titulo} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-90' : 'opacity-60 group-hover:opacity-80'}`}></div>
              </div>

              {/* Play Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-cyan-500/50 flex items-center justify-center text-white shadow-inner">
                    <Play size={18} fill="currentColor" className="text-cyan-400 drop-shadow-[0_0_8px_#06b6d4]" />
                 </div>
              </div>

              {/* Titulo */}
              <div className="absolute inset-x-0 bottom-0 p-3 z-10">
                <h4 className={`text-[11px] md:text-sm font-bold leading-tight line-clamp-2 transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>
                  {video.titulo}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
