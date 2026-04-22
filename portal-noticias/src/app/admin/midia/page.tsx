import { Image } from "lucide-react";
import MidiaClient from "@/components/admin/midia/MidiaClient";

export default function MidiaPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Image size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Mídia</h1>
          <p className="text-sm text-slate-400">Biblioteca de vídeos, imagens e upload com progresso.</p>
        </div>
      </div>

      <MidiaClient />
    </div>
  );
}
