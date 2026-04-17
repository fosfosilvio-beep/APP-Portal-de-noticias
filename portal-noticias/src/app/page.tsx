"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import SmartPlayer from "../components/SmartPlayer";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          throw new Error("Cliente Supabase não inicializado corretamente.");
        }
        
        const { data, error: fetchError } = await supabase
          .from('categorias')
          .select('*')
          .limit(4);
          
        if (fetchError) {
          throw fetchError;
        }
        
        if (data) {
          setCategorias(data);
        }
      } catch (err: any) {
        console.error("Erro ao carregar categorias:", err);
        setError(err.message || "Erro desconhecido ao carregar destaques.");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Principal */}
      <header className="bg-white border-b-[3px] border-red-600 shadow-sm w-full sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {/* O evento onError vai injetar um texto alternativo caso o arquivo Logo web.png ainda não esteja na pasta public */}
            <div className="relative group cursor-pointer inline-block">
              <img 
                src="/Logo web.png" 
                alt="Logo Portal Nossa Web TV" 
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl font-extrabold text-red-600 tracking-tighter">NOSSA<span class="text-blue-800">WEB</span><span class="text-zinc-800 font-light text-2xl">TV</span></span>';
                }}
              />
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6 shrink-0 items-center">
            <a href="#" className="text-zinc-700 hover:text-blue-600 font-semibold transition-colors text-sm uppercase tracking-wide">Início</a>
            <a href="#" className="text-zinc-700 hover:text-blue-600 font-semibold transition-colors text-sm uppercase tracking-wide">Arapongas</a>
            <a href="#" className="text-zinc-700 hover:text-blue-600 font-semibold transition-colors text-sm uppercase tracking-wide">Esportes</a>
            <a href="#" className="text-red-600 hover:text-red-800 font-bold transition-colors text-sm uppercase tracking-wide flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              TV Ao Vivo
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Lado Esquerdo - 70% */}
          <div className="w-full lg:w-[70%] flex flex-col space-y-8">
            <section>
              {/* O SmartPlayer já tem sua própria estética 16:9 elegante e os badges real-time */}
              <SmartPlayer />
            </section>
            
            {/* Feed Secundário de Notícias */}
            <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-zinc-200/60">
               <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-3">
                 <h2 className="text-xl md:text-2xl font-bold text-zinc-800 border-l-4 border-blue-600 pl-3">
                   Em Destaque
                 </h2>
               </div>
               
               {loading ? (
                 <div className="flex justify-center p-8">
                   <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-red-600 animate-spin"></div>
                 </div>
               ) : error ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
               ) : !categorias?.length ? (
                  <p className="text-zinc-500 py-4">Nenhum destaque encontrado no momento.</p>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {categorias.map((cat: any, i: number) => (
                      <div key={cat.id || i} className="group cursor-pointer flex flex-col h-full">
                        <div className="h-48 bg-zinc-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                           <img 
                             src={`https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80&random=${i}`} 
                             alt="Capa" 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
                             onError={(e) => {
                               // Fallback inline simples para imagens quebradas
                               e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80';
                             }}
                           />
                        </div>
                        <div className="flex flex-col flex-grow">
                          <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-2">Arapongas</span>
                          <h3 className="font-bold text-zinc-900 leading-snug text-lg group-hover:text-blue-600 transition-colors line-clamp-3">
                            {cat.nome || cat.titulo || cat.title || "Portal Nossa Web TV - Acompanhe as principais informações da região em tempo real"}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
               )}
            </section>
          </div>

          {/* Lado Direito - 30% (Barra Lateral) */}
          <aside className="w-full lg:w-[30%] flex flex-col space-y-6">
            
            {/* Widget: Previsão do Tempo */}
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

            {/* Widget: Últimas Notícias */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200/60 sticky top-24">
              <div className="flex items-center space-x-2 mb-6 border-b border-zinc-100 pb-3">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-zinc-900 text-lg">Últimas Notícias</h3>
              </div>
              
              <div className="flex flex-col space-y-4">
                {[
                  "Nova escola municipal é inaugurada na Zona Sul",
                  "Polícia Civil recupera veículos roubados na região",
                  "ExpoArapongas 2026: Definida grade de shows",
                  "Vagas de emprego: 250 oportunidades abertas",
                  "Acidente na BR-369 causa congestionamento"
                ].map((news, idx) => (
                  <div key={idx} className="flex gap-4 group cursor-pointer border-b border-zinc-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-col items-center justify-start pt-1">
                      <span className="text-zinc-300 font-black text-xl leading-none group-hover:text-red-500 transition-colors">{(idx + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-700 leading-snug group-hover:text-blue-700 transition-colors">
                      {news}
                    </p>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-300">
                Ver todas as notícias
              </button>
            </div>

          </aside>
        </div>
      </main>
      
      {/* Footer (Rodapé) */}
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
