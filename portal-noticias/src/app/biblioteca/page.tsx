"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";
import { Video, Film, Play, Calendar, Tag, Search, Filter } from "lucide-react";

export default function BibliotecaPublica() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const categorias = ["Todas", "Geral", "Esportes", "Polícia", "Política", "Entretenimento"];

  useEffect(() => {
    fetchConfig();
    fetchVideos();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase.from("configuracao_portal").select("*").single();
    if (data) setConfig(data);
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("biblioteca_webtv")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
      setFilteredVideos(data || []);
    } catch (err) {
      console.error("Erro ao buscar biblioteca:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "Todas") {
      setFilteredVideos(videos);
    } else {
      setFilteredVideos(videos.filter(v => v.categoria === cat));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-[family-name:var(--font-geist-sans)]">
      <Header 
        isLive={config?.is_live || false} 
        config={config} 
        categoriaAtiva="Biblioteca"
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* HERO SECTION */}
        <section className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest animate-fade-in">
            <Film size={14} /> Acervo Digital
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
            Nossa <span className="text-blue-500">Web TV</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Explore nossa biblioteca completa de reportagens, entrevistas e coberturas exclusivas da nossa região.
          </p>
        </section>

        {/* FILTROS */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-105"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE VÍDEOS */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-video bg-neutral-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-neutral-600">
               <Video size={32} />
            </div>
            <p className="text-neutral-500 font-medium">Nenhum vídeo encontrado nesta categoria.</p>
            <button onClick={() => handleFilter("Todas")} className="text-blue-500 hover:underline">Ver todo o acervo</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {filteredVideos.map((vid) => (
              <div 
                key={vid.id} 
                className="group relative bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-blue-500/50 transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              >
                {/* THUMBNAIL / PREVIEW */}
                <div 
                  className="aspect-video relative cursor-pointer overflow-hidden"
                  onClick={() => setSelectedVideo(vid)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Placeholder se não houver thumb real (biblioteca_webtv foca no vídeo) */}
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 group-hover:scale-110 transition-transform duration-700">
                    <Film className="text-neutral-700" size={48} />
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="text-white fill-current ml-1" size={24} />
                    </div>
                  </div>

                  {/* Categoria Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      {vid.categoria}
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-5 space-y-3">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                    {vid.titulo}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(vid.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center gap-1.5 uppercase tracking-wide">
                      <Tag size={14} className="text-blue-500" />
                      {vid.categoria}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL DO PLAYER (Videon) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
           <button 
             onClick={() => setSelectedVideo(null)}
             className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
           >
             <Filter className="rotate-45" size={32} /> {/* Using Filter as X for simplicity or import X */}
           </button>
           
           <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <video 
                src={selectedVideo.url_video} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <span className="text-blue-500 text-xs font-black uppercase tracking-widest mb-2 block">{selectedVideo.categoria}</span>
                  <h2 className="text-2xl font-black text-white">{selectedVideo.titulo}</h2>
              </div>
           </div>
        </div>
      )}

      {/* FOOTER SIMPLES */}
      <footer className="mt-20 py-12 border-t border-neutral-900 text-center">
          <p className="text-neutral-500 text-sm">© 2026 Nossa Web TV - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
