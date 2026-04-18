"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { Settings, Rss, Users, Sparkles, Send, Loader2, Save, LayoutDashboard, FileText, ExternalLink, LogOut, User, Eye, X, List, Trash2, ChevronUp, ChevronDown, Video } from "lucide-react";
import Link from "next/link";

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

  // Estados da Lista de Notícias
  const [listaNoticias, setListaNoticias] = useState<any[]>([]);
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const debounceTimerInfo = useRef<NodeJS.Timeout | null>(null);

  // Efeito disparado quando aba lista carrega
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

  const updatePrioridade = async (id: string, valor: number) => {
    const valorTratado = Number.isNaN(valor) ? 0 : valor;
    
    // Optimistic UI Update (Atualiza visualmente primeiro e reordena)
    setListaNoticias((prev) => {
      const novalista = prev.map(n => n.id === id ? { ...n, ordem_prioridade: valorTratado } : n);
      return novalista.sort((a, b) => {
        if ((b.ordem_prioridade || 0) === (a.ordem_prioridade || 0)) {
           return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return (b.ordem_prioridade || 0) - (a.ordem_prioridade || 0);
      });
    });

    // Debounce pra não enlouquecer o Supabase se o cara clicar rapidao 10 vezes na seta
    if (debounceTimerInfo.current) clearTimeout(debounceTimerInfo.current);
    debounceTimerInfo.current = setTimeout(async () => {
      try {
        if (!supabase) return;
        const { error } = await supabase
          .from("noticias")
          .update({ ordem_prioridade: valorTratado })
          .eq("id", id);
          
        if (error) {
           console.error("Erro ao salvar prioridade. Voltando.", error);
        }
      } catch (err: any) {
        console.error("Erro banco prioridade", err);
      }
    }, 500); // aguarda parar de clicar por meio segundo pra injetar no banco
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

  const saveLiveConfig = async () => {
    setSavingConfig(true);
    try {
      if (!supabase) return;

      // Buscar config atual para saber se a live está mudando de ON para OFF
      const { data: currentConfig } = await supabase
        .from("configuracao_portal")
        .select("is_live, url_live_facebook")
        .eq("id", 1)
        .single();

      const lastEndedAt = (!isLive && currentConfig?.is_live) ? new Date().toISOString() : null;

      const updateData: any = {
        is_live: isLive,
        url_live_facebook: urlLive,
        fake_viewers_boost: viewersBoost,
        link_anuncio_home: linkAnuncioHome,
        link_vertical_noticia: linkVerticalNoticia
      };

      // Upload Banner Home
      if (bannerHomeFile) {
        const fileExt = bannerHomeFile.name.split('.').pop();
        const fileName = `banner_home_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, bannerHomeFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);
          
        updateData.banner_anuncio_home = publicUrl;
        setBannerHomeUrl(publicUrl);
        setBannerHomeFile(null);
      }

      // Upload Banner Vertical
      if (bannerVerticalFile) {
        const fileExt = bannerVerticalFile.name.split('.').pop();
        const fileName = `banner_vertical_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, bannerVerticalFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);
          
        updateData.banner_vertical_noticia = publicUrl;
        setBannerVerticalUrl(publicUrl);
        setBannerVerticalFile(null);
      }

      if (lastEndedAt) {
        updateData.live_last_ended_at = lastEndedAt;
        
        // Salvar na Biblioteca se estiver desligando
        await supabase.from("biblioteca_lives").insert([{
          titulo: `Live de ${new Date().toLocaleDateString('pt-BR')}`,
          url: urlLive,
          tema: "Live Stream",
          thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400" 
        }]);
      }

      const { error } = await supabase
        .from("configuracao_portal")
        .update(updateData)
        .eq("id", 1);
        
      if (error) throw error;
      alert("Configurações do Portal salvas com sucesso!");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSavingConfig(false);
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
      
      if (!res.ok) throw new Error(data.error || "A API de Inteligência Artificial falhou ou está sobrecarregada no momento.");
      if (data.error) throw new Error(data.error);
      
      setTitulo(data.titulo || "");
      setSubtitulo(data.subtitulo || "");
      setConteudo(data.conteudo || "");
      setCategoria(data.categoria || "Geral");
      
      // Auto Generate Slug
      if (data.titulo) {
        setSlug(
          data.titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        );
      }

    } catch (err: any) {
      alert("⚠️ Robô Jornalista diz:\n\n" + err.message);
    } finally {
      setIsGenerating(false);
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

      // 1. Upload de Vídeo se houver
      if (videoFile) {
        setUploadingVideo(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `noticias/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        finalVideoUrl = publicUrl;
        setUploadingVideo(false);
      }

      // 2. Inserir no Banco
      const cleanSlug = slug.trim()
        .replace(/^https?:\/\//, '') // Remove http:// or https://
        .split('/') // Split by slashes
        .filter(Boolean) // Remove empty parts
        .pop() || slug; // Get last part (the actual slug) or fallback to original

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
        ordem_prioridade: 0
      }]);

      if (error) throw error;

      alert("🚀 Notícia publicada com sucesso!");
      
      // Limpar campos
      setTitulo("");
      setSubtitulo("");
      setConteudo("");
      setCategoria("");
      setSlug("");
      setImagemUrl("");
      setVideoFile(null);
      setMostrarNoPlayer(false);
      setMostrarNaHomeRecentes(false);
      setTotalNoticias(prev => prev + 1);

    } catch (err: any) {
      console.error(err);
      alert("Erro ao publicar: " + err.message);
    } finally {
      setSavingConfig(false);
      setUploadingVideo(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Settings className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">Nossa Web TV</h1>
            <p className="text-neutral-400 text-sm">Painel Administrativo V2</p>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-md"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "dashboard", label: "Início", icon: <LayoutDashboard size={20} /> },
    { id: "transmissao", label: "Gerenciar Live", icon: <Rss size={20} /> },
    { id: "nova-noticia", label: "Postar Notícia", icon: <FileText size={20} /> },
    { id: "lista-noticias", label: "Lista de Notícias", icon: <List size={20} /> },
    { id: "config", label: "Configurações do Portal", icon: <Settings size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* SIDEBAR FIXA - MODO ESCURO PROFUNDO */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col shadow-xl flex-shrink-0 z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Settings size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Admin Pro</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 mb-4">Painel</div>
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)} 
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}

          <Link 
            href="/admin/biblioteca"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
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
        {/* TOPBAR BRANCA CLARA */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10 transition-all duration-200">
           <h2 className="font-bold text-slate-800 text-xl tracking-tight hidden sm:block">
             {menuItems.find(i => i.id === activeTab)?.label}
           </h2>
           <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1.5 px-4 shadow-sm">
                 <User size={16} className="text-slate-500" />
                 <span className="text-sm font-bold text-slate-700">Admin Master</span>
              </div>
              <button 
                onClick={() => setIsAuthenticated(false)} 
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 py-1.5 px-4 rounded-full transition-all duration-200 hover:shadow-md"
              >
                 <LogOut size={16} /> Sair
              </button>
           </div>
        </header>

        {/* CONTEÚDO ROLÁVEL CENTRALIZADO */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
           {/* Fundo do main é slate-50 pelo próprio wrapper da tela de admin */}
          <div className="max-w-6xl mx-auto space-y-6"> 
            
            {/* --- ABA DASHBOARD (INÍCIO) --- */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* CARD 1: Status Live com Bolinha Vermelha Oficial */}
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

                {/* CARD 2: Total Notícias */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">{totalNoticias}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Notícias Publicadas</p>
                </div>

                {/* CARD 3: Boost de Audiência */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                   <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                    <Users size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900">{viewersBoost}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Audiência Atual</p>
                </div>
              </div>
            )}

            {/* --- ABA NOVA NOTÍCIA --- */}
            {activeTab === 'nova-noticia' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Cabeçalho da IA Isolado no Topo */}
                <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-sm border border-transparent overflow-hidden text-white transition-all duration-200">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full space-y-4">
                      <h2 className="font-black text-2xl flex items-center gap-2 text-white">
                        <Sparkles className="text-blue-300" size={24} /> Gerador Mágico
                      </h2>
                      <p className="text-blue-100 text-sm">Cole o link da fonte (Facebook/Jornal) ou digite sua ideia grosseira que o Robô Jornalista redige tudo nos moldes do jornal.</p>
                      <div className="flex bg-white/10 rounded-xl border border-white/20 p-1 backdrop-blur-sm shadow-sm transition-all duration-200">
                        <input 
                          type="text" 
                          placeholder="Exemplo: Fale sobre a feira de roupas em Arapongas amanhã..."
                          value={promptIA}
                          onChange={(e) => setPromptIA(e.target.value)}
                          className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-white placeholder-blue-200"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                      <button 
                        onClick={handleIA}
                        disabled={isGenerating || !promptIA}
                        className="w-full md:w-auto bg-white hover:bg-slate-50 disabled:opacity-75 text-blue-700 font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 shadow-sm"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        {isGenerating ? "Redigindo..." : "Escrever Notícia"}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Mesa de Redação (Grid 2 Colunas) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* COLUNA ESQUERDA - TEXTOS PRINCIPAIS */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 transition-all duration-200">
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Título da Matéria</label>
                        <input 
                          type="text" 
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Digite o título atrativo"
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-3.5 font-black text-2xl text-slate-900 transition-all duration-200 placeholder-slate-300 shadow-sm focus:shadow-md outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Subtítulo (Opcional)</label>
                        <input 
                          type="text" 
                          value={subtitulo}
                          onChange={(e) => setSubtitulo(e.target.value)}
                          placeholder="Linha fina que complementa o título"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-slate-600 transition-all duration-200 shadow-sm focus:shadow-md outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Conteúdo da Notícia</label>
                        <textarea 
                          rows={14}
                          value={conteudo}
                          onChange={(e) => setConteudo(e.target.value)}
                          placeholder="Redija a notícia em linguagem jornalística aqui..."
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-5 py-4 text-slate-800 transition-all duration-200 leading-relaxed font-serif text-lg resize-none shadow-sm focus:shadow-md outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-2 text-right">Mínimo ideal: 3 parágrafos. Separe os parágrafos pulando linha dupla (Enter).</p>
                      </div>

                    </div>
                  </div>

                  {/* COLUNA DIREITA - PARÂMETROS DA NOTÍCIA */}
                  <aside className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5 transition-all duration-200">
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Imagem de Capa (URL)</label>
                        {imagemUrl && (
                          <div className="w-full h-32 mb-3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 transition-all duration-200">
                             <img src={imagemUrl} alt="Preview da capa" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                        )}
                        <input 
                          type="text" 
                          value={imagemUrl}
                          onChange={(e) => setImagemUrl(e.target.value)}
                          placeholder="https://site.com/imagem.jpg"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-slate-700 transition-all duration-200 shadow-sm focus:shadow-md outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Cole o link de uma foto ou do Facebook para a vitrine da matéria.</p>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Categoria</label>
                        <select 
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold transition-all duration-200 shadow-sm outline-none"
                        >
                          <option value="">Selecione...</option>
                          <option value="Arapongas">Arapongas</option>
                          <option value="Esportes">Esportes</option>
                          <option value="Polícia">Polícia</option>
                          <option value="Política">Política</option>
                          <option value="Geral">Geral</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Upload de Vídeo (Opcional)</label>
                        <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 flex flex-col items-center justify-center text-center ${videoFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                          <input 
                            type="file" 
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {videoFile ? (
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-blue-700 truncate max-w-[200px]">{videoFile.name}</p>
                              <p className="text-[10px] text-blue-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          ) : (
                            <>
                              <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-2">
                                <FileText size={16} />
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">Clique ou arraste o vídeo aqui</p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Exibir no Player Principal?</label>
                          <button 
                            onClick={() => setMostrarNoPlayer(!mostrarNoPlayer)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${mostrarNoPlayer ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${mostrarNoPlayer ? 'translate-x-5.5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Aba Recentes da Home?</label>
                          <button 
                            onClick={() => setMostrarNaHomeRecentes(!mostrarNaHomeRecentes)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${mostrarNaHomeRecentes ? 'bg-blue-600' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${mostrarNaHomeRecentes ? 'translate-x-5.5' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-5">
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">URL Limpa (Slug)</label>
                        <input 
                          type="text" 
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="ex: acidente-na-avenida"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-blue-600 font-mono transition-all duration-200 shadow-sm focus:shadow-md outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Endereço público da matéria. A IA preenche isso sozinho.</p>
                      </div>

                    </div>

                    {/* ACTIONS CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3 transition-all duration-200">
                      <button 
                        onClick={() => setShowPreview(true)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 border border-slate-300"
                      >
                        <Eye size={18} /> Ver Preview 👁️
                      </button>

                      <button 
                        onClick={publishNews}
                        disabled={savingConfig || uploadingVideo}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 shadow-sm"
                      >
                        {uploadingVideo ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        {uploadingVideo ? "Subindo Vídeo..." : (savingConfig ? "Publicando..." : "Publicar Agora")}
                      </button>
                    </div>

                  </aside>
                </div>
              </div>
            )}

            {/* --- ABA TRANSMISSÃO --- */}
            {activeTab === 'transmissao' && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-all duration-200">
                <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200 flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl"><Rss className="text-red-600" size={20} /></div>
                  <h2 className="font-bold text-slate-900 text-lg">Controles AO VIVO</h2>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                  <div className="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Transmissão Ativa</h3>
                      <p className="text-sm text-slate-500 mt-1">Exibe a live na capa do portal para todos os visitantes.</p>
                    </div>
                    <button 
                      onClick={() => setIsLive(!isLive)}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 hover:shadow-md ${isLive ? 'bg-red-600' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${isLive ? 'translate-x-9' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">URL Integrada (Facebook ou Youtube)</label>
                    <input 
                      type="text" 
                      placeholder="https://facebook.com/..."
                      value={urlLive}
                      onChange={(e) => setUrlLive(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-600 focus:bg-white transition-all duration-200 text-black font-medium shadow-sm focus:shadow-md placeholder-slate-400"
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium italic">O link inserido acima aparecerá no player principal enquanto a transmissão estiver ligada.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="text-slate-500" size={18} />
                        <label className="text-sm font-bold text-slate-700">Impulso de Multidão Exibido (Boost Fake)</label>
                      </div>
                      <span className="bg-slate-100 text-slate-900 font-bold px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                        {viewersBoost} pessoas
                      </span>
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max="5000" 
                      step="50"
                      value={viewersBoost}
                      onChange={(e) => setViewersBoost(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-xl appearance-none cursor-pointer accent-blue-600 transition-all duration-200"
                    />
                    <div className="flex justify-between text-xs font-medium text-slate-400 mt-3">
                      <span>0</span>
                      <span>1k</span>
                      <span>2.5k</span>
                      <span>5k+</span>
                    </div>
                  </div>

                  <button 
                    onClick={saveLiveConfig}
                    disabled={savingConfig}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 shadow-sm mt-4"
                  >
                    {savingConfig ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {savingConfig ? "Salvando Nuvem..." : "Salvar Configurações da Live"}
                  </button>
                </div>
              </section>
            )}

            {/* --- ABA LISTA DE NOTÍCIAS --- */}
            {activeTab === 'lista-noticias' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-xl"><List className="text-purple-600" size={20} /></div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">Matérias Publicadas</h2>
                      <p className="text-slate-500 text-sm mt-0.5">Gerencie ou apague o seu acervo digital permanentemente.</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 border-b border-slate-200">
                        <th className="px-6 py-4 font-bold text-center w-24">Rank</th>
                        <th className="px-6 py-4 font-bold">Título da Notícia</th>
                        <th className="px-6 py-4 font-bold hidden sm:table-cell">Categoria</th>
                        <th className="px-6 py-4 font-bold hidden md:table-cell">Data Original</th>
                        <th className="px-6 py-4 font-bold text-right">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingNoticias ? (
                        <tr><td colSpan={5} className="p-12 text-center text-slate-400"><Loader2 className="mx-auto animate-spin mb-3" size={28}/>Carregando banco de dados...</td></tr>
                      ) : listaNoticias.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Nenhuma notícia registrada na base.</td></tr>
                      ) : (
                        listaNoticias.map((noticia) => (
                          <tr key={noticia.id} className="hover:bg-slate-50/80 transition-colors group">
                            
                            {/* CÉLULA DE RANKING / PRIORIDADE */}
                            <td className="px-6 py-4 min-w-28 text-center">
                               <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl border border-slate-200 shadow-inner w-14 mx-auto overflow-hidden">
                                 <button onClick={() => updatePrioridade(noticia.id, (noticia.ordem_prioridade || 0) + 1)} className="w-full text-slate-400 bg-white/50 hover:bg-slate-200 hover:text-blue-600 transition-colors flex items-center justify-center py-1">
                                   <ChevronUp size={16} strokeWidth={3} />
                                 </button>
                                 <input 
                                   type="number"
                                   value={noticia.ordem_prioridade || 0}
                                   onChange={(e) => updatePrioridade(noticia.id, parseInt(e.target.value) || 0)}
                                   className="text-center font-black text-slate-900 bg-transparent outline-none w-full text-base py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                 />
                                 <button onClick={() => updatePrioridade(noticia.id, (noticia.ordem_prioridade || 0) - 1)} className="w-full text-slate-400 bg-white/50 hover:bg-slate-200 hover:text-red-600 transition-colors flex items-center justify-center py-1">
                                   <ChevronDown size={16} strokeWidth={3} />
                                 </button>
                               </div>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-800 text-sm md:text-base leading-snug line-clamp-2 max-w-md group-hover:text-blue-600 transition-colors">{noticia.titulo}</p>
                              <span className="sm:hidden text-xs text-blue-600 font-bold mt-2 block uppercase">{noticia.categoria || "Geral"}</span>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{noticia.categoria || "Geral"}</span>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-500 font-medium truncate">
                              {new Date(noticia.created_at).toLocaleDateString('pt-BR')} às {new Date(noticia.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="px-6 py-4 right-0">
                              <div className="flex justify-end gap-2">
                                <a href={`/noticia/${noticia.slug || noticia.id}`} target="_blank" className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all duration-200" title="Ver no portal">
                                  <Eye size={16} />
                                </a>
                                <button onClick={() => deletarNoticia(noticia.id, noticia.titulo)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-md transition-all duration-200" title="Apagar definitivamente">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- ABA CONFIGURAÇÕES GERAIS --- */}
            {activeTab === 'config' && (
               <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-all duration-200">
                  <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-200 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl"><Settings className="text-blue-600" size={20} /></div>
                    <h2 className="font-bold text-slate-900 text-lg">Configurações de Publicidade</h2>
                  </div>

                  <div className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Publicidade 1: Home */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <Eye size={18} />
                          </div>
                          <h4 className="font-bold text-slate-800">Banner Home (Horizontal)</h4>
                        </div>
                        
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[160px] flex flex-col items-center justify-center group overflow-hidden transition-all hover:bg-slate-100/50">
                          {(bannerHomeFile || bannerHomeUrl) ? (
                            <img 
                              src={bannerHomeFile ? URL.createObjectURL(bannerHomeFile) : bannerHomeUrl} 
                              className="max-h-32 object-contain rounded-lg shadow-sm"
                              alt="Preview Home"
                            />
                          ) : (
                            <div className="text-center">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Banner Retangular</p>
                              <p className="text-[10px] text-slate-400">Dimensões sugeridas: 1200x250px</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setBannerHomeFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Link de Destino</label>
                          <input 
                            type="text"
                            placeholder="Ex: https://wa.me/554399999999"
                            value={linkAnuncioHome}
                            onChange={(e) => setLinkAnuncioHome(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
                          />
                        </div>
                      </div>

                      {/* Publicidade 2: Vertical Notícias */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                            <FileText size={18} />
                          </div>
                          <h4 className="font-bold text-slate-800">Banner Sidebar (Vertical)</h4>
                        </div>
                        
                        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[160px] flex flex-col items-center justify-center group overflow-hidden transition-all hover:bg-slate-100/50">
                          {(bannerVerticalFile || bannerVerticalUrl) ? (
                            <img 
                              src={bannerVerticalFile ? URL.createObjectURL(bannerVerticalFile) : bannerVerticalUrl} 
                              className="max-h-32 object-contain rounded-lg shadow-sm"
                              alt="Preview Sidebar"
                            />
                          ) : (
                            <div className="text-center">
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Banner em Pé</p>
                              <p className="text-[10px] text-slate-400">Dimensões sugeridas: 300x600px</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setBannerVerticalFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase px-1">Link de Destino</label>
                          <input 
                            type="text"
                            placeholder="Ex: https://seusite.com.br"
                            value={linkVerticalNoticia}
                            onChange={(e) => setLinkVerticalNoticia(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:bg-white font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <button 
                        onClick={saveLiveConfig}
                        disabled={savingConfig}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 shadow-sm"
                      >
                        {savingConfig ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {savingConfig ? "Salvando Nuvem..." : "Salvar Configurações do Portal"}
                      </button>
                      <p className="text-[10px] text-slate-400 text-center mt-3 font-medium tracking-tight uppercase">Os banners aparecem na Home e na lateral das matérias.</p>
                    </div>
                  </div>
               </section>
            )}
            
          </div>
        </main>
      </div>

      {/* --- MODAL DE PREVIEW DA NOTÍCIA --- */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 overflow-y-auto w-full h-full animate-in fade-in zoom-in-95 duration-200">
          
          <header className="bg-white border-b-[3px] border-red-600 shadow-sm w-full sticky top-0 z-50 shrink-0">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                 <span className="text-3xl font-extrabold text-red-600 tracking-tighter">NOSSA<span className="text-blue-800">WEB</span><span className="text-slate-800 font-light text-2xl">TV</span></span>
              </div>
              <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg shadow-md shadow-black/20">
                <X size={16} /> Fechar Preview
              </button>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="w-full lg:w-[70%] mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-slate-200/60 transition-all duration-200 hover:shadow-md">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-lg self-start">
                  {categoria || "Sua Categoria"}
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                  Publicado Agora Mesmo
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tight">
                {titulo || "Digite um Título Deslumbrante Acima"}
              </h1>
              
              {subtitulo && (
                <h2 className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed mb-8">
                  {subtitulo}
                </h2>
              )}

              {imagemUrl && (
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] mb-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={imagemUrl} alt="Preview Capa" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-slate prose-lg max-w-none text-slate-800 mb-8 font-serif">
                {conteudo ? (
                  conteudo.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index} className="mb-5 leading-relaxed">{paragraph}</p>
                  ))
                ) : (
                  <p className="italic text-slate-500">Escreva algo incrível no painel de redação...</p>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

    </div>
  );
}
