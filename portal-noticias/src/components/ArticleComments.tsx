"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { MessageSquare, LogIn, Send, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Comentario {
  id: string;
  usuario_nome: string;
  usuario_imagem: string;
  conteudo: string;
  created_at: string;
}

export default function ArticleComments({ noticiaId }: { noticiaId: string }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getSession().then((result: any) => {
      setUser(result.data?.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!noticiaId) return;

    const fetchComments = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("comentarios_noticias")
        .select("*")
        .eq("noticia_id", noticiaId)
        .eq("aprovado", true)
        .order("created_at", { ascending: false });

      if (data) setComentarios(data);
      setLoading(false);
    };

    fetchComments();

    // Inscricao Realtime para novos comentarios
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`comments-${noticiaId}`)
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "comentarios_noticias",
        filter: `noticia_id=eq.${noticiaId}`
      }, (payload: any) => {
        setComentarios((prev) => [payload.new as Comentario, ...prev]);
      })
      .subscribe(function(status: string) {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("[ArticleComments] Realtime error:", status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noticiaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase || !user || !novoComentario.trim() || enviando) return;

    setEnviando(true);
    const { error } = await supabase.from("comentarios_noticias").insert([
      {
        noticia_id: noticiaId,
        usuario_nome: user.user_metadata?.full_name || user.email,
        usuario_email: user.email,
        usuario_imagem: user.user_metadata?.avatar_url,
        conteudo: novoComentario.trim(),
      },
    ]);

    if (!error) {
      setNovoComentario("");
    } else {
      console.error("Erro ao comentar:", error);
    }
    setEnviando(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
    }
  };

  return (
    <section className="mt-12 py-10 border-t border-slate-100">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="text-blue-600" size={24} />
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Comentários <span className="text-slate-400">({comentarios.length})</span>
        </h3>
      </div>

      {/* Area de Input / Login */}
      {!user ? (
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
            <LogIn className="text-slate-400" size={24} />
          </div>
          <p className="text-slate-600 font-bold mb-6">Entre com suas redes sociais para participar da conversa</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Google
            </button>
            <button 
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center gap-3 bg-[#1877F2] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#166fe5] transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm mb-10 transition-all focus-within:border-blue-500/50">
          <div className="flex items-start gap-4">
            <img src={user.user_metadata?.avatar_url || ""} className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" alt="User" />
            <div className="flex-1">
              <span className="block text-xs font-black uppercase text-blue-600 tracking-widest mb-2">Comentar como {user.user_metadata?.full_name || user.email}</span>
              <textarea 
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="O que você achou dessa notícia?"
                className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-800 focus:ring-0 resize-none min-h-[100px] text-sm"
                maxLength={400}
              />
              <div className="flex justify-end mt-4">
                <button 
                  type="submit"
                  disabled={!novoComentario.trim() || enviando}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                  {enviando ? "Enviando..." : "Publicar Comentário"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Lista de Comentarios */}
      <div className="space-y-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl w-full"></div>)}
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 font-medium italic">Ainda não há comentários. Seja o primeiro a opinar!</p>
          </div>
        ) : (
          comentarios.map((comentario) => (
            <div key={comentario.id} className="flex gap-4 group">
              <div className="shrink-0">
                {comentario.usuario_imagem ? (
                  <img src={comentario.usuario_imagem} className="w-10 h-10 rounded-full border border-slate-100" alt="Avatar" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div className="flex-1 bg-slate-50/50 group-hover:bg-slate-50 p-4 rounded-2xl border border-transparent group-hover:border-slate-100 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{comentario.usuario_nome}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(comentario.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{comentario.conteudo}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
