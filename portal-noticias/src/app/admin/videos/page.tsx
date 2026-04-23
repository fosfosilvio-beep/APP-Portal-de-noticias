"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PlaySquare, Upload, Plus, Edit, Trash2, Check, X, Film, Link as LinkIcon, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import { getPublicUrl } from "@/components/FallbackImage";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    id: "",
    titulo: "",
    descricao: "",
    video_url: "",
    thumbnail_url: "",
    is_destaque: false,
    status: "published"
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("videos_vod")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setVideos(data);
    setLoading(false);
  }

  const handleOpenModal = (video?: any) => {
    if (video) {
      setFormData(video);
    } else {
      setFormData({
        id: "",
        titulo: "",
        descricao: "",
        video_url: "",
        thumbnail_url: "",
        is_destaque: false,
        status: "published"
      });
    }
    setIsModalOpen(true);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Por favor, selecione um arquivo de vídeo válido.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from("videos")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;
      setUploadProgress(100);

      const { data: publicUrlData } = supabase.storage.from("videos").getPublicUrl(filePath);
      
      setFormData({ ...formData, video_url: publicUrlData.publicUrl });
      toast.success("Vídeo carregado com sucesso!");
    } catch (err: any) {
      toast.error(`Erro no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.promise(
      (async () => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-thumb.${fileExt}`;
        const { error } = await supabase.storage.from("media").upload(`thumbnails/${fileName}`, file);
        if (error) throw error;
        const { data } = supabase.storage.from("media").getPublicUrl(`thumbnails/${fileName}`);
        setFormData({ ...formData, thumbnail_url: data.publicUrl });
      })(),
      { loading: "Enviando capa...", success: "Capa carregada!", error: "Erro ao enviar capa." }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.video_url) {
      toast.error("Título e Link do Vídeo são obrigatórios.");
      return;
    }

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      video_url: formData.video_url,
      thumbnail_url: formData.thumbnail_url,
      is_destaque: formData.is_destaque,
      status: formData.status
    };

    if (formData.id) {
      const { error } = await supabase.from("videos_vod").update(payload).eq("id", formData.id);
      if (error) toast.error("Erro ao atualizar.");
      else toast.success("Vídeo atualizado!");
    } else {
      const { error } = await supabase.from("videos_vod").insert([payload]);
      if (error) toast.error("Erro ao salvar.");
      else toast.success("Vídeo adicionado!");
    }

    setIsModalOpen(false);
    fetchVideos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este vídeo permanentemente?")) return;
    const { error } = await supabase.from("videos_vod").delete().eq("id", id);
    if (!error) {
      toast.success("Vídeo excluído.");
      fetchVideos();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-inner">
            <PlaySquare size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Nossa Web TV <span className="text-blue-600">VOD</span></h1>
            <p className="text-slate-500 font-medium mt-1">Gerencie vídeos sob demanda e conteúdos em destaque.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={16} /> Novo Vídeo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] h-64 animate-pulse border border-slate-100"></div>
          ))
        ) : videos.map((video) => (
          <div key={video.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group">
            <div className="relative h-48 bg-slate-900">
              <img 
                src={getPublicUrl(video.thumbnail_url) || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"} 
                alt={video.titulo}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                  <PlaySquare size={20} className="ml-1" />
                </div>
              </div>
              {video.is_destaque && (
                <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-md">
                  Destaque
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="font-black text-slate-900 text-lg leading-tight mb-2 line-clamp-2">{video.titulo}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">{video.descricao || "Sem descrição"}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenModal(video)}
                  className="flex-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit size={14} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(video.id)}
                  className="bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 px-4 py-3 rounded-xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                {formData.id ? "Editar Vídeo" : "Adicionar Vídeo"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Título do Vídeo</label>
                <input 
                  type="text" 
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Descrição Curta</label>
                <textarea 
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 h-24 resize-none"
                />
              </div>

              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-4">
                <label className="block text-xs font-black text-blue-900 uppercase tracking-widest">Fonte do Vídeo</label>
                
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    <input 
                      type="url" 
                      placeholder="Link do YouTube, Vimeo, ou arquivo MP4..."
                      value={formData.video_url}
                      onChange={e => setFormData({...formData, video_url: e.target.value})}
                      className="w-full bg-white border border-blue-100 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OU</span>
                  <div>
                    <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} className="hidden" id="video-upload" />
                    <label htmlFor="video-upload" className="cursor-pointer bg-white border border-blue-100 hover:border-blue-300 text-blue-600 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {isUploading ? `${uploadProgress}%` : "Upload Nativo"}
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Capa do Vídeo (Thumbnail)</label>
                   {formData.thumbnail_url ? (
                     <div className="relative rounded-2xl overflow-hidden h-32 border border-slate-100 group">
                       <img src={getPublicUrl(formData.thumbnail_url) || ""} className="w-full h-full object-cover" alt="Thumb" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" id="thumb-update" />
                         <label htmlFor="thumb-update" className="cursor-pointer text-white font-bold text-xs uppercase tracking-widest">Trocar Capa</label>
                       </div>
                     </div>
                   ) : (
                     <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                       <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" id="thumb-upload" />
                       <label htmlFor="thumb-upload" className="cursor-pointer flex flex-col items-center text-slate-400 gap-2">
                         <Image size={24} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Upload da Capa</span>
                       </label>
                     </div>
                   )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Status</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-medium outline-none"
                    >
                      <option value="published">Publicado (Visível)</option>
                      <option value="draft">Rascunho (Oculto)</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.is_destaque}
                      onChange={e => setFormData({...formData, is_destaque: e.target.checked})}
                      className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-amber-200"
                    />
                    <span className="text-xs font-black text-amber-900 uppercase tracking-widest">Destaque na Home</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100 transition-all">
                  <Check size={16} /> Salvar Vídeo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
