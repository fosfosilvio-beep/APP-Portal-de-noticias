"use client";

import { Siren } from "lucide-react";
import { useEffect, useState } from "react";

export default function PlantaoPolicialWidget() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  return (
    <div className="bg-white border border-red-100 rounded-xl p-6 shadow-sm relative overflow-hidden group">
      {/* Detalhe visual de alerta */}
      <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40"></span>
          <div className="relative inline-flex rounded-full h-8 w-8 bg-red-100 items-center justify-center border border-red-200">
            <Siren size={18} className="text-red-600 animate-pulse" />
          </div>
        </div>
        <h3 className="font-black text-slate-900 uppercase tracking-tight">
          Plantão <span className="text-red-600">Policial</span>
        </h3>
      </div>

      <div className="space-y-4">
        {/* Mock Data for Realtime (can be swapped with Supabase Realtime later) */}
        {[
          { time: currentTime, text: "Atendimento a acidente na PR-218.", urgency: "high" },
          { time: "18:30", text: "Apreensão de veículo irregular no centro.", urgency: "medium" },
          { time: "15:45", text: "Patrulhamento intensificado na Zona Sul.", urgency: "low" },
        ].map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 w-10 shrink-0">
              {item.time}
            </span>
            <p className={`text-xs font-semibold leading-relaxed ${item.urgency === 'high' ? 'text-red-700' : 'text-slate-600'}`}>
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-slate-100 hover:border-red-200">
        Ver Ocorrências
      </button>
    </div>
  );
}
