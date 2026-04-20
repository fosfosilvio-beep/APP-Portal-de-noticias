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
import NewsEditorForm from "../../components/admin/NewsEditorForm";
import { 
  Plus, Pencil, Layout, Monitor, Trash, 
  CheckCircle2, XCircle, Info, Smartphone 
} from "lucide-react";

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
  const [tituloLive, setTituloLive] = useState("");
  const [descricaoLive, setDescricaoLive] = useState("");
  const [organicViewsEnabled, setOrganicViewsEnabled] = useState(false);
  
  // Estados de Aparência & Ads
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [adSlot1, setAdSlot1] = useState<any>({ image_url: "", link: "", visible: true });
  const [adSlot2, setAdSlot2] = useState<any>({ image_url: "", link: "", visible: true });
  
  const [viewersBoost, setViewersBoost] = useState(0);
  const [savingConfig, setSavingConfig] = useState(false);
  const [totalNoticias, setTotalNoticias] = useState(0);

  // Estados de Branding & UI (ui_settings)
  const [uiSettings, setUiSettings] = useState<any>({
    logo_mode: "image",
    logo_url: "",
    brand_name: "NOSSA WEB TV",
    font_family: "Inter, sans-serif",
    primary_color: "#00AEE0",
    breaking_news_alert: { text: "", color: "#e11d48", speed: "normal" },
    widgets_visibility: { weather: true, giro24h: true, plantao: true }
  });

  // Estados de Nova Postagem (Agora gerenciados pelo componente NewsEditorForm)
  // Mantemos apenas estados globais se necessário

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
        try { setTituloLive(data.titulo_live || ""); } catch(e){}
        try { setDescricaoLive(data.descricao_live || ""); } catch(e){}
        try { setOrganicViewsEnabled(data.organic_views_enabled || false); } catch(e){}
        try { setHeroBanners(data.hero_banner_items || []); } catch(e){}
        try { setAdSlot1(data.ad_slot_1 || { image_url: "", link: "", visible: true }); } catch(e){}
        try { setAdSlot2(data.ad_slot_2 || { image_url: "", link: "", visible: true }); } catch(e){}
        try { if (data.ui_settings) setUiSettings({ ...uiSettings, ...data.ui_settings }); } catch(e){}
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

  // Função publishNews removida pois agora é gerenciada pelo componente NewsEditorForm

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
    { id: "postagens", label: "Editor de Postagens", icon: <Plus size={18} /> },
    { id: "aparencia", label: "Publicidade & Hero", icon: <Palette size={18} /> },
    { id: "branding", label: "Branding & UI", icon: <TypeIcon size={18} /> },
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
                           <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                             <div>
                                <h4 className="font-black text-zinc-900 text-lg">Acionamento Mestre da Bifurcação</h4>
                                <p className="text-zinc-500 text-sm mt-1 max-w-lg">Quando ATIVADO, o portal oculta a biblioteca on-demand e renderiza imediatamente o módulo de Ao Vivo.</p>
                             </div>
                             <div className="flex items-center gap-4">
                               {isLive && (
                                 <button 
                                   onClick={() => {
                                     if(window.confirm("⚠️ INTERROMPER TRANSMISSÃO IMEDIATAMENTE?")) {
                                       setIsLive(false);
                                       saveConfig({ is_live: false });
                                     }
                                   }}
                                   className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse"
                                 >
                                    <XCircle size={14} /> KILL SWITCH
                                 </button>
                               )}
                               <label className="relative inline-flex items-center cursor-pointer shrink-0 scale-125">
                                 <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="sr-only peer" />
                                 <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 shadow-inner"></div>
                               </label>
                             </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Título do Overlay (Live Name)</label>
                                <input type="text" value={tituloLive} onChange={e => setTituloLive(e.target.value)} placeholder="Ex: AO VIVO: Cobertura Especial..." className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                              </div>
                              <div>
                                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-1.5">Descrição Curta (Overlay)</label>
                                <input type="text" value={descricaoLive} onChange={e => setDescricaoLive(e.target.value)} placeholder="Ex: Acompanhe as últimas notícias..." className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                              {/* Coluna YouTube (Prioridade) */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-zinc-800 font-bold mb-4">
                                   <MonitorPlay size={20} className="text-red-600" /> Fonte YouTube
                                </div>
                                <input type="text" value={urlLiveYoutube} onChange={e => setUrlLiveYoutube(e.target.value)} placeholder="https://youtube.com/live/..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-sm font-medium" />
                              </div>

                              {/* Coluna Facebook (Secundária) */}
                              <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-zinc-200 pt-6 lg:pt-0 lg:pl-8">
                                <div className="flex items-center gap-2 text-zinc-800 font-bold mb-4">
                                   <Globe size={20} className="text-blue-600" /> Fonte Facebook
                                </div>
                                <input type="text" value={urlLiveFacebook} onChange={e => setUrlLiveFacebook(e.target.value)} placeholder="https://facebook.com/..." className="w-full bg-zinc-50 border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-all shadow-sm font-medium" />
                                <div className="flex items-center gap-3 pt-2">
                                   <input type="checkbox" id="showFb" checked={mostrarLiveFacebook} onChange={e => setMostrarLiveFacebook(e.target.checked)} className="w-5 h-5 accent-blue-600 cursor-pointer border-zinc-300 rounded" />
                                   <label htmlFor="showFb" className="text-sm font-bold text-zinc-700 cursor-pointer italic">Priorizar Facebook nesta sessão.</label>
                                </div>
                              </div>
                           </div>

                           <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row gap-8">
                             <div className="flex-1">
                               <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Simulador de Espectadores Sociais (Boost)</label>
                               <input type="number" value={viewersBoost} onChange={(e) => setViewersBoost(Number(e.target.value))} className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-2xl font-black text-white shadow-sm outline-none" />
                             </div>
                             <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 flex-1 flex items-center justify-between">
                               <div>
                                  <h4 className="font-bold text-zinc-800 text-sm">Simulação Orgânica</h4>
                                  <p className="text-[10px] text-zinc-500">Oscilação automática de ±5% no contador.</p>
                               </div>
                               <label className="relative inline-flex items-center cursor-pointer">
                                 <input type="checkbox" checked={organicViewsEnabled} onChange={(e) => setOrganicViewsEnabled(e.target.checked)} className="sr-only peer" />
                                 <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                               </label>
                             </div>
                           </div>

                           <div className="flex justify-end pt-4">
                              <button onClick={() => saveConfig({ 
                                is_live: isLive, 
                                url_live_youtube: urlLiveYoutube, 
                                url_live_facebook: urlLiveFacebook, 
                                mostrar_live_facebook: mostrarLiveFacebook, 
                                fake_viewers_boost: viewersBoost,
                                titulo_live: tituloLive,
                                descricao_live: descricaoLive,
                                organic_views_enabled: organicViewsEnabled
                              })} disabled={savingConfig} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50">
                                {savingConfig ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Salvar Configuração de Live
                              </button>
                           </div>
                       </div>
                    </div>
                </div>
             )}

             {/* 3. ABA POSTAGENS (CRIAÇÃO DE NOTÍCIAS COM LIBERDADE E CORES/BLOCOS) */}
             {activeTab === 'postagens' && (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <NewsEditorForm onSuccess={() => {
                       setViewersBoost(prev => prev); // dummy trigger
                       fetchCurrentConfig();
                    }} />
                </div>
             )}

             {/* 3.1 ABA APARÊNCIA (HERO & ADS) */}
             {activeTab === 'aparencia' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 md:p-10">
                       <h3 className="font-black text-2xl text-zinc-900 mb-2 flex items-center gap-3">
                          <Layout className="text-blue-600" /> Gestor de Identidade Visual
                       </h3>
                       <p className="text-sm font-medium text-zinc-500 mb-10">Configure o carrossel da Home e os slots de publicidade em tempo real.</p>

                       <section className="space-y-6">
                          <div className="flex items-center justify-between">
                             <h4 className="font-black text-zinc-800 text-sm uppercase tracking-widest">HeroBanner Home (Até 5 itens)</h4>
                             <button 
                               onClick={() => setHeroBanners([...heroBanners, { image: "", duration: 5000, scale: "object-cover", animation: "fade" }])}
                               className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                             >
                               + ADICIONAR BANNER
                             </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {heroBanners.map((item: any, idx: number) => (
                                <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 relative group">
                                   <button 
                                     onClick={() => setHeroBanners(heroBanners.filter((_: any, i: number) => i !== idx))}
                                     className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                   <div className="flex gap-4">
                                      <div className="w-20 h-20 bg-zinc-200 rounded-lg overflow-hidden shrink-0">
                                         {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-400"><Monitor size={20}/></div>}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                         <input type="text" value={item.image} onChange={e => {
                                            const newBanners = [...heroBanners];
                                            newBanners[idx].image = e.target.value;
                                            setHeroBanners(newBanners);
                                         }} placeholder="URL da Imagem..." className="w-full text-[10px] p-2 border border-zinc-200 rounded bg-white outline-none" />
                                         <div className="flex gap-2">
                                            <select value={item.scale} onChange={e => {
                                               const newBanners = [...heroBanners];
                                               newBanners[idx].scale = e.target.value;
                                               setHeroBanners(newBanners);
                                            }} className="text-[9px] font-bold p-1 border border-zinc-200 rounded bg-white outline-none">
                                               <option value="object-cover">Cover</option>
                                               <option value="object-contain">Contain</option>
                                            </select>
                                            <input type="number" value={item.duration} onChange={e => {
                                               const newBanners = [...heroBanners];
                                               newBanners[idx].duration = Number(e.target.value);
                                               setHeroBanners(newBanners);
                                            }} className="w-16 text-[9px] font-bold p-1 border border-zinc-200 rounded bg-white outline-none" />
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </section>

                       <section className="mt-12 space-y-6 pt-10 border-t border-zinc-100">
                          <h4 className="font-black text-zinc-800 text-sm uppercase tracking-widest">Publicidade (Slots Home)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {[adSlot1, adSlot2].map((slot, idx) => (
                                <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4">
                                   <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-black text-zinc-400">SLOT 0{idx+1}</span>
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={slot.visible} onChange={e => {
                                           const setter = idx === 0 ? setAdSlot1 : setAdSlot2;
                                           setter({ ...slot, visible: e.target.checked });
                                        }} className="sr-only peer" />
                                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                      </label>
                                   </div>
                                   <input type="text" value={slot.image_url} onChange={e => {
                                      const setter = idx === 0 ? setAdSlot1 : setAdSlot2;
                                      setter({ ...slot, image_url: e.target.value });
                                   }} placeholder="URL Banner Publicitário..." className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-white" />
                                   <input type="text" value={slot.link} onChange={e => {
                                      const setter = idx === 0 ? setAdSlot1 : setAdSlot2;
                                      setter({ ...slot, link: e.target.value });
                                   }} placeholder="Link de Destino (https://...)" className="w-full text-xs p-3 border border-zinc-200 rounded-xl bg-white" />
                                </div>
                             ))}
                          </div>
                       </section>

                       <div className="mt-10 flex justify-end">
                          <button 
                            onClick={() => saveConfig({ hero_banner_items: heroBanners, ad_slot_1: adSlot1, ad_slot_2: adSlot2 })} 
                            disabled={savingConfig} 
                            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2"
                          >
                             {savingConfig ? <Loader2 className="animate-spin" size={18} /> : <Palette size={18} />} Publicar Identidade Visual
                          </button>
                       </div>
                    </div>
                </div>
             )}

             {/* 3.2 ABA BRANDING & UI */}
             {activeTab === 'branding' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 md:p-10">
                       <h3 className="font-black text-2xl text-zinc-900 mb-2 flex items-center gap-3">
                          <TypeIcon className="text-purple-600" /> Interface & Design System
                       </h3>
                       <p className="text-sm font-medium text-zinc-500 mb-10">Configure as variáveis visuais do portal. Isso afeta o Header, cores principais e a barra de alertas (Marquee).</p>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                           <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-widest border-b pb-2">Logomarca & Branding</h4>
                           
                           <label className="block text-xs font-bold text-zinc-500 mt-4">Modo de Exibição do Logo</label>
                           <select 
                             value={uiSettings.logo_mode} 
                             onChange={e => setUiSettings({...uiSettings, logo_mode: e.target.value})} 
                             className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold text-zinc-700 outline-none"
                           >
                             <option value="image">Imagem (Arquivo PNG/SVG)</option>
                             <option value="text">Texto Dinâmico (Tipografia Customizada)</option>
                           </select>

                           {uiSettings.logo_mode === "image" ? (
                             <>
                                <label className="block text-xs font-bold text-zinc-500 mt-4">URL da Logomarca (.png, .svg)</label>
                                <input type="text" value={uiSettings.logo_url || ""} onChange={e => setUiSettings({...uiSettings, logo_url: e.target.value})} placeholder="Ex: https://..." className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm" />
                             </>
                           ) : (
                             <>
                                <label className="block text-xs font-bold text-zinc-500 mt-4">Nome da Marca (Texto Front-end)</label>
                                <input type="text" value={uiSettings.brand_name || ""} onChange={e => setUiSettings({...uiSettings, brand_name: e.target.value})} placeholder="Ex: NOSSA WEB TV" className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm uppercase" />
                             </>
                           )}
                           
                           <label className="block text-xs font-bold text-zinc-500 mt-4">Cor Principal do Portal (Hexadecimal)</label>
                           <div className="flex gap-3">
                             <input type="color" value={uiSettings.primary_color || "#00AEE0"} onChange={e => setUiSettings({...uiSettings, primary_color: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                             <input type="text" value={uiSettings.primary_color || "#00AEE0"} onChange={e => setUiSettings({...uiSettings, primary_color: e.target.value})} className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm uppercase font-mono" />
                           </div>
                         </div>
                         
                         <div className="space-y-4">
                           <h4 className="font-bold text-zinc-800 text-sm uppercase tracking-widest border-b pb-2">Top Marquee (Alerta Urgente)</h4>
                           <label className="block text-xs font-bold text-zinc-500 mt-4">Mensagem de Segurança (Breaking News)</label>
                           <input type="text" value={uiSettings.breaking_news_alert?.text || ""} onChange={e => setUiSettings({...uiSettings, breaking_news_alert: {...uiSettings.breaking_news_alert, text: e.target.value}})} placeholder="Deixe em branco para o Radar Regional..." className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm" />
                           
                           <label className="block text-xs font-bold text-zinc-500 mt-4">Cor de Fundo do Header Alerta</label>
                           <div className="flex gap-3">
                             <input type="color" value={uiSettings.breaking_news_alert?.color || "#e11d48"} onChange={e => setUiSettings({...uiSettings, breaking_news_alert: {...uiSettings.breaking_news_alert, color: e.target.value}})} className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0" />
                             <input type="text" value={uiSettings.breaking_news_alert?.color || "#e11d48"} onChange={e => setUiSettings({...uiSettings, breaking_news_alert: {...uiSettings.breaking_news_alert, color: e.target.value}})} className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm uppercase font-mono" />
                           </div>
                         </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 p-6 bg-zinc-50 rounded-2xl border border-zinc-200">
                          <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">App: Clima Meteorológico</span>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={uiSettings.widgets_visibility?.weather !== false} onChange={e => setUiSettings({...uiSettings, widgets_visibility: {...uiSettings.widgets_visibility, weather: e.target.checked}})} className="sr-only peer" />
                                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                <span className="ml-3 text-xs font-bold text-zinc-700">Renderizar</span>
                             </label>
                          </div>
                          <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">App: Giro 24h</span>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={uiSettings.widgets_visibility?.giro24h !== false} onChange={e => setUiSettings({...uiSettings, widgets_visibility: {...uiSettings.widgets_visibility, giro24h: e.target.checked}})} className="sr-only peer" />
                                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                <span className="ml-3 text-xs font-bold text-zinc-700">Renderizar</span>
                             </label>
                          </div>
                          <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">App: Plantão Policial</span>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={uiSettings.widgets_visibility?.plantao !== false} onChange={e => setUiSettings({...uiSettings, widgets_visibility: {...uiSettings.widgets_visibility, plantao: e.target.checked}})} className="sr-only peer" />
                                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                                <span className="ml-3 text-xs font-bold text-zinc-700">Renderizar</span>
                             </label>
                          </div>
                       </div>

                       <div className="mt-10 flex justify-end">
                          <button 
                            onClick={() => saveConfig({ ui_settings: uiSettings })} 
                            disabled={savingConfig} 
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-2"
                          >
                             {savingConfig ? <Loader2 className="animate-spin" size={18} /> : <TypeIcon size={18} />} Publicar Layout no App
                          </button>
                       </div>
                    </div>
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
                                        <td className="p-4 text-right flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <a href={`/noticia/${noticia.slug}`} target="_blank" className="p-2 text-zinc-400 hover:text-zinc-900 bg-white border border-zinc-100 rounded-lg shadow-sm transition-all"><Eye size={16}/></a>
                                           <Link href={`/admin/editar/${noticia.id}`} className="p-2 text-zinc-400 hover:text-blue-600 bg-white border border-zinc-100 rounded-lg shadow-sm transition-all"><Pencil size={16}/></Link>
                                           <button onClick={() => deletarNoticia(noticia.id, noticia.titulo)} className="p-2 text-zinc-400 hover:text-red-600 bg-white border border-zinc-100 rounded-lg shadow-sm transition-all"><Trash2 size={16}/></button>
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
