"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";
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
import { GripVertical, Trash2, Plus, Upload, Loader2, Save, Link as LinkIcon } from "lucide-react";

interface HeroBanner {
  id: string;
  image: string;
  link?: string;
  duration: number;
  scale: "object-cover" | "object-contain";
  animation: "fade" | "slide" | "zoom";
}

function SortableBannerItem({ banner, onUpdate, onDelete }: { banner: HeroBanner, onUpdate: (id: string, field: string, value: any) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-start gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl ${isDragging ? 'shadow-2xl border-pink-500/50' : ''}`}>
      <div {...attributes} {...listeners} className="cursor-grab pt-2 text-slate-500 hover:text-white transition-colors">
        <GripVertical size={20} />
      </div>
      
      <div className="w-48 h-24 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0 relative group">
        <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          <Upload size={20} className="text-white" />
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               toast.promise(
                 (async () => {
                   const supabase = createClient();
                   const ext = file.name.split(".").pop();
                   const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                   const { error } = await supabase.storage.from("media").upload(path, file);
                   if (error) throw error;
                   const { data } = supabase.storage.from("media").getPublicUrl(path);
                   onUpdate(banner.id, "image", data.publicUrl);
                 })(),
                 { loading: "Enviando...", success: "Banner atualizado", error: "Erro no upload" }
               );
             }
          }} />
        </label>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
            <LinkIcon size={12} /> Link de Destino (Opcional)
          </label>
          <input 
            type="text" 
            value={banner.link || ""} 
            onChange={(e) => onUpdate(banner.id, "link", e.target.value)}
            placeholder="https://..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Duração (ms)</label>
          <input 
            type="number" 
            value={banner.duration} 
            onChange={(e) => onUpdate(banner.id, "duration", parseInt(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Escala</label>
          <select 
            value={banner.scale} 
            onChange={(e) => onUpdate(banner.id, "scale", e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
          >
            <option value="object-cover">Preencher (Cover)</option>
            <option value="object-contain">Conter (Contain)</option>
          </select>
        </div>
      </div>

      <button onClick={() => onDelete(banner.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function HeroBannersClient() {
  const supabase = createClient();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const { data } = await supabase.from("configuracao_portal").select("hero_banner_items").single();
    if (data && Array.isArray(data.hero_banner_items)) {
      setBanners(data.hero_banner_items as HeroBanner[]);
    }
    setLoading(false);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);
      setBanners(arrayMove(banners, oldIndex, newIndex));
    }
  };

  const addBanner = () => {
    const newBanner: HeroBanner = { 
      id: Math.random().toString(36).slice(2), 
      image: "https://placehold.co/1200x400/1e293b/475569?text=Novo+Banner",
      link: "",
      duration: 5000,
      scale: "object-cover",
      animation: "fade"
    };
    setBanners([...banners, newBanner]);
  };

  const updateBanner = (id: string, field: string, value: any) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeBanner = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("configuracao_portal").update({
        hero_banner_items: banners
      }).eq("id", 1);
      if (error) throw error;
      toast.success("Banners salvos com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-violet-500" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-lg">Banners em Destaque (Home)</h3>
        <button onClick={addBanner} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          <Plus size={16} /> Adicionar Banner
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
        {banners.length === 0 ? (
          <div className="text-center p-12 text-slate-500 font-medium border-2 border-dashed border-slate-800 rounded-xl">
            Nenhum banner configurado.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={banners.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {banners.map(banner => (
                  <SortableBannerItem 
                    key={banner.id} 
                    banner={banner} 
                    onUpdate={updateBanner} 
                    onDelete={removeBanner} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? "Salvando..." : "Gravar Ordem e Imagens"}
      </button>
    </div>
  );
}
