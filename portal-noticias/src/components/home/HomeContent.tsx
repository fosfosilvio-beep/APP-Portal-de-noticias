"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Film, Calendar, Tag } from "lucide-react";
import Header from "../Header";
import HeroBanner from "../HeroBanner";
import AutomatedNewsFeed from "../AutomatedNewsFeed";
import PlantaoPolicialWidget from "../PlantaoPolicialWidget";
import DynamicAdSlot from "../DynamicAdSlot";
import HeroSection from "./HeroSection";
import CategoryNav from "../CategoryNav";
import PWAInstallBanner from "../PWAInstallBanner";
import NewsGrid from "./NewsGrid";
import BreakingNewsMarquee from "../BreakingNewsMarquee";
import ColunistasWidget from "./ColunistasWidget";
import EnquetesWidget from "./EnquetesWidget";
import Footer from "../Footer";
import { createClient } from "@/lib/supabase-browser";
import { getVisualCategory } from "@/lib/category-utils";

interface HomeContentProps {
  initialConfig: any;
  liveStatus: any;
  todasNoticias: any[];
  bibliotecaLives: any[];
  initialAds: any[];
}

export default function HomeContent({ initialConfig, liveStatus, todasNoticias, bibliotecaLives, initialAds }: HomeContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Início");
  const [searchBiblioteca, setSearchBiblioteca] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [noticiasCategoria, setNoticiasCategoria] = useState<any[]>([]);
  const [isLoadingCat, setIsLoadingCat] = useState(false);
  const [config, setConfig] = useState(initialConfig);

  const isLive = liveStatus?.is_live || false;
  const breakingNews = config?.ui_settings?.breaking_news_alert;

  useEffect(() => {
    setIsMounted(true);
    const supabase = createClient();
    
    // Categorias
    supabase.from("categorias").select("slug, nome, ordem").eq("ativa", true).order("ordem")
      .then(({ data }: any) => { if (data?.length) setCategorias(data); });

    // Realtime Config
    const channel = supabase
      .channel("config_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "configuracao_portal" }, (payload: any) => {
        setConfig(payload.new);
      })
      .subscribe();

    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat");
    if (catParam) {
      setCategoriaAtiva(catParam);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (categoriaAtiva === "Início" || categoriaAtiva === "Biblioteca") {
      setNoticiasCategoria([]);
      return;
    }

    const fetchCategoriaNoticias = async () => {
      setIsLoadingCat(true);
      const supabase = createClient();
      const normalizedTerm = categoriaAtiva.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const searchTerm = `%${normalizedTerm}%`;

      const { data, error } = await supabase
        .from("noticias")
        .select("*, categorias(id, nome, slug)")
        .ilike("categoria", searchTerm)
        .order("created_at", { ascending: false })
        .limit(40);

      if (!error && data) {
        setNoticiasCategoria(data);
      }
      setIsLoadingCat(false);
    };

    fetchCategoriaNoticias();
  }, [categoriaAtiva]);

  const noticiasDaCategoriaAtiva = categoriaAtiva === "Início" 
    ? todasNoticias 
    : noticiasCategoria.length > 0 
      ? noticiasCategoria 
      : todasNoticias.filter(n => {
          const rawCat = n.categorias?.nome || n.categoria || "Geral";
          const catName = getVisualCategory(rawCat);
          return catName.toLowerCase() === getVisualCategory(categoriaAtiva).toLowerCase();
        });

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <Header 
        isLive={isLive} 
        config={config}
        categoriaAtiva={categoriaAtiva} 
        setCategoriaAtiva={setCategoriaAtiva}
      /><PWAInstallBanner /><CategoryNav 
        categoriaAtiva={categoriaAtiva} 
        setCategoriaAtiva={setCategoriaAtiva} 
      />


      {/* Breaking News Marquee */}
      {breakingNews?.active && (
        <BreakingNewsMarquee
          text={breakingNews.text || ""}
          speed={breakingNews.speed || "normal"}
          visible={breakingNews.active}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${config?.ui_settings?.primary_color || '#00AEE0'};
        }
        .text-primary { color: var(--primary-color); }
        .bg-primary { background-color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}} />

      {/* Hero Banner Rotativo */}
      {categoriaAtiva === "Início" && config?.hero_banner_items?.length > 0 && config?.ui_settings?.widgets_visibility?.herobanner !== false && (
        <section className="w-full">
           <HeroBanner items={config.hero_banner_items} />
        </section>
      )}

      <main className="container mx-auto px-4 lg:px-8 py-4 flex-grow">
        
        {/* Ad de Topo */}
        {categoriaAtiva === "Início" && (
          <div className="mb-8 max-w-5xl mx-auto">
            <DynamicAdSlot 
              position="header_top" 
              className="h-auto" 
              initialData={initialAds.find(a => a.posicao_html === "header_top")}
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 min-w-0">
          
          {/* LADO ESQUERDO (70% - CONTEÚDO PRINCIPAL) */}
          <div className="w-full lg:w-[70%] min-w-0 flex flex-col space-y-12">
            
            {categoriaAtiva === "Início" ? (
              <div className="flex flex-col space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                
                {/* Moderação Live / Web TV */}
                <HeroSection />

                {/* Grade de Notícias */}
                <NewsGrid title="Últimas Notícias" news={todasNoticias.slice(0, 8)} />


                {/* Importador RSS */}
                <AutomatedNewsFeed />
              </div>
            ) : categoriaAtiva === "Biblioteca" ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 border-l-[6px] border-[#00AEE0] pl-4">Biblioteca <span className="text-[#00AEE0]">Web TV</span></h1>
                    <p className="text-slate-500 mt-2 font-medium">Assista aos nossos programas e lives a qualquer momento.</p>
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

                 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {[...bibliotecaLives, ...todasNoticias.filter(n => n.video_url)].filter(item => 
                    (item.titulo || "").toLowerCase().includes(searchBiblioteca.toLowerCase()) || 
                    (item.tema || item.categoria || "").toLowerCase().includes(searchBiblioteca.toLowerCase())
                  ).map((item, idx) => (
                    <div key={item.id || idx} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col hover:-translate-y-2">
                       <div className="relative h-28 sm:h-36 overflow-hidden">
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
                 
                 {isLoadingCat ? (
                    <div className="py-20 text-center">
                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
                       <p className="text-slate-500 mt-4 font-medium">Buscando matérias em {categoriaAtiva}...</p>
                    </div>
                 ) : !noticiasDaCategoriaAtiva.length ? (
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
            
            {/* Widget de Enquetes */}
            <EnquetesWidget />

            {/* Plantão Policial Widget */}
            {(config?.ui_settings?.widgets_visibility?.plantao !== false) && (
               <PlantaoPolicialWidget />
            )}

            {/* Colunistas na Sidebar para visibilidade */}
            <ColunistasWidget />


            {/* Ad Lateral */}
            <DynamicAdSlot 
              position="sidebar_right_1" 
              className="min-h-[300px]" 
              initialData={initialAds.find(a => a.posicao_html === "sidebar_right_1")}
            />

            {/* Clima se ativado */}
            {(config?.ui_settings?.widgets_visibility?.weather !== false) && (
               <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200">
                 <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs mb-4">Clima (Arapongas)</h3>
                 <div className="flex items-center gap-4">
                   <div className="text-4xl font-black text-slate-700">28°</div>
                   <div className="text-sm text-slate-500 font-medium leading-tight">Ensolarado<br/>Max: 32° | Min: 18°</div>
                 </div>
               </div>
            )}
            
          </aside>
        </div>
        
        {/* Ad Inferior */}
        <div className="mt-12 max-w-5xl mx-auto">
          <DynamicAdSlot 
            position="footer_top" 
            className="h-24 sm:h-32" 
            initialData={initialAds.find(a => a.posicao_html === "footer_top")}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
