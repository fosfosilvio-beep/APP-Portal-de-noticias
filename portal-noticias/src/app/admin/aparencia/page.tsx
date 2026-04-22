import { Palette } from "lucide-react";
import HeroBannersClient from "@/components/admin/aparencia/HeroBannersClient";

export default function AparenciaPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Palette size={20} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Aparência do Portal</h1>
          <p className="text-sm text-slate-400">Gestão de Hero Banners e destaques visuais.</p>
        </div>
      </div>
      
      <HeroBannersClient />
    </div>
  );
}
