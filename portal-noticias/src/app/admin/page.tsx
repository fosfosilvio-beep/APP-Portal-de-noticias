"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Settings, Rss, Users, Sparkles, Send, Loader2, Save, LayoutDashboard, FileText, ExternalLink, LogOut, User, Eye, X } from "lucide-react";

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

  // Estados Gerador IA
  const [promptIA, setPromptIA] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [slug, setSlug] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

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
      const { error } = await supabase
        .from("configuracao_portal")
        .update({
          is_live: isLive,
          url_live_facebook: urlLive,
          fake_viewers_boost: viewersBoost
        })
        .eq("id", 1);
        
      if (error) throw error;
      alert("Configurações da Live salvas com sucesso!");
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

  const publishNews = () => {
    alert(`Notícia pronta para ser inserida!\nTítulo: ${titulo}\nSlug: ${slug}`);
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
    { id: "dashboard", label: "Dashboard Inicial", icon: <LayoutDashboard size={20} /> },
    { id: "nova-noticia", label: "Nova Notícia (Mesa)", icon: <FileText size={20} /> },
    { id: "transmissao", label: "Gerenciar Transmissão", icon: <Rss size={20} /> },
    { id: "config", label: "Configurações", icon: <Settings size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-[family-name:var(--font-geist-sans)]">
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
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-2 mb-4">Gerenciamento</div>
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
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10 transition-all duration-200">
           <h2 className="font-bold text-gray-800 text-xl tracking-tight hidden sm:block">
             {menuItems.find(i => i.id === activeTab)?.label}
           </h2>
           <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-1.5 px-4 shadow-sm">
                 <User size={16} className="text-gray-500" />
                 <span className="text-sm font-bold text-gray-700">Admin Master</span>
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
          <div className="max-w-6xl mx-auto space-y-6"> {/* max-w-6xl pra dar mais espaço pro Grid */}
            
            {/* --- ABA DASHBOARD --- */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* CARD 1: Status Live */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                  <div className="h-10 flex items-center justify-center mb-2">
                     <span className="relative flex h-5 w-5">
                       {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                       <span className={`relative inline-flex rounded-full h-5 w-5 ${isLive ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                     </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{isLive ? "Transmitindo" : "Offline"}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Status da Live</p>
                </div>

                {/* CARD 2: Total Notícias */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{totalNoticias}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Notícias Publicadas</p>
                </div>

                {/* CARD 3: Boost de Audiência */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center transition-all duration-200">
                   <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                    <Users size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{viewersBoost}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Audiência Atual</p>
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
                        className="w-full md:w-auto bg-white hover:bg-gray-50 disabled:opacity-75 text-blue-700 font-bold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 shadow-sm"
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
                    {/* Card Corpo */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 transition-all duration-200">
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Título da Matéria</label>
                        <input 
                          type="text" 
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Digite o título atrativo"
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-xl px-4 py-3.5 font-black text-2xl text-gray-900 transition-all duration-200 placeholder-gray-300 shadow-sm focus:shadow-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Subtítulo (Opcional)</label>
                        <input 
                          type="text" 
                          value={subtitulo}
                          onChange={(e) => setSubtitulo(e.target.value)}
                          placeholder="Linha fina que complementa o título"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-gray-600 transition-all duration-200 shadow-sm focus:shadow-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Conteúdo da Notícia</label>
                        {/* Simulação de Rich Text: textarea luxuosa */}
                        <textarea 
                          rows={14}
                          value={conteudo}
                          onChange={(e) => setConteudo(e.target.value)}
                          placeholder="Redija a notícia em linguagem jornalística aqui..."
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl px-5 py-4 text-gray-800 transition-all duration-200 leading-relaxed font-serif text-lg resize-none shadow-sm focus:shadow-md"
                        />
                        <p className="text-xs text-gray-400 mt-2 text-right">Mínimo ideal: 3 parágrafos. Separe os parágrafos pulando linha dupla (Enter).</p>
                      </div>

                    </div>
                  </div>

                  {/* COLUNA DIREITA - PARÂMETROS DA NOTÍCIA */}
                  <aside className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5 transition-all duration-200">
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Imagem de Capa (URL)</label>
                        {imagemUrl && (
                          <div className="w-full h-32 mb-3 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 transition-all duration-200">
                             <img src={imagemUrl} alt="Preview da capa" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                        )}
                        <input 
                          type="text" 
                          value={imagemUrl}
                          onChange={(e) => setImagemUrl(e.target.value)}
                          placeholder="https://site.com/imagem.jpg"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-gray-700 transition-all duration-200 shadow-sm focus:shadow-md"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Cole o link de uma foto ou do Facebook para a vitrine da matéria.</p>
                      </div>

                      <div className="border-t border-gray-100 pt-5">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Categoria</label>
                        <select 
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-gray-900 font-bold transition-all duration-200 shadow-sm"
                        >
                          <option value="">Selecione...</option>
                          <option value="Arapongas">Arapongas</option>
                          <option value="Esportes">Esportes</option>
                          <option value="Polícia">Polícia</option>
                          <option value="Política">Política</option>
                          <option value="Geral">Geral</option>
                        </select>
                      </div>

                      <div className="border-t border-gray-100 pt-5">
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">URL Limpa (Slug)</label>
                        <input 
                          type="text" 
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="ex: acidente-na-avenida"
                          className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 rounded-xl px-3 py-2 text-sm text-blue-600 font-mono transition-all duration-200 shadow-sm focus:shadow-md"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Endereço público da matéria. A IA preenche isso sozinho.</p>
                      </div>

                    </div>

                    {/* ACTIONS CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3 transition-all duration-200">
                      <button 
                        onClick={() => setShowPreview(true)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 border border-gray-300"
                      >
                        <Eye size={18} /> Ver Preview 👁️
                      </button>

                      <button 
                        onClick={publishNews}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Send size={18} /> Publicar Agora
                      </button>
                    </div>

                  </aside>
                </div>
              </div>
            )}

            {/* --- ABA TRANSMISSÃO --- */}
            {activeTab === 'transmissao' && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 transition-all duration-200">
                <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl"><Rss className="text-red-600" size={20} /></div>
                  <h2 className="font-bold text-gray-900 text-lg">Controles AO VIVO</h2>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                  <div className="flex items-center justify-between bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Transmissão Ativa</h3>
                      <p className="text-sm text-gray-500 mt-1">Exibe a live na capa do portal para todos os visitantes.</p>
                    </div>
                    <button 
                      onClick={() => setIsLive(!isLive)}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 hover:shadow-md ${isLive ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${isLive ? 'translate-x-9' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL Integrada (Facebook ou Youtube)</label>
                    <input 
                      type="text" 
                      placeholder="https://facebook.com/..."
                      value={urlLive}
                      onChange={(e) => setUrlLive(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-800 shadow-sm focus:shadow-md"
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="text-gray-500" size={18} />
                        <label className="text-sm font-bold text-gray-700">Impulso de Multidão Exibido (Boost Fake)</label>
                      </div>
                      <span className="bg-gray-100 text-gray-900 font-bold px-4 py-1.5 rounded-xl border border-gray-200 shadow-sm">
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
                      className="w-full h-2.5 bg-gray-200 rounded-xl appearance-none cursor-pointer accent-blue-600 transition-all duration-200"
                    />
                    <div className="flex justify-between text-xs font-medium text-gray-400 mt-3">
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
                    {savingConfig ? "Salvando Nuvem..." : "Salvar Configurações Globais"}
                  </button>
                </div>
              </section>
            )}

            {/* --- ABA CONFIGURAÇÕES GERAIS --- */}
            {activeTab === 'config' && (
               <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center animate-in fade-in slide-in-from-bottom-2 transition-all duration-200 hover:shadow-md">
                 <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                 <h2 className="text-lg font-bold text-gray-900">Configurações Gerais</h2>
                 <p className="text-gray-500 mt-2">Esta aba está reservada para atualizações futuras como gerenciamento de chaves de IA, logos e usuários.</p>
               </section>
            )}
            
          </div>
        </main>
      </div>

      {/* --- MODAL DE PREVIEW DA NOTÍCIA --- */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 overflow-y-auto w-full h-full animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Simulando o Site Público */}
          <header className="bg-white border-b-[3px] border-red-600 shadow-sm w-full sticky top-0 z-50 shrink-0">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center">
                 <span className="text-3xl font-extrabold text-red-600 tracking-tighter">NOSSA<span className="text-blue-800">WEB</span><span className="text-zinc-800 font-light text-2xl">TV</span></span>
              </div>
              <button onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-full transition-all duration-200 hover:shadow-lg shadow-md shadow-black/20">
                <X size={16} /> Fechar Preview
              </button>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="w-full lg:w-[70%] mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-zinc-200/60 transition-all duration-200 hover:shadow-md">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-lg self-start">
                  {categoria || "Sua Categoria"}
                </span>
                <span className="text-sm text-zinc-500 flex items-center gap-1.5 font-medium">
                  Publicado Agora Mesmo
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 leading-tight mb-4 tracking-tight">
                {titulo || "Digite um Título Deslumbrante Acima"}
              </h1>
              
              {subtitulo && (
                <h2 className="text-lg md:text-xl text-zinc-600 font-normal leading-relaxed mb-8">
                  {subtitulo}
                </h2>
              )}

              {imagemUrl && (
                <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] mb-10 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img src={imagemUrl} alt="Preview Capa" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-zinc prose-lg max-w-none text-zinc-800 mb-8 font-serif">
                {conteudo ? (
                  conteudo.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index} className="mb-5 leading-relaxed">{paragraph}</p>
                  ))
                ) : (
                  <p className="italic text-zinc-500">Escreva algo incrível no painel de redação...</p>
                )}
              </div>
            </div>
          </main>
        </div>
      )}

    </div>
  );
}
