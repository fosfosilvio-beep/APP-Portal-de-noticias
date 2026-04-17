"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Settings, Rss, Users, Sparkles, Send, Loader2, Save } from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Estados do Controle de Live
  const [isLive, setIsLive] = useState(false);
  const [urlLive, setUrlLive] = useState("");
  const [viewersBoost, setViewersBoost] = useState(0);
  const [savingConfig, setSavingConfig] = useState(false);

  // Estados da IA
  const [promptIA, setPromptIA] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [conteudo, setConteudo] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Proteção simples via client-side para o MVP.
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
        .eq("id", 1); // assumindo que a linha tem id=1
        
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
      const res = await fetch("/api/gerar-noticia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptIA })
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      setTitulo(data.titulo || "");
      setSubtitulo(data.subtitulo || "");
      setConteudo(data.conteudo || "");
    } catch (err: any) {
      alert("Erro ao gerar notícia: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const publishNews = () => {
    // Para um MVP, isso simularia a inserção na tabela de notícias/categorias.
    alert(`Notícia pronta para ser inserida!\nTítulo: ${titulo}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Settings className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">Nossa Web TV</h1>
            <p className="text-zinc-400 text-sm">Painel Administrativo</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-20">
      {/* Navbar do Dashboard */}
      <header className="bg-zinc-900 text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-red-500" size={20} />
            <h1 className="font-bold tracking-tight">Admin Dashboard</h1>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg md:max-w-3xl space-y-6">
        
        {/* CARTÃO 1 & 2: CONTROLE DE LIVE E AUDIÊNCIA */}
        <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="bg-zinc-100 px-5 py-4 border-b border-zinc-200 flex items-center gap-2">
            <Rss className="text-red-600" size={20} />
            <h2 className="font-bold text-zinc-800">Controles de Transmissão</h2>
          </div>
          
          <div className="p-5 space-y-6">
            {/* Toggle Status Live */}
            <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-xl border border-zinc-100">
              <div>
                <h3 className="font-bold text-zinc-900">Status da Transmissão</h3>
                <p className="text-xs text-zinc-500">Liga/desliga player na Home</p>
              </div>
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${isLive ? 'bg-red-600' : 'bg-zinc-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isLive ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Input URL */}
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">URL do Facebook Live</label>
              <input 
                type="text" 
                placeholder="https://facebook.com/..."
                value={urlLive}
                onChange={(e) => setUrlLive(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Slider de Audiência */}
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-blue-600" size={18} />
                  <label className="text-sm font-bold text-zinc-700">Views Simultâneos (Boost)</label>
                </div>
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                  {viewersBoost}
                </span>
              </div>
              
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50"
                value={viewersBoost}
                onChange={(e) => setViewersBoost(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-xs text-zinc-400 mt-2">
                <span>0 views</span>
                <span>5k+ views</span>
              </div>
            </div>

            <button 
              onClick={saveLiveConfig}
              disabled={savingConfig}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {savingConfig ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Salvar Alterações
            </button>
          </div>
        </section>

        {/* CARTÃO 3: GERADOR DE NOTÍCIAS (IA) */}
        <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
          <div className="bg-white/50 px-5 py-4 border-b border-indigo-100 flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={20} />
            <h2 className="font-bold text-indigo-900">Gerador de Matérias (IA Claude)</h2>
          </div>
          
          <div className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-1">Coloque um Link ou Ideia inicial</label>
              <textarea 
                rows={3}
                placeholder="Exemplo: Fale sobre a nova feira de móveis que acontecerá em Arapongas neste final de semana..."
                value={promptIA}
                onChange={(e) => setPromptIA(e.target.value)}
                className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
              />
            </div>
            
            <button 
              onClick={handleIA}
              disabled={isGenerating || !promptIA}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isGenerating ? "Criando magia jornalística..." : "Gerar Notícia com IA"}
            </button>

            {/* Resultados Automáticos da IA */}
            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Título Gerado</label>
                <input 
                  type="text" 
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Título automático entrará aqui"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 font-bold text-zinc-800"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Subtítulo (Linha Fina)</label>
                <input 
                  type="text" 
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Subtítulo entrará aqui"
                  className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Conteúdo da Matéria</label>
                <textarea 
                  rows={8}
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="O texto completo será preenchido nesta área..."
                  className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-3 text-sm text-zinc-700 resize-none"
                />
              </div>

              <button 
                onClick={publishNews}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Send size={18} />
                Publicar Notícia Oficialmente
              </button>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
