"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para auditoria
    console.error("Critical Render Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-red-50 p-8 flex flex-col items-center text-center border-b border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <AlertTriangle className="text-red-600" size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">Ops! Algo deu errado</h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Detectamos uma falha técnica ao carregar esta página. Não se preocupe, nossos técnicos já foram notificados.
          </p>
        </div>
        
        <div className="p-8 space-y-4">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            <RotateCcw size={18} />
            Tentar Novamente
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            <Home size={18} />
            Voltar para o Início
          </button>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 flex justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">ID do Erro: {error.digest || "unknown"}</span>
        </div>
      </div>
    </div>
  );
}
