import { Megaphone } from "lucide-react";
export default function PublicidadePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Megaphone size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Publicidade</h1>
          <p className="text-sm text-slate-400">Ad Manager Premium com slots, criativos e diretrizes — Fase 3.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Megaphone size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo completo na Fase 3</p>
        <p className="text-slate-500 text-sm max-w-sm">
          AdSlotManager com 4 abas: Slots / Criativos / Diretrizes / Preview. Dimensões validadas por zod.
        </p>
      </div>
    </div>
  );
}
