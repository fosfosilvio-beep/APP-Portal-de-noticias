"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Film, Calendar, Tag, ChevronRight } from "lucide-react";
import Header from "../Header";
import HeroBanner from "../HeroBanner";
import AutomatedNewsFeed from "../AutomatedNewsFeed";
import PlantaoPolicialWidget from "../PlantaoPolicialWidget";
import DynamicAdSlot from "../DynamicAdSlot";
import HeroSection from "./HeroSection";
import NewsGrid from "./NewsGrid";

interface HomeContentProps {
  initialConfig: any;
  todasNoticias: any[];
  bibliotecaLives: any[];
}

export default function HomeContent({ initialConfig, todasNoticias, bibliotecaLives }: HomeContentProps) {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Início");
  const [searchBiblioteca, setSearchBiblioteca] = useState("");

  const config = initialConfig;
  const isLive = config?.is_live || false;

  const noticiasDaCategoriaAtiva = todasNoticias.filter(
    n => n.categoria?.toLowerCase() === categoriaAtiva.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <Header 
        isLive={isLive} 
        config={config}
        categoriaAtiva={categoriaAtiva} 
        setCategoriaAtiva={setCategoriaAtiva}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${config?.ui_settings?.primary_color || '#00AEE0'};
        }
        .text-primary { color: var(--primary-color); }
        .bg-primary { background-color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}} />

      {categoriaAtiva === "Início" && config?.hero_banner_items?.length > 0 && config?.ui_settings?.widgets_visibility?.herobanner !== false && (
        <section className="w-full">
           <HeroBanner items={config.hero_banner_items} />
        </section>
      )}

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 min-w-0">
          
          {/* LADO ESQUERDO (70% - CONTEÚDO PRINCIPAL) */}
          <div className="w-full lg:w-[70%] min-w-0 flex flex-col space-y-12">
            
            {categoriaAtiva === "Início" ? (
              <div className="flex flex-col space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                <HeroSection initialIsLive={isLive} initialLiveUrl={config?.url_live} />
                
                <NewsGrid title="Últimas Notícias" news={todasNoticias} />

                <AutomatedNewsFeed />
              </div>
            ) : categoriaAtiva === "Biblioteca" ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 border-l-[6px] border-[#00AEE0] pl-4">Biblioteca <span className="text-[#00AEE0]">Web TV</span></h1>
                    <p className="text-slate-500 mt-2 font-medium">Assista aos nossos programas e matérias especiais a qualquer momento.</p>
                  </div>
                  
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

                 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                  {[...bibliotecaLives, ...todasNoticias.filter(n => n.video_url)].filter(item => 
                    (item.titulo || "").toLowerCase().includes(searchBiblioteca.toLowerCase()) || 
                    (item.tema || item.categoria || "").toLowerCase().includes(searchBiblioteca.toLowerCase())
                  ).map((item, idx) => (
                    <div key={item.id || idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col hover:-translate-y-2">
                       <div className="relative h-28 sm:h-36 md:h-44 overflow-hidden">
                         <img 
                           src={item.thumbnail || item.imagem_capa || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400"} 
                           alt={item.titulo} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                         />
                         <div className="absolute top-3 left-3">
                           <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/20">
                             {item.video_url ? "Matéria" : "Live"}
                           </span>
                         </div>
                       </div>
                       <div className="p-3 sm:p-4 flex flex-col flex-1">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-[10px] text-[#00AEE0] font-black uppercase tracking-widest flex items-center gap-1">
                             <Tag size={10} /> {item.tema || item.categoria || "Geral"}
                           </span>
                         </div>
                         <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug group-hover:text-[#00AEE0] transition-colors line-clamp-2 min-h-[2rem]">
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
              <div>
                 <h1 className="text-4xl font-black text-slate-900 mb-8 border-l-[6px] border-cyan-600 pl-4">{categoriaAtiva}</h1>
                 
                 {!noticiasDaCategoriaAtiva.length ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                       <p className="text-slate-500 text-lg font-medium">Nenhuma matéria registrada em {categoriaAtiva}.</p>
                    </div>
                 ) : (
                    <NewsGrid title={categoriaAtiva} news={noticiasDaCategoriaAtiva} limit={40} />
                 )}
              </div>
            )}
          </div>

          {/* LADO DIREITO (30% - BARRA LATERAL) */}
          <aside className="w-full lg:w-[30%] flex flex-col space-y-8">
            
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

            <PlantaoPolicialWidget />

            <div className="w-full">
              <DynamicAdSlot 
                position="sidebar_right_1" 
                fallback={
                  config?.ad_slot_1?.visible && config.ad_slot_1.image_url ? (
                    <a href={config.ad_slot_1.link || "#"} target="_blank" className="group block relative w-full max-h-48 sm:max-h-64 rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-cyan-200 transition-all duration-300">
                       <img src={config.ad_slot_1.image_url} alt="Publicidade" className="w-full h-full object-contain max-h-48 sm:max-h-64 group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2 right-2">
                          <span className="bg-white/80 backdrop-blur-md text-slate-800 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-slate-200 shadow-sm">Publicidade</span>
                       </div>
                    </a>
                  ) : (
                    <div className="w-full bg-white rounded-xl border border-dashed border-slate-300 h-32 sm:h-48 flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                       <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 border border-slate-300 px-2 py-0.5 rounded">Espaço Publicitário</span>
                       <p className="text-slate-500 font-bold text-xs max-w-[180px]">Impacte milhares de leitores regionais com sua marca.</p>
                    </div>
                  )
                } 
              />
            </div>

            {(config?.ui_settings?.widgets_visibility?.giro24h !== false) && (
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"></span>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Giro 24h</h3>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-6">
                  {todasNoticias.slice(0, 5).map((news, idx) => (
                    <Link href={`/noticia/${news.slug || news.id}`} key={news.id} className="flex gap-4 group items-center">
                      <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-600 font-black text-4xl leading-none group-hover:scale-110 transition-transform w-8 shrink-0 text-center drop-shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-cyan-600 font-black uppercase tracking-widest mb-1">{news.categoria || "Geral"}</span>
                        <p className="text-sm font-bold text-slate-700 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-3">
                          {news.titulo}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full">
              <DynamicAdSlot 
                position="sidebar_right_2" 
                fallback={
                  config?.ad_slot_2?.visible && config.ad_slot_2.image_url ? (
                    <a href={config.ad_slot_2.link || "#"} target="_blank" className="group block relative w-full max-h-48 sm:max-h-72 md:max-h-[400px] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200">
                       <img src={config.ad_slot_2.image_url} alt="Publicidade Vertical" className="w-full h-full object-contain max-h-48 sm:max-h-72 md:max-h-[400px] group-hover:scale-105 transition-transform duration-700" />
                       <div className="absolute top-2 right-2">
                          <span className="bg-white/80 backdrop-blur-md text-slate-800 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-slate-200 shadow-sm">Publicidade</span>
                       </div>
                    </a>
                  ) : (
                    <div className="w-full bg-white rounded-xl border border-dashed border-slate-200 h-32 sm:h-48 md:h-[400px] flex flex-col items-center justify-center p-4 text-center group cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 border border-slate-200 px-2 py-0.5 rounded">Banner Vertical</span>
                    </div>
                  )
                } 
              />
            </div>
          </aside>
        </div>
      </main>

      {/* BANNER PUBLICITÁRIO RODAPÉ (V2 DYNAMIC) */}
      <DynamicAdSlot 
        position="footer_top" 
        className="rounded-none border-x-0 border-b-0 py-6 bg-slate-900"
        fallback={
          <div className="w-full bg-[#0f172a] border-t border-zinc-800/60 py-4 px-4 lg:px-8">
            <div className="container mx-auto flex items-center justify-center">
              {config?.ad_slot_2?.image_url || config?.banner_anuncio_home ? (
                <a
                  href={config?.ad_slot_2?.link || config?.link_anuncio_home || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-full block rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-zinc-700/40 hover:border-zinc-600 bg-black/20"
                >
                  <img
                    src={config?.ad_slot_2?.image_url || config?.banner_anuncio_home}
                    alt="Publicidade"
                    className="w-full aspect-[4/1] sm:aspect-[8/1] md:aspect-[12/1] object-contain sm:max-h-[120px] group-hover:scale-[1.01] transition-transform duration-700 rounded-2xl"
                  />
                  <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">Publicidade</span>
                  </div>
                </a>
              ) : (
                <div className="w-full h-[80px] border-2 border-dashed border-zinc-700 rounded-2xl flex items-center justify-center gap-4 group hover:bg-zinc-800/30 transition-colors cursor-pointer">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">🔖 Espaço Publicitário Premium — Rodapé</span>
                </div>
              )}
            </div>
          </div>
        }
      />

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
