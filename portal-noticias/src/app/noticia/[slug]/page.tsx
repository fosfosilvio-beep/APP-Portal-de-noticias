"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Search, MapPin, Share2 } from "lucide-react";
import SmartPlayer from "../../../components/SmartPlayer";
import Header from "../../../components/Header";

export default function NoticiaDetalhe() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [noticia, setNoticia] = useState<any>(null);
  const [ultimasNoticias, setUltimasNoticias] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      
      try {
        if (!supabase) throw new Error("Supabase indisponível.");

        // 1. Buscar Configuração do Portal (Identidade e Live)
        const { data: configData } = await supabase
          .from("configuracao_portal")
          .select("*")
          .limit(1)
          .single();
        
        if (configData) setConfig(configData);

        // 2. Busca a notícia especificamente pelo slug (ou ID se for UUID)
        let query = supabase.from("noticias").select("*");
        
        // Se parece um UUID, tenta buscar por ID também, senão apenas por slug para evitar erro de sintaxe
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
        
        if (isUUID) {
          query = query.or(`slug.eq.${slug},id.eq.${slug}`);
        } else {
          query = query.eq('slug', slug);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error("Notícia não encontrada.");

        setNoticia(data);

        // Opcional: Busca as últimas notícias para a sidebar
        const { data: ultimas } = await supabase
          .from('noticias')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (ultimas) setUltimasNoticias(ultimas);

      } catch (err: any) {
        console.error("Erro ao carregar notícia:", err);
        if (err.message.includes("multiple") || err.message.includes("no rows") || err.message.toLowerCase().includes("notícia não encontrada")) {
          setError("404");
        } else {
          setError(err.message || "Erro ao carregar matéria.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  // Função para formatar a data (ex: "Publicado em 12 de abr de 2024 às 14:30")
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data desconhecida";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <Header 
        isLive={config?.is_live || false} 
        config={config} 
        showNavigation={false} 
      />

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Lado Esquerdo - 70% (Conteúdo da Notícia) */}
          <div className="w-full lg:w-[70%] flex flex-col space-y-6">
            
            {/* Opcional incluir o SmartPlayer no topo das postagens para dar engajamento, 
                ou o usuário pode ignorar e focar na leitura. Manterei minimizado ou na sidebar dependendo da visão. 
                Neste caso colocarei no topo conforme a linha "Use o layout que já aprovamos... SmartPlayer à esquerda, feed abaixo" */}
            <SmartPlayer customVideoUrl={noticia?.video_url} />

            {loading ? (
              <div className="animate-pulse space-y-6 bg-white p-8 rounded-xl border border-zinc-200/60">
                <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                <div className="h-10 bg-zinc-200 rounded w-full"></div>
                <div className="h-6 bg-zinc-200 rounded w-3/4"></div>
                <div className="h-64 bg-zinc-200 rounded w-full mt-6"></div>
                <div className="space-y-3 mt-6">
                  <div className="h-4 bg-zinc-200 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 rounded w-5/6"></div>
                </div>
              </div>
            ) : error === "404" ? (
              <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-zinc-200/60 flex flex-col items-center">
                <svg className="w-20 h-20 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">Página não encontrada</h1>
                <p className="text-zinc-500 mb-6 font-medium">A matéria que você tentou acessar não existe ou foi removida.</p>
                <Link href="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                  Voltar para as Notícias
                </Link>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-700">
                <p className="font-bold">Houve um problema ao carregar a página.</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : noticia && (
              <article className="bg-white p-6 md:p-10 rounded-xl shadow-sm border border-zinc-200/60">
                
                {/* Meta Head: Categoria & Data */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-sm self-start">
                    {noticia.categoria || "Notícia"}
                  </span>
                  <span className="text-sm text-zinc-500 flex items-center gap-1.5 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Publicado em {formatDate(noticia.created_at || noticia.data_publicacao)}
                  </span>
                </div>

                {/* Título Principal */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 leading-tight mb-4 tracking-tight">
                  {noticia.titulo}
                </h1>
                
                {/* Subtítulo / Linha Fina */}
                {noticia.subtitulo && (
                  <h2 className="text-lg md:text-xl text-zinc-600 font-normal leading-relaxed mb-8">
                    {noticia.subtitulo}
                  </h2>
                )}

                {/* Imagem de Capa do Artigo */}
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] mb-10 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img
                    src={noticia.imagem_capa || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80"}
                    alt={noticia.titulo}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80";
                    }}
                  />
                </div>

                {/* Corpo do Texto */}
                <div className="prose prose-zinc prose-lg max-w-none text-zinc-800 mb-8">
                  {/* Se o conteúdo possuir quebras de linha padrão do Textarea, podemos processar num split */}
                  {noticia.conteudo ? (
                    noticia.conteudo.split('\n').map((paragraph: string, index: number) => (
                      paragraph.trim() && <p key={index} className="mb-5 leading-relaxed">{paragraph}</p>
                    ))
                  ) : (
                    <p className="italic text-zinc-500">Conteúdo indisponível.</p>
                  )}
                </div>

                {/* Rodapé da Matéria - Compartilhar */}
                <div className="flex border-t border-zinc-100 pt-6 mt-8 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-800 text-sm">Compartilhe:</span>
                    <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 004 8.718L2 24l5.656-.474A12.015 12.015 0 0012 24c6.627 0 12-5.373 12-12S18.573 0 11.944 0zm0 19A6.994 6.994 0 018.441 18l-3.35.304L6 15.65a6.993 6.993 0 115.944 3.35z"/></svg>
                    </button>
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Lado Direito - 30% (Barra Lateral igual da Home) */}
          <aside className="w-full lg:w-[30%] flex flex-col space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              </div>
              <div className="relative z-10">
                <h3 className="font-bold text-xs mb-5 uppercase tracking-widest text-blue-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
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

            <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 transition-all duration-300">
              <div className="flex items-center space-x-2 mb-6 border-b border-zinc-100 pb-3">
                <div className="w-3 h-3 bg-[#00AEE0] rounded-full animate-pulse"></div>
                <h3 className="font-bold text-zinc-900 text-lg">Giro de Notícias</h3>
              </div>
              
              {ultimasNoticias.length === 0 ? (
                <div className="flex justify-center py-4">
                  <span className="text-zinc-400 text-sm italic">Carregando giro...</span>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  {ultimasNoticias.map((news, idx) => (
                    <Link 
                      href={`/noticia/${news.slug || news.id}`} 
                      key={news.id || idx} 
                      className="flex gap-4 group border-b border-zinc-50 pb-4 last:border-0 last:pb-0 outline-none rounded focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                       <div className="flex flex-col items-center justify-start pt-1">
                        <span className="text-zinc-300 font-black text-xl leading-none group-hover:text-[#00AEE0] transition-colors">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#00AEE0] font-bold uppercase tracking-widest mb-1">{news.categoria || "Geral"}</span>
                        <p className="text-sm font-medium text-zinc-700 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                          {news.titulo}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* SLOT DE ANÚNCIO VERTICAL */}
            <div className="w-full">
              {config?.banner_vertical_noticia ? (
                <a href={config.link_vertical_noticia || "#"} target="_blank" className="group block relative w-full h-[500px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                   <img src={config.banner_vertical_noticia} alt="Publicidade" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   <div className="absolute top-2 right-2">
                      <span className="bg-black/20 backdrop-blur-sm text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10">Publicidade</span>
                   </div>
                </a>
              ) : (
                <div className="w-full bg-slate-100 rounded-2xl border border-dashed border-slate-300 h-[400px] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-200 transition-colors">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 border border-slate-300 px-2 py-0.5 rounded">Banner Vertical</span>
                    <p className="text-slate-500 font-bold max-w-[200px] mt-2 text-xs">Anuncie aqui e alcance Arapongas e região.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-10 mt-auto border-t-[4px] border-blue-700">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-lg tracking-tighter">NOSSA<span className="text-blue-500">WEB</span><span className="text-zinc-600">TV</span></span>
          </div>
          <p>© {new Date().getFullYear()} Portal Nossa Web TV. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
