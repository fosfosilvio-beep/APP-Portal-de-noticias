"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  Settings, 
  Video, 
  Plus, 
  Trash2, 
  Loader2, 
  LayoutDashboard, 
  LogOut, 
  User, 
  ExternalLink,
  ChevronLeft,
  Calendar,
  Tag,
  Film
} from "lucide-react";
import Link from "next/link";

export default function AdminBiblioteca() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // Estados do Formulário
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Estados da Lista
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta recuperar auth do session storage se quiser persistência simples 
    // ou apenas exige login toda vez como o outro admin faz
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos();
    }
  }, [isAuthenticated]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("biblioteca_webtv")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !titulo.trim()) {
      alert("Por favor, preencha o título e selecione um vídeo.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload para o bucket videos_biblioteca
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `acervo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('videos_biblioteca')
        .upload(filePath, videoFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos_biblioteca')
        .getPublicUrl(filePath);

      // 2. Salvar no Banco
      const { error: dbError } = await supabase
        .from("biblioteca_webtv")
        .insert([{
          titulo,
          categoria,
          url_video: publicUrl,
          created_at: new Date().toISOString()
        }]);

      if (dbError) throw dbError;

      alert("🚀 Vídeo adicionado ao acervo com sucesso!");
      setTitulo("");
      setVideoFile(null);
      fetchVideos();
    } catch (err: any) {
      alert("Erro ao subir vídeo: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deletarVideo = async (id: string, titulo: string, url_video: string) => {
    if (!window.confirm(`Deseja apagar permanentemente o vídeo "${titulo}"?`)) return;

    try {
      // 1. Deletar do Storage (opcional, mas bom pra limpar)
      const fileName = url_video.split('/').pop();
      if (fileName) {
        await supabase.storage.from('videos_biblioteca').remove([`acervo/${fileName}`]);
      }

      // 2. Deletar do Banco
      const { error } = await supabase.from("biblioteca_webtv").delete().eq("id", id);
      if (error) throw error;

      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      alert("Erro ao deletar: " + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Video className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">Biblioteca Web TV</h1>
            <p className="text-neutral-400 text-sm">Painel de Acervo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200"
            >
              Entrar na Biblioteca
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col shadow-xl flex-shrink-0 z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-neutral-900">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Settings size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Admin Pro</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
          <Link href="/admin" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all">
            <LayoutDashboard size={20} /> Voltar ao Painel
          </Link>
          <div className="bg-blue-600 text-white flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium shadow-md">
            <Video size={20} /> Gerenciar Biblioteca
          </div>
        </nav>
        
        <div className="p-4 border-t border-neutral-900">
            <a href="/biblioteca" target="_blank" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all">
              <ExternalLink size={20} /> Ver Biblioteca no Site
            </a>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10">
           <h2 className="font-bold text-slate-800 text-xl tracking-tight">Gerenciar Acervo Web TV</h2>
           <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-4">
                 <User size={16} className="text-slate-500" />
                 <span className="text-sm font-bold text-slate-700">Admin Master</span>
              </div>
              <button 
                onClick={() => setIsAuthenticated(false)} 
                className="flex items-center gap-2 text-sm text-red-600 font-bold bg-red-50 py-1.5 px-4 rounded-full"
              >
                 <LogOut size={16} /> Sair
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* FORMULÁRIO DE UPLOAD */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <Plus className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800">Novo Vídeo para o Acervo</h3>
              </div>
              <form onSubmit={handleUpload} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Título do Vídeo</label>
                    <input 
                      type="text" 
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ex: Highlights do Jogo Arapongas vs Londrina"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Categoria</label>
                    <select 
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
                    >
                      <option value="Geral">Geral</option>
                      <option value="Esportes">Esportes</option>
                      <option value="Polícia">Polícia</option>
                      <option value="Política">Política</option>
                      <option value="Entretenimento">Entretenimento</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Arquivo de Vídeo</label>
                    <div className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${videoFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {videoFile ? (
                        <div className="space-y-2">
                           <Film className="text-blue-600 mx-auto" size={32} />
                           <p className="font-bold text-blue-800">{videoFile.name}</p>
                           <p className="text-xs text-blue-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                           <Video className="text-slate-400 mx-auto" size={32} />
                           <p className="text-sm text-slate-500 uppercase font-black">Clique para selecionar</p>
                           <p className="text-xs text-slate-400">Arraste o vídeo aqui</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    {uploading ? "Subindo para a Nuvem..." : "Adicionar à Biblioteca"}
                  </button>
                </div>
              </form>
            </section>

            {/* LISTAGEM DE VÍDEOS */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Film className="text-indigo-600" size={20} />
                  <h3 className="font-bold text-slate-800">Vídeos no Acervo ({videos.length})</h3>
                </div>
                <button 
                  onClick={fetchVideos}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Atualizar Lista
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="px-6 py-4">Vídeo</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Data de Upload</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">Carregando acervo...</td></tr>
                    ) : videos.length === 0 ? (
                      <tr><td colSpan={4} className="p-12 text-center text-slate-400">Nenhum vídeo no acervo ainda.</td></tr>
                    ) : (
                      videos.map((vid) => (
                        <tr key={vid.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                  <Video size={18} />
                               </div>
                               <div>
                                  <p className="font-bold text-slate-900 line-clamp-1">{vid.titulo}</p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{vid.url_video}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-100 uppercase">
                              {vid.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                             <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400" />
                                {new Date(vid.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => deletarVideo(vid.id, vid.titulo, vid.url_video)}
                               className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                             >
                                <Trash2 size={18} />
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
