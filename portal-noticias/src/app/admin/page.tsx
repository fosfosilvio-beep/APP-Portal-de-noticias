"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { 
  Settings, Rss, Users, Sparkles, Send, Loader2, Save, 
  LayoutDashboard, FileText, ExternalLink, LogOut, User, 
  Eye, X, List, Trash2, ChevronUp, ChevronDown, Video, 
  Type as TypeIcon, Palette, Bold as BoldIcon 
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

  // Estados do Controle de Live
  const [isLive, setIsLive] = useState(false);
  const [urlLive, setUrlLive] = useState("");
  const [viewersBoost, setViewersBoost] = useState(0);
  const [savingConfig, setSavingConfig] = useState(false);
  const [totalNoticias, setTotalNoticias] = useState(0);
  const [bannerHomeUrl, setBannerHomeUrl] = useState("");
  const [bannerHomeFile, setBannerHomeFile] = useState<File | null>(null);
  const [linkAnuncioHome, setLinkAnuncioHome] = useState("");
  const [bannerVerticalUrl, setBannerVerticalUrl] = useState("");
  const [bannerVerticalFile, setBannerVerticalFile] = useState<File | null>(null);
  const [linkVerticalNoticia, setLinkVerticalNoticia] = useState("");

  // Estados Gerador IA
  const [promptIA, setPromptIA] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [slug, setSlug] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [mostrarNoPlayer, setMostrarNoPlayer] = useState(false);
  const [mostrarNaHomeRecentes, setMostrarNaHomeRecentes] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Estados de Estilização (Novo!)
  const [tituloConfig, setTituloConfig] = useState<StyleConfig>(DEFAULT_CONFIG);
  const [subtituloConfig, setSubtituloConfig] = useState<StyleConfig>(SUBTITLE_DEFAULT);

  // Estados da Lista de Notícias
  const [listaNoticias, setListaNoticias] = useState<any[]>([]);
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const debounceTimerInfo = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeTab === 'lista-noticias') {
      fetchNoticiasList();
    }
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
      if (!error && data) {
        setListaNoticias(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNoticias(false);
    }
  };

  const deletarNoticia = async (id: string, titulo: string) => {
    if(!window.confirm(`⚠️ ATENÇÃO: Deseja apagar permanentemente a notícia:\n\n"${titulo}"?`)) return;
    try {
      if (!supabase) return;
      const { error } = await supabase.from("noticias").delete().eq("id", id);
      if(error) throw error;
      setListaNoticias((prev) => prev.filter((n) => n.id !== id));
      setTotalNoticias((prev) => prev - 1);
    } catch (err: any) {
      alert("Erro ao apagar: " + err.message);
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

  const fetchCurrentConfig = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("configuracao_portal")
        .select("*")
        .limit(1)
        .single();
        
      if (data) {
        setIsLive(data.is_live);
        setUrlLive(data.url_live_facebook || "");
        setViewersBoost(data.fake_viewers_boost || 0);
        setBannerHomeUrl(data.banner_anuncio_home || "");
        setLinkAnuncioHome(data.link_anuncio_home || "");
        setBannerVerticalUrl(data.banner_vertical_noticia || "");
        setLinkVerticalNoticia(data.link_vertical_noticia || "");
      }
      
      const { count } = await supabase
        .from("noticias")
        .select('*', { count: 'exact', head: true });
        
      if (count !== null) setTotalNoticias(count);
      
    } catch (err) {
      console.error("Erro ao buscar config", err);
    }
  };

  const publishNews = async () => {
    if (!titulo.trim() || !conteudo.trim() || !slug.trim()) {
      alert("Título, Conteúdo e Slug são obrigatórios.");
      return;
    }

    setSavingConfig(true);
    let finalVideoUrl = "";

    try {
      if (!supabase) return;

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
        titulo,
        subtitulo,
        conteudo,
        categoria,
        slug: cleanSlug,
        imagem_capa: imagemUrl,
        video_url: finalVideoUrl,
        mostrar_no_player: mostrarNoPlayer,
        mostrar_na_home_recentes: mostrarNaHomeRecentes,
        titulo_config: tituloConfig,     // NOVO
        subtitulo_config: subtituloConfig, // NOVO
        ordem_prioridade: 0
      }]);

      if (error) throw error;
      alert("🚀 Notícia publicada com sucesso!");
      
      setTitulo("");
      setSubtitulo("");
      setConteudo("");
      setCategoria("");
      setSlug("");
      setImagemUrl("");
      setVideoFile(null);
      setTituloConfig(DEFAULT_CONFIG);
      setSubtituloConfig(SUBTITLE_DEFAULT);
      setTotalNoticias(prev => prev + 1);

    } catch (err: any) {
      alert("Erro ao publicar: " + err.message);
    } finally {
      setSavingConfig(false);
      setUploadingVideo(false);
    }
  };

  const handleIA = async () => {
    if (!promptIA.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptIA })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "IA falhou.");
      
      setTitulo(data.titulo || "");
      setSubtitulo(data.subtitulo || "");
      setConteudo(data.conteudo || "");
      setCategoria(data.categoria || "Geral");
      
      // Auto Generate Slug (Prioriza o sugerido pela IA)
      if (data.slug) {
        setSlug(data.slug);
      } else if (data.titulo) {
        setSlug(
          data.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        );
      }
    } catch (err: any) {
      alert("⚠️ Robô Jornalista: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Início", icon: <LayoutDashboard size={20} /> },
    { id: "transmissao", label: "Gerenciar Live", icon: <Rss size={20} /> },
    { id: "nova-noticia", label: "Postar Notícia", icon: <FileText size={20} /> },
    { id: "lista-noticias", label: "Lista de Notícias", icon: <List size={20} /> },
    { id: "config", label: "Configurações do Portal", icon: <Settings size={20} /> }
  ];

  const StyleControls = ({ config, setConfig, isImpact = false }: { config: StyleConfig, setConfig: any, isImpact?: boolean }) => {
    const fonts = [
      { name: "Inter", value: "var(--font-inter)" },
      { name: "Montserrat", value: "var(--font-montserrat)" },
      { name: "Poppins", value: "var(--font-poppins)" },
      { name: "Merriweather", value: "var(--font-merriweather)" },
      { name: "Playfair Display", value: "var(--font-playfair)" },
      { name: "Lora", value: "var(--font-lora)" },
      { name: "Anton", value: "var(--font-anton)" },
      { name: "Oswald", value: "var(--font-oswald)" },
    ];

    const colors = [
      { name: "Padrão", value: "default" },
      { name: "Azul Portal", value: "destaque" },
      { name: "Urgente", value: "urgente" },
    ];

    return (
      <div className="flex flex-wrap items-center gap-2 mb-3 bg-slate-100/50 p-2 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1">
          <TypeIcon size={14} className="text-slate-400" />
          <select 
            value={config.font} 
            onChange={(e) => setConfig({...config, font: e.target.value})}
            className="text-[10px] font-bold bg-white border border-slate-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <BoldIcon size={14} className="text-slate-400" />
          <select 
            value={config.weight} 
            onChange={(e) => setConfig({...config, weight: e.target.value})}
            disabled={config.font === "var(--font-anton)"}
            className="text-[10px] font-bold bg-white border border-slate-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="400">Normal</option>
            <option value="700">Negrito</option>
            <option value="900">Black</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <Palette size={14} className="text-slate-400" />
          <div className="flex gap-1">
            {colors.map(c => (
              <button
                key={c.value}
                onClick={() => setConfig({...config, color: c.value})}
                className={`w-4 h-4 rounded-full border transition-all ${
                  config.color === c.value ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'border-slate-300'
                }`}
                style={{ 
                  backgroundColor: c.value === 'default' ? '#0f172a' : (c.value === 'destaque' ? '#2563eb' : '#dc2626') 
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col shadow-xl flex-shrink-0 z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Settings size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg text-white">Admin Pro</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 mb-4">Painel</div>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}>
              {item.icon} {item.label}
            </button>
          ))}
          <Link href="/admin/biblioteca" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-neutral-400 hover:bg-neutral-900 hover:text-white">
            <Video size={20} /> Gerenciar Biblioteca
          </Link>
        </nav>
        <div className="p-4 border-t border-neutral-900">
            <a href="/" target="_blank" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all duration-200 hover:shadow-md">
              <ExternalLink size={20} /> Ver Site ao Vivo
            </a>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10 transition-all duration-200 text-slate-800">
           <h2 className="font-bold text-slate-800 text-xl tracking-tight hidden sm:block">
             {menuItems.find(i => i.id === activeTab)?.label}
           </h2>
           <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-4 shadow-sm">
                 <User size={16} className="text-slate-500" />
                 <span className="text-sm font-bold text-slate-700">Admin Master</span>
              </div>
              <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 py-1.5 px-4 rounded-full transition-all duration-200 hover:shadow-md">
                 <LogOut size={16} /> Sair
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6"> 
            
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                  <div className="h-10 flex items-center justify-center mb-2">
                     <span className="relative flex h-5 w-5">
                       {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                       <span className={`relative inline-flex rounded-full h-5 w-5 ${isLive ? 'bg-red-500' : 'bg-slate-300'}`}></span>
                     </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{isLive ? "Online (Rec)" : "Offline"}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Status da Transmissão</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">{totalNoticias}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Notícias Publicadas</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                   <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                    <Users size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">{viewersBoost}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Audiência Atual</p>
                </div>
              </div>
            )}

            {activeTab === 'nova-noticia' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-sm border border-transparent overflow-hidden text-white transition-all duration-200">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full space-y-4">
                      <h2 className="font-black text-2xl flex items-center gap-2 text-white">
                        <Sparkles className="text-blue-300" size={24} /> Gerador Mágico
                      </h2>
                      <p className="text-blue-100 text-sm italic">O Robô Jornalista redige tudo nos moldes profissionais com base na sua ideia.</p>
                      <div className="flex bg-white/10 rounded-xl border border-white/20 p-1 backdrop-blur-sm shadow-sm transition-all duration-200">
                        <input type="text" placeholder="Exemplo: Fale sobre a feira de roupas em Arapongas amanhã..." value={promptIA} onChange={(e) => setPromptIA(e.target.value)} className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-white placeholder-blue-100" />
                      </div>
                    </div>
                    <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                      <button onClick={handleIA} disabled={isGenerating || !promptIA} className="w-full md:w-auto bg-white hover:bg-slate-50 disabled:opacity-75 text-blue-700 font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 shadow-sm uppercase tracking-tighter">
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        {isGenerating ? "Redigindo..." : "Escrever Notícia"}
                      </button>
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 transition-all duration-200">
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Título da Matéria</label>
                          <StyleControls config={tituloConfig} setConfig={setTituloConfig} />
                        </div>
                        <input 
                          type="text" 
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Digite o título atrativo"
                          style={{ 
                            fontFamily: tituloConfig.font, 
                            fontWeight: tituloConfig.weight,
                            color: tituloConfig.color === 'destaque' ? '#2563eb' : (tituloConfig.color === 'urgente' ? '#dc2626' : '#0f172a')
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3.5 text-2xl transition-all duration-200 placeholder-slate-300 shadow-sm focus:shadow-md outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Subtítulo (Opcional)</label>
                          <StyleControls config={subtituloConfig} setConfig={setSubtituloConfig} />
                        </div>
                        <input 
                          type="text" 
                          value={subtitulo}
                          onChange={(e) => setSubtitulo(e.target.value)}
                          placeholder="Linha fina que complementa o título"
                          style={{ 
                            fontFamily: subtituloConfig.font, 
                            fontWeight: subtituloConfig.weight,
                            color: subtituloConfig.color === 'destaque' ? '#2563eb' : (subtituloConfig.color === 'urgente' ? '#dc2626' : '#475569')
                          }}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm transition-all duration-200 shadow-sm focus:shadow-md outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Conteúdo da Notícia</label>
                        <RichTextEditor content={conteudo} onChange={(newContent) => setConteudo(newContent)} />
                        <p className="text-xs text-slate-400 mt-2 text-right">O conteúdo é salvo como HTML profissional, respeitando fontes e cores inline.</p>
                      </div>

                    </div>
                  </div>

                  <aside className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5 transition-all duration-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Imagem de Capa (URL)</label>
                        {imagemUrl && (
                          <div className="w-full h-32 mb-3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 transition-all duration-200">
                             <img src={imagemUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input type="text" value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} placeholder="https://site.com/imagem.jpg" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-slate-700 transition-all duration-200 shadow-sm outline-none" />
                      </div>
                      <div className="border-t border-slate-100 pt-5">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Categoria</label>
                        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold outline-none">
                          <option value="">Selecione...</option>
                          <option value="Arapongas">Arapongas</option>
                          <option value="Esportes">Esportes</option>
                          <option value="Polícia">Polícia</option>
                          <option value="Política">Política</option>
                          <option value="Geral">Geral</option>
                        </select>
                      </div>
                      <div className="border-t border-slate-100 pt-5">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Upload de Vídeo</label>
                        <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center ${videoFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          {videoFile ? <p className="text-sm font-bold text-blue-700 truncate max-w-[200px]">{videoFile.name}</p> : <p className="text-[10px] text-slate-500 font-medium italic">Clique ou arraste vídeo</p>}
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-5">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">URL Limpa (Slug)</label>
                        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ex: acidente-na-avenida" className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-blue-600 font-mono outline-none" />
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
                      <button onClick={publishNews} disabled={savingConfig || uploadingVideo} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 uppercase tracking-tighter">
                        {uploadingVideo ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        {uploadingVideo ? "Subindo Vídeo..." : (savingConfig ? "Publicando..." : "Publicar Agora")}
                      </button>
                    </div>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
