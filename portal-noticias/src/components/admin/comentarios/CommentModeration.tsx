"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, Trash2, Search, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Comentario {
  id: string;
  nome_usuario: string;
  comentario: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  noticias: {
    titulo: string;
  };
}

export default function CommentModeration() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchComentarios();
  }, []);

  async function fetchComentarios() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comentarios")
      .select(`
        id, nome_usuario, comentario, status, created_at,
        noticias(titulo)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar comentários.");
    } else {
      setComentarios(data as any);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: "approved" | "rejected") {
    const { error } = await supabase
      .from("comentarios")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar status.");
    } else {
      toast.success(`Comentário ${newStatus === "approved" ? "aprovado" : "rejeitado"} com sucesso!`);
      setComentarios(comentarios.map(c => c.id === id ? { ...c, status: newStatus } : c));
    }
  }

  async function deleteComment(id: string) {
    if (!confirm("Tem certeza que deseja excluir permanentemente este comentário?")) return;

    const { error } = await supabase.from("comentarios").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir comentário.");
    } else {
      toast.success("Comentário excluído.");
      setComentarios(comentarios.filter(c => c.id !== id));
    }
  }

  const filtered = comentarios.filter(c => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = c.nome_usuario.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.comentario.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-100 text-emerald-700";
      case "rejected": return "bg-rose-100 text-rose-700";
      default: return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved": return "Aprovado";
      case "rejected": return "Rejeitado";
      default: return "Pendente";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex bg-slate-50 p-1 rounded-2xl w-full lg:w-auto">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f === "pending" ? "Pendentes" : f === "approved" ? "Aprovados" : f === "rejected" ? "Rejeitados" : "Todos"}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border-none"
          />
        </div>
      </div>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl">Nenhum comentário</h3>
          <p className="text-slate-500 font-medium mt-2">A caixa de entrada está limpa.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-slate-900 uppercase tracking-tighter">{c.nome_usuario}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(c.status)}`}>
                      {getStatusText(c.status)}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      {new Date(c.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl">
                    "{c.comentario}"
                  </p>

                  <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    Em: {c.noticias?.titulo || "Notícia não encontrada"}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                  {c.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(c.id, "approved")}
                      className="flex-1 md:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check size={14} /> Aprovar
                    </button>
                  )}
                  {c.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(c.id, "rejected")}
                      className="flex-1 md:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      <X size={14} /> Rejeitar
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="flex-1 md:flex-none bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-rose-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
