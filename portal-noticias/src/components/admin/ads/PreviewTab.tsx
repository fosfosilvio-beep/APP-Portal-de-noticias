import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Loader2, Monitor, Smartphone } from "lucide-react";
import DOMPurify from "dompurify";
import { SponsoredBadge } from "@/components/ads/SponsoredBadge";

export default function PreviewTab() {
  const supabase = createClient();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const { data } = await supabase.from("ad_slots").select("*").eq("status_ativo", true).order("nome_slot");
    if (data) setSlots(data);
    setLoading(false);
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="font-bold text-white">Live Preview</h3>
          <p className="text-sm text-slate-400">Visualização de todos os anúncios ativos no sistema.</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setViewMode("desktop")}
            className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors ${viewMode === 'desktop' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Monitor size={16} /> Desktop
          </button>
          <button 
            onClick={() => setViewMode("mobile")}
            className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors ${viewMode === 'mobile' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Smartphone size={16} /> Mobile
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${viewMode === 'desktop' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
        {slots.map(slot => (
          <div key={slot.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-white text-sm">{slot.nome_slot}</h4>
                <code className="text-[10px] text-amber-500 font-mono block mt-1">{slot.posicao_html}</code>
              </div>
              {slot.is_sponsored_content && <SponsoredBadge />}
            </div>

            <div 
              className="bg-slate-950 border border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative"
              style={{
                width: viewMode === 'mobile' ? Math.min(320, slot.width || 320) : slot.width || '100%',
                height: slot.height || 250,
                maxWidth: '100%'
              }}
            >
              {slot.codigo_html_ou_imagem ? (
                <div 
                  className="w-full h-full flex items-center justify-center [&_img]:max-w-full [&_img]:max-h-full [&_img]:object-contain"
                  dangerouslySetInnerHTML={{ 
                    __html: slot.sanitized 
                      ? DOMPurify.sanitize(slot.codigo_html_ou_imagem) 
                      : slot.codigo_html_ou_imagem 
                  }} 
                />
              ) : (
                <span className="text-slate-600 font-medium text-xs text-center px-4">Anúncio Vazio<br/>({slot.width}x{slot.height})</span>
              )}
            </div>
            
            <div className="w-full mt-4 flex items-center justify-between text-[10px] text-slate-500">
              <span>{slot.advertiser_name || 'Sem anunciante'}</span>
              <span>
                {slot.start_date && new Date(slot.start_date).toLocaleDateString()}
                {slot.end_date && ` - ${new Date(slot.end_date).toLocaleDateString()}`}
              </span>
            </div>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500">
            Nenhum slot ativo configurado para visualização.
          </div>
        )}
      </div>
    </div>
  );
}
