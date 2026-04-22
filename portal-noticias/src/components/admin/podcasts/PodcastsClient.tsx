"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/lib/toast";
import { Mic2, Plus, Trash2, ExternalLink, Upload, Loader2, GripVertical, PlaySquare } from "lucide-react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const podcastSchema = z.object({
  titulo: z.string().min(3, "Título obrigatório (mín. 3 chars)"),
  descricao: z.string().optional(),
  url_youtube: z.string().url("URL inválida").refine(
    (url) => url.includes("youtube.com") || url.includes("youtu.be"),
    "URL deve ser do YouTube"
  ),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
});
type PodcastFormData = z.infer<typeof podcastSchema>;

function SortableRow({ item, onDelete }: { item: any; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 group">
      <button {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
        <GripVertical size={18} />
      </button>
      {item.thumbnail_url ? (
        <img src={item.thumbnail_url} alt={item.titulo} className="w-14 h-10 object-cover rounded-lg shrink-0" />
      ) : (
        <div className="w-14 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
          <PlaySquare size={18} className="text-slate-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm truncate">{item.titulo}</p>
        <a href={item.url_youtube} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 mt-0.5">
          <ExternalLink size={10} /> YouTube
        </a>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function PodcastsClient() {
  const supabase = createClient();
  const [episodios, setEpisodios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [thumbFile, setThumbFile] = useState<File | null>(null);

  const form = useForm<PodcastFormData>({
    resolver: zodResolver(podcastSchema),
    defaultValues: { titulo: "", descricao: "", url_youtube: "", thumbnail_url: "" },
  });

  const fetchEpisodios = async () => {
    const { data } = await supabase
      .from("biblioteca_lives")
      .select("*")
      .order("created_at", { ascending: false });
    setEpisodios(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEpisodios(); }, []);

  const uploadThumb = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `podcast-covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const onSubmit = async (data: PodcastFormData) => {
    setSaving(true);
    try {
      let thumbUrl = data.thumbnail_url || null;
      if (thumbFile) {
        thumbUrl = await uploadThumb(thumbFile);
        if (!thumbUrl) throw new Error("Falha no upload da thumbnail");
      }

      const { error } = await supabase.from("biblioteca_lives").insert({
        titulo: data.titulo,
        descricao: data.descricao || null,
        url: data.url_youtube,
        thumbnail: thumbUrl,
        tipo: "podcast",
      });
      if (error) throw error;
      toast.success("Episódio adicionado!");
      form.reset();
      setThumbFile(null);
      setShowForm(false);
      fetchEpisodios();
    } catch (err: any) {
      toast.error("Erro ao salvar", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("biblioteca_lives").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Episódio excluído");
    setEpisodios(prev => prev.filter(e => e.id !== id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = episodios.findIndex(e => e.id === active.id);
    const newIdx = episodios.findIndex(e => e.id === over.id);
    const reordered = arrayMove(episodios, oldIdx, newIdx);
    setEpisodios(reordered);
    // Save order — update each item's ordem field
    const updates = reordered.map((item, idx) =>
      supabase.from("biblioteca_lives").update({ ordem: idx }).eq("id", item.id)
    );
    await Promise.all(updates);
    toast.success("Ordem salva!");
  };

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{episodios.length} episódios na biblioteca</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-black px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> Novo Episódio
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="font-black text-white text-sm uppercase tracking-widest">Adicionar Episódio</h3>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Título *</label>
                <input {...form.register("titulo")} placeholder="Nome do episódio" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
                {form.formState.errors.titulo && <p className="text-red-400 text-xs mt-1">{form.formState.errors.titulo.message}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">URL YouTube *</label>
                <input {...form.register("url_youtube")} placeholder="https://youtube.com/..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" />
                {form.formState.errors.url_youtube && <p className="text-red-400 text-xs mt-1">{form.formState.errors.url_youtube.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Descrição</label>
              <textarea {...form.register("descricao")} rows={3} placeholder="Sobre este episódio..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500 resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Thumbnail</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                  <Upload size={14} /> {thumbFile ? thumbFile.name : "Upload imagem"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbFile(e.target.files?.[0] || null)} />
                </label>
                <span className="text-slate-500 text-xs self-center">ou</span>
                <input {...form.register("thumbnail_url")} placeholder="https://..." className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-green-500" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-black px-6 py-2.5 rounded-xl transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista com DnD */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-500" /></div>
        ) : episodios.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-2xl">
            <Mic2 size={36} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-bold">Nenhum episódio ainda. Adicione o primeiro!</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={episodios.map(e => e.id)} strategy={verticalListSortingStrategy}>
              {episodios.map((ep) => (
                <SortableRow key={ep.id} item={ep} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
