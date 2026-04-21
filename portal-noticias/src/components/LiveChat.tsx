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

  // Busca sessão atual
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca msgs históricas e inscreve Realtime
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("live_messages")
        .select(`
          id, conteudo, created_at, is_admin_msg, profile_id,
          profiles (id, nome_completo, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (data) setMessages(data.reverse() as ChatMessage[]);
    };

    fetchMessages();

    // Inscreve
    const channel = supabase
      .channel("public:live_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages" },
        async (payload) => {
           // Precisamos do profile no payload insert, faremos fetch adicional
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
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

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

  return (
    <div className="w-full h-full min-h-[480px] lg:h-[600px] flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xl font-sans">
      {/* HEADER */}
      <div className="bg-slate-50 py-4 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="text-slate-900 font-black text-sm tracking-wide flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          Chat ao Vivo
        </h3>
        {session ? (
           <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase transition-colors">
              <LogOut size={12} /> Sair
           </button>
        ) : (
           <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-cyan-600" onClick={() => setIsAuthModalOpen(true)}>
             Fazer Login
           </span>
        )}
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <MessageSquare size={32} className="mb-2 opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">Nenhuma mensagem ainda</p>
           </div>
        )}
        {messages.map((msg) => {
          const isMe = session?.user?.id === msg.profile_id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] ${isMe ? 'ml-auto' : ''}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isMe && (
                   <img src={msg.profiles?.avatar_url || "https://ui-avatars.com/api/?name=User"} alt="" className="w-5 h-5 rounded-full object-cover shadow-sm bg-slate-200 border border-slate-100" />
                )}
                <span className="text-[10px] font-bold text-slate-500">
                   {isMe ? 'Você' : (msg.profiles?.nome_completo || 'Espectador')}
                </span>
                {msg.is_admin_msg && (
                   <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider font-black">Admin</span>
                )}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm border ${isMe ? 'bg-[#00AEE0] text-white rounded-br-none border-[#009FD0]' : 'bg-white text-slate-700 rounded-bl-none border-slate-100'}`}>
                {msg.conteudo}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white border-t border-slate-100 p-4 shrink-0">
         {!session ? (
           <button 
             onClick={() => setIsAuthModalOpen(true)}
             className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:bg-slate-50 hover:text-cyan-600 hover:border-cyan-200 transition-all flex items-center justify-center gap-2 text-sm"
           >
              Acesse com o Google para participar
           </button>
         ) : (
           <form onSubmit={handleSendMessage} className="flex items-center gap-2">
             <input 
               type="text" 
               placeholder="Escreva sua mensagem..."
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
               maxLength={250}
             />
             <button 
               type="submit" 
               disabled={!newMessage.trim()}
               className="bg-[#00AEE0] text-white p-3 rounded-xl hover:bg-[#009FD0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
             >
               <Send size={18} />
             </button>
           </form>
         )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
