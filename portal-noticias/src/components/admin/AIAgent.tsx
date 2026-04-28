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

import { usePathname } from "next/navigation";
import portalManifest from "@/lib/portal-manifest.json";
import { createClient } from "@/lib/supabase-browser";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAgent() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! Sou o Copiloto da Nossa Web TV. Estou onisciente sobre o sistema e pronto para agir. Em que módulo vamos trabalhar agora?" }
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

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setQuery("");
    setIsTyping(true);

    // Lógica Evoluída com Context Awareness
    setTimeout(async () => {
      let response = "";
      const q = userMessage.toLowerCase();
      
      // Identificar módulo atual pela rota
      const isAdsModule = pathname.includes("publicidade");
      const isNewsModule = pathname.includes("noticias");

      if (q.includes("erro") || q.includes("melhorar") || q.includes("prompt")) {
        const moduleName = isAdsModule ? "Publicidade" : isNewsModule ? "Notícias" : "Global";
        const tables = isAdsModule ? portalManifest.modules.publicidade.tables.join(", ") : "Diversas";
        
        response = `Detectei um pedido de evolução em **${moduleName}**. Gerando prompt técnico para o Antigravity:\n\n` +
                   "```markdown\n" +
                   `[ANTIGRAVITY COMMAND]\n` +
                   `CONTEXTO: ${moduleName} (Rota: ${pathname})\n` +
                   `PEDIDO: ${userMessage}\n` +
                   `ESTRUTURA: React + Supabase (Tabelas: ${tables})\n` +
                   `AÇÃO: Implementar melhoria seguindo padrões de modularidade extrema.\n` +
                   "```\n" +
                   "Copie o bloco acima e cole no chat principal!";
      } else if (isAdsModule || q.includes("publicidade")) {
        response = `Você está no módulo **${portalManifest.modules.publicidade.name}**. ` +
                   "Atualmente gerencio Banners, Campanhas e Slots. \n\n" +
                   "**Dica técnica:** Este módulo usa RPC para métricas atômicas e Lazy Loading no frontend para SEO.";
      } else {
        response = "Estou monitorando seu progresso. Como Engenheiro Chefe, posso te ajudar a ajustar as regras de negócio ou a UI Shadcn. O que precisa?";
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
      
      // Salvar log silenciosamente
      await logInteraction(userMessage, response);
    }, 800);
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
            className="absolute bottom-20 right-0 w-[400px] max-h-[600px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
                  <Sparkles size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">CO-PILOTO IA</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Online & Sincronizado</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-500">
                  v1.2.0
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] max-h-[400px] scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%] space-y-1",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none border border-zinc-200/50 dark:border-zinc-700/50"
                  )}>
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest px-1">
                    {msg.role === "user" ? "Você" : "Agent"}
                  </span>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-zinc-400">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" />
                   </div>
                </div>
              )}
            </div>

            {/* Footer / Input */}
            <div className="p-6 pt-0 mt-auto bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="Descreva uma tarefa ou tire uma dúvida..."
                  className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm"
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
                  className="absolute right-3 bottom-3 p-2 bg-zinc-900 dark:bg-blue-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-tight"
                  onClick={() => setQuery("Como criar um novo slot de publicidade?")}
                >
                  <Database size={12} /> Publicidade
                </button>
                <button 
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] font-black text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-tight"
                  onClick={() => setQuery("Reportar erro no player de vídeo")}
                >
                  <Monitor size={12} /> Reportar Bug
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
