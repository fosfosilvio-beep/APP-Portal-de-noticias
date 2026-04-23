"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Upload, Plus, Edit, Trash2, Check, X, FileText, Images, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPublicUrl } from "@/components/FallbackImage";

export default function AdminEdicoesPage() {
  const [edicoes, setEdicoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    id: "",
    titulo: "",
    pdf_url: "",
    capa_url: "",
    is_destaque: false,
    data_publicacao: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    fetchEdicoes();
  }, []);

  async function fetchEdicoes() {
    setLoading(true);
    const { data, error } = await supabase
      .from("edicoes_digitais")
      .select("*")
      .order("data_publicacao", { ascending: false });

    if (!error && data) setEdicoes(data);
    setLoading(false);
  }

  const handleOpenModal = (edicao?: any) => {
    if (edicao) {
      setFormData({
        ...edicao,
        data_publicacao: new Date(edicao.data_publicacao).toISOString().slice(0, 16)
      });
    } else {
      setFormData({
        id: "",
        titulo: "",
        pdf_url: "",
        capa_url: "",
        is_destaque: false,
        data_publicacao: new Date().toISOString().slice(0, 16)
      });
    }
    setIsModalOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, selecione um arquivo PDF.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("edicoes")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;
      setUploadProgress(100);

      const { data: publicUrlData } = supabase.storage.from("edicoes").getPublicUrl(filePath);
      
      setFormData({ ...formData, pdf_url: publicUrlData.publicUrl });
      toast.success("PDF da edição carregado com sucesso!");
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCapaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.promise(
      (async () => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-capa.${fileExt}`;
        const { error } = await supabase.storage.from("media").upload(`thumbnails/${fileName}`, file);
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(`thumbnails/${fileName}`);
        setFormData({ ...formData, capa_url: data.publicUrl });
      })(),
      { loading: "Enviando capa...", success: "Capa carregada!", error: "Erro ao enviar capa." }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.pdf_url || !formData.capa_url) {
      toast.error("Título, Arquivo PDF e Capa são obrigatórios.");
      return;
    }

    const payload = {
      titulo: formData.titulo,
      pdf_url: formData.pdf_url,
      capa_url: formData.capa_url,
      is_destaque: formData.is_destaque,
      data_publicacao: new Date(formData.data_publicacao).toISOString()
    };

    if (formData.id) {
      const { error } = await supabase.from("edicoes_digitais").update(payload).eq("id", formData.id);
      if (error) toast.error("Erro ao atualizar.");
      else toast.success("Edição atualizada!");
    } else {
      const { error } = await supabase.from("edicoes_digitais").insert([payload]);
      if (error) toast.error("Erro ao salvar.");
      else toast.success("Edição publicada!");
    }

    setIsModalOpen(false);
    fetchEdicoes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta edição permanentemente?")) return;
    const { error } = await supabase.from("edicoes_digitais").delete().eq("id", id);
    if (!error) {
      toast.success("Edição excluída.");
      fetchEdicoes();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-inner">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Edições <span className="text-blue-600">Digitais</span></h1>
            <p className="text-slate-500 font-medium mt-1">Gerencie revistas e jornais interativos no formato FlipBook.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={16} /> Nova Edição
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] aspect-[3/4] animate-pulse border border-slate-100"></div>
          ))
        ) : edicoes.map((edicao) => (
          <div key={edicao.id} className="bg-white rounded-[2rem] p-3 border border-slate-100 shadow-sm hover:-translate-y-1 transition-all group flex flex-col">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
              <img 
                src={getPublicUrl(edicao.capa_url) || "https://placehold.co/600x800/f8fafc/94a3b8?text=Capa"} 
                alt={edicao.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {edicao.is_destaque && (
                <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-md">
                  Destaque
                </div>
              )}
            </div>
            <h3 className="font-black text-slate-900 text-sm leading-tight text-center line-clamp-2 px-2">{edicao.titulo}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mt-1 pb-3">
              {new Date(edicao.data_publicacao).toLocaleDateString('pt-BR')}
            </p>
            
            <div className="mt-auto flex gap-1 border-t border-slate-50 pt-2">
              <button 
                onClick={() => handleOpenModal(edicao)}
                className="flex-1 text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 py-2 rounded-xl text-xs flex justify-center transition-colors"
              >
                <Edit size={14} />
              </button>
              <button 
                onClick={() => handleDelete(edicao.id)}
                className="flex-1 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 py-2 rounded-xl text-xs flex justify-center transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                {formData.id ? "Editar Edição" : "Publicar Nova Edição"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Título da Edição</label>
                    <input 
                      type="text" 
                      value={formData.titulo}
                      onChange={e => setFormData({...formData, titulo: e.target.value})}
                      placeholder="Ex: Edição Especial de Inverno"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Data de Publicação</label>
                    <input 
                      type="datetime-local" 
                      value={formData.data_publicacao}
                      onChange={e => setFormData({...formData, data_publicacao: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>

                  <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <label className="block text-xs font-black text-blue-900 uppercase tracking-widest mb-3">Arquivo PDF</label>
                    {formData.pdf_url ? (
                      <div className="flex items-center gap-3 bg-white p-3 border border-blue-100 rounded-xl">
                        <FileText className="text-rose-500" size={24} />
                        <span className="text-xs font-bold text-slate-600 truncate flex-1">...{formData.pdf_url.slice(-20)}</span>
                        <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" id="pdf-update" />
                        <label htmlFor="pdf-update" className="cursor-pointer text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">Trocar</label>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <input type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" required={!formData.id} />
                        <label htmlFor="pdf-upload" className="w-full cursor-pointer bg-white border border-blue-100 hover:border-blue-300 text-blue-600 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all shadow-sm">
                          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          {isUploading ? `Enviando... ${uploadProgress}%` : "Anexar Arquivo PDF"}
                        </label>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_destaque}
                      onChange={e => setFormData({...formData, is_destaque: e.target.checked})}
                      className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-amber-200"
                    />
                    <span className="text-xs font-black text-amber-900 uppercase tracking-widest">Destacar no Portal</span>
                  </label>
                </div>

                <div>
                   <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Imagem de Capa (JPG/PNG)</label>
                   {formData.capa_url ? (
                     <div className="relative rounded-2xl overflow-hidden aspect-[3/4] border border-slate-100 group">
                       <img src={getPublicUrl(formData.capa_url) || ""} className="w-full h-full object-cover" alt="Capa" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                         <input type="file" accept="image/*" onChange={handleCapaUpload} className="hidden" id="capa-update" />
                         <label htmlFor="capa-update" className="cursor-pointer text-white font-bold text-xs uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">Trocar Capa</label>
                       </div>
                     </div>
                   ) : (
                     <div className="aspect-[3/4] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                       <input type="file" accept="image/*" onChange={handleCapaUpload} className="hidden" id="capa-upload" required={!formData.id} />
                       <label htmlFor="capa-upload" className="cursor-pointer flex flex-col items-center text-slate-400 gap-2 w-full h-full justify-center">
                         <Images size={32} />
                         <span className="text-[10px] font-black uppercase tracking-widest px-6 text-center">Upload Imagem da Capa</span>
                       </label>
                     </div>
                   )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100 transition-all">
                  <Check size={16} /> Salvar Edição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
