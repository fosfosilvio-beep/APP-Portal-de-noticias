"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transmissaoSchema, type TransmissaoFormData } from "@/lib/schemas/shared";
import { createClient } from "@/lib/supabase-browser";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/toast";
import ChatModerator from "./ChatModerator";
import { 
  Webhook, 
  XCircle, 
  MonitorPlay, 
  Globe, 
  ShieldAlert, 
  Loader2,
  Users
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function TransmissaoClient({ initialConfig }: { initialConfig: any }) {
  const confirm = useConfirm();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);

  // Initialize with initialConfig but then fetch from the NEW table
  useEffect(() => {
    async function fetchNewLiveStatus() {
      const { data } = await supabase.from("portal_live_status").select("*").eq("id", 1).maybeSingle();
      if (data) {
        setLiveData(data);
        // Update form values if they differ
        form.reset({
          is_live: data.is_live,
          titulo_live: data.titulo || initialConfig.titulo_live || "",
          descricao_live: data.descricao || initialConfig.descricao_live || "",
          url_live_youtube: data.url_youtube || initialConfig.url_live_youtube || "",
          url_live_facebook: data.url_facebook || initialConfig.url_live_facebook || "",
          mostrar_live_facebook: initialConfig.mostrar_live_facebook || false,
          fake_viewers_boost: data.fake_viewers_boost || initialConfig.fake_viewers_boost || 0,
          organic_views_enabled: initialConfig.organic_views_enabled || false,
        });
      }
    }
    fetchNewLiveStatus();
  }, []);

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
      // 1. Update the NEW table (portal_live_status)
      const { error: newTableError } = await supabase
        .from("portal_live_status")
        .upsert({
          id: 1,
          is_live: data.is_live,
          url_youtube: data.url_live_youtube,
          url_facebook: data.url_live_facebook,
          titulo: data.titulo_live,
          descricao: data.descricao_live,
          fake_viewers_boost: data.fake_viewers_boost,
          updated_at: new Date().toISOString()
        });

      if (newTableError) {
         // Se a tabela nova ainda não existe, tentamos salvar na antiga como fallback
         console.warn("New table not found, falling back to legacy table...");
         const { error } = await supabase
           .from("configuracao_portal")
           .update(data)
           .eq("id", 1);
         if (error) throw error;
      } else {
        // Se a nova tabela funcionou, também atualizamos a antiga para manter compatibilidade
        await supabase.from("configuracao_portal").update(data).eq("id", 1).maybeSingle();
      }
        
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
      description: "⚠️ INTERROMPER TRANSMISSÃO IMEDIATAMENTE?",
      destructive: true,
      confirmLabel: "KILL SWITCH"
    });
    if (!ok) return;
    setValue("is_live", false);
    await onSubmit({ ...form.getValues(), is_live: false });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-[60%] flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Webhook className="text-red-500" size={20} />
              <h3 className="font-black text-slate-100 text-sm uppercase tracking-widest">Orquestrador de Sinal</h3>
            </div>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h4 className="font-black text-white text-lg">Acionamento Mestre</h4>
                <p className="text-slate-400 text-sm mt-1 max-w-sm">Alterna todo portal para "Modo Live".</p>
              </div>
              <div className="flex items-center gap-4">
                {isLive && (
                  <button type="button" onClick={killSwitch} className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                    <XCircle size={14} /> KILL SWITCH
                  </button>
                )}
                <label className="relative inline-flex items-center cursor-pointer shrink-0 scale-125">
                  <input type="checkbox" {...register("is_live")} className="sr-only peer" />
                  <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-red-500 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Título do Overlay</label>
                <input type="text" {...register("titulo_live")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-red-600 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
                <input type="text" {...register("descricao_live")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-red-600 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold mb-4">
                  <MonitorPlay size={18} className="text-red-500" /> Fonte YouTube
                </div>
                <input type="url" {...register("url_live_youtube")} className="w-full bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-red-600 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none transition-all" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-300 font-bold mb-4">
                  <Globe size={18} className="text-blue-500" /> Fonte Facebook
                </div>
                <input type="url" {...register("url_live_facebook")} className="w-full bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-blue-600 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none transition-all" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />} 
                APLICAR ALTERAÇÕES À BASE
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex flex-col">
        <ChatModerator />
      </div>
    </div>
  );
}
