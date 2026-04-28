"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Info, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function QuemSomos() {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    supabase.from("configuracao_portal").select("*").single().then(({ data }: any) => {
      if (data) setConfig(data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-slate-600">Voltar para o Portal</span>
            </Link>
            <div className="flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                <span className="font-black text-slate-900 tracking-tighter uppercase">Quem Somos</span>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              Quem Somos
            </h1>
            <p className="text-slate-500 font-medium">
              Conheça a história e a missão da Nossa Web TV
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
            {config?.texto_quem_somos ? (
              <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold whitespace-pre-wrap">
                {config.texto_quem_somos}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 font-medium">
                Conteúdo em desenvolvimento. Em breve você conhecerá mais sobre nossa história.
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Portal Nossa Web TV. Arapongas, PR.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
