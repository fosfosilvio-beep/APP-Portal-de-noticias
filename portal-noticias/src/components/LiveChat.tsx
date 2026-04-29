"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Send, LogOut, MessageSquare } from "lucide-react";
import AuthModal from "./AuthModal";

interface Profile {
  id: string;
  nome_completo: string | null;
  avatar_url: string | null;
}

interface ChatMessage {
  id: string;
  profile_id: string;
  conteudo: string;
  created_at: string;
  is_admin_msg: boolean;
  profiles?: Profile;
}

interface LiveChatProps {
  liveUrl?: string | null;
}

export default function LiveChat({ liveUrl }: LiveChatProps) {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Lógica de Detecção de Plataforma ---
  const isYouTube = liveUrl?.includes("youtube.com") || liveUrl?.includes("youtu.be");
  const isFacebook = liveUrl?.includes("facebook.com") || liveUrl?.includes("fb.watch");
  
  let youtubeChatUrl = "";

  if (isYouTube && liveUrl) {
    let videoId = "";
    try {
      if (liveUrl.includes("v=")) {
        videoId = new URL(liveUrl).searchParams.get("v") || "";
      } else if (liveUrl.includes("youtu.be/")) {
        videoId = liveUrl.split("youtu.be/")[1]?.split("?")[0];
      } else if (liveUrl.includes("/live/")) {
        videoId = liveUrl.split("/live/")[1]?.split("?")[0];
      }
    } catch (e) {
      console.warn("Erro ao extrair ID do vídeo para o chat:", e);
    }
    
    if (videoId) {
      const domain = typeof window !== "undefined" ? window.location.hostname : "nossawebtv.com.br";
      youtubeChatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${domain}`;
    }
  }

  // Se for YouTube e tivermos a URL, usamos o chat do YT. 
  // Se for Facebook ou qualquer outra coisa, usamos o Chat Nativo (Fallback Inteligente).
  const useNativeChat = !isYouTube || !youtubeChatUrl;

  // Busca sessão atual
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca msgs históricas e inscreve Realtime (Apenas se FOR chat nativo)
  useEffect(() => {
    if (!useNativeChat) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("live_messages")
        .select(`
          id, conteudo, created_at, is_admin_msg, profile_id,
          profiles (id, nome_completo, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) {
        const formattedMessages = data.map((msg: any) => ({
          ...msg,
          profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles
        })) as ChatMessage[];
        
        setMessages(formattedMessages.reverse());
      }
    };

    fetchMessages();

    // --- Configuração do Canal de Mensagens (Realtime v2) ---
    // Usamos um nome de canal dinâmico para evitar colisões no Hot Reload
    const channelId = `chat-${Math.random().toString(36).substring(7)}`;
    const chatChannel = supabase.channel(channelId);

    chatChannel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages" },
        async (payload: any) => {
          if (!payload.new) return;
          
          // Buscar dados do perfil para a mensagem recebida em tempo real
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, nome_completo, avatar_url")
            .eq("id", payload.new.profile_id)
            .maybeSingle();
            
          const incomingMsg: ChatMessage = {
            id: payload.new.id,
            profile_id: payload.new.profile_id,
            conteudo: payload.new.conteudo,
            created_at: payload.new.created_at,
            is_admin_msg: payload.new.is_admin_msg,
            profiles: profileData || undefined
          };

          setMessages(prev => {
            if (prev.some(m => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.log("[LiveChat] Realtime Ativo:", channelId);
        }
      });

    return () => {
      supabase.removeChannel(chatChannel);
    };
  }, [useNativeChat]);

  // Rolagem Auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    const client = supabase;
    if (client) await client.auth.signOut();
  };

  // --- Lógica de Permissão de Comentário (Qualquer Autenticado) ---
  const isAuthorized = !!session;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = supabase;
    if (!client || !session?.user) {
      console.warn("[LiveChat] Tentativa de envio sem sessão ativa.");
      return;
    }
    
    const text = newMessage.trim();
    if (!text) return;

    try {
      console.log("[LiveChat] Iniciando envio da mensagem...");
      
      const payload = { 
        profile_id: session.user.id, 
        conteudo: text 
      };

      console.log("[LiveChat] Payload:", payload);

      const { data, error } = await client
        .from("live_messages")
        .insert([payload])
        .select(`
          id, conteudo, created_at, is_admin_msg, profile_id,
          profiles (id, nome_completo, avatar_url)
        `)
        .single();

      if (error) {
        console.error("[LiveChat] ERRO NO INSERT:", error);
        console.error("[LiveChat] Detalhes do Erro Supabase:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log("[LiveChat] Sucesso! Mensagem retornada:", data);
      
      if (data) {
        setMessages(prev => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data as ChatMessage];
        });
      }

      setNewMessage("");
    } catch (err: any) {
      console.error("[LiveChat] FAIHA CRÍTICA NO FRONTEND:", err.message);
      alert(`Erro ao enviar: ${err.message}`);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    const client = supabase;
    if (!client) return;
    
    try {
      console.log(`[LiveChat] Disparando OAuth para ${provider}...`);
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.href // Usando href exato para evitar loop de recarregamento
        }
      });
      
      if (error) throw error;
    } catch (err: any) {
      console.error("[LiveChat] Erro ao iniciar login OAuth:", err.message);
    }
  };

  // --- RENDER YOUTUBE CHAT ---
  if (!useNativeChat && youtubeChatUrl) {
    return (
      <div className="w-full h-full min-h-[400px] lg:h-full flex flex-col bg-black rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        <div className="bg-zinc-900 py-3 px-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            Chat do YouTube
          </h3>
        </div>
        <iframe 
          src={youtubeChatUrl}
          className="w-full h-full flex-1 border-0"
          title="YouTube Live Chat"
        />
      </div>
    );
  }

  // --- RENDER NATIVE CHAT (Fallback para Facebook e outros) ---
  return (
    <div className="w-full h-full min-h-[400px] lg:h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl font-sans">
      {/* HEADER */}
      <div className="bg-slate-50 py-3 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 font-black text-xs tracking-widest uppercase flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          Chat {isFacebook ? "Nativo" : "ao Vivo"}
        </h3>
        <div className="flex items-center gap-3">
          {isFacebook && (
            <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
              FB Fallback
            </span>
          )}
          {session ? (
             <button type="button" onClick={handleLogout} className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-red-500 font-black uppercase transition-colors">
                <LogOut size={10} /> Sair
             </button>
          ) : null}
        </div>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <MessageSquare size={24} className="mb-2 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Inicie a conversa</p>
           </div>
        )}
        {messages.map((msg) => {
          const isMe = session?.user?.id === msg.profile_id;
          const userAvatar = msg.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.profiles?.nome_completo || 'User')}&background=random`;
          
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] ${isMe ? 'ml-auto' : ''}`}>
              <div className={`flex items-center gap-2 mb-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                <img 
                  src={userAvatar} 
                  alt="" 
                  className="w-5 h-5 rounded-full object-cover border border-slate-200 shadow-sm" 
                />
                <span className="text-[10px] font-black uppercase text-slate-900 tracking-tight">
                   {isMe ? 'Você' : (msg.profiles?.nome_completo || 'Espectador')}
                </span>
              </div>
              <div className={`px-3 py-2.5 rounded-2xl text-xs shadow-sm border ${isMe ? 'bg-blue-600 text-white rounded-tr-none border-blue-700' : 'bg-white text-slate-700 rounded-tl-none border-slate-100'}`}>
                {msg.conteudo}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white border-t border-slate-100 p-4 shrink-0">
         {!isAuthorized ? (
           <div className="flex flex-col gap-3">
             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest text-center mb-1">
               Faça login com Google ou Facebook para comentar
             </p>
             <div className="flex gap-2">
               <button 
                 type="button"
                 onClick={() => handleOAuthLogin('google')}
                 className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-tighter"
               >
                 <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 Google
               </button>
               <button 
                 type="button"
                 onClick={() => handleOAuthLogin('facebook')}
                 className="flex-1 py-2 px-3 rounded-xl bg-[#1877F2] text-white font-bold hover:bg-[#1865D6] transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-tighter"
               >
                 <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                 Facebook
               </button>
             </div>
           </div>
         ) : (
           <form onSubmit={handleSendMessage} className="flex items-center gap-2">
             <input 
               type="text" 
               placeholder="Comentar..."
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-all"
               maxLength={250}
             />
             <button 
               type="submit" 
               disabled={!newMessage.trim()}
               className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md active:scale-95"
             >
               <Send size={16} />
             </button>
           </form>
         )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
