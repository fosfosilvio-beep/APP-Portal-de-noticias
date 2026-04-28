"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Code2, 
  MessageSquare,
  ChevronRight,
  Database,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { usePathname } from "next/navigation";
import portalManifest from "@/lib/portal-manifest.json";
import { createClient } from "@/lib/supabase-browser";
import { AI_KNOWLEDGE } from "@/lib/ai-knowledge";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAgent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o Engenheiro Chefe da Nossa Web TV. O sistema está 100% mapeado. Como posso ajudar na evolução do portal hoje?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // 1. Log da interação no Supabase
  const logInteraction = async (pergunta: string, resposta: string) => {
    try {
      const supabase = createClient();
      await supabase.from("logs_agente").insert({
        rota: pathname,
        pergunta,
        resposta,
        metadata: {
          manifest_version: portalManifest.version
        }
      });
    } catch (err) {
      console.error("Erro ao logar interação do agente:", err);
    }
  };

  // 2. Gerar Prompt para o Antigravity
  const generateAntigravityPrompt = (msgContent: string) => {
    const isAds = pathname.includes("publicidade");
    const module = isAds ? "Publicidade" : "Geral";
    const tables = isAds ? AI_KNOWLEDGE.modules.publicidade.tables.join(", ") : "Diversas";

    const prompt = "```markdown\n" +
                   `[ANTIGRAVITY COMMAND]\n` +
                   `CONTEXTO: ${module} (Rota: ${pathname})\n` +
                   `SOLICITAÇÃO: ${msgContent}\n` +
                   `ESTRUTURA: Next.js + Supabase (${tables})\n` +
                   `AÇÃO: Implementar/Corrigir seguindo as diretrizes de modularidade.\n` +
                   "```";
    
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt técnico copiado!");
  };

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setQuery("");
    setIsTyping(true);

    try {
      const supabase = createClient();
      
      // Chamada real para a Edge Function
      const { data, error } = await supabase.functions.invoke("portal-copilot", {
        body: { 
          query: userMessage, 
          route: pathname,
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
        }
      });

      if (error) throw error;

      const aiResponse = data.text || "Desculpe, tive um problema técnico ao processar sua solicitação.";
      
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      await logInteraction(userMessage, aiResponse);
    } catch (err) {
      console.error("Erro no Copiloto:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão com o cérebro da IA. Verifique as Edge Functions." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {/* Botão Flutuante */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-colors relative overflow-hidden group",
          isOpen ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <Bot size={28} />
              <span className="text-[10px] font-black tracking-tighter mt-0.5">AGENT</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Janela do Agente */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            className="absolute bottom-20 right-0 w-[450px] max-h-[700px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-900 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
                  <Sparkles size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-xs tracking-widest uppercase">Engenheiro Chefe</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Sincronizado via Edge Function</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[400px] max-h-[500px] scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[90%] space-y-2",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-700/50"
                  )}>
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? "mt-2" : ""}>{line}</p>
                    ))}

                    {msg.role === "assistant" && i > 0 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-4 w-full bg-zinc-900 text-white hover:bg-zinc-800 gap-2 font-black text-[10px] uppercase h-8"
                        onClick={() => generateAntigravityPrompt(msg.content)}
                      >
                        <Code2 size={12} /> Traduzir para Antigravity
                      </Button>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest px-1 flex items-center gap-1">
                    {msg.role === "user" ? "Admin" : <><Sparkles size={8} className="text-blue-500" /> Copiloto Inteligente</>}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-3 text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-2xl w-fit border border-zinc-100 dark:border-zinc-800">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-tighter">Consultando Knowledge Map...</span>
                </div>
              )}
            </div>

            {/* Footer / Input */}
            <div className="p-6 pt-0 mt-auto bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
              <div className="relative mt-4">
                <textarea
                  rows={2}
                  placeholder="Descreva uma tarefa ou tire uma dúvida técnica..."
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm placeholder:text-zinc-400"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!query.trim() || isTyping}
                  className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
