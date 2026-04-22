import { Newspaper, Plus } from "lucide-react";
import Link from "next/link";

export default function NoticiasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Newspaper size={20} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Notícias</h1>
            <p className="text-sm text-slate-400">Listagem, busca, filtros e editor com Copiloto IA.</p>
          </div>
        </div>
        <Link
          href="/admin/noticias/novo"
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Nova Notícia
        </Link>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Newspaper size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.2</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Listagem com TanStack Table, editor com react-hook-form + zod, auto-save em nuvem e Copiloto IA integrado.
        </p>
      </div>
    </div>
  );
}
