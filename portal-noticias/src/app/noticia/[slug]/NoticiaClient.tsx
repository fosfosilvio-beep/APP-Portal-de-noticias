"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";

import { supabase } from "../../../lib/supabase";
import { Tag, ChevronLeft, Sun, Clock, BookOpen } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getVisualCategory, normalizeCategory } from "../../../lib/category-utils";

// Lightbox dinâmico para performance
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";

import Header from "../../../components/Header";
import ShareBar from "../../../components/ShareBar";
import NewsNarrator from "../../../components/NewsNarrator";
import CommentsSection from "../../../components/noticias/CommentsSection";
import Footer from "../../../components/Footer";
import SmartPlayer from "../../../components/SmartPlayer";
import DynamicAdSlot from "../../../components/DynamicAdSlot";

export default function NoticiaClient({ slug, initialData }: { slug: string, initialData?: any }) {
  const [noticia, setNoticia] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");
  const hasTracked = useRef(false);
  
  // Estados para o Header
  const [isLive, setIsLive] = useState(false);
  const [config, setConfig] = useState<any>(null);

  // Estados do Lightbox
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [slides, setSlides] = useState<{ src: string }[]>([]);

  // Estados de UX de Leitura
  const [readingTime, setReadingTime] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialData) {
      fetchConfigOnly();
    } else {
      fetchData();
    }
  }, [slug, initialData]);

  // Efeito para UX de Leitura (Tempo + Highlighting)
  useEffect(() => {
    if (noticia && !loading) {
      const text = noticia.conteudo?.replace(/<[^>]*>/g, '') || '';
      const words = text.trim().split(/\s+/).length;
      const time = Math.ceil(words / 200);
      setReadingTime(time || 1);

      setTimeout(() => {
        const marks = document.querySelectorAll('#article-body mark, #article-body strong.highlight');
        if (marks.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-highlight');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.5 });

        marks.forEach(mark => {
          mark.classList.add('custom-highlight');
          observer.observe(mark);
        });
      }, 500);
    }
  }, [noticia, loading]);

  useEffect(() => {
    if (!noticia?.id || hasTracked.current) return;
    hasTracked.current = true;
    
    const key = `viewed_${noticia.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noticiaId: noticia.id }),
    }).catch(() => null);
  }, [noticia?.id]);

  useEffect(() => {
    if (noticia && !loading) {
      const timer = setTimeout(() => {
        const articleElement = document.getElementById("article-body");
        const coverImg = document.getElementById("cover-image");
        const allImages: HTMLImageElement[] = [];
        
        if (coverImg instanceof HTMLImageElement) allImages.push(coverImg);
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

  async function fetchConfigOnly() {
    try {
      if (!supabase) return;
      const { data: configData } = await supabase
        .from("configuracao_portal")
        .select("*")
        .limit(1)
        .single();
      
      if (configData) {
        setIsLive(configData.is_live);
        setConfig(configData);
      }
    } catch (err) {
      console.error("Erro ao carregar configs:", err);
    }
  }

  async function fetchData() {
    if (!slug) return;
    try {
      if (!supabase) return;
      
      await fetchConfigOnly();

      if (!initialData) {
        const decodedSlug = decodeURIComponent(slug as string);
        const { data, error: err } = await supabase
          .from("noticias")
          .select("*")
          .eq("slug", decodedSlug)
          .single();

        if (err) throw err;
        setNoticia(data);
      }
    } catch (err: any) {
      if (!noticia) setError("Notícia não encontrada.");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // ─── BLINDAGEM SSR ────────────────────────────────────────────────────────
  // Se não estiver montado (SSR), retornamos um estado mínimo e seguro
  // Isso evita Erro 500 no servidor por APIs do navegador ou hooks pesados
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header estático simulado para evitar CLS */}
        <div className="h-16 bg-black w-full" />
        <main className="container mx-auto px-4 py-10 max-w-7xl">
           <div className="animate-pulse space-y-4">
              <div className="h-10 bg-zinc-200 w-3/4 rounded" />
              <div className="h-6 bg-zinc-100 w-1/2 rounded" />
              <div className="h-[400px] bg-zinc-200 w-full rounded-xl" />
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isLive={isLive} 
        config={config} 
        categoriaAtiva={getVisualCategory(noticia?.categoria)}
        setCategoriaAtiva={() => {}} 
      />

      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="mb-4">
          <Link href="/" className="text-zinc-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition-colors">
            <ChevronLeft size={16} />
            Voltar para o Início
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
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
              <article className="bg-white p-4 md:p-10 rounded-xl shadow-sm border border-zinc-200/60 relative">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm self-start">
                    {getVisualCategory(noticia.categoria)}
                  </span>
                  <span className="text-sm text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Clock size={16} />
                    Publicado em {formatDate(noticia.created_at || noticia.data_publicacao)}
                  </span>
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 tracking-tight text-zinc-900">
                  {noticia.titulo}
                </h1>
                
                {noticia.subtitulo && (
                  <h2 className="text-lg md:text-xl text-zinc-600 leading-relaxed mb-6 font-medium">
                    {noticia.subtitulo}
                  </h2>
                )}

                <div className="flex flex-col gap-2 mb-6 border-y border-slate-50 py-4">
                  <NewsNarrator 
                    newsId={noticia.id}
                    title={noticia.titulo} 
                    subtitle={noticia.subtitulo} 
                    content={noticia.conteudo?.replace(/<[^>]*>/g, '') || ""} 
                  />
                  <ShareBar url={`/noticia/${slug}`} title={noticia.titulo} />
                </div>

                {noticia.video_url && (
                  <div className="mb-6 w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-zinc-800">
                    <SmartPlayer customVideoUrl={noticia.video_url} disableFallback={true} />
                  </div>
                )}

                <div className="relative w-full h-[250px] sm:h-[400px] lg:h-[450px] mb-6 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm">
                  <img
                    id="cover-image"
                    src={noticia.imagem_capa || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80"}
                    alt={noticia.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>

                <div className="prose prose-zinc lg:prose-xl max-w-none text-zinc-800 mb-8">
                  {noticia.conteudo ? (
                    <div 
                      id="article-body"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(noticia.conteudo) }} 
                      className="font-inter"
                    />
                  ) : (
                    <p className="italic text-zinc-500">Conteúdo indisponível.</p>
                  )}
                </div>

                <div className="mt-8">
                   <ShareBar url={`/noticia/${slug}`} title={noticia.titulo} />
                   <CommentsSection noticiaId={noticia.id} />
                </div>
              </article>
            )}
          </div>

          <aside className="w-full lg:w-[30%] flex flex-col space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md">
              <h3 className="font-bold text-xs mb-5 uppercase tracking-widest text-blue-100 flex items-center gap-2">
                <Sun size={14} className="text-yellow-400" />
                Tempo em Arapongas
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-5xl font-extrabold">26°</p>
                <div className="text-sm border-l border-blue-400/30 pl-3">
                  <span className="font-medium">Ensolarado</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" />
                Categorias Populares
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Entretenimento", "Educação", "Saúde", "Esportes", "Arapongas", "Polícia", "Política", "Geral"].map(cat => (
                  <span 
                    key={cat} 
                    onClick={() => window.location.href = `/${normalizeCategory(cat)}`}
                    className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full hover:bg-blue-600 hover:text-white transition-colors cursor-pointer uppercase"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="sticky top-24">
               <DynamicAdSlot position="sidebar_right_1" noticiaId={noticia?.id} className="min-h-[500px]" />
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
        />
      )}

      <Footer config={config} />
    </div>
  );
}
