"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandingSchema, type BrandingFormData } from "@/lib/schemas/branding";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { Save, Loader2, Building2, MapPin, Mail, Phone, Copyright, FileText, Info } from "lucide-react";

export default function InstitutionalClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<BrandingFormData>({
    resolver: zodResolver(brandingSchema),
  });

  const { register, handleSubmit, reset } = form;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from("configuracao_portal").select("*").single();
    if (data) {
      reset({
        ...data,
        endereco_rodape: data.endereco_rodape || "",
        email_contato: data.email_contato || "",
        telefone_contato: data.telefone_contato || "",
        copyright_texto: data.copyright_texto || "",
        texto_quem_somos: data.texto_quem_somos || "",
        texto_termos_uso: data.texto_termos_uso || "",
        texto_privacidade: data.texto_privacidade || "",
      });
    }
    setLoading(false);
  };

  const onSubmit = async (data: BrandingFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("configuracao_portal")
        .update({ 
          endereco_rodape: data.endereco_rodape,
          email_contato: data.email_contato,
          telefone_contato: data.telefone_contato,
          copyright_texto: data.copyright_texto,
          texto_quem_somos: data.texto_quem_somos,
          texto_termos_uso: data.texto_termos_uso,
          texto_privacidade: data.texto_privacidade,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) throw error;
      toast.success("Configurações institucionais salvas!");
      loadSettings();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Erro ao salvar: " + (err.message || "Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-5xl pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* DADOS DE CONTATO (RODAPÉ) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <MapPin size={20} className="text-blue-500" /> Informações de Contato (Rodapé)
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Endereço Completo</label>
              <input
                type="text"
                {...register("endereco_rodape")}
                placeholder="Ex: Av. Curitiba, 1000 - Centro, Arapongas - PR"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Mail size={14} className="text-blue-500"/> E-mail de Contato
              </label>
              <input
                type="email"
                {...register("email_contato")}
                placeholder="contato@portal.com.br"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Phone size={14} className="text-blue-500"/> Telefone de Contato
              </label>
              <input
                type="text"
                {...register("telefone_contato")}
                placeholder="(43) 99999-9999"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Copyright size={20} className="text-blue-500" /> Direitos Autorais
          </h3>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Texto de Copyright</label>
            <input
              type="text"
              {...register("copyright_texto")}
              placeholder="Ex: © 2008 - 2026 NOSSA WEB TV. Todos os direitos reservados."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* TEXTOS INSTITUCIONAIS */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <FileText size={20} className="text-blue-500" /> Páginas Institucionais (Conteúdo)
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Info size={14} className="text-blue-500"/> Quem Somos
              </label>
              <textarea
                {...register("texto_quem_somos")}
                rows={4}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Termos de Uso</label>
              <textarea
                {...register("texto_termos_uso")}
                rows={4}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Política de Privacidade</label>
              <textarea
                {...register("texto_privacidade")}
                rows={4}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Salvando Alterações..." : "Gravar Configurações Institucionais"}
        </button>
      </form>
    </div>
  );
}
