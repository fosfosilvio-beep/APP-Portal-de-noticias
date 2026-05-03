"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Loader2, User, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Comentario {
  id: string;
  nome_usuario: string;
  comentario: string;
  created_at: string;
}

interface CommentsSectionProps {
  noticiaId: string;
}

export default function CommentsSection({ noticiaId }: CommentsSectionProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [nome, setNome] = useState("");
  const [texto, setTexto] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchComentarios();
    checkUser();
  }, [noticiaId]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setNome(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
    }
  }

  async function fetchComentarios() {
    const { data } = await supabase
      .from("comentarios")
      .select("id, usuario_nome, comentario, criado_em")
      .eq("noticia_id", noticiaId)
      .order("criado_em", { ascending: false });

    // Mapear criado_em para created_at para manter compatibilidade com a interface
    const mapped = (data || []).map((c: any) => ({
      ...c,
      nome_usuario: c.usuario_nome,
      created_at: c.criado_em
    }));

    setComentarios(mapped as any);
    setLoading(false);
  }

  function validarComentario(nome: string, texto: string): string | null {
    const nomeTrim = nome.trim();
    const textoTrim = texto.trim();
    
    if (!nomeTrim) return "Preencha seu nome.";
    if (nomeTrim.length < 2) return "Nome deve ter pelo menos 2 caracteres.";
    if (nomeTrim.length > 80) return "Nome deve ter no maximo 80 caracteres.";
    if (!/^[a-zA-Z0-9À-ɏ\s.-]+$/.test(nomeTrim)) {
      return "Nome contém caracteres inválidos.";
    }
    
    if (!textoTrim) return "Preencha o comentário.";
    if (textoTrim.length < 3) return "Comentário deve ter pelo menos 3 caracteres.";
    if (textoTrim.length > 1000) return "Comentário deve ter no maximo 1000 caracteres.";
    if (/(https?:\/\/|www\.|http:\/\/|\.com|\.br|\.net)/.test(textoTrim)) {
      return "Links não são permitidos.";
    }
    
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const erro = validarComentario(nome, texto);
    if (erro) {
      toast.error(erro);
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("comentarios").insert([{
        noticia_id: noticiaId,
        usuario_nome: nome.trim().slice(0, 80),
        comentario: texto.trim().slice(0, 1000),
      }]);

      if (error) {
        console.error("[CommentsSection] Erro ao inserir:", error);
        toast.error("Erro ao enviar comentário. Tente novamente.");
      } else {
        setSubmitted(true);
        // Não limpa o nome se estiver logado
        if (!user) setNome("");
        setTexto("");
        fetchComentarios(); // Atualiza a lista imediatamente
      }
    } catch (err) {
      console.error("[CommentsSection] Excecao:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const formatDate = (date: string) => {
    if (!date) return "Agora";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="mt-16 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <MessageSquare size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
            Comentários
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            {loading ? "..." : `${comentarios.length} participação${comentarios.length !== 1 ? "ões" : ""}`}
          </p>
        </div>
      </div>

      {/* Comment Form */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 space-y-3"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 text-3xl">
                ✓
              </div>
              <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl">
                Obrigado por participar!
              </h3>
              <p className="text-slate-500 font-medium text-sm">
                Seu comentário foi publicado com sucesso.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-blue-600 text-xs font-black uppercase tracking-widest"
              >
                Deixar outro comentário
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-900 font-black uppercase tracking-tighter">
                  Deixe sua <span className="text-blue-600">Opinião</span>
                </h3>
                {user && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    Conectado como {user.email?.split('@')[0]}
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={80}
                disabled={!!user}
                className={`w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-semibold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 border-none transition-all ${!!user ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
              <textarea
                placeholder="Escreva seu comentário aqui..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-semibold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/20 border-none transition-all resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs font-bold">
                  {texto.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Enviar Comentário
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : comentarios.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <MessageSquare size={36} />
          </div>
          <p className="text-slate-400 font-bold">Seja o primeiro a comentar esta matéria!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comentarios.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm flex gap-4"
            >
              <div className="w-11 h-11 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0 font-black text-lg uppercase">
                {c.nome_usuario.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-black text-slate-900 uppercase tracking-tighter">
                    {c.nome_usuario}
                  </span>
                  <span className="flex items-center gap-1 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={10} />
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-sm">
                  {c.comentario}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
