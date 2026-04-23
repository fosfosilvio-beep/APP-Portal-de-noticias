"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Folder, Image as ImageIcon, Video, FileText, Trash2, Copy, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPublicUrl } from "@/components/FallbackImage";

type BucketName = "media" | "videos" | "edicoes";

export default function AdminMidiaPage() {
  const [activeBucket, setActiveBucket] = useState<BucketName>("media");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFiles(activeBucket);
  }, [activeBucket]);

  async function fetchFiles(bucket: BucketName) {
    setLoading(true);
    // Lista os arquivos na raiz do bucket. Se existirem subpastas, precisaremos adaptar para recursão ou navegar.
    // Para simplificar, o Storage API retorna até 100 arquivos.
    const { data, error } = await supabase.storage.from(bucket).list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      toast.error(`Erro ao carregar arquivos: ${error.message}`);
    } else {
      // Filtra arquivos ocultos gerados pelo sistema (.emptyFolderPlaceholder)
      setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder"));
    }
    setLoading(false);
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${fileName}? Esta ação pode quebrar matérias que usam este arquivo.`)) return;

    const { error } = await supabase.storage.from(activeBucket).remove([fileName]);
    if (error) {
      toast.error(`Erro ao excluir: ${error.message}`);
    } else {
      toast.success("Arquivo excluído.");
      fetchFiles(activeBucket);
    }
  };

  const copyToClipboard = (fileName: string) => {
    const { data } = supabase.storage.from(activeBucket).getPublicUrl(fileName);
    navigator.clipboard.writeText(data.publicUrl);
    toast.success("URL Pública copiada!");
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <ImageIcon size={24} className="text-emerald-500" />;
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return <Video size={24} className="text-blue-500" />;
    if (['pdf'].includes(ext || '')) return <FileText size={24} className="text-rose-500" />;
    return <Folder size={24} className="text-slate-400" />;
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-inner">
            <Folder size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Galeria <span className="text-blue-600">UpaMidia</span></h1>
            <p className="text-slate-500 font-medium mt-1">Gerencie todos os arquivos armazenados na nuvem do portal.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => setActiveBucket("media")}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeBucket === 'media' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Imagens (Media)
          </button>
          <button 
            onClick={() => setActiveBucket("videos")}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeBucket === 'videos' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Vídeos
          </button>
          <button 
            onClick={() => setActiveBucket("edicoes")}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeBucket === 'edicoes' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-900'}`}
          >
            PDFs
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
          <Folder size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Nenhum Arquivo</h3>
          <p className="text-slate-500 font-medium mt-2">O bucket selecionado está vazio ou a busca não encontrou resultados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest">Arquivo</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-32">Tamanho</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest w-40">Data</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-500 uppercase tracking-widest text-right w-32">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.name} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                          {getFileIcon(file.name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs lg:max-w-md">{file.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Bucket: {activeBucket}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                      {file.metadata?.size ? formatBytes(file.metadata.size) : '--'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-bold tracking-widest uppercase">
                      {new Date(file.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => copyToClipboard(file.name)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                          title="Copiar URL"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(file.name)}
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
