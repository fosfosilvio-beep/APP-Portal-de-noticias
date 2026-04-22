import { Palette } from "lucide-react";
export default function AparenciaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Palette size={20} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Aparência</h1>
          <p className="text-sm text-slate-400">Hero Banners com reordenação dnd-kit e live preview — Sub-fase 2B.4</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Palette size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.4</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Gestão de Hero Banners com reordenação via dnd-kit, validação de dimensões e live preview.
        </p>
      </div>
    </div>
  );
}
