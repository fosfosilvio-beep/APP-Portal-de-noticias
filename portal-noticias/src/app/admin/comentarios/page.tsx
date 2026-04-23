"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";

export default function ComentariosAdmin() {
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending, approved, rejected

  useEffect(() => {
    fetchComentarios();
  }, [filter]);

  const fetchComentarios = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("comentarios")
      .select("*, noticias(titulo, slug)")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    
    if (data) setComentarios(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("comentarios").update({ status: newStatus }).eq("id", id);
    if (!error) {
      toast.success(newStatus === 'approved' ? "Comentário Aprovado!" : "Comentário Rejeitado!");
      fetchComentarios();
    } else {
      toast.error("Erro ao atualizar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir definitivamente?")) return;
    await supabase.from("comentarios").delete().eq("id", id);
    fetchComentarios();
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminTopbar />
        
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* TOPO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner border border-blue-100/50">
                <MessageSquare size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Moderação de Comentários</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  Aprove ou rejeite os comentários feitos nas notícias do portal.
                </p>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setFilter("pending")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pendentes</button>
              <button onClick={() => setFilter("approved")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === 'approved' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Aprovados</button>
              <button onClick={() => setFilter("rejected")} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Rejeitados</button>
            </div>
          </div>

          {/* LISTA */}
          {loading ? (
             <div className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>
          ) : comentarios.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 border-dashed">
              <MessageSquare className="mx-auto text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-black text-slate-700 mb-2">Caixa Limpa</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">Nenhum comentário {filter === 'pending' ? 'aguardando moderação' : filter === 'approved' ? 'aprovado' : 'rejeitado'} no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comentarios.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row gap-6">
                  
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-xl shrink-0 uppercase">
                    {item.nome_usuario.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-slate-900 text-lg">{item.nome_usuario}</span>
                      <span className="text-slate-400 text-xs font-medium">
                        {new Date(item.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    
                    {item.noticias && (
                      <Link href={`/noticia/${item.noticias.slug}`} target="_blank" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-600 bg-blue-50 px-2 py-1 rounded mb-3">
                        Na Notícia: {item.noticias.titulo.substring(0, 40)}... <ExternalLink size={10} />
                      </Link>
                    )}

                    <p className="text-slate-700 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {item.comentario}
                    </p>
                  </div>

                  <div className="flex items-start md:flex-col gap-2 shrink-0">
                    {filter !== 'approved' && (
                      <button onClick={() => updateStatus(item.id, 'approved')} className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                        <CheckCircle2 size={16} /> Aprovar
                      </button>
                    )}
                    {filter !== 'rejected' && (
                      <button onClick={() => updateStatus(item.id, 'rejected')} className="w-full bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                        <XCircle size={16} /> Rejeitar
                      </button>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="w-full bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
