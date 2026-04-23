"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlaySquare, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getPublicUrl } from "@/components/FallbackImage";

export default function VideosWidget() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase
        .from("videos_vod")
        .select("*")
        .eq("status", "published")
        .eq("is_destaque", true)
        .order("created_at", { ascending: false })
        .limit(4);

      if (data) setVideos(data);
      setLoading(false);
    }
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm animate-pulse h-64"></div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <section className="w-full bg-slate-900 rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <PlaySquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Web TV <span className="text-blue-500">Vídeos</span></h2>
            <p className="text-slate-400 font-medium text-sm">Assista aos nossos principais destaques em VOD.</p>
          </div>
        </div>
        <Link href="/videos" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group bg-blue-950/50 px-4 py-2 rounded-xl">
          Ver todos os vídeos <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {videos.slice(0, 2).map((video) => (
          <Link href={`/videos`} key={video.id} className="group block">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black mb-4 border border-white/10 shadow-lg group-hover:shadow-blue-900/50 transition-all group-hover:-translate-y-1">
              <img 
                src={getPublicUrl(video.thumbnail_url) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"} 
                alt={video.titulo}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                  <PlaySquare size={24} className="ml-1" />
                </div>
              </div>
            </div>
            <h3 className="font-black text-lg leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
              {video.titulo}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
