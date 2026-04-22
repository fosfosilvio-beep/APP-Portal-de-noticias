"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandingSchema, type BrandingFormData } from "@/lib/schemas/branding";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { Save, Loader2, Image as ImageIcon, Upload, AlertTriangle, Globe, MonitorPlay, Key } from "lucide-react";

export default function BrandingClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      nome_plataforma: "",
      logo_url: "",
      facebook_page_url: "",
      youtube_channel_url: "",
      openrouter_api_key: "",
      alerta_urgente_ativo: false,
      alerta_urgente_texto: "",
      ui_settings: {
        theme_color: "#2563eb",
        header_style: "modern",
        font_family: "var(--font-inter)",
      }
    }
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const logoUrl = watch("logo_url");
  const alertaAtivo = watch("alerta_urgente_ativo");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from("configuracao_portal").select("*").single();
    if (data) {
      form.reset({
        nome_plataforma: data.nome_plataforma || "",
        logo_url: data.logo_url || "",
        facebook_page_url: data.facebook_page_url || "",
        youtube_channel_url: data.youtube_channel_url || "",
        openrouter_api_key: data.openrouter_api_key || "",
        alerta_urgente_ativo: data.alerta_urgente_ativo || false,
        alerta_urgente_texto: data.alerta_urgente_texto || "",
        ui_settings: data.ui_settings as any || { theme_color: "#2563eb", header_style: "modern", font_family: "var(--font-inter)" },
      });
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.promise(
      (async () => {
        const ext = file.name.split(".").pop();
        const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        setValue("logo_url", data.publicUrl, { shouldValidate: true });
      })(),
      { loading: "Enviando logo...", success: "Logo atualizada", error: "Erro no upload" }
    );
  };

  const onSubmit = async (data: BrandingFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase.from("configuracao_portal").update(data).eq("id", 1);
      if (error) throw error;
      toast.success("Configurações salvas com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-pink-500" /></div>;

  return (
    <div className="max-w-5xl space-y-8">
      <form id="branding-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* IDENTIDADE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <ImageIcon size={20} className="text-pink-500" /> Identidade Visual
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Plataforma</label>
                <input
                  type="text"
                  {...register("nome_plataforma")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                />
                {errors.nome_plataforma && <p className="text-red-500 text-xs mt-1">{errors.nome_plataforma.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">URL do Logotipo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register("logo_url")}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  />
                  <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white w-12 rounded-xl cursor-pointer transition-colors">
                    <Upload size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://placehold.co/100x100/1e293b/1e293b')] opacity-20" />
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="max-h-24 max-w-full relative z-10 drop-shadow-xl" />
              ) : (
                <div className="text-slate-600 font-bold uppercase tracking-widest text-xs relative z-10">Sem Logo</div>
              )}
            </div>
          </div>
        </div>

        {/* ALERTA URGENTE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" /> Ticker de Breaking News
          </h3>
          
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" {...register("alerta_urgente_ativo")} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-red-500 transition-all"></div>
                <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
              </div>
              <span className="text-sm font-bold text-white">Ativar faixa de notícia urgente no topo do site</span>
            </label>

            {alertaAtivo && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mensagem do Ticker</label>
                <input
                  type="text"
                  {...register("alerta_urgente_texto")}
                  placeholder="EXCLUSIVO: Novas informações sobre o caso..."
                  className="w-full bg-slate-950 border border-red-900/30 rounded-xl px-4 py-3 text-sm text-red-100 focus:ring-2 focus:ring-red-500 outline-none placeholder:text-red-900/50"
                />
              </div>
            )}
          </div>
        </div>

        {/* INTEGRAÇÕES & SOCIAL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
            <Key size={20} className="text-emerald-500" /> Redes Sociais & Integrações
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Globe size={14} className="text-blue-500"/> Página Facebook</label>
              <input type="text" {...register("facebook_page_url")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MonitorPlay size={14} className="text-red-500"/> Canal YouTube</label>
              <input type="text" {...register("youtube_channel_url")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">OpenRouter API Key (Copiloto IA)</label>
              <input type="password" {...register("openrouter_api_key")} placeholder="sk-or-v1-..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none font-mono" />
            </div>
          </div>
        </div>

      </form>

      <button
        type="submit"
        form="branding-form"
        disabled={saving}
        className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? "Salvando..." : "Gravar Configurações"}
      </button>
    </div>
  );
}
