"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "@/lib/toast";

export default function ChatModerator() {
  const [messages, setMessages] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();
  const supabase = createClient();

  useEffect(() => {
    // Carregar últimas 100 mensagens (aumentado de 40 para 100)
    const loadMessages = async () => {
      const { data } = await supabase
        .from("live_messages")
        .select(`*, profiles(nome_completo)`)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    
    loadMessages();

    // Auto-reconnect Realtime
    const channel = supabase
      .channel("chat_moderation")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages" },
        async (payload) => {
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("nome_completo")
            .eq("id", payload.new.user_id)
            .single();

          const newMsg = { ...payload.new, profiles: profile };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "live_messages" },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const limparChat = async () => {
    const ok = await confirm({
      title: "Limpar todo o chat?",
      description: "⚠️ Tem certeza que deseja apagar TODAS AS MENSAGENS da live atual? Isso não pode ser desfeito.",
      destructive: true,
      confirmLabel: "Apagar Tudo"
    });
    
    if (!ok) return;

    try {
      // Apagar tudo (neq 0 para bypass)
      await supabase.from("live_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      setMessages([]);
      toast.success("Chat limpo com sucesso.");
    } catch (err: any) {
      toast.error("Erro ao limpar chat", err.message);
    }
  };

  const deletarMensagem = async (id: string) => {
    const ok = await confirm({
      description: "Deseja apagar esta mensagem?",
      destructive: true,
    });
    if (!ok) return;

    try {
      await supabase.from("live_messages").delete().eq("id", id);
      toast.success("Mensagem apagada.");
    } catch (err: any) {
      toast.error("Erro ao apagar", err.message);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative h-[700px]">
      <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <h3 className="text-white font-black uppercase text-sm tracking-widest">Moderação Chat TV</h3>
        </div>
        <button
          onClick={limparChat}
          className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white font-bold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-red-600/20 hover:border-red-600"
        >
          <Trash2 size={14} /> Limpar Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest text-center px-4">
            Sistema Pronto.<br/>Aguardando mensagens...
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition flex gap-3 group">
            <div className="flex-1">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                {m.profiles?.nome_completo || "Anônimo"}
              </span>
              <p className="text-slate-300 text-sm mt-0.5 leading-snug">{m.conteudo}</p>
            </div>
            <button
              onClick={() => deletarMensagem(m.id)}
              className="text-slate-600 hover:text-red-500 self-start p-1 transition-colors opacity-0 group-hover:opacity-100"
              title="Apagar Mensagem"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}
