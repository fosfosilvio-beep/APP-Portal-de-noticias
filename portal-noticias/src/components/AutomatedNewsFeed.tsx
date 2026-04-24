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
       <section className="bg-zinc-900/60 p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-800 mt-8 flex flex-col items-center justify-center min-h-[300px]">
         <Loader2 className="animate-spin text-red-500 mb-4" size={36} />
         <span className="text-zinc-500 text-sm font-medium animate-pulse">Sintonizando com portais parceiros (Plantão)...</span>
       </section>
     );
  }

  // Falha amigável/silenciosa caso o servidor do G1 caia ou mude a estrutura do XML.
  if (error || !plantaoItems.length) {
     return null; 
  }

  return (
    <section className="bg-zinc-900/80 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-xl border border-zinc-800 mt-8">
       <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
         <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 text-zinc-100 border-l-[5px] border-red-500 pl-4">
           Radar Automático
           <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> Plantão 24h
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
              className="group flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:shadow-[0_4px_20px_rgba(239,68,68,0.1)] hover:-translate-y-1 hover:border-zinc-700 transition-all duration-300 isolate"
            >
              <div className="h-44 bg-zinc-800 w-full relative overflow-hidden z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent z-10"></div>
                
                {/* Fallback imbatível do genérico fotojornalismo */}
                <img 
                  src={item.imagem || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80&random=${i}`} 
                  alt="Capa Extração Parceiro"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80'; }}
                />
                
                <span className="absolute bottom-3 left-3 z-20 text-[9px] font-black uppercase tracking-widest bg-red-600/90 backdrop-blur shadow-md text-white px-2 py-1 rounded">
                  G1 Integração 📡
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1 relative z-20">
                <span className="text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-wide">
                  {item?.data ? `${new Date(item.data).toLocaleDateString('pt-BR')} — ${new Date(item.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}` : "Agora"}
                </span>
                <h3 className="font-bold text-zinc-100 text-[15px] leading-snug group-hover:text-red-400 transition-colors drop-shadow-sm">
                  {item?.titulo || "Notícia em atualização"}
                </h3>
              </div>
           </a>
         ))}
       </div>
    </section>
  );
}
