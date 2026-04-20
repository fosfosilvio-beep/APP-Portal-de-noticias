"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Settings, Rss, Users, Sparkles, Send, Loader2, Save, 
  LayoutDashboard, FileText, ExternalLink, LogOut, User, 
  Eye, List, Trash2, Video, Type as TypeIcon, Palette, 
  Bold as BoldIcon, Radio, Webhook, MonitorPlay, Globe, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../../components/RichTextEditor";

interface StyleConfig {
  font: string;
  weight: string;
  color: string;
}

const DEFAULT_CONFIG: StyleConfig = {
  font: "var(--font-inter)",
  weight: "900",
  color: "default"
};

const SUBTITLE_DEFAULT: StyleConfig = {
  font: "var(--font-inter)",
  weight: "400",
  color: "default"
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Config Globais (Supabase `configuracao_portal`)
  const [isLive, setIsLive] = useState(false);
  const [urlLiveFacebook, setUrlLiveFacebook] = useState("");
  const [urlLiveYoutube, setUrlLiveYoutube] = useState("");
  const [mostrarLiveFacebook, setMostrarLiveFacebook] = useState(false);
  
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState("");
  const [facebookPageUrl, setFacebookPageUrl] = useState("");
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  
  const [viewersBoost, setViewersBoost] = useState(0);
  const [savingConfig, setSavingConfig] = useState(false);
  const [totalNoticias, setTotalNoticias] = useState(0);

  // Estados de Nova Postagem
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [slug, setSlug] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [tituloConfig, setTituloConfig] = useState<StyleConfig>(DEFAULT_CONFIG);
  const [subtituloConfig, setSubtituloConfig] = useState<StyleConfig>(SUBTITLE_DEFAULT);

  // Lista de Notícias
  const [listaNoticias, setListaNoticias] = useState<any[]>([]);
  const [loadingNoticias, setLoadingNoticias] = useState(false);

  useEffect(() => {
    if (activeTab === 'lista-noticias') fetchNoticiasList();
  }, [activeTab]);

  const fetchNoticiasList = async () => {
    setLoadingNoticias(true);
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("noticias")
        .select("id, titulo, categoria, created_at, slug, ordem_prioridade")
        .order("ordem_prioridade", { ascending: false })
        .order("created_at", { ascending: false });
      if (!error && data) setListaNoticias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNoticias(false);
    }
  };

  const deletarNoticia = async (id: string, titulo: string) => {
    if(!window.confirm(`⚠️ Deseja apagar permanentemente:\n\n"${titulo}"?`)) return;
    try {
      const { error } = await supabase.from("noticias").delete().eq("id", id);
      if(error) throw error;
      setListaNoticias((prev) => prev.filter((n) => n.id !== id));
      setTotalNoticias((prev) => prev - 1);
    } catch (err: any) {
      alert("Erro ao apagar: " + err.message);
    }
  };

  const fetchCurrentConfig = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from("configuracao_portal").select("*").limit(1).single();
      if (data) {
        setIsLive(data.is_live);
        // Os campos abaixo estão dentro do Try para perdoar a ausência da coluna caso o user não tenha criado no painel da Vercel
        try { setUrlLiveFacebook(data.url_live_facebook || ""); } catch(e){}
        try { setUrlLiveYoutube(data.url_live_youtube || ""); } catch(e){}
        try { setMostrarLiveFacebook(data.mostrar_live_facebook || false); } catch(e){}
        try { setYoutubeChannelUrl(data.youtube_channel_url || ""); } catch(e){}
        try { setFacebookPageUrl(data.facebook_page_url || ""); } catch(e){}
        try { setOpenrouterApiKey(data.openrouter_api_key || ""); } catch(e){}
        try { setViewersBoost(data.fake_viewers_boost || 0); } catch(e){}
      }
      
      const { count } = await supabase.from("noticias").select('*', { count: 'exact', head: true });
      if (count !== null) setTotalNoticias(count);
    } catch (err) {
      console.error("Erro ao buscar config. Verifique se adicionou as colunas no Supabase.", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
      fetchCurrentConfig();
    } else {
      alert("Senha incorreta.");
    }
  };
  
  const saveConfig = async (fieldsToUpdate: any) => {
    setSavingConfig(true);
    try {
      if (!supabase) return;
      const { error } = await supabase.from("configuracao_portal").update(fieldsToUpdate).eq("id", 1);
      if (error) throw error;
      alert("✅ Configurações atualizadas e injetadas no portal em tempo real!");
    } catch (err: any) {
      alert("❌ Erro ao salvar configuração. Você adicionou esta nova coluna no banco de dados Supabase?\n\nError: " + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const publishNews = async () => {
    if (!titulo.trim() || !conteudo.trim() || !slug.trim()) {
      alert("Título, Conteúdo e Slug são obrigatórios."); return;
    }
    setSavingConfig(true);
    let finalVideoUrl = "";

    try {
      if (videoFile) {
        setUploadingVideo(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `noticias/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('videos').upload(filePath, videoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
        finalVideoUrl = publicUrl;
        setUploadingVideo(false);
      }

      const cleanSlug = slug.trim().replace(/^https?:\/\//, '').split('/').filter(Boolean).pop() || slug;

      const { error } = await supabase.from("noticias").insert([{
        titulo, subtitulo, conteudo, categoria, slug: cleanSlug, imagem_capa: imagemUrl, 
        video_url: finalVideoUrl, mostrar_no_player: false, mostrar_na_home_recentes: true,
        titulo_config: tituloConfig, subtitulo_config: subtituloConfig, ordem_prioridade: 0
      }]);

      if (error) throw error;
      alert("🚀 Notícia publicada com sucesso no banco de dados da redação!");
      
      setTitulo(""); setSubtitulo(""); setConteudo(""); setCategoria(""); setSlug("");
      setImagemUrl(""); setVideoFile(null); setTituloConfig(DEFAULT_CONFIG);
      setSubtituloConfig(SUBTITLE_DEFAULT); setTotalNoticias(prev => prev + 1);
    } catch (err: any) {
       alert("Erro ao publicar: " + err.message);
    } finally {
      setSavingConfig(false); setUploadingVideo(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-[family-name:var(--font-inter)]">
        <div className="w-full max-w-sm p-8 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
           <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Settings className="text-white" size={24} />
              </div>
           </div>
           <h1 className="text-2xl font-black text-white text-center mb-1">Nossa Web TV</h1>
           <p className="text-zinc-500 text-sm text-center font-medium mb-8">Management Enterprise Suite</p>
           
           <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 placeholder-zinc-600 transition-all outline-none font-medium"
                  placeholder="Insert Authorization Key"
                />
              </div>
              <button type="submit" className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all">
                Authenticate
              </button>
           </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Visão Geral", icon: <LayoutDashboard size={18} /> },
    { id: "ao-vivo", label: "Sinal Ao Vivo", icon: <Radio size={18} /> },
    { id: "postagens", label: "Editor de Postagens", icon: <FileText size={18} /> },
    { id: "facebook-insta", label: "Feeds Sociais", icon: <Globe size={18} /> },
    { id: "biblioteca", label: "Acervo de Biblioteca", icon: <Video size={18} /> },
    { id: "copiloto-ia", label: "Copiloto IA", icon: <Sparkles size={18} /> },
    { id: "lista-noticias", label: "Auditoria de Notícias", icon: <List size={18} /> }
  ];

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-[family-name:var(--font-inter)]">
      
      {/* SHADCN DARK LINE-ART SIDEBAR */}
      <aside className="w-[280px] bg-[#09090b] border-r border-zinc-900 flex flex-col shadow-2xl z-20 flex-shrink-0 text-zinc-100">
        <div className="h-20 flex items-center px-6 border-b border-zinc-900 border-opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center shadow-inner">
               <Settings size={18} className="text-zinc-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-md leading-tight">Admin Pro V2</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Enterprise Mode</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-8 space-y-1.5 px-4 scrollbar-hide">
          <div className="text-[11px] font-black text-zinc-600 uppercase tracking-widest px-3 mb-4">Core Modules</div>
          
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-700' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <div className={activeTab === item.id ? 'text-blue-400' : 'text-zinc-500'}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-zinc-900">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center text-center">
             <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                <User size={18} className="text-blue-500" />
             </div>
             <p className="text-sm font-bold text-white mb-0.5">Administrador(a)</p>
             <p className="text-xs text-zinc-500 mb-4">Acesso Ilimitado</p>
             <button onClick={() => setIsAuthenticated(false)} className="flex items-center justify-center gap-2 w-full text-xs font-bold text-zinc-400 hover:text-white bg-zinc-950 hover:bg-red-900/30 py-2 rounded-lg transition-colors border border-zinc-800">
                <LogOut size={14} /> Desconectar Token
             </button>
          </div>
        </div>
      </aside>

      {/* DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa]">
        
        {/* HEADER TOP ROW */}
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0 z-10">
           <div className="flex flex-col">
              <h2 className="font-black text-zinc-900 text-xl tracking-tight">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">Controle executivo e métricas da plataforma.</p>
           </div>
           
           <div className="flex items-center gap-4 hidden sm:flex">
             <a href="/" target="_blank" className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 py-2 px-4 rounded-full transition-colors border border-zinc-200 shadow-sm">
                <ExternalLink size={14} /> Inspecionar Site ao Vivo
             </a>
           </div>
        </header>

        {/* TAB CONTENTS (RENDER) */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           <div className="max-w-6xl mx-auto space-y-8 pb-32">
             
             {/* 1. ABA DASHBOARD (FALLBACK / MODO MANUTENÇÃO) */}
             {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                   {/* Fallback de emergência Box */}
                   <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                      <h3 className="font-black text-red-700 flex items-center gap-2 mb-2">
                        <AlertTriangle size={18} /> Central de Controle de Fallback 
                      </h3>
                      <p className="text-sm font-medium text-red-600/80 mb-6 max-w-2xl">Use as ferramentas abaixo apenas em caso de emergência ou quebras de front-end significativas.</p>
                      
                      <div className="flex flex-wrap gap-4">
                        <button className="bg-white border-2 border-red-200 hover:border-red-500 hover:shadow-md text-red-700 font-bold px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2">
                           <LayoutDashboard size={16} /> Ligar Modo de Manutenção (WIP)
                        </button>
                        <button className="bg-white border-2 border-orange-200 hover:border-orange-500 hover:shadow-md text-orange-700 font-bold px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2">
                           Lançar Alerta Breaking News
                        </button>
                      </div>
                   </div>

                   {/* Cards Genéricos */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">Total Publicações</p>
                        <h2 className="text-4xl font-black text-zinc-900 border-l-4 border-blue-500 pl-3 leading-none">{totalNoticias}</h2>
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">Views Simultâneas (Sinal)</p>
                        <h2 className="text-4xl font-black text-zinc-900 border-l-4 border-emerald-500 pl-3 leading-none">{viewersBoost}</h2>
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-4">Estado da Bifurcação</p>
                        <div className="flex items-center gap-3 border-l-4 border-red-500 pl-3 h-9">
                           {isLive ? <span className="text-red-600 font-black flex items-center gap-2 text-2xl uppercase tracking-tighter">● ATIVADA</span> : <span className="text-zinc-400 font-black uppercase text-2xl tracking-tighter">OFFLINE</span>}
                        </div>
                      </div>
                   </div>
                </div>
             )}

             {/* 2. ABA AO VIVO (BIFURCAÇÃO MÁSTER) */}
             {activeTab === 'ao-vivo' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden">
                       <div className="bg-zinc-50 px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <Webhook className="text-red-500" size={20} />
                           <h3 className="font-black text-zinc-800">Orquestrador da Transmissão (Ao Vivo)</h3>
                         </div>
                       </div>
                       
                       <div className="p-6 md:p-8 space-y-8">
                          {/* Toggle Mestre */}
                          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                               <h4 className="font-black text-zinc-900 text-lg">Acionamento Mestre da Bifurcação</h4>
                               <p className="text-zinc-500 text-sm mt-1 max-w-lg">Quando ATIVADO, o portal oculta a biblioteca on-demand e renderiza imediatamente o módulo de Ao Vivo em Tela Cheia e em tempo real para os leitores na Homepage.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0 scale-125">
                              <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="sr-only peer" />
                              <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                            </label>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {/* Coluna YouTube (Prioridade) */}
                             <div className="space-y-4">
                               <div className="flex items-center gap-2 text-zinc-800 font-bold mb-4">
                                  <MonitorPlay size={20} className="text-red-600" /> Player 1 (Prioritário: YouTube)
                               </div>
                               <div>
                                 <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Link da Transmissão YT</label>
                                 <input type="text" value={urlLiveYoutube} onChange={e => setUrlLiveYoutube(e.target.value)} placeholder="https://youtube.com/live/..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-sm font-medium" />
                               </div>
                             </div>

                             {/* Coluna Facebook (Secundária) */}
                             <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-200 pt-6 lg:pt-0 lg:pl-8">
                               <div className="flex items-center gap-2 text-zinc-800 font-bold mb-4">
                                  <Globe size={20} className="text-blue-600" /> Player 2 (Secundário: Facebook)
                               </div>
                               <div>
                                 <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Link da Transmissão FB</label>
                                 <input type="text" value={urlLiveFacebook} onChange={e => setUrlLiveFacebook(e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-sm font-medium" />
                               </div>
                               <div className="flex items-center gap-3 pt-2">
                                  <input type="checkbox" id="showFb" checked={mostrarLiveFacebook} onChange={e => setMostrarLiveFacebook(e.target.checked)} className="w-5 h-5 accent-blue-600 cursor-pointer border-zinc-300 rounded" />
                                  <label htmlFor="showFb" className="text-sm font-bold text-zinc-700 cursor-pointer">Usar Facebook em vez do YouTube nesta sessão.</label>
                               </div>
                               <p className="text-xs text-zinc-400 font-medium bg-zinc-50 p-3 rounded-lg border border-zinc-100 italic">O sistema sempre prioriza nativamente o fluxo do YouTube. Alterne esta chave e salve para que o portal consuma o link e o chat do Facebook.</p>
                             </div>
                          </div>

                          <div className="border-t border-zinc-200 pt-8 pt-6">
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Simulador de Espectadores Sociais (Boost)</label>
                            <input type="number" value={viewersBoost} onChange={(e) => setViewersBoost(Number(e.target.value))} className="w-full max-w-xs bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-2xl font-black text-zinc-800 shadow-sm outline-none" />
                          </div>

                          <div className="flex justify-end pt-4">
                             <button onClick={() => saveConfig({ is_live: isLive, url_live_youtube: urlLiveYoutube, url_live_facebook: urlLiveFacebook, mostrar_live_facebook: mostrarLiveFacebook, fake_viewers_boost: viewersBoost })} disabled={savingConfig} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                               {savingConfig ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Salvar Definições da Live
                             </button>
                          </div>
                       </div>
                    </div>
                </div>
             )}

             {/* 3. ABA POSTAGENS (CRIAÇÃO DE NOTÍCIAS COM LIBERDADE E CORES/BLOCOS) */}
             {activeTab === 'postagens' && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 grid xl:grid-cols-3 gap-8">
                   
                   {/* ENGINE DO EDITOR RICH */}
                   <div className="xl:col-span-2 space-y-6">
                      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 sm:p-8 relative">
                          <h3 className="font-black text-zinc-800 flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                            <FileText size={20} className="text-blue-500" /> Editor de Postagens da Redação
                          </h3>
                          
                          <div className="space-y-8">
                             {/* TITULO */}
                             <div>
                               <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Título Impactante</label>
                                  <div className="flex gap-2">
                                    <select value={tituloConfig.font} onChange={e => setTituloConfig({...tituloConfig, font: e.target.value})} className="text-[10px] bg-zinc-50 border border-zinc-200 rounded p-1 font-bold outline-none text-zinc-700">
                                       <option value="var(--font-inter)">Inter (Sans)</option>
                                       <option value="var(--font-anton)">Anton (Slab)</option>
                                       <option value="var(--font-playfair)">Playfair (Serif)</option>
                                    </select>
                                    <select value={tituloConfig.color} onChange={e => setTituloConfig({...tituloConfig, color: e.target.value})} className="text-[10px] bg-zinc-50 border border-zinc-200 rounded p-1 font-bold outline-none text-zinc-700">
                                       <option value="default">Grafite</option>
                                       <option value="destaque">Azul Portal</option>
                                       <option value="urgente">Vermelho Urgente</option>
                                    </select>
                                  </div>
                               </div>
                               <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Insira o Título Principal..." style={{ fontFamily: tituloConfig.font, color: tituloConfig.color === 'destaque' ? '#2563eb' : (tituloConfig.color === 'urgente' ? '#dc2626' : '#18181b') }} className="w-full bg-white border border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-3.5 text-2xl md:text-3xl font-black shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-zinc-300" />
                             </div>

                             {/* SUBTITULO */}
                             <div>
                               <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Linha Fina / Subtítulo</label>
                               <input type="text" value={subtitulo} onChange={e => setSubtitulo(e.target.value)} placeholder="Resumo auxiliar ou contextualização..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-3 text-sm font-medium shadow-sm outline-none transition-all placeholder:text-zinc-400 text-zinc-700" />
                             </div>

                             {/* CONTEUDO E GALLERY MOCK */}
                             <div>
                               <div className="flex items-center justify-between mb-2">
                                 <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Postagem: Blocos de Construção</label>
                                 <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded shadow-sm">Liberdade Criativa ON</span>
                               </div>
                               <RichTextEditor content={conteudo} onChange={setConteudo} />
                             </div>
                             
                             <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 border-dashed">
                               <p className="text-xs font-bold text-zinc-500 mb-2">Bloco Extra: Adicionar Mídia à Postagem (Avançado - Em Breve API de Dropzone para múltiplas fotos / Galeria)</p>
                               <button className="text-sm font-bold text-zinc-700 hover:text-zinc-900 border border-zinc-300 bg-white px-4 py-2 rounded-lg shadow-sm w-full md:w-auto">
                                 + Carga de Galeria Extra Upload
                               </button>
                             </div>
                          </div>
                      </div>
                   </div>

                   {/* BARRA LATERAL DA PUBLICAÇÃO */}
                   <aside className="space-y-6">
                      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                         <div className="bg-zinc-50 px-5 py-4 border-b border-zinc-200">
                           <h4 className="font-black text-zinc-800 text-sm">Capa e Metadados</h4>
                         </div>
                         <div className="p-5 space-y-6">
                           <div>
                              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Foto Principal (URL Externa provisória)</label>
                              <div className="w-full h-36 bg-zinc-100 rounded-xl border border-zinc-200 mb-3 overflow-hidden">
                                {imagemUrl ? <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><Palette size={24}/></div>}
                              </div>
                              <input type="text" value={imagemUrl} onChange={e => setImagemUrl(e.target.value)} placeholder="https://imagem..." className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 shadow-sm" />
                           </div>
                           
                           <div>
                              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Vídeo do Repórter (Opcional - MP4 Upload)</label>
                              <div className="border border-dashed border-zinc-300 bg-zinc-50 rounded-xl p-3 text-center cursor-pointer hover:bg-zinc-100 transition-colors relative">
                                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {videoFile ? <p className="text-xs font-bold text-blue-600 truncate">{videoFile.name}</p> : <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest py-2">Selecionar Arquivo de Vídeo</p>}
                              </div>
                           </div>
                           
                           <div>
                              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">Categoria Base</label>
                              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full text-sm font-bold px-3 py-2.5 border border-zinc-200 rounded-lg outline-none focus:border-blue-500 shadow-sm cursor-pointer bg-white">
                                 <option value="">(Sem categoria)</option>
                                 <option value="Arapongas">Arapongas Mestre</option>
                                 <option value="Esportes">Esportes</option>
                                 <option value="Polícia">Policial Rápido</option>
                                 <option value="Política">Política Local</option>
                                 <option value="Geral">Notícias Gerais</option>
                              </select>
                           </div>

                           <div>
                              <label className="block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-2">URL de SEO Automática (Slug)</label>
                              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="meu-slug-perfeito" className="w-full text-sm font-mono text-zinc-600 px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:border-zinc-400 bg-zinc-50" />
                              <p className="text-[10px] text-zinc-400 font-medium mt-1">Dica: Use hifens para SEO. O painel cuidará do resto.</p>
                           </div>
                         </div>
                      </div>

                      <button onClick={publishNews} disabled={savingConfig || uploadingVideo} className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                         {uploadingVideo ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                         {uploadingVideo ? "Fazendo Upload..." : "PUBLICAR NA PLATAFORMA"}
                      </button>
                   </aside>
                </div>
             )}

             {/* 4. ABA FACEBOOK/INSTA */}
             {activeTab === 'facebook-insta' && (
                <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden p-6 md:p-8">
                       <h3 className="font-black text-zinc-800 flex items-center gap-2 mb-2 text-xl">
                         <Globe className="text-blue-600" size={24} /> Configuração Social Sync (Facebook/Insta)
                       </h3>
                       <p className="text-sm font-medium text-zinc-500 max-w-xl mb-8">Defina aqui a URL da sua página do Facebook. Essa variável importará automaticamente uma galeria para a sua homepage na nova UI.</p>
                       
                       <div className="space-y-4 mb-8">
                          <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Endereço da Página Mãe (Facebook Page URL)</label>
                          <input type="text" value={facebookPageUrl} onChange={e => setFacebookPageUrl(e.target.value)} placeholder="https://www.facebook.com/SuaPagina..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-xl px-5 py-4 text-base outline-none transition-all shadow-sm font-medium" />
                       </div>

                       <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm font-medium mb-8">
                          <div className="shrink-0 pt-0.5"><Rss size={16}/></div>
                          <p>O robô do frontend lerá essa URL e renderizará embedded de cards na seção "Social/Facebook" com o SDK mais atualizado.</p>
                       </div>

                       <button onClick={() => saveConfig({ facebook_page_url: facebookPageUrl })} disabled={savingConfig} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2">
                         <Save size={18} /> Consolidar Conexão Social
                       </button>
                    </div>
                </div>
             )}

             {/* 5. ABA BIBLIOTECA (YOUTUBE INTEGRATION) */}
             {activeTab === 'biblioteca' && (
                <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden p-6 md:p-8">
                       <h3 className="font-black text-zinc-800 flex items-center gap-2 mb-2 text-xl">
                         <MonitorPlay className="text-red-600" size={24} /> Orquestrador de Acervo e YouTube
                       </h3>
                       <p className="text-sm font-medium text-zinc-500 max-w-xl mb-8">Gerencie a aba pública de "Biblioteca" no Portal. Configure o link principal para importação em paralelo aos vídeos locais adicionados a mão.</p>
                       
                       <div className="space-y-4 mb-8 border-b border-zinc-100 pb-8">
                          <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Canal / Playlist Nativa do YouTube</label>
                          <input type="text" value={youtubeChannelUrl} onChange={e => setYoutubeChannelUrl(e.target.value)} placeholder="https://youtube.com/c/SeuCanal" className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500 rounded-xl px-5 py-4 text-base outline-none transition-all shadow-sm font-medium" />
                          <button onClick={() => saveConfig({ youtube_channel_url: youtubeChannelUrl })} disabled={savingConfig} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-all flex items-center mt-4 gap-2">
                             <Save size={18} /> Salvar Vínculo do YouTube
                          </button>
                       </div>

                       <div>
                          <h4 className="font-bold text-zinc-800 mb-2 tracking-tight flex items-center gap-2"><Video size={16} className="text-zinc-500" /> Acervo Exclusivo (Upload Local VOD)</h4>
                          <p className="text-xs text-zinc-500 font-medium mb-4">Para fazer envios de arquivos manuais ou de cobertura jornalistica regional, use o painel VOD isolado no ambiente antigo temporário ou pela aba Nova Postagem.</p>
                          <Link href="/admin/biblioteca" className="text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-5 py-2.5 rounded-lg border border-zinc-200 inline-block transition-colors">
                             Adicionar Video Local ao VOD Sub-acervo ↗
                          </Link>
                       </div>
                    </div>
                </div>
             )}

             {/* 6. ABA COPILOTO IA */}
             {activeTab === 'copiloto-ia' && (
                <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-[#09090b] text-white border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden relative p-8">
                       <div className="absolute top-10 right-10 w-48 h-48 bg-purple-600 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                       <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative z-10">
                          <Sparkles size={24} className="text-purple-400" />
                       </div>
                       
                       <h3 className="font-black text-2xl tracking-tight mb-3 relative z-10">Copiloto IA: Integração OpenRouter</h3>
                       <p className="text-sm font-medium text-zinc-400 mb-8 max-w-xl relative z-10">
                         Nossa IA auxiliar é alimentada via OpenRouter no backend para te ajudar dentro do Editor "Postagens". Ela reescreve títulos para aumentar views e sumariza textos usando modelos sem censura como a Meta Llama ou Claude. Sem custo local.
                       </p>
                       
                       <div className="space-y-4 mb-2 relative z-10">
                          <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Master API Key (Injeção de Secret OpenRouter)</label>
                          <div className="relative">
                            <input type="password" value={openrouterApiKey} onChange={e => setOpenrouterApiKey(e.target.value)} placeholder="sk-or-v1-..." className="w-full bg-zinc-900 border border-zinc-700 focus:border-purple-500 rounded-xl px-5 py-4 text-white text-base outline-none transition-all shadow-sm font-mono placeholder:text-zinc-700" />
                          </div>
                          <p className="text-[10px] text-zinc-500 italic mt-1 pb-4">Nós injetamos isso de forma reversa e salva em state via backend com segurança. Obtenha isso no console do openrouter.ai.</p>
                       </div>

                       <button onClick={() => saveConfig({ openrouter_api_key: openrouterApiKey })} disabled={savingConfig} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 relative z-10 w-full sm:w-auto justify-center">
                         <Save size={18} /> Criptografar e Salvar Nova IA Key
                       </button>
                    </div>
                </div>
             )}

             {/* 7. ABA LISTA / AUDITORIA */}
             {activeTab === 'lista-noticias' && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl overflow-hidden p-6 md:p-8">
                       <h3 className="font-black text-zinc-800 flex items-center gap-2 mb-6">
                         <List className="text-emerald-500" size={20} /> Base e Auditoria de Matérias
                       </h3>
                       
                       <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-sm">
                             <thead>
                               <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                                 <th className="p-4">Título Interno</th>
                                 <th className="p-4 w-32">Categoria</th>
                                 <th className="p-4 w-32">Criado</th>
                                 <th className="p-4 w-24 text-right">Ações</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-zinc-100 font-medium">
                               {loadingNoticias ? (
                                  <tr><td colSpan={4} className="p-8 text-center text-zinc-400">Puxando registros da auditoria...</td></tr>
                               ) : listaNoticias.length === 0 ? (
                                  <tr><td colSpan={4} className="p-8 text-center text-zinc-400">O armazém parece estar vazio.</td></tr>
                               ) : (
                                  listaNoticias.map(noticia => (
                                     <tr key={noticia.id} className="hover:bg-zinc-50 transition-colors group">
                                        <td className="p-4">
                                           <p className="text-zinc-800 font-bold truncate max-w-sm">{noticia.titulo}</p>
                                           <p className="text-zinc-400 text-[10px] font-mono mt-0.5">/{noticia.slug}</p>
                                        </td>
                                        <td className="p-4"><span className="bg-zinc-200 text-zinc-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">{noticia.categoria || 'Sem Base'}</span></td>
                                        <td className="p-4 text-zinc-500 text-xs">{new Date(noticia.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4 text-right flex items-center justify-end gap-1">
                                           <a href={`/noticia/${noticia.slug}`} target="_blank" className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16}/></a>
                                           <button onClick={() => deletarNoticia(noticia.id, noticia.titulo)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </td>
                                     </tr>
                                  ))
                               )}
                             </tbody>
                          </table>
                       </div>
                    </div>
                </div>
             )}

           </div>
        </div>
      </main>
    </div>
  );
}
