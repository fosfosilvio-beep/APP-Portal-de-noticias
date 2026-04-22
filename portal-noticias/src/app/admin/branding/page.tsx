import { Brush } from "lucide-react";
export default function BrandingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
          <Brush size={20} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Branding & UI</h1>
          <p className="text-sm text-slate-400">Cores, fontes, logos e breaking news — Sub-fase 2B.5</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Brush size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.5</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Schema uiSettingsSchema (zod), live preview do header e breaking news ticker.
        </p>
      </div>
    </div>
  );
}
