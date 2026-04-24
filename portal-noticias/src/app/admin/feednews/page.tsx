"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Rss, Plus, Trash2, RefreshCw, CheckCircle2, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function FeedNewsPage() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFeed, setNewFeed] = useState({ nome: "", url: "", categoria_padrao: "Geral" });

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("rss_feeds").select("*").order("created_at", { ascending: false });
    if (!error && data) setFeeds(data);
    setLoading(false);
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeed.nome || !newFeed.url) {
      toast.error("Preencha nome e URL do Feed.");
      return;
    }
    
    const { error } = await supabase.from("rss_feeds").insert([newFeed]);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Feed cadastrado com sucesso!");
      setShowModal(false);
      setNewFeed({ nome: "", url: "", categoria_padrao: "Geral" });
      fetchFeeds();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este Feed RSS?")) return;
    const { error } = await supabase.from("rss_feeds").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Feed excluído.");
      fetchFeeds();
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    toast.info("Iniciando sincronização dos Feeds...");
    try {
      const res = await fetch("/api/cron/fetch-rss", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Sincronização concluída! ${data.importedCount || 0} novas matérias importadas como rascunho.`);
        fetchFeeds(); // Atualiza a data de última sincronização
      } else {
        throw new Error(data.error || "Erro desconhecido ao sincronizar.");
      }
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
          {/* TOPO DA PÁGINA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner border border-orange-100/50">
                <Rss size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciador FeedNews</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  Adicione URLs de Feeds RSS (G1, Agências) para importar matérias automaticamente.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSyncAll}
                disabled={isSyncing || feeds.length === 0}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all"
              >
                <Plus size={18} />
                Novo Feed
              </button>
            </div>
          </div>

          {/* LISTA DE FEEDS */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : feeds.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 border-dashed">
              <Globe className="mx-auto text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-black text-slate-700 mb-2">Nenhum Feed Cadastrado</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Adicione seu primeiro Feed RSS para que o portal comece a buscar notícias automaticamente no modo piloto automático.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feeds.map((feed) => (
                <div key={feed.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-[50px] -z-10 group-hover:bg-orange-100 transition-colors"></div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Rss size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 line-clamp-1">{feed.nome}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Cat: {feed.categoria_padrao}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(feed.id)}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-slate-500 font-mono truncate">{feed.url}</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={14} />
                      {feed.last_fetched ? (
                        <span>Última vez: {new Date(feed.last_fetched).toLocaleString('pt-BR')}</span>
                      ) : (
                        <span>Nunca sincronizado</span>
                      )}
                    </div>
                    {feed.status === 'active' && <CheckCircle2 size={16} className="text-emerald-500" />}
                  </div>
                </div>
              ))}
            </div>
          )}
      {/* MODAL NOVO FEED */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">Novo Feed RSS</h2>
              <p className="text-slate-500 text-sm mt-1">Configure um novo fornecedor de notícias.</p>
            </div>
            
            <form onSubmit={handleAddFeed} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Fornecedor</label>
                <input 
                  type="text" 
                  value={newFeed.nome}
                  onChange={e => setNewFeed({...newFeed, nome: e.target.value})}
                  placeholder="Ex: G1 Brasil, UOL Política..."
                  className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-slate-50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">URL do Feed (XML)</label>
                <input 
                  type="url" 
                  value={newFeed.url}
                  onChange={e => setNewFeed({...newFeed, url: e.target.value})}
                  placeholder="https://g1.globo.com/rss/g1/"
                  className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria Padrão</label>
                <input 
                  type="text" 
                  value={newFeed.categoria_padrao}
                  onChange={e => setNewFeed({...newFeed, categoria_padrao: e.target.value})}
                  placeholder="Ex: Brasil, Política, Mundo"
                  className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all bg-slate-50"
                  required
                />
              </div>
              
              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm"
                >
                  Salvar Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
