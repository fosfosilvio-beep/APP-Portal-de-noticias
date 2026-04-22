"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { Upload, Trash2, Film, Loader2, ExternalLink, Image as ImageIcon } from "lucide-react";

export default function MidiaClient() {
  const supabase = createClient();
  const [ativos, setAtivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"videos" | "imagens">("videos");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    const bucket = activeTab === "videos" ? "media" : "media";
    const folder = activeTab === "videos" ? "videos_biblioteca" : "galeria";
    const { data } = await supabase.storage.from(bucket).list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    setAtivos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMedia(); }, [activeTab]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    e.target.value = "";
  };

  const uploadFile = (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const folder = activeTab === "videos" ? "videos_biblioteca" : "galeria";
    const path = `${folder}/${Date.now()}_${file.name}`;

    const xhr = new XMLHttpRequest();
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/media/${path}`;

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 200 || xhr.status === 201) {
        toast.success(`${file.name} enviado com sucesso!`);
        fetchMedia();
      } else {
        toast.error("Erro no upload", xhr.statusText);
      }
      setUploading(false);
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      toast.error("Erro de rede no upload");
      setUploading(false);
      setUploadProgress(0);
    };

    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("x-upsert", "true");
    xhr.send(file);
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Excluir ${name}?`)) return;
    const folder = activeTab === "videos" ? "videos_biblioteca" : "galeria";
    const { error } = await supabase.storage.from("media").remove([`${folder}/${name}`]);
    if (error) { toast.error("Erro ao excluir", error.message); return; }
    toast.success("Arquivo excluído");
    fetchMedia();
  };

  const getPublicUrl = (name: string) => {
    const folder = activeTab === "videos" ? "videos_biblioteca" : "galeria";
    const { data } = supabase.storage.from("media").getPublicUrl(`${folder}/${name}`);
    return data.publicUrl;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        {[
          { key: "videos", label: "Vídeos / Lives", icon: Film },
          { key: "imagens", label: "Galeria de Imagens", icon: ImageIcon },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === key
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors group"
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input ref={fileInputRef} type="file" accept={activeTab === "videos" ? "video/*" : "image/*"} className="hidden" onChange={handleUpload} />
        <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
          <Upload size={24} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-300 group-hover:text-white transition-colors">
            {uploading ? `Enviando... ${uploadProgress}%` : "Clique ou arraste o arquivo aqui"}
          </p>
          <p className="text-slate-500 text-xs mt-1">{activeTab === "videos" ? "MP4, MOV, AVI" : "JPG, PNG, WebP, GIF"} — Máx. 500MB</p>
        </div>
        {uploading && (
          <div className="w-64 bg-slate-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : ativos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-700 rounded-2xl">
          <Film size={36} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">Nenhum arquivo enviado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {ativos.map((item) => {
            const url = getPublicUrl(item.name);
            const isVideo = item.name.match(/\.(mp4|mov|avi|webm)$/i);
            return (
              <div key={item.id || item.name} className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {isVideo ? (
                  <div className="h-28 bg-slate-800 flex items-center justify-center">
                    <Film size={28} className="text-slate-500" />
                  </div>
                ) : (
                  <img src={url} alt={item.name} className="w-full h-28 object-cover" />
                )}
                <div className="p-2">
                  <p className="text-slate-300 text-xs font-medium truncate">{item.name}</p>
                  <p className="text-slate-500 text-[10px]">{item.metadata?.size ? `${(item.metadata.size / 1024 / 1024).toFixed(1)}MB` : ""}</p>
                </div>
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                    <ExternalLink size={12} />
                  </a>
                  <button onClick={() => handleDelete(item.name)} className="w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
