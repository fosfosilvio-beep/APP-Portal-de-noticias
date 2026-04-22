"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transmissaoSchema, type TransmissaoFormData } from "@/lib/schemas/shared";
import { createClient } from "@/lib/supabase-browser";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/toast";
import ChatModerator from "./ChatModerator";
import { 
  Radio, 
  Webhook, 
  XCircle, 
  MonitorPlay, 
  Globe, 
  ShieldAlert, 
  Loader2 
} from "lucide-react";
import { useState } from "react";

export default function TransmissaoClient({ initialConfig }: { initialConfig: any }) {
  const confirm = useConfirm();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with zod validation
  const form = useForm<TransmissaoFormData>({
    resolver: zodResolver(transmissaoSchema),
    defaultValues: {
      is_live: initialConfig.is_live ?? false,
      titulo_live: initialConfig.titulo_live ?? "",
      descricao_live: initialConfig.descricao_live ?? "",
      url_live_youtube: initialConfig.url_live_youtube ?? "",
      url_live_facebook: initialConfig.url_live_facebook ?? "",
      mostrar_live_facebook: initialConfig.mostrar_live_facebook ?? false,
      fake_viewers_boost: initialConfig.fake_viewers_boost ?? 0,
      organic_views_enabled: initialConfig.organic_views_enabled ?? false,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const isLive = watch("is_live");

  const onSubmit = async (data: TransmissaoFormData) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("configuracao_portal")
        .update(data)
        .eq("id", 1);
        
      if (error) throw error;
      toast.success("Transmissão atualizada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao atualizar", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const killSwitch = async () => {
    const ok = await confirm({
      title: "Interromper Sinal?",
      description: "⚠️ INTERROMPER TRANSMISSÃO IMEDIATAMENTE? Isso derrubará o sinal em todo o portal.",
      destructive: true,
      confirmLabel: "KILL SWITCH"
    });

    if (!ok) return;

    setValue("is_live", false);
    // Auto-save immediately on kill switch
    await onSubmit({ ...form.getValues(), is_live: false });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* COLUNA ESQUERDA: Orquestrador */}
      <div className="w-full lg:w-[60%] flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Webhook className="text-red-500" size={20} />
              <h3 className="font-black text-slate-100 text-sm uppercase tracking-widest">Orquestrador de Sinal</h3>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
            {/* Acionamento Mestre */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-black text-white text-lg">Acionamento Mestre</h4>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">Alterna todo portal para "Modo Live".</p>
              </div>
              <div className="flex items-center gap-4">
                {isLive && (
                  <button 
                    type="button"
                    onClick={killSwitch}
                    className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse"
                  >
                    <XCircle size={14} /> KILL SWITCH
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 scale-125">
                  <input 
                    type="checkbox" 
                    {...register("is_live")}
                    className="sr-only peer" 
                  />
                  <div className="w-14 h-7 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Metadados Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Título do Overlay</label>
                <input 
                  type="text" 
                  {...register("titulo_live")}
                  placeholder="AO VIVO: Titulo..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                />
                {errors.titulo_live && <p className="text-red-500 text-xs mt-1">{errors.titulo_live.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
                <input 
                  type="text" 
                  {...register("descricao_live")}
                  placeholder="Acompanhe Agora!" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all" 
                />
                {errors.descricao_live && <p className="text-red-500 text-xs mt-1">{errors.descricao_live.message}</p>}
              </div>
            </div>

            {/* Fontes de Sinal */}
            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold mb-4">
                  <MonitorPlay size={18} className="text-red-500" /> Fonte YouTube
                </div>
                <input 
                  type="url" 
                  {...register("url_live_youtube")}
                  placeholder="https://youtube.com/live/..." 
                  className="w-full bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-red-600 focus:border-transparent rounded-xl px-4 py-3 text-sm text-white font-bold placeholder:text-slate-600 outline-none transition-all" 
                />
                {errors.url_live_youtube && <p className="text-red-500 text-xs mt-1">{errors.url_live_youtube.message}</p>}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold mb-4">
                  <Globe size={18} className="text-blue-500" /> Fonte Facebook
                </div>
                <input 
                  type="url" 
                  {...register("url_live_facebook")}
                  placeholder="https://facebook.com/..." 
                  className="w-full bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-600 focus:border-transparent rounded-xl px-4 py-3 text-sm text-white font-bold placeholder:text-slate-600 outline-none transition-all" 
                />
                {errors.url_live_facebook && <p className="text-red-500 text-xs mt-1">{errors.url_live_facebook.message}</p>}
                
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="showFb" 
                    {...register("mostrar_live_facebook")}
                    className="w-4 h-4 accent-blue-600 cursor-pointer border-slate-700 rounded bg-slate-900" 
                  />
                  <label htmlFor="showFb" className="text-xs font-bold text-slate-400 cursor-pointer italic">Priorizar Facebook Live (se preenchido)</label>
                </div>
              </div>
            </div>

            {/* Simulador */}
            <div className="border-t border-slate-800 pt-8 flex flex-col gap-8">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-inner">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Audiência Simulada (+Bot Boost)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="number" 
                    {...register("fake_viewers_boost", { valueAsNumber: true })}
                    className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-2xl font-black text-white outline-none" 
                  />
                  <label className="relative inline-flex items-center cursor-pointer ml-auto" title="Oscilação Orgânica">
                    <input 
                      type="checkbox" 
                      {...register("organic_views_enabled")}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                    <span className="text-slate-300 text-xs ml-2 font-bold uppercase tracking-widest">Oscilação Orgânica</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={isSaving} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />} 
                APLICAR ALTERAÇÕES À BASE
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* COLUNA DIREITA: Moderador do Chat */}
      <div className="w-full lg:w-[40%] flex flex-col">
        <ChatModerator />
      </div>
    </div>
  );
}
