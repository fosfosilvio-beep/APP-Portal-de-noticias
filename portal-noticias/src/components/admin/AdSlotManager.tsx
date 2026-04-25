"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Save, Loader2, GripVertical, Eye, EyeOff, Trash2, Upload, ExternalLink, Monitor
} from "lucide-react";
import { toast } from "@/lib/toast";

interface AdSlot {
  id: string;
  nome_slot: string;
  posicao_html: string;
  dimensoes: string;
  codigo_html_ou_imagem: string | null;
  status_ativo: boolean;
  cliente_nome?: string | null;
  link_destino?: string | null;
  validade_ate?: string | null;
  cliques?: number;
}

// Mapa de posições para o Skeleton Visual
const SKELETON_ZONES: Record<string, { label: string; style: string }> = {
  header_top:      { label: "📢 Header — 728×90",      style: "w-full h-8 bg-blue-100 border-blue-300" },
  sidebar_right_1: { label: "📐 Sidebar 1 — 300×250",  style: "w-1/4 h-16 bg-purple-100 border-purple-300" },
  sidebar_right_2: { label: "📐 Sidebar 2 — 300×400",  style: "w-1/4 h-24 bg-purple-100 border-purple-300" },
  footer_top:      { label: "📢 Footer — 728×90",       style: "w-full h-8 bg-green-100 border-green-300" },
};

