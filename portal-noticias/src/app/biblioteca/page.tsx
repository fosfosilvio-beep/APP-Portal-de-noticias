"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import Header from "../../components/Header";
import SmartPlayer from "../../components/SmartPlayer";
import { 
  Video, Play, Calendar, User, Clock, 
  ChevronRight, Mic2, LayoutGrid, Info,
  MessageSquare, Heart, ThumbsUp, Flame, Send, Smile,
  Share2, Link as LinkIcon, Check
} from "lucide-react";
import Footer from "../../components/Footer";

interface Podcast {
  id: string;
  nome: string;
  apresentador_nome: string;
  apresentador_foto_url: string;
  horario_exibicao: string;
  descricao: string;
}

interface Episodio {
  id: string;
  titulo: string;
  video_url: string;
  thumbnail_url: string;
  data_publicacao: string;
  start_time: number;
  end_time: number | null;
  convidados?: string;
  view_count: number;
}

export default function BibliotecaPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodios, setEpisodios] = useState<Episodio[]>([]);
  const [selectedEpisodio, setSelectedEpisodio] = useState<Episodio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);
  
  // Engagement States
  const [comments, setComments] = useState<any[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [initialEpId, setInitialEpId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ep = params.get('ep');
    if (ep) setInitialEpId(ep);
    fetchInitialData(ep);
  }, []);

  useEffect(() => {
    if (selectedPodcast) {
      fetchEpisodios(selectedPodcast.id);
    }
  }, [selectedPodcast]);

  useEffect(() => {
    if (selectedEpisodio) {
      fetchEngagement(selectedEpisodio.id);
    }
  }, [selectedEpisodio]);

  const fetchInitialData = async (epIdUrl?: string | null) => {
    setLoading(true);
    try {
      // Config do Portal (para o Header e Live status)
      const { data: configData } = await supabase.from("configuracao_portal").select("*").single();
      if (configData) setConfig(configData);

      // Podcasts
      const { data: podcastData } = await supabase
        .from("podcasts")
        .select("*")
        .order("nome");
      
      if (podcastData && podcastData.length > 0) {
        setPodcasts(podcastData);

        if (epIdUrl) {
          const { data: epData } = await supabase.from('episodios').select('*').eq('id', epIdUrl).single();
          if (epData) {
            const matchingPod = podcastData.find((p: Podcast) => p.id === epData.podcast_id);
            setSelectedPodcast(matchingPod || podcastData[0]);
            return; // Effect on selectedPodcast vai disparar o fetchEpisodios
          }
        }

        setSelectedPodcast(podcastData[0]); // Seleciona o primeiro por padrão
      }
    } catch (err) {
      console.error("Erro ao carregar podcasts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodios = async (podcastId: string) => {
    setSelectedEpisodio(null); // Limpa o episódio anterior imediatamente
    setEpisodios([]); // Limpa a lista anterior imediatamente
    try {
      const { data } = await supabase
        .from("episodios")
        .select("*, podcasts(*)")
        .eq("podcast_id", podcastId)
        .order("data_publicacao", { ascending: false });
      
      setEpisodios(data || []);
      if (data && data.length > 0) {
        // Se temos um initialEpId via URL, tenta selecioná-lo
        let targetEp = data[0];
        if (initialEpId) {
           const found = data.find((ep: any) => ep.id === initialEpId);
           if (found) targetEp = found;
           setInitialEpId(null); // Limpa para os próximos cliques
        }

        setSelectedEpisodio(targetEp);
        incrementViews(targetEp.id);
      } else {
        setSelectedEpisodio(null);
      }
    } catch (err) {
      console.error("Erro ao carregar episódios:", err);
    }
  };

  const incrementViews = async (episodeId: string) => {
    try {
      await supabase.rpc('increment_view_count', { target_id: episodeId });
    } catch (err) {
      console.error("Erro ao incrementar views:", err);
    }
  };

  const fetchEngagement = async (episodeId: string) => {
    // Busca Comentários
    const { data: comms } = await supabase
      .from("comentarios_podcast")
      .select("*")
      .eq("episodio_id", episodeId)
      .order("created_at", { ascending: false });
    setComments(comms || []);

    // Busca Reações Globais
    const { data: reacts } = await supabase
      .from("episodio_reacoes")
      .select("emoji, count")
      .eq("episodio_id", episodeId);
    
    const reactMap: Record<string, number> = {};
    reacts?.forEach((r: any) => { reactMap[r.emoji] = r.count; });
    setReactions(reactMap);
  };

  const handleSendComment = async () => {
    if (!selectedEpisodio || !newComment.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("comentarios_podcast").insert({
      episodio_id: selectedEpisodio.id,
      mensagem: newComment
    });
    if (!error) {
       setNewComment("");
       fetchEngagement(selectedEpisodio.id);
    }
    setSubmitting(false);
  };

  const handleReaction = async (emoji: string) => {
    if (!selectedEpisodio) return;
    // Update local UI for instant feedback
    setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    // Update DB via RPC
    await supabase.rpc('increment_reaction_count', { 
      target_id: selectedEpisodio.id, 
      emoji_val: emoji 
    });
  };

  const handleShare = (platform: string) => {
    if (!selectedEpisodio) return;
    const url = `${window.location.origin}/biblioteca?ep=${selectedEpisodio.id}`;
    const text = encodeURIComponent(`Confira este episódio: ${selectedEpisodio.titulo}`);
    
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text} ${url}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredEpisodios = episodios.filter(ep => {
    const term = searchTerm.toLowerCase();
    return (
      ep.titulo.toLowerCase().includes(term) ||
      (ep.convidados?.toLowerCase().includes(term)) ||
      new Date(ep.data_publicacao).toLocaleDateString().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Header 
        isLive={config?.is_live || false} 
        config={config} 
        categoriaAtiva="Biblioteca"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${config?.ui_settings?.primary_color || '#00AEE0'};
        }
        .text-primary { color: var(--primary-color); }
        .bg-primary { background-color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
      `}} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        
        {/* TITULO E MENU DE PODCASTS */}
        <section className="mb-10 md:mb-12 space-y-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-6">
              <div className="max-w-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter flex flex-wrap items-center gap-2 sm:gap-3">
                  <Mic2 size={32} className="text-blue-500 shrink-0" /> 
                  <span>Biblioteca</span> 
                  <span className="text-zinc-600">On-Demand</span>
                </h1>
                <p className="text-zinc-500 font-bold mt-2 uppercase text-[10px] tracking-widest leading-relaxed">
                  Assista a todos os podcasts e podcasts do portal
                </p>
              </div>
              
              {/* Menu Horizontal de Podcasts */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                {podcasts.map((pod) => (
                  <button
                    key={pod.id}
                    onClick={() => setSelectedPodcast(pod)}
                    className={`flex flex-col items-center gap-3 shrink-0 group transition-all ${
                      selectedPodcast?.id === pod.id ? "opacity-100" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 transition-all ${
                       selectedPodcast?.id === pod.id ? "border-blue-600 shadow-[0_0_15px_#2563eb66]" : "border-zinc-800"
                    }`}>
                       <img 
                         src={pod.apresentador_foto_url || "https://ui-avatars.com/api/?name=" + pod.nome} 
                         className="w-full h-full object-cover transition-transform group-hover:scale-110"
                         alt={pod.nome}
                       />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest text-center max-w-[100px] truncate ${
                      selectedPodcast?.id === pod.id ? "text-blue-500" : "text-zinc-500"
                    }`}>
                      {pod.nome}
                    </span>
                  </button>
                ))}
              </div>
           </div>
        </section>

        {loading ? (
           <div className="h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
           </div>
        ) : !selectedPodcast ? (
          <div className="py-20 text-center bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
             <Info size={48} className="mx-auto text-zinc-700 mb-4" />
             <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhum podrama cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             
             {/* BARRA DE PESQUISA INTERATIVA */}
             <div className="relative max-w-2xl mx-auto -mt-6 z-20 px-2">
                <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
                   <LayoutGrid className="text-zinc-500" size={18} />
                </div>
                <input 
                  type="search" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar..." 
                  className="w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-2xl"
                />
             </div>
             
             {/* PAINEL DO PODCAST (PLAYER + APRESENTADOR) */}
             <div className="flex flex-col lg:flex-row gap-8 bg-zinc-900/40 p-4 sm:p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 shadow-2xl">
                
                {/* Lado Esquerdo: Player Principal e Share */}
                 <div className="flex-1 min-w-0 flex flex-col gap-4">
                    <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
                      {selectedEpisodio ? (
                        <SmartPlayer 
                          key={selectedEpisodio.id}
                          customVideoUrl={selectedEpisodio.video_url} 
                          startTime={selectedEpisodio.start_time} 
                          endTime={selectedEpisodio.end_time || undefined} 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 p-6 text-center">
                           <Video size={48} className="mb-4 opacity-20" />
                           <p className="font-bold uppercase tracking-widest text-[10px]">Nenhum episódio disponível para este programa</p>
                        </div>
                      )}
                    </div>

                    {/* SOCIAL SHARE MODULE */}
                    {selectedEpisodio && (
                      <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-[24px] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div>
                            <h3 className="font-black text-white text-lg sm:text-xl line-clamp-1">{selectedEpisodio.titulo}</h3>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                               Publicado em {new Date(selectedEpisodio.data_publicacao).toLocaleDateString('pt-BR')}
                            </p>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-500 flex items-center justify-center transition-colors" title="WhatsApp">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </button>
                            <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 flex items-center justify-center transition-colors" title="Facebook">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </button>
                            <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors" title="X (Twitter)">
                               <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </button>
                            <button onClick={() => handleShare('copy')} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors relative" title="Copiar Link">
                               {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
                               {copied && (
                                 <span className="absolute -top-10 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in">
                                   Copiado!
                                 </span>
                               )}
                            </button>
                         </div>
                      </div>
                    )}
                 </div>

                {/* Lado Direito: Info do Apresentador */}
                <div className="w-full lg:w-[350px] flex flex-col justify-center gap-6">
                   <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img 
                          src={selectedPodcast.apresentador_foto_url || "https://ui-avatars.com/api/?name=" + selectedPodcast.apresentador_nome + "&background=1e293b&color=fff&size=200"} 
                          alt={selectedPodcast.apresentador_nome}
                          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-zinc-900 shadow-2xl"
                        />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white">{selectedPodcast.apresentador_nome}</h2>
                        <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mt-1">Apresentador(a)</p>
                      </div>
                      {selectedEpisodio?.convidados && (
                        <div className="bg-blue-600/10 border border-blue-600/20 px-4 py-2 rounded-xl">
                          <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">Convidados Hoje:</p>
                          <p className="text-xs font-bold text-white">{selectedEpisodio.convidados}</p>
                        </div>
                      )}
                      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-zinc-800/50">
                         <div className="bg-zinc-800/50 p-2 sm:p-3 rounded-2xl flex flex-col justify-center items-center">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block">Episódios</span>
                            <span className="text-base sm:text-lg font-black">{episodios.length}</span>
                         </div>
                         <div className="bg-zinc-800/50 p-2 sm:p-3 rounded-2xl flex flex-col justify-center items-center">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block">Horário</span>
                            <span className="text-[9px] sm:text-[10px] font-black truncate max-w-full">{selectedPodcast.horario_exibicao || "A definir"}</span>
                         </div>
                         <div className="bg-zinc-800/50 p-2 sm:p-3 rounded-2xl border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.1)] flex flex-col justify-center items-center col-span-2 sm:col-span-1">
                            <span className="text-[7px] font-black text-blue-500 uppercase block">Views</span>
                            <span className="text-base sm:text-lg font-black text-white">{selectedEpisodio?.view_count || 0}</span>
                         </div>
                      </div>
                      <p className="text-zinc-400 text-sm mt-4 italic line-clamp-2">
                        "{selectedPodcast.descricao || "Acompanhe as principais pautas e entrevistas exclusivas em nosso podcast oficial."}"
                      </p>
                   </div>
                </div>
             </div>

             {/* SEÇÃO DE ENGAJAMENTO (COMENTÁRIOS E REAÇÕES) */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-700">
                
                {/* Lado A: Reações e Novo Comentário */}
                <div className="bg-zinc-900/60 p-6 md:p-8 rounded-[32px] border border-white/5 space-y-6">
                   <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                         <MessageSquare size={16} /> O que você achou?
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-0">
                         {["👍", "❤️", "🔥", "👏", " 😂"].map(emoji => (
                            <button 
                               key={emoji}
                               onClick={() => handleReaction(emoji)}
                               className="group relative bg-zinc-800/50 hover:bg-blue-600 transition-all px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 shrink-0"
                            >
                               <span className="text-lg">{emoji}</span>
                               <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white">{reactions[emoji] || 0}</span>
                            </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <textarea 
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         placeholder="Escreva sua opinião para o apresentador..."
                         className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-4 text-sm font-medium text-zinc-300 outline-none focus:border-blue-500/30 transition-all h-28 resize-none"
                      />
                      <button 
                         onClick={handleSendComment}
                         disabled={submitting}
                         className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white font-black text-xs py-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                         {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <><Send size={14} /> Enviar Mensagem</>}
                      </button>
                   </div>
                </div>

                {/* Lado B: Feed de Comentários */}
                <div className="bg-zinc-900/30 p-6 md:p-8 rounded-[32px] border border-white/5 flex flex-col h-[340px]">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                      <Smile size={14} /> Mensagens Recentes ({comments.length})
                   </h4>
                   
                   <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide no-scrollbar">
                      {comments.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                            <MessageSquare size={32} className="mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Ainda não há comentários.</p>
                         </div>
                      ) : (
                         comments.map(c => (
                            <div key={c.id} className="bg-zinc-950/50 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-right-4">
                               <div className="flex items-center justify-between mb-2">
                                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Internauta Anônimo</span>
                                  <span className="text-[8px] font-bold text-zinc-600">{new Date(c.created_at).toLocaleTimeString()}</span>
                               </div>
                               <p className="text-xs text-zinc-400 leading-relaxed font-medium">{c.mensagem}</p>
                            </div>
                         ))
                      )}
                   </div>
                </div>
             </div>

             {/* GRID DE EPISÓDIOS (FILTRADO) */}
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <LayoutGrid size={20} className="text-zinc-400" /> Episódios Disponíveis
                   </h3>
                </div>

                {episodios.length === 0 ? (
                  <div className="p-12 text-center text-zinc-600 font-bold uppercase text-xs tracking-widest border border-dashed border-zinc-800 rounded-3xl">
                    Aguardando upload de episódios...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEpisodios.slice(0, 6).map((ep) => (
                      <div 
                        key={ep.id}
                        onClick={() => {
                          setSelectedEpisodio(ep);
                          incrementViews(ep.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`group relative bg-zinc-900 border transition-all duration-300 rounded-3xl overflow-hidden cursor-pointer hover:scale-[1.02] ${
                          selectedEpisodio?.id === ep.id ? "border-blue-500 ring-4 ring-blue-500/10" : "border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                         <div className="aspect-video relative overflow-hidden bg-zinc-800">
                           <img 
                              src={ep.thumbnail_url || "https://picsum.photos/seed/" + ep.id + "/800/450"} 
                              alt={ep.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                               <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                  <Play fill="currentColor" size={20} />
                               </div>
                            </div>
                             <div className="absolute bottom-3 left-3 bg-blue-600 backdrop-blur-md text-[9px] font-black uppercase text-white px-2 py-1 rounded-md border border-white/10 flex items-center gap-1">
                                <Video size={10} /> 👁️ {ep.view_count || 0}
                             </div>
                             <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase text-white px-2 py-1 rounded-md border border-white/10">
                                HD 1080p
                             </div>
                         </div>
                         <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                               <Calendar size={12} className="text-zinc-500" />
                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                  {new Date(ep.data_publicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                               </span>
                            </div>
                            <h4 className="font-black text-white leading-tight group-hover:text-blue-400 transition-colors">
                               {ep.titulo}
                            </h4>
                         </div>
                      </div>
                    ))}
                  </div>
                )}

                {episodios.length > 6 && (
                   <div className="pt-8 flex justify-center">
                      <button className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 transition-all">
                        Ver todo o histórico <ChevronRight size={14} />
                      </button>
                   </div>
                )}
             </section>

          </div>
        )}

      </main>
      
      <Footer config={config} />
    </div>
  );
}
