import { Brush } from "lucide-react";
import BrandingClient from "@/components/admin/branding/BrandingClient";

export default function BrandingPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
          <Brush size={20} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Branding & Integrações</h1>
          <p className="text-sm text-slate-400">Identidade visual, logos, alertas e chaves de API.</p>
        </div>
      </div>
      
      <BrandingClient />
    </div>
  );
}
