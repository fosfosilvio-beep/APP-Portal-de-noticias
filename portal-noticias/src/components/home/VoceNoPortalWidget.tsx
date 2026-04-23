"use client";

import { Megaphone, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function VoceNoPortalWidget() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl relative my-8">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      
      <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-cyan-300 text-xs font-black uppercase tracking-widest border border-white/10 mb-2">
            <Megaphone size={14} /> Canal Direto
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Você no Portal
          </h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl leading-relaxed">
            Viu algo acontecendo na cidade? Tem uma sugestão de pauta ou quer fazer uma denúncia? Envie fotos, vídeos e relatos diretamente para a nossa redação.
          </p>
        </div>
        
        <div className="shrink-0 w-full md:w-auto">
          <Link 
            href="/voce-no-portal"
            className="group flex items-center justify-center gap-3 w-full md:w-auto px-8 py-5 bg-white text-blue-900 hover:bg-cyan-50 hover:text-blue-800 rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-cyan-500/20 hover:scale-105"
          >
            Enviar Minha Notícia
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
