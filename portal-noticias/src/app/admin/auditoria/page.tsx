import { ClipboardList } from "lucide-react";
export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <ClipboardList size={20} className="text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Auditoria</h1>
          <p className="text-sm text-slate-400">Auditoria de notícias com TanStack Table — Sub-fase 2B.8</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <ClipboardList size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.8</p>
        <p className="text-slate-500 text-sm max-w-sm">
          TanStack Table com busca, filtros de categoria e data, paginação server-side e reordenação dnd-kit.
        </p>
      </div>
    </div>
  );
}
