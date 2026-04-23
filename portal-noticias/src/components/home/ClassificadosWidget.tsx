"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Store, Home, Car, Briefcase, MessageCircle, ChevronRight, LayoutGrid } from "lucide-react";
import Link from "next/link";

const tabs = [
  { id: "Todos", icon: <LayoutGrid size={16} /> },
  { id: "Imóvel", icon: <Home size={16} /> },
  { id: "Veículo", icon: <Car size={16} /> },
  { id: "Emprego", icon: <Briefcase size={16} /> }
];

export default function ClassificadosWidget() {
  const [classificados, setClassificados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Todos");

  useEffect(() => {
    fetchClassificados();
  }, []);

  const fetchClassificados = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("classificados")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (data) setClassificados(data);
    setLoading(false);
  };

  const filteredItems = activeTab === "Todos" 
    ? classificados 
    : classificados.filter(item => item.tipo === activeTab);

  if (loading || classificados.length === 0) return null;

  return (
    <div className="w-full bg-slate-50 py-12 px-4 rounded-[3rem] my-12 border border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
              <Store size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
                Classificados <span className="text-emerald-500">Arapongas</span>
              </h2>
              <p className="text-slate-500 font-medium text-sm">Oportunidades locais atualizadas diariamente</p>
            </div>
          </div>

          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id 
                    ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                {tab.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col">
              {item.fotos && item.fotos.length > 0 ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img src={item.fotos[0]} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700">
                    {item.tipo}
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[4/3] w-full bg-slate-100 flex items-center justify-center">
                  <Store size={32} className="text-slate-300" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-700">
                    {item.tipo}
                  </div>
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 leading-tight mb-2 line-clamp-2 flex-1 group-hover:text-emerald-600 transition-colors">
                  {item.titulo}
                </h3>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className="bg-emerald-100 text-emerald-700 font-black text-sm px-3 py-1.5 rounded-xl">
                    {item.preco ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco) : 'A Combinar'}
                  </span>
                  
                  {item.contato_whatsapp && (
                    <button 
                      onClick={() => window.open(`https://wa.me/${item.contato_whatsapp}?text=${encodeURIComponent(`Olá, vi o anúncio "${item.titulo}" na Nossa Web TV.`)}`, '_blank')}
                      className="w-8 h-8 bg-slate-50 hover:bg-emerald-500 text-slate-400 hover:text-white rounded-full flex items-center justify-center transition-colors"
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 font-medium">
               Nenhuma oportunidade encontrada para "{activeTab}".
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
