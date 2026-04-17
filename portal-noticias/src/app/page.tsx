"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import SmartPlayer from "../components/SmartPlayer";
import AutomatedNewsFeed from "../components/AutomatedNewsFeed";
import { supabase } from "../lib/supabase";
import { Play } from "lucide-react";

export default function Home() {
  const [todasNoticias, setTodasNoticias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [categoriaAtiva, setCategoriaAtiva] = useState("Início");

  // Single Fetch: Busca master do Supabase
  useEffect(() => {
    async function carregarTudo() {
      setLoading(true);
      setError(null);
      try {
        if (!supabase) throw new Error("Supabase não conectado.");
        
        // Trazemos as 80 matérias mais pesadas
        const { data, error: fetchError } = await supabase
          .from('noticias')
          .select('*')
          .order('ordem_prioridade', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(80);
          
        if (fetchError) throw fetchError;
        if (data) setTodasNoticias(data);
        
      } catch (err: any) {
        console.error("Erro no load inicial:", err);
        setError("Não foi possível conectar à base de dados.");
      } finally {
        setLoading(false);
      }
    }
    
    carregarTudo();
  }, []);

  // Divisores de Categoria
  // Top Destaques são os 4 maiores ranks isolados, independente da categoria (se na Home)
  const masterHighlights = todasNoticias.slice(0, 4); 
  const remainingNews = todasNoticias.slice(4);

  // Faixas Horizontais Exclusivas para a Home
  const policiasNews = todasNoticias.filter(n => n.categoria?.toLowerCase().includes('polícia')).slice(0, 4);
  const politicaNews = todasNoticias.filter(n => n.categoria?.toLowerCase().includes('política')).slice(0, 4);

  // Para modo categoria (quando não está no 'Início')
  const noticiasDaCategoriaAtiva = todasNoticias.filter(
    n => n.categoria?.toLowerCase() === categoriaAtiva.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER DE PORTAL PRO */}
      <header className="bg-white border-b border-slate-200 shadow-sm w-full sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" onClick={() => setCategoriaAtiva('Início')} className="relative cursor-pointer outline-none group flex items-center">
               <img 
                 src="/Logo%20web.png" 
                 alt="Nossa Web TV" 
                 className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   e.currentTarget.parentElement!.innerHTML = '<div class="flex flex-col"><span class="text-2xl font-black text-red-600 tracking-tighter leading-none">NOSSA<span class="text-slate-800">WEB</span></span><span class="text-xs font-bold tracking-widest text-slate-400">TV DIGITAL</span></div>';
                 }}
               />
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-1 shrink-0 items-center bg-slate-100 p-1.5 rounded-full">
            {['Início', 'Arapongas', 'Esportes', 'Polícia', 'Política'].map(cat => (
              <a 
                key={cat}
                href="#" 
                onClick={(e) => { e.preventDefault(); setCategoriaAtiva(cat); window.scrollTo(0, 0); }} 
                className={`cursor-pointer text-sm font-bold transition-all uppercase tracking-wide px-5 py-2 rounded-full ${
                  categoriaAtiva === cat 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                {cat}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* MARQUEE PLANTÃO */}
      <div className="bg-red-600 text-white border-b border-red-700 w-full overflow-hidden flex items-center h-10">
         <div className="container mx-auto px-4 lg:px-8 flex items-center">
            <span className="font-black text-xs uppercase tracking-widest bg-red-700 px-3 py-1 rounded shadow-inner z-10 shrink-0">Radar Regional</span>
            <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
              <div className="animate-[marquee_20s_linear_infinite] flex gap-10 opacity-90 text-sm font-medium">
                 <span>Arapongas/PR - Em Tempo Real...</span>
                 <span>Ouça nossa programação e acompanhe o portal 24 horas por dia.</span>
                 <span>Líder de audiência e credibilidade no norte do Paraná.</span>
              </div>
            </div>
         </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-grow">
        
        {loading ? (
           <div className="w-full h-[60vh] flex flex-col items-center justify-center">
             <div className="flex space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-red-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-4 h-4 bg-red-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
             </div>
             <span className="text-slate-400 font-bold uppercase tracking-widest mt-6 text-sm">Atualizando Central...</span>
           </div>
        ) : error ? (
           <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-lg mx-auto mt-20">
             <h2 className="text-red-600 font-black text-xl mb-2">Erro de Conexão</h2>
             <p className="text-red-500 font-medium">{error}</p>
           </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            
            {/* LADO ESQUERDO (70% - CONTEÚDO PRINCIPAL) */}
            <div className="w-full lg:w-[70%] flex flex-col space-y-12">
              
              {/* --- MODO HOME (INÍCIO) --- */}
              {categoriaAtiva === "Início" ? (
                <>
                  {/* BENTO GRID (VINHETA TOP) */}
                  <section className="grid grid-cols-1 md:grid-cols-12 gap-5">
                     {/* Bloco Master: Player + Titulo */}
                     <div className="md:col-span-8 flex flex-col gap-4">
                        <SmartPlayer />
                        {masterHighlights[0] && (
                           <Link href={`/noticia/${masterHighlights[0].slug || masterHighlights[0].id}`} className="group relative w-full h-[260px] sm:h-[320px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                             <img src={masterHighlights[0].imagem_capa || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'} alt="Destaque" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                             <div className="absolute inset-0 p-6 flex flex-col justify-end">
                               <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded inline-block w-max mb-3 mb-2 shadow-sm">{masterHighlights[0].categoria || "Geral"}</span>
                               <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-lg group-hover:text-blue-300 transition-colors">{masterHighlights[0].titulo}</h2>
                             </div>
                           </Link>
                        )}
                     </div>

                     {/* Bloco Lateral Menor (Sub-Destaques) */}
                     <div className="md:col-span-4 flex flex-col gap-5">
                       {masterHighlights.slice(1, 4).map((noticia, i) => (
                          <Link key={noticia.id} href={`/noticia/${noticia.slug || noticia.id}`} className="group relative w-full flex-1 min-h-[140px] sm:min-h-0 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                            <img src={noticia.imagem_capa || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80&random=${i}`} alt="Destaque Lateral" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                               <span className="text-red-400 font-bold text-[10px] uppercase tracking-widest block mb-1 drop-shadow-md">{noticia.categoria || "Geral"}</span>
                               <h3 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-lg group-hover:text-blue-300 transition-colors line-clamp-3">{noticia.titulo}</h3>
                            </div>
                          </Link>
                       ))}
                     </div>
                  </section>

                  {/* FAIXA: PLANTÃO POLICIAL */}
                  {policiasNews.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                           <span className="w-1.5 h-6 bg-slate-800 rounded-full"></span> 
                           Câmera Policial
                        </h2>
                        <button onClick={() => {setCategoriaAtiva('Polícia'); window.scrollTo(0,0)}} className="text-sm font-bold text-slate-500 hover:text-slate-800 hidden sm:block">Ver todos &rarr;</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                        {policiasNews.map((noticia, i) => (
                           <Link key={noticia.id} href={`/noticia/${noticia.slug || noticia.id}`} className="group bg-white rounded-2xl p-3 shadow-sm border border-slate-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                             <div className="w-full h-36 rounded-xl bg-slate-200 mb-4 overflow-hidden relative">
                                <img src={noticia.imagem_capa || `https://images.unsplash.com/photo-1549880181-56a44cf4a9a0?w=400&random=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="capa" />
                             </div>
                             <h4 className="font-bold text-slate-800 text-[15px] leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">{noticia.titulo}</h4>
                             <p className="text-xs text-slate-400 font-medium mt-3">{new Date(noticia.created_at).toLocaleDateString()}</p>
                           </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* FAIXA: POLÍTICA LOCAL */}
                  {politicaNews.length > 0 && (
                    <section>
                      <div className="flex items-center mb-5">
                        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                           <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> 
                           Poder & Política
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-4">
                        {politicaNews.map((noticia, i) => (
                           <Link key={noticia.id} href={`/noticia/${noticia.slug || noticia.id}`} className="group flex flex-row sm:flex-col gap-4 sm:gap-0 bg-white rounded-2xl p-3 shadow-sm border border-slate-100/50 hover:shadow-lg transition-all duration-300">
                             <div className="w-24 sm:w-full h-24 sm:h-36 shrink-0 rounded-xl bg-slate-200 sm:mb-4 overflow-hidden relative">
                                <img src={noticia.imagem_capa || `https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&random=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="capa" />
                             </div>
                             <div className="flex flex-col flex-1 justify-center sm:justify-start">
                               <h4 className="font-bold text-slate-800 text-sm sm:text-[15px] leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">{noticia.titulo}</h4>
                             </div>
                           </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* O RESTANTE DAS NOTÍCIAS CARREGADAS (MIX) */}
                  {remainingNews.length > 0 && (
                     <section>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {remainingNews.slice(0, 6).map((noticia, i) => (
                            <Link key={noticia.id} href={`/noticia/${noticia.slug || noticia.id}`} className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                               <div className="flex items-center gap-2 mb-3">
                                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold uppercase tracking-widest px-2 py-1 rounded">{noticia.categoria || "Geral"}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{new Date(noticia.created_at).toLocaleDateString()}</span>
                               </div>
                               <h3 className="font-bold text-slate-800 text-lg leading-snug group-hover:text-blue-600 transition-colors">{noticia.titulo}</h3>
                            </Link>
                          ))}
                        </div>
                     </section>
                  )}
                  
                  {/* FEED G1 EXTRA */}
                  <AutomatedNewsFeed />
                </>
              ) : (
                /* --- MODO CATEGORIA ATIVA --- */
                <div>
                   <h1 className="text-4xl font-black text-slate-900 mb-8 border-l-[6px] border-blue-600 pl-4">{categoriaAtiva}</h1>
                   
                   {!noticiasDaCategoriaAtiva.length ? (
                      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                         <p className="text-slate-500 text-lg font-medium">Nenhuma matéria registrada em {categoriaAtiva}.</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {noticiasDaCategoriaAtiva.map((noticia, i) => (
                            <Link key={noticia.id} href={`/noticia/${noticia.slug || noticia.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                               <div className="h-56 bg-slate-200 w-full relative overflow-hidden">
                                  <img src={noticia.imagem_capa || `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&random=${i}`} alt="Capa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                               </div>
                               <div className="p-6 flex flex-col flex-1">
                                  <div className="font-bold text-blue-600 uppercase tracking-widest text-[11px] mb-2">{noticia.categoria}</div>
                                  <h2 className="text-xl font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">{noticia.titulo}</h2>
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
              
              {/* CLIMA ARAPONGAS - WIDGET PREMIUM */}
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-7 text-white shadow-lg relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                 <div className="relative z-10">
                   <h3 className="font-bold text-xs mb-6 uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>
                     Arapongas / PR
                   </h3>
                   <div className="flex items-end justify-between">
                     <p className="text-6xl font-black tracking-tighter">26°</p>
                     <div className="text-right">
                       <span className="block font-bold text-blue-400 text-lg">Ensolarado</span>
                       <span className="text-sm font-medium text-slate-400">Max: 31° / Min: 18°</span>
                     </div>
                   </div>
                 </div>
              </div>

               {/* SLOT DE ANÚNCIO 1 */}
               <div className="w-full bg-slate-100 rounded-2xl border border-dashed border-slate-300 h-64 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-200 transition-colors">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 border border-slate-300 px-2 py-0.5 rounded">Espaço Publicitário</span>
                  <p className="text-slate-500 font-bold max-w-[200px]">Anuncie sua marca para milhares de leitores.</p>
               </div>

              {/* GIRO LATERAL (Últimas 5) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/50">
                <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-4">
                  <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
                  <h3 className="font-black text-slate-800 text-lg">Giro 24h</h3>
                </div>
                
                <div className="flex flex-col space-y-5">
                  {todasNoticias.slice(0, 5).map((news, idx) => (
                    <Link href={`/noticia/${news.slug || news.id}`} key={news.id} className="flex gap-4 group">
                      <span className="text-slate-200 font-black text-3xl leading-none group-hover:text-red-100 transition-colors italic w-8 shrink-0 text-center">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-red-500 font-black uppercase tracking-widest mb-1">{news.categoria || "Geral"}</span>
                        <p className="text-sm font-bold text-slate-700 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                          {news.titulo}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* SLOT DE ANÚNCIO 2 */}
              <div className="w-full bg-slate-100 rounded-2xl border border-dashed border-slate-300 h-[400px] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-200 transition-colors">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 border border-slate-300 px-2 py-0.5 rounded">Banner Vertical</span>
              </div>

            </aside>
          </div>
        )}
      </main>
      
      {/* RODAPÉ PREMIUM */}
      <footer className="bg-[#0A0A0A] text-slate-400 py-12 mt-auto border-t-[5px] border-blue-600 rounded-t-3xl">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-black text-2xl text-white tracking-tighter leading-none mb-2">NOSSA<span className="text-blue-600">WEB</span><span className="text-slate-500 font-light">TV</span></span>
            <p className="font-medium text-slate-500 text-xs text-center md:text-left max-w-xs">A maior fonte regional de notícias com a credibilidade e agilidade que você assina embaixo.</p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <p className="font-bold text-slate-300">© {new Date().getFullYear()} Portal Nossa Web TV.</p>
            <p className="text-xs text-slate-500 mt-1">Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
