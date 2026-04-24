"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, Save, User, Link as LinkIcon, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { createColumnistUserAction } from "@/app/actions/admin";

interface Colunista {
  id: string;
  nome: string;
  cargo_descricao: string;
  foto_perfil: string;
  slug: string;
  biografia: string;
}

interface ColunistaFormProps {
  colunista: Colunista | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ColunistaForm({ colunista, onClose, onSuccess }: ColunistaFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [formData, setFormData] = useState({
    nome: colunista?.nome || "",
    cargo_descricao: colunista?.cargo_descricao || "",
    foto_perfil: colunista?.foto_perfil || "",
    slug: colunista?.slug || "",
    biografia: colunista?.biografia || ""
  });

  // Auto-gerar slug a partir do nome
  useEffect(() => {
    if (!colunista && formData.nome) {
      const generatedSlug = formData.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.nome, colunista]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const safeName = file.name.replace(`.${fileExt}`, '').replace(/[^a-zA-Z0-9]/g, '');
      const fileName = `${safeName}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("midia")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("midia")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto_perfil: publicUrl }));
      toast.success("Foto carregada!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);

      if (!colunista && (formData as any).email && (formData as any).password) {
        // Modo Criação com Usuário
        const res = await createColumnistUserAction({
          ...formData,
          email: (formData as any).email,
          password: (formData as any).password
        });
        
        if (!res.success) throw new Error(res.error);
        toast.success("Colunista e Usuário criados!");
      } else {
        // Modo Edição ou apenas Perfil
        const payload = {
          nome: formData.nome,
          cargo_descricao: formData.cargo_descricao,
          foto_perfil: formData.foto_perfil,
          slug: formData.slug,
          biografia: formData.biografia,
        };

        if (colunista) {
          const { error } = await supabase
            .from("colunistas")
            .update(payload)
            .eq("id", colunista.id);
          if (error) throw error;
          toast.success("Colunista atualizado!");
        } else {
          const { error } = await supabase
            .from("colunistas")
            .insert([payload]);
          if (error) throw error;
          toast.success("Perfil de colunista cadastrado!");
        }
      }

      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl">
                {colunista ? "Editar Colunista" : "Novo Colunista"}
              </h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Preencha o perfil e dados de acesso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-slate-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Foto Profile */}
            <div className="shrink-0 flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner relative group bg-slate-50">
                {formData.foto_perfil ? (
                  <img src={formData.foto_perfil} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <User size={48} />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setUseExternalUrl(false)} 
                  className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all ${!useExternalUrl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  Upload
                </button>
                <button 
                  type="button" 
                  onClick={() => setUseExternalUrl(true)} 
                  className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase transition-all ${useExternalUrl ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  Link
                </button>
              </div>

              {useExternalUrl ? (
                <div className="w-full space-y-2">
                  <input 
                    type="url" 
                    value={formData.foto_perfil} 
                    onChange={e => setFormData({...formData, foto_perfil: e.target.value})} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/20" 
                    placeholder="https://exemplo.com/foto.png" 
                  />
                </div>
              ) : (
                <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center gap-2">
                  <Upload size={14} /> {formData.foto_perfil ? "Trocar" : "Subir"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cargo / Especialidade</label>
                <input
                  required
                  type="text"
                  value={formData.cargo_descricao}
                  onChange={(e) => setFormData({ ...formData, cargo_descricao: e.target.value })}
                  placeholder="Ex: Diretor Geral"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                />
              </div>

              {!colunista && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Dados de Acesso (Login)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">E-mail</label>
                    <input
                      required
                      type="email"
                      value={(formData as any).email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value } as any)}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Senha Inicial</label>
                    <input
                      required
                      type="password"
                      value={(formData as any).password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value } as any)}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Slug da URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <FileText size={12} /> Biografia Curta
            </label>
            <textarea
              rows={4}
              value={formData.biografia}
              onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-400 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {colunista ? "Salvar Alterações" : "Criar Colunista e Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
