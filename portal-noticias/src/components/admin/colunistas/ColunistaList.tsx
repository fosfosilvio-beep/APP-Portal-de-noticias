"use client";

import { useState, useEffect } from "react";
import { Plus, Search, User, Edit2, Trash2, Loader2, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ColunistaForm from "./ColunistaForm";

interface Colunista {
  id: string;
  nome: string;
  cargo_descricao: string;
  foto_perfil: string;
  slug: string;
  biografia: string;
}

export default function ColunistaList() {
  const [colunistas, setColunistas] = useState<Colunista[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingColunista, setEditingColunista] = useState<Colunista | null>(null);

  useEffect(() => {
    fetchColunistas();
  }, []);

  async function fetchColunistas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("colunistas")
        .select("*")
        .order("nome");

      if (error) throw error;
      setColunistas(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar colunistas: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este colunista?")) return;

    try {
      const { error } = await supabase.from("colunistas").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Colunista excluído com sucesso!");
      fetchColunistas();
    } catch (error: any) {
      toast.error("Erro ao excluir colunista: " + error.message);
    }
  }

  const filteredColunistas = colunistas.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cargo_descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar colunista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3 text-slate-900 font-bold shadow-sm placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
          />
        </div>

        <button
          onClick={() => {
            setEditingColunista(null);
            setIsFormOpen(true);
          }}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px]"
        >
          <Plus size={18} /> Novo Colunista
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Carregando time...</p>
        </div>
      ) : filteredColunistas.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle className="text-slate-200" size={40} />
          </div>
          <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl">Nenhum colunista encontrado</h3>
          <p className="text-slate-500 font-medium mt-2">Comece cadastrando seu primeiro formador de opinião.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColunistas.map((colunista) => (
            <div key={colunista.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                    {colunista.foto_perfil ? (
                      <img src={colunista.foto_perfil} alt={colunista.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <User size={40} />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-50 text-blue-600">
                    <User size={14} />
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-900 font-black uppercase tracking-tighter leading-tight">{colunista.nome}</h4>
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">{colunista.cargo_descricao}</p>
                </div>

                <div className="flex items-center gap-2 pt-4 w-full">
                  <button
                    onClick={() => {
                      setEditingColunista(colunista);
                      setIsFormOpen(true);
                    }}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(colunista.id)}
                    className="w-12 bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ColunistaForm
          colunista={editingColunista}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchColunistas();
          }}
        />
      )}
    </div>
  );
}
