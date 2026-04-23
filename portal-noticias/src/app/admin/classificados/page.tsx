"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit, Home, Car, Briefcase, Store, CheckCircle2, MoreHorizontal, Upload, X } from "lucide-react";
import { toast } from "sonner";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function ClassificadosAdminPage() {
  const [classificados, setClassificados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ id: "", tipo: "Imóvel", titulo: "", descricao: "", preco: "", contato_whatsapp: "", status: "active", fotos: [] as string[] });

  useEffect(() => {
    fetchClassificados();
  }, []);

  const fetchClassificados = async () => {
    setLoading(true);
    const { data } = await supabase.from("classificados").select("*").order("created_at", { ascending: false });
    if (data) setClassificados(data);
    setLoading(false);
  };

  const handleUploadFotos = async (files: FileList) => {
    toast.promise(
      (async () => {
        const newUrls = [...formData.fotos];
        for (const file of Array.from(files)) {
          const ext = file.name.split(".").pop();
          const path = `classificados/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await supabase.storage.from("media").upload(path, file);
          if (!error) {
            const { data } = supabase.storage.from("media").getPublicUrl(path);
            newUrls.push(data.publicUrl);
          }
        }
        setFormData({ ...formData, fotos: newUrls });
      })(),
      {
        loading: "Fazendo upload das fotos...",
        success: "Fotos adicionadas com sucesso",
        error: "Erro no upload das fotos",
      }
    );
  };

  const removeFoto = (index: number) => {
    const newFotos = [...formData.fotos];
    newFotos.splice(index, 1);
    setFormData({ ...formData, fotos: newFotos });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        tipo: formData.tipo,
        titulo: formData.titulo,
        descricao: formData.descricao,
        preco: parseFloat(formData.preco) || null,
        contato_whatsapp: formData.contato_whatsapp,
        status: formData.status,
        fotos: formData.fotos,
      };

      if (formData.id) {
        await supabase.from("classificados").update(payload).eq("id", formData.id);
        toast.success("Anúncio atualizado!");
      } else {
        await supabase.from("classificados").insert([payload]);
        toast.success("Anúncio criado!");
      }
      setShowModal(false);
      fetchClassificados();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este classificado?")) return;
    await supabase.from("classificados").delete().eq("id", id);
    toast.success("Excluído com sucesso");
    fetchClassificados();
  };

  const getIcon = (tipo: string) => {
    switch(tipo) {
      case "Imóvel": return <Home size={16} />;
      case "Veículo": return <Car size={16} />;
      case "Emprego": return <Briefcase size={16} />;
      default: return <Store size={16} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminTopbar />
        
        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* TOPO DA PÁGINA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-100/50">
                <Store size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Classificados Arapongas</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  Gerencie ofertas locais de imóveis, veículos e vagas de emprego.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setFormData({ id: "", tipo: "Imóvel", titulo: "", descricao: "", preco: "", contato_whatsapp: "", status: "active", fotos: [] });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus size={18} />
              Novo Anúncio
            </button>
          </div>

          {/* LISTA */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : classificados.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 border-dashed">
              <Store className="mx-auto text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-black text-slate-700 mb-2">Nenhum Anúncio</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">
                Crie o primeiro anúncio para ativar a seção de Classificados na Home.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classificados.map((item) => (
                <div key={item.id} className={`bg-white rounded-[2rem] p-6 border ${item.status === 'sold' ? 'border-slate-200 opacity-70' : 'border-slate-100'} shadow-sm relative group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
                      {getIcon(item.tipo)}
                      {item.tipo}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setFormData({ ...item, preco: item.preco?.toString() || "" }); setShowModal(true); }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {item.fotos && item.fotos.length > 0 && (
                    <div className="w-full h-32 rounded-xl mb-4 overflow-hidden bg-slate-100">
                      <img src={item.fotos[0]} alt={item.titulo} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-black text-slate-900 mb-2 line-clamp-2">{item.titulo}</h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-emerald-600 font-black text-lg">
                      {item.preco ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco) : 'A Combinar'}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${item.status === 'sold' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                      {item.status === 'sold' ? 'Vendido' : 'Ativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL NOVO ANÚNCIO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-slate-100 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900">{formData.id ? "Editar Anúncio" : "Novo Anúncio"}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select 
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value})}
                    className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="Imóvel">Imóvel</option>
                    <option value="Veículo">Veículo</option>
                    <option value="Emprego">Emprego</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="active">Ativo (Disponível)</option>
                    <option value="sold">Vendido / Preenchida</option>
                    <option value="paused">Pausado</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Anúncio</label>
                <input 
                  type="text" 
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ex: Vende-se Casa Centro ou Vaga de Motorista"
                  className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Preço (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.preco}
                    onChange={e => setFormData({...formData, preco: e.target.value})}
                    placeholder="Deixe em branco para 'A Combinar'"
                    className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Contato</label>
                  <input 
                    type="text" 
                    value={formData.contato_whatsapp}
                    onChange={e => setFormData({...formData, contato_whatsapp: e.target.value})}
                    placeholder="Ex: 43999999999"
                    className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Completa</label>
                <textarea 
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  rows={4}
                  className="w-full text-sm font-medium px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 bg-slate-50 resize-none"
                />
              </div>
              
              {/* GALERIA */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Fotos (Opcional)</label>
                  <label className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-lg">
                    <Upload size={14} /> Adicionar Fotos
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleUploadFotos(e.target.files)} />
                  </label>
                </div>
                
                {formData.fotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {formData.fotos.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={url} alt="Galeria" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFoto(i)} className="absolute inset-0 bg-red-500/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  {isSaving ? "Salvando..." : "Salvar Classificado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
