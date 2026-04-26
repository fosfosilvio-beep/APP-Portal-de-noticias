"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { 
  Settings, Video, Plus, Trash2, Loader2, LayoutDashboard, LogOut, User, 
  ExternalLink, Calendar, Film, Mic2, Image as ImageIcon, PlaySquare, FileVideo, Users, Clock
} from "lucide-react";
import Link from "next/link";

export default function AdminBiblioteca() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"episodios" | "podcasts">("episodios");

  // Podcasts State
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [progNome, setProgNome] = useState("");
  const [progApresentador, setProgApresentador] = useState("");
  const [progHorario, setProgHorario] = useState("");
  const [progDesc, setProgDesc] = useState("");
  const [progFotoFile, setProgFotoFile] = useState<File | null>(null);
  
  // Episodios State
  const [episodios, setEpisodios] = useState<any[]>([]);
  const [epPodcastId, setEpPodcastId] = useState("");
  const [epTitulo, setEpTitulo] = useState("");
  const [epConvidados, setEpConvidados] = useState("");
  const [epThumbFile, setEpThumbFile] = useState<File | null>(null);
  const [epVideoSource, setEpVideoSource] = useState<"youtube" | "upload">("youtube");
  const [epVideoUrl, setEpVideoUrl] = useState("");
  const [epVideoFile, setEpVideoFile] = useState<File | null>(null);
  const [epStartTimeStr, setEpStartTimeStr] = useState("");
  const [epEndTimeStr, setEpEndTimeStr] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pData } = await supabase.from("podcasts").select("*").order("nome");
      setPodcasts(pData || []);
      if (pData && pData.length > 0 && !epPodcastId) {
        setEpPodcastId(pData[0].id);
      }
      
      const { data: eData } = await supabase.from("episodios").select("*, podcasts(nome)").order("data_publicacao", { ascending: false });
      setEpisodios(eData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") setIsAuthenticated(true);
    else alert("Senha incorreta.");
  };

  const parseTimeToSeconds = (timeStr: string) => {
    if (!timeStr) return null;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return Number(timeStr) || 0;
  };

  const formatSecondsToTime = (seconds: number | null) => {
    if (seconds === null || seconds === undefined) return "-";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSavePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progNome || !progApresentador) return alert("Preencha o nome do podcast e do apresentador.");
    setUploading(true);
    try {
      let fotoUrl = "";
      if (progFotoFile) {
         fotoUrl = await uploadFile(progFotoFile, "videos_biblioteca", "fotos");
      }
      const { error } = await supabase.from("podcasts").insert({
        nome: progNome,
        apresentador_nome: progApresentador,
        apresentador_foto_url: fotoUrl,
        horario_exibicao: progHorario,
        descricao: progDesc
      });
      if (error) throw error;
      alert("Podcast salvo com sucesso!");
      setProgNome(""); setProgApresentador(""); setProgHorario(""); setProgDesc(""); setProgFotoFile(null);
      fetchData();
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEpisodio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!epPodcastId || !epTitulo) return alert("Selecione um podcast e preencha o título.");
    if (epVideoSource === "upload" && !epVideoFile) return alert("Selecione o arquivo de vídeo.");
    if (epVideoSource === "youtube" && !epVideoUrl) return alert("Insira o link do YouTube.");

    setUploading(true);
    try {
      let finalVideoUrl = epVideoUrl;
      if (epVideoSource === "upload" && epVideoFile) {
        finalVideoUrl = await uploadFile(epVideoFile, "videos_biblioteca", "acervo");
      }

      let finalThumbUrl = "";
      if (epThumbFile) {
        finalThumbUrl = await uploadFile(epThumbFile, "videos_biblioteca", "thumbnails");
      } else if (epVideoSource === "youtube" && finalVideoUrl) {
         const match = finalVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
         if (match && match[1]) {
            finalThumbUrl = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
         }
      }

      const { error } = await supabase.from("episodios").insert({
        podcast_id: epPodcastId,
        titulo: epTitulo,
        convidados: epConvidados,
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbUrl,
        start_time: parseTimeToSeconds(epStartTimeStr) || 0,
        end_time: parseTimeToSeconds(epEndTimeStr) || null,
        data_publicacao: new Date().toISOString()
      });

      if (error) throw error;
      alert("Episódio salvo com sucesso!");
      setEpTitulo(""); setEpConvidados(""); setEpVideoUrl(""); setEpVideoFile(null); setEpThumbFile(null);
      setEpStartTimeStr(""); setEpEndTimeStr("");
      fetchData();
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deletePodcast = async (id: string) => {
    if (!confirm("Excluir este podcast e TODOS os seus episódios?")) return;
    await supabase.from("podcasts").delete().eq("id", id);
    fetchData();
  };

  const deleteEpisodio = async (id: string) => {
    if (!confirm("Excluir este episódio?")) return;
    await supabase.from("episodios").delete().eq("id", id);
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Mic2 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">Biblioteca Web TV</h1>
            <p className="text-neutral-400 text-sm">Painel de Podcasts</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-200"
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200">
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
            <Mic2 size={20} /> PodManager
          </div>
        </nav>
        <div className="p-4 border-t border-neutral-900">
            <a href="/biblioteca" target="_blank" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all">
              <ExternalLink size={20} /> Ver Biblioteca no Site
            </a>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10">
           <div className="flex items-center gap-4">
              <h2 className="font-bold text-slate-800 text-xl tracking-tight">Gerenciar Podcasts & Episódios</h2>
           </div>
           <div className="flex items-center gap-4 ml-auto">
              <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-sm text-red-600 font-bold bg-red-50 py-1.5 px-4 rounded-full hover:bg-red-100 transition">
                 <LogOut size={16} /> Sair
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* TABS */}
            <div className="flex p-1 bg-slate-200 rounded-xl w-fit">
               <button 
                  onClick={() => setActiveTab("episodios")}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'episodios' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                  <Video size={18} /> Cadastrar Episódio
               </button>
               <button 
                  onClick={() => setActiveTab("podcasts")}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'podcasts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                  <Mic2 size={18} /> Gerenciar Podcasts
               </button>
            </div>

            {/* TAB: PROGRAMAS */}
            {activeTab === "podcasts" && (
               <div className="space-y-8 animate-in fade-in">
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                        <Plus className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Novo Podcast (Podcast)</h3>
                     </div>
                     <form onSubmit={handleSavePodcast} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Nome do Podcast</label>
                              <input type="text" value={progNome} onChange={e => setProgNome(e.target.value)} placeholder="Ex: Espaço Retrô" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Nome do Apresentador</label>
                              <input type="text" value={progApresentador} onChange={e => setProgApresentador(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Dia e Horário ao Vivo</label>
                              <input type="text" value={progHorario} onChange={e => setProgHorario(e.target.value)} placeholder="Ex: Toda Segunda às 20h" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Foto do Apresentador (Opcional)</label>
                              <div className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${progFotoFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                                 <input type="file" accept="image/*" onChange={e => setProgFotoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                 {progFotoFile ? <p className="font-bold text-blue-800">{progFotoFile.name}</p> : <p className="text-sm text-slate-500 font-bold"><ImageIcon className="inline mr-2" size={18}/>Clique para subir imagem</p>}
                              </div>
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Descrição (Opcional)</label>
                              <textarea value={progDesc} onChange={e => setProgDesc(e.target.value)} placeholder="Sobre o que é este podcast?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 h-24 resize-none" />
                           </div>
                           <button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} {uploading ? "Salvando..." : "Salvar Podcast"}
                           </button>
                        </div>
                     </form>
                  </section>

                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Mic2 className="text-blue-600" size={20}/> Podcasts Cadastrados</h3>
                     </div>
                     <div className="overflow-x-auto p-2">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                 <th className="px-6 py-4">Podcast</th>
                                 <th className="px-6 py-4">Apresentador</th>
                                 <th className="px-6 py-4 text-right">Ações</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {podcasts.map(pod => (
                                 <tr key={pod.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-800">{pod.nome}</td>
                                    <td className="px-6 py-4 text-slate-600">{pod.apresentador_nome}</td>
                                    <td className="px-6 py-4 text-right">
                                       <button onClick={() => deletePodcast(pod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </section>
               </div>
            )}

            {/* TAB: EPISODIOS */}
            {activeTab === "episodios" && (
               <div className="space-y-8 animate-in fade-in">
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                        <Video className="text-blue-600" size={20} />
                        <h3 className="font-bold text-slate-800">Postar Novo Episódio</h3>
                     </div>
                     <form onSubmit={handleSaveEpisodio} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        
                        <div className="space-y-5">
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Podcast / Podcast</label>
                              <select value={epPodcastId} onChange={e => setEpPodcastId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 outline-none focus:border-blue-500">
                                 {podcasts.length === 0 && <option value="">Cadastre um podcast primeiro...</option>}
                                 {podcasts.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Título do Episódio</label>
                              <input type="text" value={epTitulo} onChange={e => setEpTitulo(e.target.value)} placeholder="Ex: Entrevista com Prefeito" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" required />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Nome do(s) Convidado(s) <span className="text-slate-400 font-normal">(Opcional)</span></label>
                              <input type="text" value={epConvidados} onChange={e => setEpConvidados(e.target.value)} placeholder="Ex: Dr. Drauzio Varella" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
                           </div>
                           <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">Foto / Folder do Convidado <ImageIcon size={14}/></label>
                              <p className="text-xs text-slate-500 mb-2">Aparecerá como capa (thumbnail) ao invés do default do YouTube.</p>
                              <div className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all ${epThumbFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                                 <input type="file" accept="image/*" onChange={e => setEpThumbFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                 {epThumbFile ? <p className="font-bold text-blue-800">{epThumbFile.name}</p> : <p className="text-sm text-slate-500 font-bold">Clique para subir imagem de Capa</p>}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                           <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200">
                              <button type="button" onClick={() => setEpVideoSource("youtube")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2 ${epVideoSource === "youtube" ? "bg-red-50 text-red-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><PlaySquare size={18}/> YouTube</button>
                              <button type="button" onClick={() => setEpVideoSource("upload")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex justify-center items-center gap-2 ${epVideoSource === "upload" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}><FileVideo size={18}/> Upload do PC</button>
                           </div>

                           {epVideoSource === "youtube" ? (
                              <div className="animate-in fade-in slide-in-from-top-2">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Link do YouTube</label>
                                 <input type="url" value={epVideoUrl} onChange={e => setEpVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-red-500" />
                              </div>
                           ) : (
                              <div className="animate-in fade-in slide-in-from-top-2">
                                 <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Arquivo de Vídeo (.mp4)</label>
                                 <div className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all bg-white ${epVideoFile ? 'border-blue-500' : 'border-slate-200'}`}>
                                    <input type="file" accept="video/*" onChange={e => setEpVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {epVideoFile ? <p className="font-bold text-blue-800">{epVideoFile.name}</p> : <p className="text-sm text-slate-500 font-bold"><FileVideo size={24} className="mx-auto mb-2 text-slate-300"/>Arraste o vídeo</p>}
                                 </div>
                              </div>
                           )}

                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Início (Tempo)</label>
                                 <input type="text" value={epStartTimeStr} onChange={e => setEpStartTimeStr(e.target.value)} placeholder="Ex: 05:30" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest flex items-center gap-1"><Clock size={12}/> Fim (Tempo)</label>
                                 <input type="text" value={epEndTimeStr} onChange={e => setEpEndTimeStr(e.target.value)} placeholder="Ex: 45:00" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 text-sm font-mono" />
                              </div>
                              <p className="col-span-2 text-[10px] text-slate-400 font-bold">Opcional: Define em que momento o player começa e termina (Formato mm:ss ou segundos).</p>
                           </div>

                           <div className="pt-4 mt-auto">
                              <button type="submit" disabled={uploading || podcasts.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                                 {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} {uploading ? "Publicando Episódio..." : "Publicar Episódio"}
                              </button>
                           </div>
                        </div>
                     </form>
                  </section>

                  {/* LISTA DE EPISODIOS */}
                  <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <Film className="text-indigo-600" size={20} />
                           <h3 className="font-bold text-slate-800">Episódios Publicados ({episodios.length})</h3>
                        </div>
                        <button onClick={fetchData} className="text-xs font-bold text-blue-600 hover:underline">Atualizar Lista</button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                 <th className="px-6 py-4">Episódio</th>
                                 <th className="px-6 py-4">Podcast</th>
                                 <th className="px-6 py-4">Trecho</th>
                                 <th className="px-6 py-4 text-right">Ações</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {loading ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando...</td></tr> : 
                               episodios.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum episódio cadastrado.</td></tr> :
                               episodios.map((ep) => (
                                 <tr key={ep.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-12 h-8 bg-slate-200 rounded overflow-hidden relative shrink-0">
                                             <img src={ep.thumbnail_url || "https://picsum.photos/100/60"} className="w-full h-full object-cover" alt="thumb"/>
                                          </div>
                                          <div>
                                             <p className="font-bold text-slate-900 line-clamp-1">{ep.titulo}</p>
                                             {ep.convidados && <p className="text-[10px] text-slate-500 uppercase">Com: {ep.convidados}</p>}
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-100 uppercase">
                                          {ep.podcasts?.nome || "Desconhecido"}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="text-[10px] font-bold text-slate-500 font-mono">
                                          <span className="text-green-600">{formatSecondsToTime(ep.start_time)}</span> ➔ <span className="text-red-500">{formatSecondsToTime(ep.end_time)}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       <button onClick={() => deleteEpisodio(ep.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </section>
               </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
