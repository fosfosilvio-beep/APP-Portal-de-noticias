"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandingSchema, type BrandingFormData } from "@/lib/schemas/branding";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { Save, Loader2, Image as ImageIcon, Upload, AlertTriangle, Globe, MonitorPlay, Key, Phone, Type, MousePointer2, Palette } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatExternalUrl } from "@/lib/utils";
import HeroBannersClient from "../aparencia/HeroBannersClient";

/**
 * BrandingClient - v2.1 (Force Update para garantir visibilidade do campo Logo Texto)
 * Última atualização: 2026-04-25 14:38
 */

export default function BrandingClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      nome_plataforma: "",
      logo_url: "",
      logo_texto_url: "",
      facebook_page_url: "",
      youtube_channel_url: "",
      instagram_url: "",
      whatsapp_number: "",
      ticker_speed: 20,
      ticker_font_size: 14,
      ticker_font_color: "#ffffff",
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
  const logoTextoUrl = watch("logo_texto_url");
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
        logo_texto_url: data.logo_texto_url || "",
        facebook_page_url: data.facebook_page_url || "",
        youtube_channel_url: data.youtube_channel_url || "",
        instagram_url: data.instagram_url || "",
        whatsapp_number: data.whatsapp_number || "",
        ticker_speed: data.ticker_speed || 20,
        ticker_font_size: data.ticker_font_size || 14,
        ticker_font_color: data.ticker_font_color || "#ffffff",
        openrouter_api_key: data.openrouter_api_key || "",
        alerta_urgente_ativo: data.alerta_urgente_ativo || false,
        alerta_urgente_texto: data.alerta_urgente_texto || "",
        ui_settings: data.ui_settings as any || { 
          theme_color: "#2563eb", 
          header_style: "modern", 
          font_family: "var(--font-inter)"
        },
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

  const handleLogoTextoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.promise(
      (async () => {
        const ext = file.name.split(".").pop();
        const path = `logos/${Date.now()}-texto-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("media").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        setValue("logo_texto_url", data.publicUrl, { shouldValidate: true });
      })(),
      { loading: "Enviando logo texto...", success: "Logo texto atualizada", error: "Erro no upload" }
    );
  };

  const onSubmit = async (data: BrandingFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("configuracao_portal")
        .update({ 
          ...data,
          facebook_page_url: data.facebook_page_url?.trim(),
          youtube_channel_url: data.youtube_channel_url?.trim(),
          instagram_url: data.instagram_url?.trim(),
          whatsapp_number: data.whatsapp_number?.replace(/\D/g, ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      toast.success("Configurações salvas com sucesso!");
      loadSettings();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erro ao salvar: " + (err.message || "Verifique sua conexão ou permissões."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-pink-500" /></div>;

  return (
    <div className="max-w-5xl pb-20">
      <Tabs defaultValue="geral" className="space-y-8">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="geral" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all">
            Identidade & Social
          </TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all">
            Hero Banners (Topo)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-8 outline-none">
          <form id="branding-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SEÇÃO IDENTIDADE VISUAL */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <ImageIcon size={20} className="text-pink-500" /> Identidade Visual do Portal
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome da Plataforma</label>
                    <input
                      type="text"
                      {...register("nome_plataforma")}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                    {errors.nome_plataforma && <p className="text-red-500 text-xs mt-1">{errors.nome_plataforma.message}</p>}
                  </div>

                  {/* Logo Ícone */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Logo Principal (Ícone)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        {...register("logo_url")}
                        placeholder="URL da imagem ou upload..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                      <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white w-12 rounded-xl cursor-pointer transition-colors">
                        <Upload size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    </div>
                  </div>

                  {/* Logo Texto - O CAMPO QUE VOCÊ ESTAVA PROCURANDO ESTÁ AQUI ABAIXO */}
                  <div className="p-4 bg-pink-500/5 border border-pink-500/10 rounded-xl">
                    <label className="block text-xs font-black text-pink-400 uppercase tracking-widest mb-2">Logo em Texto (Lado a Lado)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        {...register("logo_texto_url")}
                        placeholder="URL do texto logo ou upload..."
                        className="w-full bg-slate-950 border border-pink-500/20 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                      />
                      <label className="flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white w-12 rounded-xl cursor-pointer transition-colors">
                        <Upload size={16} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoTextoUpload} />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic">Dica: Use uma imagem PNG com fundo transparente do nome do seu portal.</p>
                  </div>
                </div>

                {/* PRÉ-VISUALIZAÇÃO */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] relative">
                  <div className="absolute top-4 left-4 text-[10px] font-black text-slate-700 uppercase tracking-tighter">Live Preview</div>
                  <div className="flex items-center gap-4">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="max-h-20 max-w-full object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-700 italic">Ícone</div>
                    )}
                    {logoTextoUrl ? (
                      <img src={logoTextoUrl} alt="Logo Texto" className="max-h-12 max-w-full object-contain" />
                    ) : (
                      <div className="h-8 px-4 rounded-lg bg-slate-900 border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-700 italic">Texto</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ALERTA URGENTE */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" /> Ticker de Notícia Urgente
              </h3>
              
              <div className="space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" {...register("alerta_urgente_ativo")} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-red-600 transition-all"></div>
                    <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Exibir faixa vermelha no topo do site</span>
                </label>

                {alertaAtivo && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Texto do Alerta</label>
                      <input
                        type="text"
                        {...register("alerta_urgente_texto")}
                        placeholder="Ex: BREAKING NEWS: Evento importante acontecendo agora..."
                        className="w-full bg-slate-950 border border-red-900/30 rounded-xl px-4 py-3 text-sm text-red-100 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <MousePointer2 size={14} className="text-pink-500" /> Velocidade (S)
                        </label>
                        <input 
                          type="number" 
                          {...register("ticker_speed", { valueAsNumber: true })}
                          placeholder="Ex: 20"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" 
                        />
                        <p className="text-[9px] text-slate-500 mt-1 italic">Segundos p/ completar volta. Menor = Mais Rápido.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Type size={14} className="text-pink-500" /> Tamanho Fonte (px)
                        </label>
                        <input 
                          type="number" 
                          {...register("ticker_font_size", { valueAsNumber: true })}
                          placeholder="Ex: 14"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Palette size={14} className="text-pink-500" /> Cor do Texto
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            {...register("ticker_font_color")}
                            className="h-11 w-11 bg-slate-950 border border-slate-800 rounded-lg p-1 outline-none cursor-pointer" 
                          />
                          <input 
                            type="text"
                            {...register("ticker_font_color")}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* REDES SOCIAIS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                <Key size={20} className="text-blue-500" /> Redes Sociais & Integrações
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Globe size={14} className="text-blue-500"/> Facebook URL</label>
                  <input type="text" {...register("facebook_page_url")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MonitorPlay size={14} className="text-red-500"/> YouTube URL</label>
                  <input type="text" {...register("youtube_channel_url")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Globe size={14} className="text-pink-500"/> Instagram URL</label>
                  <input type="text" {...register("instagram_url")} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Phone size={14} className="text-emerald-500"/> WhatsApp (Número com DDD)</label>
                  <input type="text" {...register("whatsapp_number")} placeholder="Ex: 5543999999999" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                </div>
                <div className="md:col-span-2 border-t border-slate-800 pt-6 mt-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">OpenRouter API Key (Inteligência Artificial)</label>
                  <input type="password" {...register("openrouter_api_key")} placeholder="sk-or-v1-..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none font-mono" />
                </div>
              </div>
            </div>

            {/* BOTÃO SALVAR */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-5 rounded-xl shadow-2xl shadow-pink-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Salvando Alterações..." : "Gravar Configurações Gerais"}
            </button>
          </form>
        </TabsContent>

        <TabsContent value="banners" className="outline-none">
          <HeroBannersClient />
        </TabsContent>
      </Tabs>
    </div>
  );
}
