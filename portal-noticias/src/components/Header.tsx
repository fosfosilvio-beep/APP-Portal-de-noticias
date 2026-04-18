"use client";

import Link from "next/link";
import { useState } from "react";

interface HeaderProps {
  isLive: boolean;
  config?: {
    logo_url?: string;
    tema_cor?: string;
  };
  categoriaAtiva?: string;
  setCategoriaAtiva?: (cat: string) => void;
  showNavigation?: boolean;
}

export default function Header({ 
  isLive, 
  config, 
  categoriaAtiva, 
  setCategoriaAtiva, 
  showNavigation = true 
}: HeaderProps) {
  
  const temaCor = config?.tema_cor || "#00AEE0";

  return (
    <div className="w-full flex flex-col font-sans sticky top-0 z-50">
      {/* HEADER DE PORTAL PRO */}
      <header className="bg-white border-b border-slate-200 shadow-sm w-full">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link 
              href="/" 
              onClick={() => setCategoriaAtiva?.('Início')} 
              className="relative cursor-pointer outline-none group flex items-center gap-3"
            >
               <div className="relative">
                 <img 
                   src={config?.logo_url || "/logo.png"} 
                   alt="Nossa Web TV" 
                   className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105 rounded-full"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement!.innerHTML = `
                       <div class="flex items-center gap-2">
                         <div class="w-12 h-12 bg-gradient-to-tr from-cyan-600 to-blue-800 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner border-2 border-white">TV</div>
                         <div class="flex flex-col">
                           <span class="text-2xl font-black text-[#00AEE0] tracking-tighter leading-none drop-shadow-sm">NOSSA<span class="text-slate-800">WEB</span></span>
                           <span class="text-[10px] font-black tracking-widest text-[#00AEE0]">BR</span>
                         </div>
                       </div>`;
                   }}
                 />
               </div>
            </Link>
          </div>
          
          <nav className="flex items-center gap-4">
            {showNavigation && setCategoriaAtiva && (
              <div className="hidden lg:flex space-x-1 shrink-0 items-center bg-slate-100 p-1.2 rounded-full border border-slate-200">
                {['Início', 'Arapongas', 'Esportes', 'Polícia', 'Política', 'Biblioteca'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setCategoriaAtiva(cat); window.scrollTo(0, 0); }} 
                    className={`cursor-pointer text-[11px] font-black transition-all uppercase tracking-widest px-4 py-2 rounded-full ${
                      categoriaAtiva === cat 
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {!showNavigation && (
              <Link 
                href="/" 
                className="hidden sm:flex text-slate-500 hover:text-[#00AEE0] font-bold transition-colors text-xs uppercase tracking-widest outline-none items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200"
              >
                ← Voltar ao Início
              </Link>
            )}

            <div className={`text-[10px] uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 shadow-sm ${
              isLive 
              ? 'bg-red-50 text-red-600 border-red-100 font-black animate-pulse' 
              : 'bg-slate-50 text-slate-400 border-slate-200 opacity-70 font-bold'
            }`}>
              <span className="relative flex h-2 w-2">
                {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-red-600' : 'bg-slate-400'}`}></span>
              </span>
              {isLive ? "TV Ao Vivo" : "TV Offline"}
            </div>
          </nav>
        </div>
      </header>

      {/* MARQUEE AZUL CIANO (RADAR REGIONAL) */}
      <div className="bg-gradient-to-r from-[#005a78] to-[#00AEE0] text-white border-b border-cyan-800 w-full overflow-hidden flex items-center h-9 shadow-sm">
         <div className="container mx-auto px-4 lg:px-8 flex items-center">
            <span className="font-black text-[9px] uppercase tracking-widest bg-cyan-950/40 border border-cyan-400/20 px-3 py-1 rounded shadow-inner z-10 shrink-0">Radar Regional</span>
            <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
              <div className="animate-marquee flex gap-10 opacity-90 text-[11px] font-bold uppercase tracking-tight">
                 <span>Arapongas/PR - Em Tempo Real...</span>
                 <span className="text-cyan-200">•</span>
                 <span>Ouça nossa programação e acompanhe o portal 24 horas por dia.</span>
                 <span className="text-cyan-200">•</span>
                 <span>Líder de audiência e credibilidade no norte do Paraná.</span>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
}
