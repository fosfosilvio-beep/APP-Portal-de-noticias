"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit, CheckCircle2, XCircle, PieChart, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function EnquetesAdminPage() {
  const [enquetes, setEnquetes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "",
    pergunta: "",
    opcoes: [{ id: "1", texto: "", votos: 0 }, { id: "2", texto: "", votos: 0 }],
    status: "active"
  });

  useEffect(() => {
    fetchEnquetes();
  }, []);

  const fetchEnquetes = async () => {
    setLoading(true);
    const { data } = await supabase.from("enquetes").select("*").order("created_at", { ascending: false });
    if (data) setEnquetes(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pergunta.trim() || formData.opcoes.some(o => !o.texto.trim())) {
      toast.error("Preencha a pergunta e todas as opções.");
      return;
    }

    setIsSaving(true);
    try {
      if (formData.id) {
        await supabase.from("enquetes").update({
          pergunta: formData.pergunta,
          opcoes: formData.opcoes,
          status: formData.status
        }).eq("id", formData.id);
        toast.success("Enquete atualizada!");
      } else {
        await supabase.from("enquetes").insert([{
          pergunta: formData.pergunta,
          opcoes: formData.opcoes,
          status: formData.status
        }]);
        toast.success("Enquete criada!");
      }
      setShowModal(false);
      fetchEnquetes();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await supabase.from("enquetes").update({ status: newStatus }).eq("id", id);
    fetchEnquetes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta enquete permanentemente?")) return;
    await supabase.from("enquetes").delete().eq("id", id);
    fetchEnquetes();
  };

  const addOpcao = () => {
    setFormData({
      ...formData,
      opcoes: [...formData.opcoes, { id: Date.now().toString(), texto: "", votos: 0 }]
    });
  };

  const removeOpcao = (index: number) => {
    if (formData.opcoes.length <= 2) return toast.error("Mínimo de 2 opções");
    const novas = [...formData.opcoes];
    novas.splice(index, 1);
    setFormData({ ...formData, opcoes: novas });
  };

  const updateOpcaoTexto = (index: number, texto: string) => {
    const novas = [...formData.opcoes];
    novas[index].texto = texto;
    setFormData({ ...formData, opcoes: novas });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminTopbar />
        
        <div className="p-8 max-w-5xl mx-auto w-full">
          {/* TOPO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner border border-purple-100/50">
                <PieChart size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enquetes da Comunidade</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">
                  Gerencie as pesquisas e votações ativas na Home do portal.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setFormData({ id: "", pergunta: "", opcoes: [{ id: "1", texto: "", votos: 0 }, { id: "2", texto: "", votos: 0 }], status: "active" });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 transition-all"
            >
              <Plus size={18} />
              Nova Enquete
            </button>
          </div>

          {/* LISTA */}
          {loading ? (
            <div className="py-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div></div>
          ) : enquetes.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200 border-dashed">
              <PieChart className="mx-auto text-slate-200 mb-4" size={64} />
              <h3 className="text-xl font-black text-slate-700 mb-2">Nenhuma Enquete</h3>
              <p className="text-slate-500 font-medium max-w-md mx-auto">Engaje seus leitores criando a primeira pesquisa.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {enquetes.map((enq) => {
                const totalVotos = enq.opcoes.reduce((acc: number, cur: any) => acc + (cur.votos || 0), 0);
                return (
                  <div key={enq.id} className={`bg-white rounded-2xl p-6 border ${enq.status === 'active' ? 'border-purple-200 shadow-md shadow-purple-50' : 'border-slate-100 opacity-70'} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${enq.status === 'active' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                          {enq.status === 'active' ? '🟢 Ativa na Home' : '⚫ Inativa'}
                        </span>
                        <span className="text-slate-400 text-xs font-bold">{totalVotos} Votos Totais</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">{enq.pergunta}</h3>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {enq.opcoes.map((op: any, i: number) => {
                          const pct = totalVotos === 0 ? 0 : Math.round((op.votos / totalVotos) * 100);
                          return (
                            <div key={op.id} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
                              <span className="font-medium text-slate-600">{op.texto}</span>
                              <span className="font-black text-purple-600">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStatus(enq.id, enq.status)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Ativar/Desativar">
                        {enq.status === 'active' ? <XCircle size={20} /> : <PlayCircle size={20} />}
                      </button>
                      <button onClick={() => { setFormData(enq); setShowModal(true); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDelete(enq.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">{formData.id ? "Editar Enquete" : "Criar Enquete"}</h2>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">A Pergunta (Tema)</label>
                <input 
                  type="text" 
                  value={formData.pergunta}
                  onChange={e => setFormData({...formData, pergunta: e.target.value})}
                  placeholder="Ex: Qual sua opinião sobre o novo binário?"
                  className="w-full text-sm font-bold px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-purple-500 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Opções de Voto</label>
                <div className="space-y-3">
                  {formData.opcoes.map((op, index) => (
                    <div key={op.id} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">
                        {index + 1}
                      </div>
                      <input 
                        type="text" 
                        value={op.texto}
                        onChange={e => updateOpcaoTexto(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                        className="w-full text-sm font-bold px-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-purple-500 bg-white"
                        required
                      />
                      <button type="button" onClick={() => removeOpcao(index)} className="p-2 text-slate-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addOpcao} className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  <Plus size={14} /> Adicionar Opção
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-3.5 rounded-xl shadow-lg shadow-purple-600/20">
                  {isSaving ? "Salvando..." : "Salvar Enquete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
