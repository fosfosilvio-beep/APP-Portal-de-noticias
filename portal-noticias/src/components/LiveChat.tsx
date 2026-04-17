"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Send, Heart, Flame, ThumbsUp, Laugh } from "lucide-react";

interface Mensagem {
  id: string;
  nome_usuario: string;
  mensagem: string;
  cor_nome: string;
  created_at: string;
}

interface Reacao {
  id: string;
  tipo_emoji: string;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  left: number;
  duration: number;
}

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];

export default function LiveChat() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [nome, setNome] = useState("");
  const [corNome, setCorNome] = useState(COLORS[0]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(false);
  
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    // Restaurar preferência do Local Storage
    const savedName = localStorage.getItem("@portal_chat_nome");
    const savedColor = localStorage.getItem("@portal_chat_cor");
    
    if (savedName) setNome(savedName);
    if (savedColor) setCorNome(savedColor);
    else setCorNome(COLORS[Math.floor(Math.random() * COLORS.length)]);

    // Carregar últimas 50 conexões limitadas
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('live_mensagens')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (data) {
        setMensagens(data.reverse()); // Reverse para ordem cronológica visual
      }
    };
    
    fetchHistory();

    // Inscrição para MENSAGENS Realtime
    const msgChannel = supabase.channel('mensagens_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_mensagens' }, (payload) => {
        const newMessage = payload.new as Mensagem;
        setMensagens((prev) => {
          const novasList = [...prev, newMessage];
          return novasList.slice(-50); // Mantém somente as ultimas 50 na tela
        });
      })
      .subscribe();
      
    // Inscrição para REAÇÕES Realtime
    const reactChannel = supabase.channel('reacoes_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_reacoes' }, (payload) => {
        const novaReacao = payload.new as Reacao;
        dispararEmojiVisual(novaReacao.tipo_emoji);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(reactChannel);
    };
  }, []);

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const dispararEmojiVisual = (emoji: string) => {
    const freshId = Math.random().toString(36).substr(2, 9);
    const newEmoji: FloatingEmoji = {
      id: freshId,
      emoji: emoji,
      left: Math.random() * 80 + 10, // pos random no eixo x
      duration: Math.random() * 2 + 2, // temp random entre 2 a 4 segundos
    };
    
    setFloatingEmojis(prev => [...prev, newEmoji]);
    
    // Cleanup apos a animação
    setTimeout(() => {
      setFloatingEmojis(current => current.filter(e => e.id !== freshId));
    }, newEmoji.duration * 1000);
  };

  const handleSendReacao = async (emoji: string) => {
    // Dispara localmente para UX imediata (Optimistic)
    dispararEmojiVisual(emoji);
    
    // Manda pro Supabase pro resto da galera ver
    await supabase.from('live_reacoes').insert([
      { tipo_emoji: emoji }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !novaMensagem.trim()) return;

    setLoadingMsg(true);
    
    // Salva o nome se for novo para uso posterior
    localStorage.setItem("@portal_chat_nome", nome);
    localStorage.setItem("@portal_chat_cor", corNome);

    const pack = {
      nome_usuario: nome.trim(),
      mensagem: novaMensagem.trim(),
      cor_nome: corNome
    };

    setNovaMensagem(""); // Limpa o input instântaneamente

    await supabase.from('live_mensagens').insert([pack]);
    
    setLoadingMsg(false);
  };

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-[#0f172a] rounded-2xl shadow-xl overflow-hidden border border-[#1e293b] font-sans relative">
      
      {/* Container de partículas de reações */}
      <div className="absolute bottom-16 left-0 w-full h-[60%] pointer-events-none z-0 overflow-hidden">
        {floatingEmojis.map(floater => (
          <div 
            key={floater.id}
            className="absolute bottom-0 text-3xl opacity-0 animate-[floatUp_linear_forwards]"
            style={{ 
              left: `${floater.left}%`, 
              animationDuration: `${floater.duration}s` 
            }}
          >
            {floater.emoji}
          </div>
        ))}
      </div>

      {/* Header do Chat */}
      <div className="bg-[#1e293b] py-3 px-5 border-b border-slate-700/50 flex justify-between items-center z-10 shrink-0">
        <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Chat ao Vivo
        </h3>
        <span className="text-slate-400 text-xs">Comunidade Global</span>
      </div>

      {/* Área de Mensagens (Scrollable) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent z-10"
      >
        {mensagens.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium">
            Seja o primeiro a enviar uma mensagem!
          </div>
        ) : (
          mensagens.map((msg, idx) => (
            <div key={msg.id || idx} className="text-sm leading-relaxed backdrop-blur-sm bg-black/10 p-2.5 rounded-lg border border-white/5 break-words">
              <span className="font-bold flex items-center gap-1.5 mb-0.5" style={{ color: msg.cor_nome }}>
                {msg.nome_usuario}
              </span>
              <span className="text-slate-300 relative z-10">{msg.mensagem}</span>
            </div>
          ))
        )}
      </div>

      {/* Barra de Reações Rápidas */}
      <div className="bg-[#1e293b]/80 px-2 py-2 flex justify-center gap-4 z-10 border-t border-slate-700/30">
        <button onClick={() => handleSendReacao('❤️')} className="hover:scale-125 transition-transform text-xl" title="Amei">❤️</button>
        <button onClick={() => handleSendReacao('🔥')} className="hover:scale-125 transition-transform text-xl" title="Fogo">🔥</button>
        <button onClick={() => handleSendReacao('👏')} className="hover:scale-125 transition-transform text-xl" title="Palmas">👏</button>
        <button onClick={() => handleSendReacao('😂')} className="hover:scale-125 transition-transform text-xl" title="Haha">😂</button>
      </div>

      {/* Formulário Input */}
      <div className="bg-[#152033] p-4 border-t border-slate-700/50 z-10 shrink-0 flex flex-col gap-3">
        {/* Identificação Simples do Usuário */}
        <div className="flex bg-[#0f172a] rounded-lg border border-slate-700/50 overflow-hidden px-3 py-1 items-center">
            <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest mr-2 shrink-0">Seu Nome:</span>
            <input 
              type="text" 
              maxLength={20}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Visitante..."
              className="bg-transparent border-none outline-none text-white text-xs w-full font-bold placeholder-slate-600"
            />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            disabled={loadingMsg}
            placeholder={nome ? "Digite algo..." : "Preencha o nome acima"}
            className="flex-1 bg-[#1e293b] text-white border border-[#334155] rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-500"
            autoComplete="off"
            maxLength={150}
          />
          <button 
            type="submit" 
            disabled={!novaMensagem.trim() || !nome.trim() || loadingMsg}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:bg-slate-700 text-white rounded-xl px-4 flex items-center justify-center transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}
