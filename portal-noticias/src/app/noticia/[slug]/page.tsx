"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { Tag, ChevronLeft, Sun, Play, Clock } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lightbox dinâmico para performance
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";

import Header from "../../../components/Header";
import ShareBar from "../../../components/ShareBar";
import NewsNarrator from "../../../components/NewsNarrator";
import ArticleComments from "../../../components/ArticleComments";

export default function NoticiaDetalhe({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [noticia, setNoticia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Estados para o Header
  const [isLive, setIsLive] = useState(false);
  const [config, setConfig] = useState<any>(null);

  // Estados do Lightbox
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [slides, setSlides] = useState<{ src: string }[]>([]);

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Efeito para capturar imagens e injetar eventos de clique
  useEffect(() => {
    if (noticia && !loading) {
      const timer = setTimeout(() => {
        const articleElement = document.getElementById("article-body");
        const coverImg = document.getElementById("cover-image");
        
        const allImages: HTMLImageElement[] = [];
        
        if (coverImg instanceof HTMLImageElement) {
          allImages.push(coverImg);
        }
        
        if (articleElement) {
          const bodyImages = Array.from(articleElement.getElementsByTagName("img"));
          allImages.push(...bodyImages);
        }

        if (allImages.length > 0) {
          const slideUrls = allImages.map(img => ({ src: img.src }));
          setSlides(slideUrls);

          allImages.forEach((img, index) => {
            img.style.cursor = "zoom-in";
            img.onclick = () => {
              setPhotoIndex(index);
              setIsOpen(true);
            };
          });
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [noticia, loading]);

  const fetchData = async () => {
    try {
      if (!supabase) return;
      
      // 1. Buscar Config do Portal
      const { data: configData } = await supabase
        .from("configuracao_portal")
        .select("*")
        .limit(1)
        .single();
      
      if (configData) {
        setIsLive(configData.is_live);
        setConfig(configData);
      }

      // 2. Buscar Notícia
      const { data, error: err } = await supabase
        .from("noticias")
        .select("*")
        .eq("slug", slug)
        .single();

      if (err) throw err;
      setNoticia(data);
    } catch (err: any) {
      setError("Notícia não encontrada.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isLive={isLive} 
        config={config} 
        categoriaAtiva={noticia?.categoria || "Geral"}
        setCategoriaAtiva={() => {}} // Dummy as it's a detail page
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/" className="text-zinc-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
            <ChevronLeft size={16} />
            Voltar para o Início
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-[70%]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-500 font-medium tracking-tight uppercase text-xs">Carregando notícia...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-xl text-center">
                <p className="font-bold text-lg">⚠️ Erro</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : noticia && (
              <article className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-zinc-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm self-start">
                    {noticia.categoria || "Notícia"}
                  </span>
                  <span className="text-sm text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Clock size={16} />
                    Publicado em {formatDate(noticia.created_at || noticia.data_publicacao)}
                  </span>
                </div>

                <h1 
                  style={{ 
                    fontFamily: noticia.titulo_config?.font || "inherit", 
                    fontWeight: noticia.titulo_config?.weight || "900",
                    color: noticia.titulo_config?.color === 'destaque' ? '#2563eb' : (noticia.titulo_config?.color === 'urgente' ? '#dc2626' : '#0f172a')
                  }}
                  className="text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 tracking-tight"
                >
                  {noticia.titulo}
                </h1>
                
                {noticia.subtitulo && (
                  <h2 
                    style={{ 
                      fontFamily: noticia.subtitulo_config?.font || "inherit", 
                      fontWeight: noticia.subtitulo_config?.weight || "400",
                      color: noticia.subtitulo_config?.color === 'destaque' ? '#2563eb' : (noticia.subtitulo_config?.color === 'urgente' ? '#dc2626' : '#475569')
                    }}
                    className="text-lg md:text-xl leading-relaxed mb-8"
                  >
                    {noticia.subtitulo}
                  </h2>
                )}

                <div className="flex flex-col gap-2 mb-8 border-y border-slate-50 py-4">
                  <NewsNarrator 
                    newsId={noticia.id}
                    title={noticia.titulo} 
                    subtitle={noticia.subtitulo} 
                    content={noticia.conteudo?.replace(/<[^>]*>/g, '') || ""} 
                  />
                  <ShareBar url={`/noticia/${slug}`} title={noticia.titulo} />
                </div>

                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] mb-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm group">
                  <img
                    id="cover-image"
                    src={noticia.imagem_capa || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80"}
                    alt={noticia.titulo}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80";
                    }}
                  />
                </div>

                <div className="prose prose-zinc lg:prose-xl max-w-none text-zinc-800 mb-8">
                  {noticia.conteudo ? (
                    <div 
                      id="article-body"
                      dangerouslySetInnerHTML={{ __html: noticia.conteudo }} 
                      className="font-inter"
                    />
                  ) : (
                    <p className="italic text-zinc-500">Conteúdo indisponível.</p>
                  )}
                </div>

                <div className="mt-12">
                   <ShareBar url={`/noticia/${slug}`} title={noticia.titulo} />
                   <ArticleComments noticiaId={noticia.id} />
                </div>
              </article>
            )}
          </div>

          <aside className="w-full lg:w-[30%] flex flex-col space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold text-xs mb-5 uppercase tracking-widest text-blue-100 flex items-center gap-2">
                  <Sun size={14} className="text-yellow-400" />
                  Tempo em Arapongas
                </h3>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <p className="text-5xl font-extrabold tracking-tighter">26°</p>
                    <div className="flex flex-col text-sm border-l border-blue-400/30 pl-3">
                      <span className="font-medium">Ensolarado</span>
                      <span className="text-blue-200">Max: 31° / Min: 18°</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" />
                Categorias Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Arapongas", "Polícia", "Esportes", "Política", "Geral"].map(cat => (
                  <span key={cat} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full hover:bg-blue-600 hover:text-white transition-colors cursor-pointer uppercase">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="sticky top-24 bg-zinc-900 rounded-xl h-[500px] flex items-center justify-center p-6 border border-zinc-800 shadow-xl overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-[20s]" />
               <div className="relative z-10 text-center">
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter mb-4 inline-block">Publicidade</span>
                  <h4 className="text-white font-bold text-xl uppercase tracking-tighter leading-tight drop-shadow-md">Seu Negócio Aqui</h4>
                  <p className="text-zinc-400 text-sm mt-2 font-medium">Anuncie no maior portal de Arapongas</p>
                  <button className="mt-6 w-full bg-white text-black font-black py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-all uppercase text-xs tracking-widest shadow-lg">Saiba Mais</button>
               </div>
            </div>
          </aside>
        </div>
      </main>

      {slides.length > 0 && (
        <Lightbox
          open={isOpen}
          close={() => setIsOpen(false)}
          index={photoIndex}
          slides={slides}
          plugins={[Zoom, Fullscreen]}
          animation={{ fade: 300 }}
          controller={{ closeOnBackdropClick: true }}
          styles={{
            container: { backgroundColor: "rgba(0, 0, 0, .95)" },
          }}
        />
      )}

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
