import { AD_GUIDELINES } from "@/lib/ad-guidelines";
import { Copy, ShieldCheck } from "lucide-react";
import { toast } from "@/lib/toast";

export default function GuidelinesTab() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-start gap-4">
        <ShieldCheck className="text-amber-500 shrink-0 mt-1" />
        <div>
          <h4 className="text-white font-bold text-sm">Diretrizes de Qualidade</h4>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Compartilhe estas diretrizes com as agências ou designers. Respeitar as dimensões e pesos máximos (em KB) garante que o portal mantenha um carregamento rápido e otimizado para SEO, além de evitar que banners "quebrem" o layout no celular.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AD_GUIDELINES.map((guide, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col h-full">
            <h5 className="font-black text-white text-lg mb-1">{guide.name}</h5>
            <code className="text-xs text-amber-500 font-mono mb-4 block">{guide.position}</code>
            
            <p className="text-sm text-slate-400 mb-6 flex-1">
              {guide.description}
            </p>

            <div className="space-y-2 bg-slate-900 p-4 rounded-xl text-xs font-medium text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Dimensões (LxA):</span>
                <span className="text-white">{guide.width} x {guide.height} px</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2 pt-2">
                <span className="text-slate-500">Peso Máximo:</span>
                <span className="text-emerald-400">{guide.maxWeightKB} KB</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Formatos:</span>
                <span>{guide.formats.join(", ")}</span>
              </div>
            </div>

            <button 
              onClick={() => handleCopy(`Mídia: ${guide.name}\nDimensões: ${guide.width}x${guide.height} px\nPeso Max: ${guide.maxWeightKB} KB\nFormatos: ${guide.formats.join(', ')}`)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Copy size={14} /> Copiar Especificações
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