// ========== SORTABLE ITEM ==========
function SortableAdItem({ slot, onToggle, onDelete, onUpdate, onUploadImage }: {
  slot: AdSlot;
  onToggle: (id: string, val: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, field: string, val: string) => void;
  onUploadImage: (id: string, file: File) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slot.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const zoneInfo = SKELETON_ZONES[slot.posicao_html];

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Header do Slot */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
        <button className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical size={18} />
        </button>
        <div className="flex-1">
          <span className="font-black text-slate-800 text-sm">{slot.nome_slot}</span>
          <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{slot.dimensoes}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(slot.id, !slot.status_ativo)}
            className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest transition-colors ${
              slot.status_ativo
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {slot.status_ativo ? <Eye size={12} /> : <EyeOff size={12} />}
            {slot.status_ativo ? "Ativo" : "Pausado"}
          </button>
          <button onClick={() => onDelete(slot.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Corpo do Slot */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preview */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Arte / Imagem</label>
          <div className="relative group bg-slate-100 rounded-xl overflow-hidden border border-slate-200" style={{ height: "100px" }}>
            {slot.codigo_html_ou_imagem && !slot.codigo_html_ou_imagem.includes("<") ? (
              <img key={slot.codigo_html_ou_imagem} src={slot.codigo_html_ou_imagem} alt={slot.nome_slot} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1">
                <Monitor size={24} />
                <span className="text-[9px] font-bold uppercase">{zoneInfo?.label || slot.posicao_html}</span>
              </div>
            )}
            {/* Upload overlay */}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={16} className="text-white" />
              <span className="text-white text-[10px] font-black uppercase">Upload Imagem</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files?.[0]) await onUploadImage(slot.id, e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>

        {/* Configurações */}
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">URL / Código HTML</label>
            <textarea
              value={slot.codigo_html_ou_imagem || ""}
              onChange={(e) => onUpdate(slot.id, "codigo_html_ou_imagem", e.target.value)}
              rows={2}
              placeholder="Cole URL de imagem ou snippet HTML..."
              className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-slate-50 text-zinc-900 font-bold placeholder:text-zinc-500 resize-none transition-all"
            />
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={slot.cliente_nome || ""}
                  onChange={(e) => onUpdate(slot.id, "cliente_nome", e.target.value)}
                  placeholder="Ex: Supermercado X"
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Link de Destino</label>
                <input
                  type="url"
                  value={slot.link_destino || ""}
                  onChange={(e) => onUpdate(slot.id, "link_destino", e.target.value)}
                  placeholder="https://cliente.com.br"
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Posição no Layout</label>
              <select
                value={slot.posicao_html}
                onChange={(e) => onUpdate(slot.id, "posicao_html", e.target.value)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer transition-all"
              >
                <option value="header_top">Header — Topo</option>
                <option value="sidebar_right_1">Sidebar — Lateral 1</option>
                <option value="sidebar_right_2">Sidebar — Lateral 2</option>
                <option value="in_article">In-Article (Dentro do Texto)</option>
                <option value="footer_top">Footer — Rodapé</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Data de Expiração</label>
                <input
                  type="date"
                  value={slot.validade_ate ? new Date(slot.validade_ate).toISOString().split('T')[0] : ""}
                  onChange={(e) => onUpdate(slot.id, "validade_ate", e.target.value ? new Date(e.target.value).toISOString() : "")}
                  className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-zinc-900 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cliques Recebidos</label>
                <div className="w-full text-xs font-black px-3 py-2 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  {slot.cliques || 0} CLIQUES
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== SKELETON MAP ==========
function PortalSkeletonMap({ slots, onZoneClick, selectedZone }: { slots: AdSlot[], onZoneClick: (pos: string) => void, selectedZone: string | null }) {
  const activeByPos = slots.reduce<Record<string, AdSlot>>((acc, s) => {
    if (s.status_ativo) acc[s.posicao_html] = s;
    return acc;
  }, {});

  const getZoneClass = (pos: string, base: string, active: string, inactive: string) => {
    const isSelected = selectedZone === pos;
    const hasActive = activeByPos[pos];
    return `${base} cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${isSelected ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-900 border-solid' : 'border-dashed'} ${hasActive ? active : inactive}`;
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        🗺️ Mapa Visual do Portal — Zonas Publicitárias
      </p>
      {/* Header Zone */}
      <div 
        onClick={() => onZoneClick("header_top")}
        className={getZoneClass("header_top", "w-full h-16 rounded-lg border-2 flex items-center justify-center text-[9px] font-black uppercase tracking-wider", "bg-blue-500/20 border-blue-400 text-blue-300", "border-slate-700 text-slate-600 hover:bg-slate-800/50")}
      >
        {activeByPos["header_top"] ? `✓ ${activeByPos["header_top"].nome_slot}` : "HEADER 728×90 — Vazio"}
      </div>

      {/* Body zone */}
      <div className="flex gap-3">
        {/* Main content area */}
        <div className="flex-1 bg-slate-800/50 rounded-lg h-52 flex items-center justify-center">
          <div className="space-y-1.5 w-4/5">
            <div className="h-2 bg-slate-700 rounded-full w-full" />
            <div className="h-2 bg-slate-700 rounded-full w-3/4" />
            <div className="h-2 bg-slate-700 rounded-full w-5/6" />
            <div className="h-1 bg-slate-700/50 rounded-full w-1/2 mt-2" />
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-1/4 space-y-2">
          {["sidebar_right_1", "sidebar_right_2"].map((pos) => (
            <div 
              key={pos} 
              onClick={() => onZoneClick(pos)}
              className={getZoneClass(pos, "rounded-lg border-2 flex items-center justify-center text-[8px] font-black uppercase tracking-wider p-2", "bg-purple-500/20 border-purple-400 text-purple-300", "border-slate-700 text-slate-600 hover:bg-slate-800/50") + (pos === "sidebar_right_1" ? " h-24" : " h-40")}
            >
              {activeByPos[pos] ? `✓ Slot Ativo` : pos === "sidebar_right_1" ? "300×250 Vazio" : "300×400 Vazio"}
            </div>
          ))}
        </div>
      </div>

      {/* In-Article */}
      <div 
        onClick={() => onZoneClick("in_article")}
        className={getZoneClass("in_article", "w-full h-12 rounded-lg border-2 flex items-center justify-center text-[9px] font-black uppercase tracking-wider", "bg-yellow-500/20 border-yellow-400 text-yellow-300", "border-slate-700 text-slate-600 hover:bg-slate-800/50")}
      >
        {activeByPos["in_article"] ? `✓ In-Article — ${activeByPos["in_article"].nome_slot}` : "IN-ARTICLE — Vazio"}
      </div>

      {/* Footer Zone */}
      <div 
        onClick={() => onZoneClick("footer_top")}
        className={getZoneClass("footer_top", "w-full h-16 rounded-lg border-2 flex items-center justify-center text-[9px] font-black uppercase tracking-wider", "bg-emerald-500/20 border-emerald-400 text-emerald-300", "border-slate-700 text-slate-600 hover:bg-slate-800/50")}
      >
        {activeByPos["footer_top"] ? `✓ ${activeByPos["footer_top"].nome_slot}` : "FOOTER 728×90 — Vazio"}
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function AdSlotManager() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterZone, setFilterZone] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    const { data } = await supabase.from("ad_slots").select("*").order("created_at");
    if (data) {
      const mapped = data.map((s: any) => ({
        ...s,
        cliente_nome: s.advertiser_name || s.cliente_nome,
        link_destino: s.click_url || s.link_destino,
        validade_ate: s.end_date || s.validade_ate
      }));
      setSlots(mapped);
    }
    setLoading(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSlots((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggle = (id: string, val: boolean) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, status_ativo: val } : s)));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remover este slot?")) return;
    await supabase.from("ad_slots").delete().eq("id", id);
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: string, val: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const handleUploadImage = async (id: string, file: File) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot) return;
    const ext = file.name.split(".").pop();
    const path = `ads/${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true });
    if (error) { alert("Erro no upload: " + error.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
    handleUpdate(id, "codigo_html_ou_imagem", publicUrl);
  };

  const handleAddSlot = async () => {
    const { data, error } = await supabase.from("ad_slots").insert([{
      nome_slot: "Novo Slot Publicitário",
      posicao_html: "sidebar_right_1",
      dimensoes: "300x250",
      status_ativo: false
    }]).select().single();
    if (!error && data) setSlots([...slots, data as AdSlot]);
  };


  const handleSaveAll = async () => {
    console.log("Iniciando salvamento de todos os slots (Sync with DB columns)...", slots);
    setSaving(true);
    try {
      const updates = slots.map(slot => 
        supabase.from("ad_slots").update({
          nome_slot: slot.nome_slot,
          posicao_html: slot.posicao_html,
          dimensoes: slot.dimensoes,
          codigo_html_ou_imagem: slot.codigo_html_ou_imagem,
          status_ativo: slot.status_ativo,
          advertiser_name: slot.cliente_nome,
          click_url: slot.link_destino,
          end_date: slot.validade_ate,
        }).eq("id", slot.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        console.error("Erros ao salvar slots:", errors);
        toast.error("Erro", "Ocorreram erros ao salvar alguns slots.");
      } else {
        setSaving(false);
        toast.success("Sucesso", "Todos os slots foram salvos com sucesso!");
        await fetchSlots(); 
      }
    } catch (err: any) {
      console.error("Erro crítico no salvamento:", err);
      toast.error("Erro Crítico", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mapa Esqueleto */}
      <PortalSkeletonMap 
        slots={slots} 
        onZoneClick={(zone) => setFilterZone(zone === filterZone ? null : zone)}
        selectedZone={filterZone}
      />

      {/* Header de Ação */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-900 text-lg">Gerenciador de Publicidade</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-500 font-medium">{slots.filter(s => s.status_ativo).length} de {slots.length} slots ativos</p>
            {filterZone && (
              <button 
                onClick={() => setFilterZone(null)}
                className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full hover:bg-blue-200 transition-colors"
              >
                Filtrando: {filterZone} (Limpar ✕)
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddSlot}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus size={16} /> Criar Slot
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-lg"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publicar Tudo
          </button>
        </div>
      </div>

      {/* Lista Drag & Drop */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Loader2 className="animate-spin mx-auto text-blue-500 mb-3" size={28} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Carregando Slots...</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {slots
                .filter(s => !filterZone || s.posicao_html === filterZone)
                .map((slot) => (
                <SortableAdItem
                  key={slot.id}
                  slot={slot}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                  onUploadImage={handleUploadImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {slots.length === 0 && !loading && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Monitor size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">Nenhum slot criado. Clique em "Criar Slot" para começar.</p>
        </div>
      )}
    </div>
  );
}
