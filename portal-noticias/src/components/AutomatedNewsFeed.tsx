"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AutomatedNewsFeed() {
  const [plantaoItems, setPlantaoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRSS() {
      try {
        const response = await fetch('/api/rss');
        const data = await response.json();
        
        if(!response.ok) throw new Error(data.error || "Erro ao puxar plantão");
        
        setPlantaoItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadRSS();
  }, []);

  if (loading) {
     return (
       <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-zinc-200/60 mt-8 flex flex-col items-center justify-center min-h-[300px]">
         <Loader2 className="animate-spin text-red-600 mb-4" size={36} />
         <span className="text-slate-400 text-sm font-medium animate-pulse">Sintonizando com portais parceiros (Plantão)...</span>
       </section>
     );
  }

  // Falha amigável/silenciosa caso o servidor do G1 caia ou mude a estrutura do XML.
  if (error || !plantaoItems.length) {
     return null; 
  }

  return (
    <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-zinc-200/60 mt-8">
       <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-3">
         <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-zinc-800 border-l-[5px] border-red-600 pl-4">
           Radar Automático
           <span className="bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
             <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span> Plantão 24h
           </span>
         </h2>
       </div>

       {/* Grid dinâmico ajustável: 1 no tel pra 3 nos monitores */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
         {plantaoItems.map((item, i) => (
           <a 
              key={item.id || i}
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex flex-col h-full bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-44 bg-zinc-200 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 transition-opacity group-hover:opacity-80"></div>
                
                {/* Fallback imbatível do genérico fotojornalismo */}
                <img 
                  src={item.imagem || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&random=${i}`} 
                  alt="Capa Extração Parceiro"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'; }}
                />
                
                <span className="absolute bottom-3 left-3 z-20 text-[9px] font-black uppercase tracking-widest bg-red-600/90 shadow-md text-white px-2 py-1 rounded">
                  G1 Integração 📡
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1 bg-white">
                <span className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  {new Date(item.data).toLocaleDateString('pt-BR')} — {new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </span>
                <h3 className="font-extrabold text-slate-800 text-[15px] leading-snug group-hover:text-red-700 transition-colors">
                  {item.titulo}
                </h3>
              </div>
           </a>
         ))}
       </div>
    </section>
  );
}
