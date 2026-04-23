"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, Loader2, Save } from "lucide-react";

interface StoryFormProps {
  story?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StoryForm({ story, onClose, onSuccess }: StoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: story?.titulo || "",
    imagem_capa: story?.imagem_capa || "",
    link_destino: story?.link_destino || "",
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `stories/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("stories")
        .getPublicUrl(filePath);

      setFormData({ ...formData, imagem_capa: publicUrl });
    } catch (error: any) {
      alert("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imagem_capa) return alert("Selecione uma imagem de capa.");

    setLoading(true);
    try {
      if (story?.id) {
        const { error } = await supabase
          .from("web_stories")
          .update(formData)
          .eq("id", story.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("web_stories")
          .insert([formData]);
        if (error) throw error;
      }
      onSuccess();
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
          <h3 className="font-black text-slate-900 uppercase tracking-tighter">
            {story ? "Editar Story" : "Novo Story"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Preview / Upload */}
          <div className="flex justify-center">
            <div className="relative w-48 aspect-[9/16] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 overflow-hidden group">
              {formData.imagem_capa ? (
                <>
                  <img src={formData.imagem_capa} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                      Alterar Imagem
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                  ) : (
                    <>
                      <Upload size={24} className="text-slate-300 mb-2" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Upload Vertical (9:16)</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Título do Story</label>
              <input
                required
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Resumo do Dia, Bastidores..."
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Link de Destino (Opcional)</label>
              <input
                type="url"
                value={formData.link_destino || ""}
                onChange={(e) => setFormData({ ...formData, link_destino: e.target.value })}
                placeholder="https://exemplo.com/materia-completa"
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {story ? "Salvar" : "Publicar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
