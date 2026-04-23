"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart3, Users, LayoutTemplate, TrendingUp, Smartphone, MousePointerClick, MessageCircle } from "lucide-react";

export default function MidiaKitPage() {
  const [config, setConfig] = useState<any>(null);
  const whatsappNumber = "5543999999999"; // Replace with real or fetch from config

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from("configuracao_portal").select("*").limit(1).single();
      if (data) setConfig(data);
    };
    fetchConfig();
  }, []);

  const handleWhatsapp = () => {
    const text = "Olá! Gostaria de conhecer os planos de anúncio na Nossa Web TV.";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header config={config} />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="bg-slate-900 text-white pt-24 pb-32 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
          
          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/10">
              <TrendingUp size={16} className="text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-widest text-cyan-50">Mídia Kit Digital</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6">
              A vitrine definitiva para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">seu negócio</span> em Arapongas.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium mb-12">
              Alcance milhares de leitores diários através do portal de notícias mais inovador, rápido e interativo da região.
            </p>
            
            <button 
              onClick={handleWhatsapp}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-8 py-4 rounded-2xl text-lg transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <MessageCircle size={24} />
              Falar com o Comercial
            </button>
          </div>
        </section>

        {/* NÚMEROS E MÉTRICAS */}
        <section className="py-20 px-4 -mt-16 relative z-20">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-500">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users size={32} />
                </div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">+50k</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Leitores Mensais</p>
              </div>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-500 delay-100">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone size={32} />
                </div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">85%</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Acessos via Celular</p>
              </div>
              
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-500 delay-200">
                <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <MousePointerClick size={32} />
                </div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Alta</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Taxa de Conversão (CTR)</p>
              </div>
            </div>
          </div>
        </section>

        {/* FORMATOS DE BANNER */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Formatos de Anúncio</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                Integração nativa que não atrapalha a leitura, mas garante máxima visibilidade para sua marca.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Formato 1 */}
              <div className="flex flex-col">
                <div className="bg-slate-100 rounded-[2rem] p-8 mb-6 aspect-video flex flex-col items-center justify-center relative border border-slate-200">
                  {/* Mockup Topo */}
                  <div className="w-full h-4 bg-white rounded-t-lg mb-2"></div>
                  <div className="w-full h-16 bg-cyan-500 rounded shadow-lg flex items-center justify-center text-white font-black text-xs uppercase tracking-widest border border-cyan-400">
                    Sua Marca (Topo)
                  </div>
                  <div className="w-full flex-1 bg-white rounded-b-lg mt-2 p-4">
                    <div className="w-3/4 h-2 bg-slate-200 rounded mb-2"></div>
                    <div className="w-full h-2 bg-slate-200 rounded mb-2"></div>
                    <div className="w-5/6 h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Master Topo</h3>
                <p className="text-slate-500 font-medium">O primeiro impacto. Visível em todas as páginas do portal assim que o leitor entra.</p>
              </div>

              {/* Formato 2 */}
              <div className="flex flex-col">
                <div className="bg-slate-100 rounded-[2rem] p-8 mb-6 aspect-video flex items-start justify-center gap-4 relative border border-slate-200">
                  {/* Mockup Sidebar */}
                  <div className="w-2/3 h-full bg-white rounded-lg p-4">
                    <div className="w-full h-20 bg-slate-200 rounded mb-2"></div>
                    <div className="w-full h-2 bg-slate-200 rounded mb-2"></div>
                    <div className="w-full h-2 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-1/3 h-32 bg-emerald-500 rounded shadow-lg flex items-center justify-center text-white font-black text-[10px] text-center uppercase tracking-widest border border-emerald-400 p-2">
                    Banner<br/>Lateral
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Sidebar Premium</h3>
                <p className="text-slate-500 font-medium">Acompanha o leitor durante a navegação. Ideal para campanhas focadas em clique.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-24 px-4 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-center">
          <div className="container mx-auto max-w-3xl">
            <LayoutTemplate size={48} className="mx-auto text-cyan-200 mb-8" />
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
              Pronto para alavancar suas vendas?
            </h2>
            <p className="text-xl text-cyan-100 font-medium mb-10">
              Entre em contato agora mesmo e descubra o plano perfeito para o tamanho do seu negócio.
            </p>
            <button 
              onClick={handleWhatsapp}
              className="bg-white text-blue-700 hover:bg-slate-50 font-black px-10 py-5 rounded-2xl text-lg transition-transform hover:scale-105 shadow-2xl flex items-center gap-3 mx-auto uppercase tracking-widest"
            >
              <MessageCircle size={24} />
              Chamar no WhatsApp
            </button>
          </div>
        </section>

      </main>

      <Footer />
      
      {/* Botão Flutuante de WhatsApp Geral */}
      <button 
        onClick={handleWhatsapp}
        className="fixed bottom-8 right-8 bg-emerald-500 text-white p-4 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.5)] hover:bg-emerald-400 hover:scale-110 transition-all z-50 flex items-center justify-center group"
      >
        <MessageCircle size={32} />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Fale com o Comercial
        </span>
      </button>
    </div>
  );
}
