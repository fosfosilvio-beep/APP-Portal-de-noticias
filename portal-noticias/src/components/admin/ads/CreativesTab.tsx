import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adSlotSchema, type AdSlotFormData } from "@/lib/schemas/ads";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { Loader2, Save, Code, Image as ImageIcon, Link as LinkIcon, Calendar, ShieldCheck } from "lucide-react";

export default function CreativesTab() {
  const supabase = createClient();
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<AdSlotFormData>({
    resolver: zodResolver(adSlotSchema),
  });
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const isSponsored = watch("is_sponsored_content");

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    const { data } = await supabase.from("ad_slots").select("*").order("nome_slot");
    if (data) setSlots(data);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSlotId) {
      const slot = slots.find(s => s.id === selectedSlotId);
      if (slot) {
        reset({
          nome_slot: slot.nome_slot,
          posicao_html: slot.posicao_html,
          status_ativo: slot.status_ativo,
          width: slot.width,
          height: slot.height,
          codigo_html_ou_imagem: slot.codigo_html_ou_imagem || "",
          is_sponsored_content: slot.is_sponsored_content || false,
          advertiser_name: slot.advertiser_name || "",
          click_url: slot.click_url || "",
          start_date: slot.start_date ? new Date(slot.start_date).toISOString().slice(0,16) : "",
          end_date: slot.end_date ? new Date(slot.end_date).toISOString().slice(0,16) : "",
        });
      }
    }
  }, [selectedSlotId]);

  const onSubmit = async (data: AdSlotFormData) => {
    if (!selectedSlotId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("ad_slots").update({
        ...data,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      }).eq("id", selectedSlotId);
      if (error) throw error;
      toast.success("Criativo atualizado com sucesso!");
      loadSlots(); // refresh list
    } catch (err: any) {
      toast.error("Erro ao salvar", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="grid xl:grid-cols-4 gap-8">
      {/* SELETOR DE SLOT */}
      <div className="xl:col-span-1 space-y-4">
        <h3 className="font-bold text-white mb-4">Selecionar Posição</h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {slots.map(slot => (
            <button
              key={slot.id}
              onClick={() => setSelectedSlotId(slot.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selectedSlotId === slot.id ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
            >
              <p className="font-bold text-sm truncate">{slot.nome_slot}</p>
              <p className="text-[10px] font-mono mt-1 opacity-70">{slot.posicao_html}</p>
            </button>
          ))}
        </div>
      </div>

      {/* EDITOR */}
      <div className="xl:col-span-3">
        {selectedSlotId ? (
          <form id="creative-form" onSubmit={handleSubmit(onSubmit)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Code size={20} className="text-amber-500"/> Gestão do Criativo
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status do Slot:</span>
                <div className="relative">
                  <input type="checkbox" {...register("status_ativo")} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-emerald-500 transition-all"></div>
                  <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                </div>
              </label>
            </div>

            {/* DIMENSÕES & METADADOS */}
            <div className="grid md:grid-cols-3 gap-6 bg-slate-950 p-6 rounded-xl border border-slate-800">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Largura (Width px)</label>
                <input type="number" {...register("width", { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500" />
                {errors.width && <p className="text-red-500 text-[10px] mt-1">{errors.width.message}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Altura (Height px)</label>
                <input type="number" {...register("height", { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500" />
                {errors.height && <p className="text-red-500 text-[10px] mt-1">{errors.height.message}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Anunciante (Controle Interno)</label>
                <input type="text" {...register("advertiser_name")} placeholder="Ex: Coca-Cola" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500" />
              </div>
            </div>

            {/* CONAR & DATAS */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-colors">
                  <div className="relative">
                    <input type="checkbox" {...register("is_sponsored_content")} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:bg-amber-500 transition-all"></div>
                    <div className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5"><ShieldCheck size={16} className="text-amber-500"/> Conteúdo Patrocinado</span>
                    <p className="text-[10px] text-slate-500">Exibe badge "Patrocinado" exigido pelo CONAR.</p>
                  </div>
                </label>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><LinkIcon size={12}/> Link de Clique</label>
                  <input type="url" {...register("click_url")} placeholder="https://" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500" />
                  {errors.click_url && <p className="text-red-500 text-[10px] mt-1">{errors.click_url.message}</p>}
                </div>
              </div>

              <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Calendar size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Agendamento da Campanha</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Início</label>
                  <input type="datetime-local" {...register("start_date")} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Fim (Opcional)</label>
                  <input type="datetime-local" {...register("end_date")} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none" />
                </div>
              </div>
            </div>

            {/* CÓDIGO HTML */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Código HTML (AdSense / Script / Imagem)</label>
              </div>
              <textarea 
                {...register("codigo_html_ou_imagem")}
                rows={8}
                placeholder="<!-- Cole aqui a tag do Google AdSense, iframe ou HTML customizado da imagem -->"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-emerald-400 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-y"
              />
              <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500"/> Sanitização automática com DOMPurify no Frontend.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Salvando..." : "Gravar Criativo"}
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <ImageIcon size={48} className="text-slate-800 mb-4" />
            <h3 className="text-lg font-bold text-slate-400">Nenhum Slot Selecionado</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-2">Selecione uma posição na lista lateral para injetar o código HTML ou imagem publicitária.</p>
          </div>
        )}
      </div>
    </div>
  );
}
