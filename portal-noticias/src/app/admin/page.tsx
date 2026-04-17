"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Settings, Rss, Users, Sparkles, Send, Loader2, Save, LayoutDashboard, FileText, ExternalLink, LogOut, User } from "lucide-react";

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
    } catch (err: any) {
      alert("⚠️ Robô Jornalista diz:\n\n" + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const publishNews = () => {
    alert(`Notícia pronta para ser inserida!\nTítulo: ${titulo}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
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
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
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
    { id: "nova-noticia", label: "Nova Notícia (IA)", icon: <FileText size={20} /> },
    { id: "transmissao", label: "Gerenciar Transmissão", icon: <Rss size={20} /> },
    { id: "config", label: "Configurações", icon: <Settings size={20} /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* SIDEBAR FIXA - MODO ESCURO PROFUNDO */}
      <aside className="w-64 bg-[#0A0A0A] text-white flex flex-col shadow-xl flex-shrink-0 z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
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
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-neutral-900">
            <a href="/" target="_blank" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors">
              <ExternalLink size={20} /> Ver Site ao Vivo
            </a>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOPBAR BRANCA CLARA */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-8 flex-shrink-0 z-10">
           <h2 className="font-bold text-gray-800 text-xl tracking-tight hidden sm:block">
             {menuItems.find(i => i.id === activeTab)?.label}
           </h2>
           <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full py-1.5 px-4">
                 <User size={16} className="text-gray-500" />
                 <span className="text-sm font-bold text-gray-700">Admin Master</span>
              </div>
              <button 
                onClick={() => setIsAuthenticated(false)} 
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 py-1.5 px-4 rounded-full transition-colors"
              >
                 <LogOut size={16} /> Sair
              </button>
           </div>
        </header>

        {/* CONTEÚDO ROLÁVEL CENTRALIZADO */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* --- ABA DASHBOARD --- */}
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* CARD 1: Status Live */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900">{totalNoticias}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-1">Notícias Publicadas</p>
                </div>

                {/* CARD 3: Boost de Audiência */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center">
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
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50/50 px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg"><Sparkles className="text-blue-600" size={20} /></div>
                  <h2 className="font-bold text-gray-900 text-lg">Gerador Mágico com IA</h2>
                </div>
                
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Coloque um Link ou Ideia Inicial</label>
                    <textarea 
                      rows={3}
                      placeholder="Exemplo: Acidente na Avenida Arapongas..."
                      value={promptIA}
                      onChange={(e) => setPromptIA(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none text-gray-800"
                    />
                  </div>
                  
                  <button 
                    onClick={handleIA}
                    disabled={isGenerating || !promptIA}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isGenerating ? "Redigindo Notícia Oficial..." : "Gerar Notícia Completa"}
                  </button>

                  <div className="pt-6 mt-6 border-t border-gray-100 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Título Sugerido</label>
                        <input 
                          type="text" 
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2.5 font-bold text-gray-900 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Categoria Base</label>
                        <input 
                          type="text" 
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 text-blue-600 rounded-lg px-4 py-2.5 font-bold transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Resumo Secundário (Subtítulo)</label>
                      <input 
                        type="text" 
                        value={subtitulo}
                        onChange={(e) => setSubtitulo(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-lg px-4 py-2.5 text-gray-700 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Redação Completa</label>
                      <textarea 
                        rows={8}
                        value={conteudo}
                        onChange={(e) => setConteudo(e.target.value)}
                        className="w-full bg-white border border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3 text-gray-800 resize-none transition-colors leading-relaxed"
                      />
                    </div>

                    <button 
                      onClick={publishNews}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                    >
                      <Send size={18} /> Publicar Matéria no Portal
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* --- ABA TRANSMISSÃO --- */}
            {activeTab === 'transmissao' && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-gray-50/50 px-6 py-5 border-b border-gray-200 flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg"><Rss className="text-red-600" size={20} /></div>
                  <h2 className="font-bold text-gray-900 text-lg">Controles AO VIVO</h2>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                  <div className="flex items-center justify-between bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Transmissão Ativa</h3>
                      <p className="text-sm text-gray-500 mt-1">Exibe a live na capa do portal para todos os visitantes.</p>
                    </div>
                    <button 
                      onClick={() => setIsLive(!isLive)}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${isLive ? 'bg-red-600' : 'bg-gray-300'}`}
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
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-800"
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="text-gray-500" size={18} />
                        <label className="text-sm font-bold text-gray-700">Impulso de Multidão Exibido (Boost Fake)</label>
                      </div>
                      <span className="bg-gray-100 text-gray-900 font-bold px-4 py-1.5 rounded-lg border border-gray-200">
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
                      className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 mt-4"
                  >
                    {savingConfig ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {savingConfig ? "Salvando Nuvem..." : "Salvar Configurações Globais"}
                  </button>
                </div>
              </section>
            )}

            {/* --- ABA CONFIGURAÇÕES GERAIS --- */}
            {activeTab === 'config' && (
               <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                 <h2 className="text-lg font-bold text-gray-900">Configurações Gerais</h2>
                 <p className="text-gray-500 mt-2">Esta aba está reservada para atualizações futuras como gerenciamento de chaves de IA, logos e usuários.</p>
               </section>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
