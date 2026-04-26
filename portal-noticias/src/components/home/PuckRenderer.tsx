"use client";

import React from "react";
import { Render } from "@measured/puck";
import { puckConfig } from "@/lib/puck-config";
import "@measured/puck/puck.css";
import Header from "@/components/Header";
import HeroSection from "@/components/home/HeroSection";
import PWAInstallBanner from "@/components/PWAInstallBanner";

interface PuckRendererProps {
  data: any;
  config?: any;
}

export default function PuckRenderer({ data, config }: PuckRendererProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const isLive = config?.is_live || false;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans overflow-x-hidden">
      {/* Inject primary color CSS var */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${config?.ui_settings?.primary_color || '#00AEE0'};
        }
        .text-primary { color: var(--primary-color); }
        .bg-primary { background-color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}} />

      <Header isLive={isLive} config={config} categoriaAtiva="Início" setCategoriaAtiva={() => {}} />
      <PWAInstallBanner />

      <main className="container mx-auto px-4 lg:px-8 flex-grow">
        
        {/* Adicionar Player de Live se estiver ativo */}
        {isLive && <HeroSection />}

        {data && typeof data === 'object' && Object.keys(data).length > 0 ? (
          <Render config={puckConfig} data={data} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
             <p className="font-medium">Conteúdo em carregamento ou indisponível.</p>
          </div>
        )}
      </main>

      <footer className="bg-[#0f172a] text-slate-400 py-12 mt-auto border-t-[5px] border-[#00AEE0] rounded-t-3xl">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-black text-2xl text-white tracking-tighter leading-none mb-2">
              NOSSA<span className="text-[#00AEE0]">WEB</span><span className="text-slate-500 font-light">TV</span>
            </span>
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
