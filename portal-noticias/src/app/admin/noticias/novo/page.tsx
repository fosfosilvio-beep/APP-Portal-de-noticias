import { Newspaper } from "lucide-react";

export default function NovaNoticiaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Newspaper size={20} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Nova Notícia</h1>
          <p className="text-sm text-slate-400">Editor completo com Copiloto IA — Sub-fase 2B.2</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Newspaper size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Editor em implementação</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Editor com react-hook-form + zod, auto-save em nuvem e sidebar de Copiloto IA.
        </p>
      </div>
    </div>
  );
}
