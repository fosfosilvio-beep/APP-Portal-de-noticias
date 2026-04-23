"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase-browser";
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable, 
  getSortedRowModel,
  SortingState
} from "@tanstack/react-table";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "@/lib/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Loader2, Search, Edit2, Trash2, GripVertical, CheckCircle2, XCircle, Link as LinkIcon, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Row Component for Drag and Drop
function SortableRow({ row, onEdit, onDelete, onCopyLink }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={`border-b border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors ${isDragging ? 'relative shadow-xl border-blue-500/50 bg-slate-800' : ''}`}>
      {row.getVisibleCells().map((cell: any) => (
        <td key={cell.id} className="p-4 text-sm text-slate-300">
          {cell.column.id === 'drag' ? (
            <button {...attributes} {...listeners} className="cursor-grab hover:text-white transition-colors">
              <GripVertical size={16} className="text-slate-500" />
            </button>
          ) : cell.column.id === 'actions' ? (
            <div className="flex items-center gap-2">
              <Link href={`/admin/noticias/${row.original.id}/editar`} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Editar">
                <Edit2 size={16} />
              </Link>
              <button onClick={() => onCopyLink(row.original.slug)} className="p-2 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors" title="Copiar Link">
                <LinkIcon size={16} />
              </button>
              <a href={`/noticia/${row.original.slug}`} target="_blank" className="p-2 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors" title="Ver no Site">
                <ExternalLink size={16} />
              </a>
              <button onClick={() => onDelete(row.original.id, row.original.titulo)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Apagar">
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </td>
      ))}
    </tr>
  );
}

export default function NoticiasList() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch News
  const { data: noticias = [], isLoading } = useQuery({
    queryKey: ["noticias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("*, categorias(nome)")
        .order("ordem_prioridade", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async (items: any[]) => {
      // Create batch update array
      const updates = items.map((item, index) => ({
        id: item.id,
        ordem_prioridade: index,
        // we must supply minimal fields or just write a custom RPC if we want to avoid replacing the row.
        // Actually supabase JS .upsert() or multiple .update() is safer.
      }));
      
      // Execute multiple updates since bulk update on selective columns requires RPC or multiple calls
      await Promise.all(updates.map(u => 
        supabase.from("noticias").update({ ordem_prioridade: u.ordem_prioridade }).eq("id", u.id)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
      toast.success("Ordem salva com sucesso.");
    },
    onError: (err: any) => {
      toast.error("Erro ao reordenar", err.message);
    }
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = noticias.findIndex((item: any) => item.id === active.id);
      const newIndex = noticias.findIndex((item: any) => item.id === over.id);
      const newOrder = arrayMove(noticias, oldIndex, newIndex);
      
      // Optimistic update
      queryClient.setQueryData(["noticias"], newOrder);
      
      // Save to DB
      reorderMutation.mutate(newOrder);
    }
  };

  const handleDelete = async (id: string, titulo: string) => {
    const ok = await confirm({
      title: "Apagar Notícia",
      description: `Deseja permanentemente excluir "${titulo}"?`,
      destructive: true,
      confirmLabel: "Excluir"
    });
    if (!ok) return;

    const { error } = await supabase.from("noticias").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir", error.message);
    } else {
      toast.success("Notícia apagada.");
      queryClient.invalidateQueries({ queryKey: ["noticias"] });
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/noticia/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const filteredData = noticias.filter((n: any) => 
    n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (n.categorias?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      id: "drag",
      header: "",
      cell: () => null,
      size: 40,
    },
    {
      accessorKey: "titulo",
      header: "Título",
      cell: (info: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-white max-w-[300px] md:max-w-md truncate">{info.getValue()}</span>
          <span className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[300px] md:max-w-md">/{info.row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: (info: any) => {
        const cat = info.row.original.categorias?.nome || "Geral";
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">{cat}</span>;
      }
    },
    {
      accessorKey: "status",
      header: "Status / Home",
      cell: (info: any) => {
        const isHome = info.row.original.mostrar_na_home_recentes;
        return (
          <div className="flex items-center gap-3">
             {isHome ? (
               <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                 <CheckCircle2 size={12} /> Na Home
               </div>
             ) : (
               <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                 <XCircle size={12} /> Oculto
               </div>
             )}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Ações",
      cell: () => null,
    }
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-2 rounded-xl max-w-md">
        <div className="pl-3 text-slate-400"><Search size={18} /></div>
        <input 
          type="text" 
          placeholder="Buscar por título ou categoria..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-white w-full py-2 placeholder:text-slate-600"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">Nenhuma notícia encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  {table.getFlatHeaders().map(header => (
                    <th key={header.id} className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              </thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredData.map((d: any) => d.id)} strategy={verticalListSortingStrategy}>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <SortableRow key={row.id} row={row} onEdit={() => {}} onDelete={handleDelete} onCopyLink={copyLink} />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
