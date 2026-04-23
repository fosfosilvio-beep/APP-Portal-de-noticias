"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Trash2, Megaphone, MapPin, Eye, FileEdit } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function VoceNoPortalAdmin() {
  const [sugestoes, setSugestoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSugestoes();
  }, []);

  const fetchSugestoes = async () => {
    setLoading(true);
    const { data } = await supabase.from("vocenoportal_sugestoes").select("*").order("created_at", { ascending: false });
    if (data) setSugestoes(data);
    setLoading(false);
  };

  const markAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus !== 'new') return;
    await supabase.from("vocenoportal_sugestoes").update({ status: 'read' }).eq("id", id);
    fetchSugestoes();
  };

  const transformToNews = async (sugestao: any) => {
    try {
      // Cria o rascunho da matéria na tabela de notícias
      const conteudoHTML = `<p><strong>Relato de ${sugestao.nome}:</strong></p><p>${sugestao.relato}</p>`;
      
      const { data, error } = await supabase.from("noticias").insert([{
        titulo: `[Pauta] Sugestão de ${sugestao.nome.split(" ")[0]}`,
        conteudo: conteudoHTML,
        status: "draft",
        imagem_capa: sugestao.midia_urls?.[0] || null,
        categoria: "Comunidade"
      }]).select("id").single();

      if (error) throw error;

      // Marca sugestão como transformada
      await supabase.from("vocenoportal_sugestoes").update({ status: 'transformed' }).eq("id", sugestao.id);
      
      toast.success("Rascunho criado com sucesso!");
      router.push(`/admin/noticias?edit=${data.id}`);
    } catch (err) {
      toast.error("Erro ao transformar em pauta.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este relato?")) return;
    await supabase.from("vocenoportal_sugestoes").delete().eq("id", id);
    fetchSugestoes();
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
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100/50">
                <Megaphone size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Caixa de Denúncias</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  Relatos e sugestões de pauta enviados pela comunidade de Arapongas.
                </p>
              </div>
            </div>
          </div>

          {/* LISTA */}
          {loading ? (
             <div className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div></div>
          ) : sugestoes.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 border-dashed">
              <Megaphone className="mx-auto text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-black text-slate-700 mb-2">Caixa Vazia</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">Nenhuma denúncia ou relato no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sugestoes.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-[2rem] p-6 border ${item.status === 'new' ? 'border-emerald-300 shadow-md shadow-emerald-50' : 'border-slate-100'} flex flex-col relative transition-all`}
                  onMouseEnter={() => markAsRead(item.id, item.status)}
                >
                  {item.status === 'new' && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  )}
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h3 className="font-black text-slate-900">{item.nome}</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">WhatsApp: {item.whatsapp}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${item.status === 'transformed' ? 'bg-blue-100 text-blue-700' : (item.status === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}`}>
                      {item.status === 'transformed' ? 'Virou Matéria' : (item.status === 'new' ? 'Novo' : 'Lido')}
                    </span>
                  </div>

                  {item.localizacao && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-3 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                      <MapPin size={12} /> {item.localizacao}
                    </div>
                  )}

                  <p className="text-slate-700 text-sm font-medium leading-relaxed italic border-l-2 border-emerald-200 pl-3 mb-4 flex-1">
                    "{item.relato}"
                  </p>

                  {item.midia_urls && item.midia_urls.length > 0 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                      {item.midia_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" className="shrink-0 relative group">
                          {url.match(/\.(mp4|mov)$/i) ? (
                            <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Eye size={20} /></div>
                          ) : (
                            <img src={url} className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white"><Eye size={16} /></div>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => transformToNews(item)}
                      disabled={item.status === 'transformed'}
                      className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <FileEdit size={16} /> Transformar em Pauta
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all">
                      <Trash2 size={16} />
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
