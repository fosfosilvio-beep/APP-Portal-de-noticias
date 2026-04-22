import { Mic2 } from "lucide-react";
export default function PodcastsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Mic2 size={20} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Podcasts</h1>
          <p className="text-sm text-slate-400">Episódios, thumbnails e rotas públicas — Sub-fase 2B.6</p>
        </div>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-800/30 p-16 flex flex-col items-center justify-center gap-4 text-center">
        <Mic2 size={40} className="text-slate-600" />
        <p className="text-slate-400 font-semibold">Módulo em implementação — Sub-fase 2B.6</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Editor com RichText, reordenação dnd-kit, upload de thumbnails e rotas públicas /podcast/[slug].
        </p>
      </div>
    </div>
  );
}
