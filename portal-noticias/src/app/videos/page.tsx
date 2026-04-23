"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PlaySquare, ChevronLeft, Loader2, X } from "lucide-react";
import Link from "next/link";
import { getPublicUrl } from "@/components/FallbackImage";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any;

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const { data } = await supabase
      .from("videos_vod")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (data) setVideos(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-blue-200">
      <Header showNavigation={false} />

      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors mb-6">
            <ChevronLeft size={16} /> Voltar para o Portal
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <PlaySquare size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Web TV <span className="text-blue-600">On Demand</span></h1>
              <p className="text-slate-500 font-medium mt-2 text-lg">Assista às nossas reportagens e transmissões exclusivas.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
            <PlaySquare size={48} className="mx-auto text-slate-300 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Nenhum vídeo disponível</h3>
            <p className="text-slate-500 font-medium mt-2">Em breve novos conteúdos serão publicados aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {videos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => setActiveVideo(video)}
                className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                <div className="relative h-48 sm:h-56 w-full rounded-[1.5rem] overflow-hidden bg-slate-900 mb-4">
                  <img 
                    src={getPublicUrl(video.thumbnail_url) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"} 
                    alt={video.titulo}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 group-hover:scale-110 group-hover:bg-blue-600 transition-all">
                      <PlaySquare size={24} className="ml-1" />
                    </div>
                  </div>
                  {video.is_destaque && (
                    <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                      Destaque
                    </div>
                  )}
                </div>
                <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {video.titulo}
                </h3>
                <p className="text-slate-500 text-sm mt-2 line-clamp-2 flex-grow">
                  {video.descricao}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Publicado em {new Date(video.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-10 animate-in fade-in duration-300">
          <button 
            onClick={() => setActiveVideo(null)}
            className="absolute top-6 right-6 lg:top-10 lg:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors z-10"
          >
            <X size={24} />
          </button>
          
          <div className="w-full max-w-6xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative border border-white/10">
            {/* @ts-ignore */}
            <ReactPlayer 
              url={activeVideo.video_url}
              width="100%"
              height="100%"
              controls
              playing
            />
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 lg:bottom-10 lg:left-10 max-w-4xl">
            <h2 className="text-white text-2xl lg:text-4xl font-black tracking-tight mb-2 drop-shadow-md">
              {activeVideo.titulo}
            </h2>
            <p className="text-slate-300 text-sm lg:text-base max-w-3xl drop-shadow-md line-clamp-3">
              {activeVideo.descricao}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
