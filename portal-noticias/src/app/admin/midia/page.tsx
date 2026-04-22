import { Image } from "lucide-react";
export default function MidiaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Image size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Mídia</h1>
          <p className="text-sm text-slate-400">Biblioteca VOD e Redes Sociais — Sub-fase 2B.7</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Image size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.7</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Biblioteca VOD com upload robusto e progresso; Redes Sociais com embed Facebook ou remoção documentada.
        </p>
      </div>
    </div>
  );
}
