"use client";

import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import SmartPlayer from "../components/SmartPlayer";
import LiveChat from "../components/LiveChat";
import AutomatedNewsFeed from "../components/AutomatedNewsFeed";
import { supabase } from "../lib/supabase";
import { Play, Search, Film, Calendar, Tag, ChevronRight, Tv, Radio } from "lucide-react";
import Header from "../components/Header";
import VideoCarousel from "../components/VideoCarousel";
import HeroBanner from "../components/HeroBanner";

export default function Home() {
  const [todasNoticias, setTodasNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [bibliotecaLives, setBibliotecaLives] = useState<any[]>([]);
  const [searchBiblioteca, setSearchBiblioteca] = useState("");

  const [categoriaAtiva, setCategoriaAtiva] = useState("Início");
  const [config, setConfig] = useState<any>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // Callback sincronizado com o SmartPlayer (Realtime)
  const handleLiveChange = useCallback((live: boolean, url: string | null) => {
    setIsLive(live);
    setLiveUrl(url);
  }, []);

  // Single Fetch com Fallback de Segurança + Configuração do Portal
  useEffect(() => {
    async function carregarTudo() {
      setLoading(true);
      setError(null);
      try {
        if (!supabase) throw new Error("Supabase não conectado.");
        
        // 1. Buscar Configuração (Live, Ads, Banners, UI Settings)
        const { data: configData } = await supabase
          .from("configuracao_portal")
          .select("is_live, hero_banner_items, ad_slot_1, ad_slot_2, banner_anuncio_home, link_anuncio_home, banner_vertical_noticia, link_vertical_noticia, ui_settings")
          .limit(1)
          .single();
        
        if (configData) {
          setIsLive(configData.is_live);
          setConfig(configData);
        }

        // 2. Buscar Notícias
        let result = await supabase
          .from('noticias')
          .select('*')
          .order('ordem_prioridade', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(80);
          
        if (result.error) {
           console.warn("Fallback acionado: Buscando sem 'ordem_prioridade'", result.error);
           result = await supabase
             .from('noticias')
             .select('*')
             .order('created_at', { ascending: false })
             .limit(80);
        }
          
        if (result.error) throw result.error;
        if (result.data) setTodasNoticias(result.data);

        // 3. Buscar Biblioteca de Lives
        const { data: bData } = await supabase
          .from("biblioteca_lives")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (bData) setBibliotecaLives(bData);
        
      } catch (err: any) {
        console.error("Erro no load inicial:", err);
        setError("Não foi possível conectar à base de dados. " + (err.message || ''));
      } finally {
        setLoading(false);
      }
    }
    
    carregarTudo();

    // Inscrição para mudanças na configuração (Live ON/OFF)
    const configChannel = supabase
      .channel("home_config_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "configuracao_portal" },
        (payload) => {
          setIsLive(payload.new.is_live);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
    };
  }, []);

  // Divisores de Categoria
  const masterHighlights = todasNoticias.slice(0, 4); 
  const remainingNews = todasNoticias.slice(4);
  const policiasNews = todasNoticias.filter(n => n.categoria?.toLowerCase().includes('polícia')).slice(0, 4);
  const politicaNews = todasNoticias.filter(n => n.categoria?.toLowerCase().includes('política')).slice(0, 4);
  const noticiasDaCategoriaAtiva = todasNoticias.filter(
    n => n.categoria?.toLowerCase() === categoriaAtiva.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans">
      
      <Header 
        isLive={isLive} 
        categoriaAtiva={categoriaAtiva} 
        setCategoriaAtiva={setCategoriaAtiva}
      />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-grow">
        
        {loading ? (
           <div className="w-full h-[60vh] flex flex-col items-center justify-center">
             <div className="flex space-x-2">
                <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-4 h-4 bg-cyan-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
             </div>
             <span className="text-slate-500 font-bold uppercase tracking-widest mt-6 text-sm">Atualizando Central...</span>
           </div>
        ) : error ? (
           <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-20 shadow-sm">
             <h2 className="text-red-600 font-black text-xl mb-2 flex items-center justify-center gap-2">⚠️ Atenção Necessária</h2>
             <p className="text-red-700 font-medium mb-4">{error}</p>
             <p className="text-xs text-red-500/80 italic rounded bg-red-100/50 p-3">Verifique suas chaves de API do Supabase na Vercel.</p>
           </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            
            {/* LADO ESQUERDO (70% - CONTEÚDO PRINCIPAL) */}
            <div className="w-full lg:w-[70%] flex flex-col space-y-12">
              
              {/* --- MODO HOME (INÍCIO): ESTILO MOVIE PORTAL --- */}
              {categoriaAtiva === "Início" ? (
                <div className="flex flex-col space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  
                  {/* CARROSSEL HERO DINÂMICO (NOVO) */}
                  {config?.hero_banner_items?.length > 0 && config?.ui_settings?.widgets_visibility?.herobanner !== false && (
                    <section className="w-full mb-4">
                       <HeroBanner items={config.hero_banner_items} />
                    </section>
                  )}
                  
                  {/* SEÇÃO 1: HERO PLAYER — BIFURCAÇÃO LIVE / BIBLIOTECA */}
                  <section className="w-full flex flex-col gap-6">

                    {/* ── MODO LIVE: Player + Chat lateral ── */}
                    <div
                      className={`w-full transition-all duration-700 ease-in-out overflow-hidden ${
                        isLive ? "max-h-[800px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-4 pointer-events-none"
                      }`}
                    >
                      {/* Banner de alerta ativo */}
                      <div className="flex items-center gap-3 bg-red-600/10 border border-red-500/20 rounded-2xl px-5 py-3 mb-4">
                        <span className="relative flex h-3 w-3 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                        </span>
                        <p className="text-red-400 font-black text-xs uppercase tracking-widest">
                          Transmissão ao Vivo em andamento — Assista agora!
                        </p>
                        <Tv className="ml-auto text-red-500/60 shrink-0" size={18} />
                      </div>

                      {/* Player + Chat lado a lado */}
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Player ocupa ~65% */}
                        <div className="relative w-full lg:w-[65%] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl shadow-red-900/20 border border-red-900/30">
                          <SmartPlayer
                            customVideoUrl={undefined}
                            onLiveChange={handleLiveChange}
                          />
                        </div>

                        {/* Chat ocupa ~35% */}
                        <div className="w-full lg:w-[35%] min-h-[340px] lg:min-h-0">
                          <LiveChat liveUrl={liveUrl} />
                        </div>
                      </div>
                    </div>

                    {/* ── MODO BIBLIOTECA: Player + Carrossel ── */}
                    <div
                      className={`w-full flex flex-col gap-6 transition-all duration-700 ease-in-out overflow-hidden ${
                        !isLive ? "max-h-[1200px] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4 pointer-events-none"
                      }`}
                    >
                      {/* Label Biblioteca */}
                      <div className="flex items-center gap-3 bg-cyan-500/5 border border-cyan-500/15 rounded-2xl px-5 py-3">
                        <Radio className="text-cyan-500/70 shrink-0" size={16} />
                        <p className="text-cyan-600/80 font-black text-xs uppercase tracking-widest">
                          Biblioteca Web TV — Podcasts &amp; Programas
                        </p>
                      </div>

                      {/* Player principal da Biblioteca */}
                      <div className="relative w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/50 border border-slate-800">
                        <SmartPlayer
                          customVideoUrl={selectedVideoUrl || undefined}
                          onLiveChange={handleLiveChange}
                        />
                      </div>

                      {/* Carrossel de Vídeos */}
                      <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6 border border-white/5 shadow-inner">
                        <VideoCarousel
                          activeUrl={selectedVideoUrl}
                          onVideoSelect={(url) => {
                            setSelectedVideoUrl(url);
                            window.scrollTo({ top: 120, behavior: "smooth" });
                          }}
                        />
                      </div>
                    </div>

                  </section>

                  {/* SEÇÃO 2: GRID DE NOTÍCIAS (BENTO DARK MODE) */}
                  <section className="flex flex-col mt-8">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                        <h2 className="text-2xl font-black text-zinc-100 flex items-center gap-4">
                           <span className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_12px_#06b6d4]"></span> 
                           Últimas Notícias
                        </h2>
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                          Recentes <ChevronRight size={14} />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todasNoticias.slice(0, 18).map((noticia, i) => (
                           <Link 
                              key={noticia.id} 
                              href={`/noticia/${noticia.slug || noticia.id}`} 
                              className="group flex flex-col transition-all duration-300 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-900/10 hover:-translate-y-1 hover:border-zinc-700"
                           >
                              {/* Thumbnail Universal */}
                              <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-800 isolate">
                                 <img 
                                    src={noticia.imagem_capa || `https://picsum.photos/seed/${noticia.id}/600/400`} 
                                    alt={noticia.titulo} 
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                                 />
                                 <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent z-10"></div>
                                 
                                 {/* Ícone Play Minimalista com Glow (Apenas para vídeos) */}
                                 {(noticia.video_url || noticia.mostrar_no_player) && (
                                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                      <div className="w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                                         <Play size={22} fill="currentColor" className="text-white drop-shadow-[0_0_10px_#00AEE0]" />
                                      </div>
                                   </div>
                                 )}

                                 {/* Tag de Categoria */}
                                 <div className="absolute top-4 left-4 z-20">
                                    <span className="bg-zinc-900/80 backdrop-blur-md text-zinc-100 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg border border-zinc-700/50">
                                       {noticia.categoria || "Geral"}
                                    </span>
                                 </div>
                                 
                                 {/* Conteúdo do Card em Overlay Flutuante */}
                                 <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col flex-1 z-30">
                                    <div className="flex items-center gap-2 mb-2">
                                       <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest bg-zinc-950/60 px-2 py-0.5 rounded-full border border-zinc-800">
                                          {new Date(noticia.created_at).toLocaleDateString()}
                                       </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-100 leading-snug group-hover:text-cyan-400 transition-colors line-clamp-3 text-shadow-sm">
                                       {noticia.titulo}
                                    </h3>
                                 </div>
                              </div>
                           </Link>
                        ))}
                     </div>
                  </section>

                  {/* FEED G1 EXTRA */}
                  <AutomatedNewsFeed />
                </div>
              ) : categoriaAtiva === "Biblioteca" ? (
                /* --- MODO BIBLIOTECA (NETFLIX STYLE) --- */
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 border-l-[6px] border-[#00AEE0] pl-4">Biblioteca <span className="text-[#00AEE0]">Web TV</span></h1>
                      <p className="text-slate-500 mt-2 font-medium">Assista aos nossos programas e matérias especiais a qualquer momento.</p>
                    </div>
                    
                    {/* Barra de Pesquisa */}
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder="Pesquisar título ou tema..."
                        value={searchBiblioteca}
                        onChange={(e) => setSearchBiblioteca(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#00AEE0]/20 focus:border-[#00AEE0] transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Grid de Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...bibliotecaLives, ...todasNoticias.filter(n => n.video_url)].filter(item => 
                      (item.titulo || "").toLowerCase().includes(searchBiblioteca.toLowerCase()) || 
                      (item.tema || item.categoria || "").toLowerCase().includes(searchBiblioteca.toLowerCase())
                    ).map((item, idx) => (
                      <div key={item.id || idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col hover:-translate-y-2">
                         <div className="relative h-44 overflow-hidden">
                           <img 
                             src={item.thumbnail || item.imagem_capa || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400"} 
                             alt={item.titulo} 
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                           />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                             <div className="w-12 h-12 bg-[#00AEE0] rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                               <Play size={20} fill="currentColor" />
                             </div>
                           </div>
                           <div className="absolute top-3 left-3">
                             <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/20">
                               {item.video_url ? "Matéria" : "Live"}
                             </span>
                           </div>
                         </div>
                         <div className="p-5 flex flex-col flex-1">
                           <div className="flex items-center gap-2 mb-2">
                             <span className="text-[10px] text-[#00AEE0] font-black uppercase tracking-widest flex items-center gap-1">
                               <Tag size={10} /> {item.tema || item.categoria || "Geral"}
                             </span>
                           </div>
                           <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#00AEE0] transition-colors line-clamp-2 min-h-[2.5rem]">
                             {item.titulo}
                           </h3>
                           <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                             <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                             <a 
                               href={item.video_url ? `/noticia/${item.slug || item.id}` : item.url} 
                               target={item.video_url ? "_self" : "_blank"}
                               className="text-[#00AEE0] hover:underline"
                             >
                               Assistir Agora
                             </a>
                           </div>
                         </div>
                      </div>
                    ))}
                  </div>

                  {[...bibliotecaLives, ...todasNoticias.filter(n => n.video_url)].length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                      <Film className="mx-auto text-slate-200 mb-4" size={64} />
                      <p className="text-slate-400 font-bold">Nenhum vídeo encontrado no catálogo.</p>
                    </div>
                  )}
                </div>
              ) : (
                /* --- MODO CATEGORIA ATIVA --- */
                <div>
                   <h1 className="text-4xl font-black text-zinc-100 mb-8 border-l-[6px] border-cyan-600 pl-4">{categoriaAtiva}</h1>
                   
                   {!noticiasDaCategoriaAtiva.length ? (
                      <div className="bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-800">
                         <p className="text-zinc-500 text-lg font-medium">Nenhuma matéria registrada em {categoriaAtiva}.</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {noticiasDaCategoriaAtiva.map((noticia, i) => (
                            <Link key={noticia.id} href={`/noticia/${noticia.slug || noticia.id}`} className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                               <div className="h-64 w-full relative overflow-hidden isolate bg-zinc-800">
                                  <img src={noticia.imagem_capa || `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&random=${i}`} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 z-0" />
                                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent z-10"></div>
                               </div>
                               <div className="p-6 flex flex-col flex-1 relative z-20 -mt-16">
                                  <div className="font-bold text-cyan-400 uppercase tracking-widest text-[11px] mb-2 drop-shadow-md">{noticia.categoria}</div>
                                  <h2 className="text-xl font-bold text-zinc-100 leading-snug group-hover:text-cyan-400 transition-colors drop-shadow-lg">{noticia.titulo}</h2>
                               </div>
                            </Link>
                         ))}
                      </div>
                   )}
                </div>
              )}
            </div>

            {/* LADO DIREITO (30% - BARRA LATERAL) */}
            <aside className="w-full lg:w-[30%] flex flex-col space-y-8">
              
              {/* CLIMA ARAPONGAS */}
              {(config?.ui_settings?.widgets_visibility?.weather !== false) && (
                <div className="bg-slate-900 rounded-2xl p-7 text-white shadow-lg relative overflow-hidden group border border-slate-800">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-[#00AEE0] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                   <div className="relative z-10">
                     <h3 className="font-bold text-xs mb-6 uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                       Arapongas / PR
                     </h3>
                     <div className="flex items-center justify-between mb-2">
                       <p className="text-6xl font-black tracking-tighter">26°<span className="text-3xl text-slate-500 font-medium">C</span></p>
                       <div className="text-right flex flex-col items-end">
                         <span className="block font-black text-cyan-400 text-lg">Ensolarado</span>
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Máx 31° Min 18°</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 pt-4 border-t border-slate-800">
                        <span className="flex items-center gap-1"><span className="text-cyan-500">💧</span> Umidade: 55%</span>
                        <span className="flex items-center gap-1"><span className="text-orange-500">🌡️</span> Sensação: 28°C</span>
                     </div>
                   </div>
                </div>
              )}

               {/* SLOT DE ANÚNCIO 1 (CONSOLIDADO) */}
               <div className="w-full">
                  {config?.ad_slot_1?.visible && config.ad_slot_1.image_url ? (
                    <a href={config.ad_slot_1.link || "#"} target="_blank" className="group block relative w-full h-64 rounded-2xl overflow-hidden shadow-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                       <img src={config.ad_slot_1.image_url} alt="Publicidade" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2 right-2">
                          <span className="bg-zinc-900/80 backdrop-blur-md text-zinc-100 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-zinc-700/50">Publicidade</span>
                       </div>
                    </a>
                  ) : config?.banner_anuncio_home ? (
                    <a href={config.link_anuncio_home || "#"} target="_blank" className="group block relative w-full h-64 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border border-zinc-800">
                       <img src={config.banner_anuncio_home} alt="Publicidade Legacy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2 right-2">
                          <span className="bg-black/40 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10">Publicidade</span>
                       </div>
                    </a>
                  ) : (
                    <div className="w-full bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-700 h-64 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-zinc-800/60 transition-colors shadow-sm">
                       <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 border border-zinc-700 px-2 py-0.5 rounded">Espaço Publicitário</span>
                       <p className="text-zinc-500 font-bold text-xs max-w-[180px]">Impacte milhares de leitores regionais com sua marca.</p>
                    </div>
                  )}
               </div>

              {/* GIRO LATERAL (NEON/BENTO) */}
              {(config?.ui_settings?.widgets_visibility?.giro24h !== false) && (
                <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"></span>
                      <h3 className="font-black text-zinc-100 text-lg uppercase tracking-tight">Giro 24h</h3>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-6">
                    {todasNoticias.slice(0, 5).map((news, idx) => (
                      <Link href={`/noticia/${news.slug || news.id}`} key={news.id} className="flex gap-4 group items-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 font-black text-4xl leading-none group-hover:scale-110 transition-transform w-8 shrink-0 text-center drop-shadow-sm">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-cyan-500 font-black uppercase tracking-widest mb-1">{news.categoria || "Geral"}</span>
                          <p className="text-sm font-bold text-zinc-300 leading-snug group-hover:text-cyan-400 transition-colors line-clamp-3">
                            {news.titulo}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* PLANTÃO POLICIAL */}
              {(config?.ui_settings?.widgets_visibility?.plantao !== false) && (
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-30 group-hover:opacity-40 transition-opacity duration-700"></div>
                  <div className="flex items-center space-x-3 mb-6 relative z-10 border-b border-slate-800 pb-4">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-black"></span>
                    </div>
                    <h3 className="font-black text-white text-lg uppercase tracking-widest drop-shadow-md">Plantão Policial</h3>
                  </div>
                  
                  <div className="flex flex-col space-y-5 relative z-10">
                    {todasNoticias.filter(n => ['polícia', 'policia'].includes(n.categoria?.toLowerCase())).slice(0, 3).map((news) => (
                      <Link href={`/noticia/${news.slug || news.id}`} key={news.id} className="flex flex-col group block">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                            {new Date(news.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-300 leading-snug group-hover:text-white transition-colors line-clamp-2">
                          {news.titulo}
                        </p>
                      </Link>
                    ))}
                    {todasNoticias.filter(n => ['polícia', 'policia'].includes(n.categoria?.toLowerCase())).length === 0 && (
                       <p className="text-xs font-medium text-slate-500 italic">Nenhum registro policial recente.</p>
                    )}
                  </div>
                </div>
              )}

               {/* SLOT DE ANÚNCIO 2 (CONSOLIDADO) */}
               <div className="w-full">
                  {config?.ad_slot_2?.visible && config.ad_slot_2.image_url ? (
                    <a href={config.ad_slot_2.link || "#"} target="_blank" className="group block relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200">
                       <img src={config.ad_slot_2.image_url} alt="Publicidade Vertical" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2 right-2">
                          <span className="bg-slate-900/40 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10">Publicidade</span>
                       </div>
                    </a>
                  ) : config?.banner_vertical_noticia ? (
                    <a href={config.link_vertical_noticia || "#"} target="_blank" className="group block relative w-full h-[400px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                       <img src={config.banner_vertical_noticia} alt="Publicidade Vertical Legacy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2 right-2">
                          <span className="bg-black/20 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10">Publicidade</span>
                       </div>
                    </a>
                  ) : (
                    <div className="w-full bg-white rounded-2xl border border-dashed border-slate-200 h-[400px] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 border border-slate-200 px-2 py-0.5 rounded">Banner Vertical</span>
                    </div>
                  )}
               </div>

            </aside>
          </div>
        )}
      </main>
      
      {/* RODAPÉ */}
      <footer className="bg-[#0f172a] text-slate-400 py-12 mt-auto border-t-[5px] border-[#00AEE0] rounded-t-3xl">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-black text-2xl text-white tracking-tighter leading-none mb-2">NOSSA<span className="text-[#00AEE0]">WEB</span><span className="text-slate-500 font-light">TV</span></span>
            <p className="font-medium text-slate-500 text-xs text-center md:text-left max-w-xs">A maior fonte regional de notícias.</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <p className="font-bold text-slate-300">© {new Date().getFullYear()} Portal Nossa Web TV.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
