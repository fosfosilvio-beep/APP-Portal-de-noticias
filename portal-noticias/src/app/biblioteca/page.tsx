"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";
import SmartPlayer from "../../components/SmartPlayer";
import { 
  Video, Play, Calendar, User, Clock, 
  ChevronRight, Mic2, LayoutGrid, Info
} from "lucide-react";

interface Podcast {
  id: string;
  nome: string;
  apresentador_nome: string;
  apresentador_foto_url: string;
  horario_exibicao: string;
  descricao: string;
}

interface Episodio {
  id: string;
  titulo: string;
  video_url: string;
  thumbnail_url: string;
  data_publicacao: string;
}

export default function BibliotecaPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodios, setEpisodios] = useState<Episodio[]>([]);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPodcast) {
      fetchEpisodios(selectedPodcast.id);
    }
  }, [selectedPodcast]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Config do Portal (para o Header e Live status)
      const { data: configData } = await supabase.from("configuracao_portal").select("*").single();
      if (configData) setConfig(configData);

      // Podcasts
      const { data: podcastData } = await supabase
        .from("podcasts")
        .select("*")
        .order("nome");
      
      if (podcastData && podcastData.length > 0) {
        setPodcasts(podcastData);
        setSelectedPodcast(podcastData[0]); // Seleciona o primeiro por padrão
      }
    } catch (err) {
      console.error("Erro ao carregar podcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodios = async (podcastId: string) => {
    try {
      const { data } = await supabase
        .from("episodios")
        .select("*")
        .eq("podcast_id", podcastId)
        .order("data_publicacao", { ascending: false });
      
      setEpisodios(data || []);
      if (data && data.length > 0) {
        setSelectedVideoUrl(data[0].video_url); // Linka o vídeo mais recente no player mestre
      } else {
        setSelectedVideoUrl(null);
      }
    } catch (err) {
      console.error("Erro ao carregar episódios:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Header 
        isLive={config?.is_live || false} 
        config={config} 
        categoriaAtiva="Biblioteca"
      />

      <main className="container mx-auto px-4 py-8 md:py-12">
        
        {/* TITULO E MENU DE PODCASTS */}
        <section className="mb-12 space-y-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Mic2 size={32} className="text-blue-500" /> Biblioteca <span className="text-zinc-600">On-Demand</span>
                </h1>
                <p className="text-zinc-500 font-bold mt-2 uppercase text-xs tracking-widest">
                  Assista a todos os programas e podcasts do portal
                </p>
              </div>
              
              {/* Menu Horizontal de Podcasts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {podcasts.map((pod) => (
                  <button
                    key={pod.id}
                    onClick={() => setSelectedPodcast(pod)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      selectedPodcast?.id === pod.id 
                        ? "bg-blue-600 text-white shadow-[0_0_20px_#2563eb44]" 
                        : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-800"
                    }`}
                  >
                    {pod.nome}
                  </button>
                ))}
              </div>
           </div>
        </section>

        {loading ? (
           <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
           </div>
        ) : !selectedPodcast ? (
          <div className="py-20 text-center bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
             <Info size={48} className="mx-auto text-zinc-700 mb-4" />
             <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhum programa cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             
             {/* PAINEL DO PODCAST (PLAYER + APRESENTADOR) */}
             <div className="flex flex-col lg:flex-row gap-8 bg-zinc-900/40 p-6 md:p-8 rounded-[40px] border border-white/5 shadow-2xl">
                
                {/* Lado Esquerdo: Player Principal */}
                <div className="flex-1 min-w-0">
                   <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
                      <SmartPlayer customVideoUrl={selectedVideoUrl || undefined} />
                   </div>
                </div>

                {/* Lado Direito: Info do Apresentador */}
                <div className="w-full lg:w-[350px] flex flex-col justify-center gap-6">
                   <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img 
                          src={selectedPodcast.apresentador_foto_url || "https://ui-avatars.com/api/?name=" + selectedPodcast.apresentador_nome + "&background=1e293b&color=fff&size=200"} 
                          alt={selectedPodcast.apresentador_nome}
                          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-zinc-900 shadow-2xl"
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{selectedPodcast.apresentador_nome}</h2>
                        <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">Apresentador(a)</p>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
                         <div className="bg-zinc-800/50 p-3 rounded-2xl">
                            <span className="text-[8px] font-black text-zinc-500 uppercase block">Episódios</span>
                            <span className="text-xl font-black">{episodios.length}</span>
                         </div>
                         <div className="bg-zinc-800/50 p-3 rounded-2xl">
                            <span className="text-[8px] font-black text-zinc-500 uppercase block">Horário</span>
                            <span className="text-xs font-black truncate">{selectedPodcast.horario_exibicao || "A definir"}</span>
                         </div>
                      </div>
                      <p className="text-zinc-400 text-sm italic line-clamp-3">
                        "{selectedPodcast.descricao || "Acompanhe as principais pautas e entrevistas exclusivas em nosso podcast oficial."}"
                      </p>
                   </div>
                </div>
             </div>

             {/* GRID DE EPISÓDIOS (FILTRADO) */}
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <LayoutGrid size={20} className="text-zinc-400" /> Episódios Disponíveis
                   </h3>
                </div>

                {episodios.length === 0 ? (
                  <div className="p-12 text-center text-zinc-600 font-bold uppercase text-xs tracking-widest border border-dashed border-zinc-800 rounded-3xl">
                    Aguardando upload de episódios...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {episodios.slice(0, 6).map((ep) => (
                      <div 
                        key={ep.id}
                        onClick={() => setSelectedVideoUrl(ep.video_url)}
                        className={`group relative bg-zinc-900 border transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.02] ${
                          selectedVideoUrl === ep.video_url ? "border-blue-500 ring-4 ring-blue-500/10" : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                         <div className="aspect-video relative overflow-hidden bg-zinc-800">
                           <img 
                              src={ep.thumbnail_url || "https://picsum.photos/seed/" + ep.id + "/800/450"} 
                              alt={ep.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                               <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                  <Play fill="currentColor" size={20} />
                               </div>
                            </div>
                            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase text-white px-2 py-1 rounded-md border border-white/10">
                               HD 1080p
                            </div>
                         </div>
                         <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                               <Calendar size={12} className="text-zinc-500" />
                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                  {new Date(ep.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                               </span>
                            </div>
                            <h4 className="font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                               {ep.titulo}
                            </h4>
                         </div>
                      </div>
                    ))}
                  </div>
                )}

                {episodios.length > 6 && (
                   <div className="pt-8 flex justify-center">
                      <button className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 transition-all">
                        Ver todo o histórico <ChevronRight size={14} />
                      </button>
                   </div>
                )}
             </section>

          </div>
        )}

      </main>

      <footer className="mt-20 py-12 border-t border-zinc-900 text-center">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 Nossa Web TV — Acervo Digital Industrializado
          </p>
      </footer>
    </div>
  );
}
