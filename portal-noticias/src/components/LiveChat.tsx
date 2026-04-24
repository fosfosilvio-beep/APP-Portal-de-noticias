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

  // --- Lógica para YouTube Chat ---
  const isYouTube = liveUrl?.includes("youtube.com") || liveUrl?.includes("youtu.be");
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
      // O embed_domain deve ser o domínio onde o site está hospedado
      const domain = typeof window !== "undefined" ? window.location.hostname : "nossawebtv.com.br";
      youtubeChatUrl = `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${domain}`;
    }
  }

  // Busca sessão atual (apenas se não for YouTube chat ou para persistência)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca msgs históricas e inscreve Realtime (Apenas se NÃO for YouTube chat)
  useEffect(() => {
    if (isYouTube && youtubeChatUrl) return;

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

    const channel = supabase
      .channel("public:live_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages" },
        async (payload: any) => {
           const { data: profileData } = await supabase
             .from("profiles")
             .select("id, nome_completo, avatar_url")
             .eq("id", payload.new.profile_id)
             .single();
             
           const newMsg: ChatMessage = {
             id: payload.new.id,
             profile_id: payload.new.profile_id,
             conteudo: payload.new.conteudo,
             created_at: payload.new.created_at,
             is_admin_msg: payload.new.is_admin_msg,
             profiles: profileData || undefined
           };
           setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe((status: string, err?: Error) => {
        if (err) {
          console.error("LiveChat realtime subscription error:", err);
        }
      });

    return () => { supabase.removeChannel(channel) };
  }, [isYouTube, youtubeChatUrl]);

  // Rolagem Auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }
    
    const text = newMessage.trim();
    if (!text) return;

    setNewMessage("");
    await supabase.from("live_messages").insert([
      { profile_id: session.user.id, conteudo: text }
    ]);
  };

  const handleLogout = async () => {
     await supabase.auth.signOut();
  };

  // --- RENDER YOUTUBE CHAT ---
  if (isYouTube && youtubeChatUrl) {
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

  // --- RENDER NATIVE CHAT ---
  return (
    <div className="w-full h-full min-h-[400px] lg:h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl font-sans">
      {/* HEADER */}
      <div className="bg-slate-50 py-3 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 font-black text-xs tracking-widest uppercase flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          Chat ao Vivo
        </h3>
        {session ? (
           <button onClick={handleLogout} className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-red-500 font-black uppercase transition-colors">
              <LogOut size={10} /> Sair
           </button>
        ) : (
           <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:text-blue-600" onClick={() => setIsAuthModalOpen(true)}>
             Entrar
           </span>
        )}
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
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] ${isMe ? 'ml-auto' : ''}`}>
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {!isMe && (
                   <img src={msg.profiles?.avatar_url || "https://ui-avatars.com/api/?name=User"} alt="" className="w-4 h-4 rounded-full object-cover border border-slate-100" />
                )}
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tight">
                   {isMe ? 'Você' : (msg.profiles?.nome_completo || 'Espectador')}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-xl text-xs shadow-sm border ${isMe ? 'bg-blue-600 text-white rounded-br-none border-blue-700' : 'bg-white text-slate-700 rounded-bl-none border-slate-100'}`}>
                {msg.conteudo}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white border-t border-slate-100 p-3 shrink-0">
         {!session ? (
           <button 
             onClick={() => setIsAuthModalOpen(true)}
             className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 text-slate-400 font-bold hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
           >
              Faça login para participar
           </button>
         ) : (
           <form onSubmit={handleSendMessage} className="flex items-center gap-2">
             <input 
               type="text" 
               placeholder="Comentar..."
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 transition-all"
               maxLength={250}
             />
             <button 
               type="submit" 
               disabled={!newMessage.trim()}
               className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
             >
               <Send size={14} />
             </button>
           </form>
         )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
