import { Radio, Wifi } from "lucide-react";

export default function TransmissaoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Radio size={20} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Transmissão</h1>
          <p className="text-sm text-slate-400">Controle do sinal ao vivo e cockpit de transmissão.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Wifi size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.1</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Este módulo unificará o Dashboard e o Sinal Ao Vivo em um cockpit único com validação de URLs e métricas em tempo real.
        </p>
      </div>
    </div>
  );
}
