"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { X, User, MapPin, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsAuditModalProps {
  noticiaId: string;
  noticiaTitulo: string;
  onClose: () => void;
}

interface AuditLog {
  id: string;
  nome_usuario: string;
  email_usuario: string;
  cidade: string;
  estado: string;
  created_at: string;
}

export default function NewsAuditModal({ noticiaId, noticiaTitulo, onClose }: NewsAuditModalProps) {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [noticiaId]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("noticia_logs")
        .select("id, nome_usuario, email_usuario, cidade, estado, created_at")
        .eq("noticia_id", noticiaId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.error("Erro ao buscar logs de auditoria:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Auditoria de Acessos</h2>
            <p className="text-slate-400 text-sm truncate max-w-md">{noticiaTitulo}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Carregando auditoria...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-600">
                <User size={32} />
              </div>
              <p className="text-slate-500 font-bold">Nenhum log detalhado encontrado para esta matéria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-950/40 border border-slate-800/40 rounded-xl px-6 py-4 hover:border-blue-500/20 transition-all">
                    {/* [Horário] */}
                    <div className="flex items-center gap-2 shrink-0 min-w-[140px]">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        <Clock size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-300">
                          {new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(log.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    {/* [Nome/Email] */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-slate-100 truncate">
                          {log.nome_usuario || "Anônimo"}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate italic opacity-80">
                          {log.email_usuario || "E-mail não identificado"}
                        </span>
                      </div>
                    </div>

                    {/* [Cidade/Estado] */}
                    <div className="shrink-0 flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800/50">
                      <MapPin size={14} className="text-rose-500" />
                      <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                        {log.cidade || "Desconhecida"} / {log.estado || "--"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Exibindo os últimos {logs.length} acessos
          </p>
          <button 
            onClick={onClose}
            className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
