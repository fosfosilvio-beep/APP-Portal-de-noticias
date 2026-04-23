import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
import { Loader2, Plus, Edit2, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function SlotsTab() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["ad_slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ad_slots").select("*").order("nome_slot");
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: "Excluir Slot",
      description: `Tem certeza que deseja apagar o slot "${name}"? Todas as impressões e relatórios atrelados a ele podem ser impactados.`,
      destructive: true
    });
    if (!ok) return;

    const { error } = await supabase.from("ad_slots").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir", error.message);
    else {
      toast.success("Slot apagado.");
      queryClient.invalidateQueries({ queryKey: ["ad_slots"] });
    }
  };

  const handleAddSlot = async () => {
    const nome = prompt("Nome do novo slot (ex: Header Superior):");
    if (!nome) return;
    const posicao = prompt("Posição de sistema (ex: header_top, in_article):");
    if (!posicao) return;

    const { error } = await supabase.from("ad_slots").insert([{ 
      nome_slot: nome, 
      posicao_html: posicao,
      status_ativo: false,
      sanitized: true
    }]);

    if (error) toast.error("Erro ao criar slot", error.message);
    else {
      toast.success("Slot criado!");
      queryClient.invalidateQueries({ queryKey: ["ad_slots"] });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean, width: number | null, height: number | null) => {
    if (!currentStatus && (!width || !height)) {
      toast.error("Impossível ativar: dimensões (width/height) são obrigatórias para slots ativos.");
      return;
    }

    const { error } = await supabase.from("ad_slots").update({ status_ativo: !currentStatus }).eq("id", id);
    if (error) toast.error("Erro", error.message);
    else queryClient.invalidateQueries({ queryKey: ["ad_slots"] });
  };

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">Mapeamento de Posições</h3>
          <p className="text-sm text-slate-400">Slots definem **onde** a publicidade vai aparecer no portal.</p>
        </div>
        <button onClick={handleAddSlot} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg">
          <Plus size={16} /> Novo Slot Vazio
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((slot: any) => (
          <div key={slot.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl relative group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-black text-slate-200">{slot.nome_slot}</h4>
                <code className="text-[10px] text-amber-500 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{slot.posicao_html}</code>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(slot.id, slot.status_ativo, slot.width, slot.height)}
                  className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-colors ${slot.status_ativo ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}
                >
                  {slot.status_ativo ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400 mt-4 font-medium">
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>Dimensões:</span>
                <span className="text-white font-mono">{slot.width || '?'}x{slot.height || '?'} px</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/50 pb-1">
                <span>Patrocinado (CONAR):</span>
                <span>{slot.is_sponsored_content ? <ShieldCheck size={14} className="text-emerald-500"/> : <ShieldAlert size={14} className="text-slate-600"/>}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Criativo:</span>
                <span className="text-white truncate max-w-[120px]">{slot.advertiser_name || 'Nenhum'}</span>
              </div>
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <button className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500 hover:text-white transition-colors" title="Editar config">
                <Edit2 size={12} />
              </button>
              <button onClick={() => handleDelete(slot.id, slot.nome_slot)} className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500 hover:text-white transition-colors" title="Apagar">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
