"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  Save, Loader2, LayoutPanelLeft, SlidersHorizontal,
  ImageIcon, Sparkles, Plus
} from "lucide-react";

import AdBannerLibrary from "./AdBannerLibrary";
import PortalCanvas from "./PortalCanvas";
import AdPropertiesPanel from "./AdPropertiesPanel";
import { useAdCanvas, CANVAS_ZONES } from "@/hooks/useAdCanvas";
import type { AdSlot } from "@/hooks/useAdCanvas";

// ─── Overlay visual durante o drag ───────────────────────────────────────────

function DragOverlayCard({ slot }: { slot: AdSlot }) {
  const hasImage =
    slot.codigo_html_ou_imagem && !slot.codigo_html_ou_imagem.includes("<");

  return (
    <div className="bg-white border-2 border-blue-400 rounded-xl shadow-2xl overflow-hidden w-40 rotate-2 scale-105 cursor-grabbing">
      <div className="h-16 bg-slate-100 overflow-hidden">
        {hasImage ? (
          <img
            src={slot.codigo_html_ou_imagem!}
            alt={slot.nome_slot}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={20} className="text-slate-300" />
          </div>
        )}
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[10px] font-black text-slate-900 truncate">{slot.nome_slot}</p>
        <p className="text-[8px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">
          Soltando na zona...
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdCanvasEditor() {
  const {
    slots,
    assignments,
    selectedSlotId,
    selectedSlot,
    loading,
    saving,
    setSelectedSlotId,
    assignToZone,
    removeFromZone,
    updateSlot,
    addSlot,
    deleteSlot,
    uploadImage,
    saveAll,
    latestNews,
    portalConfig,
    previewNoticiaId,
    setPreviewNoticiaId,
  } = useAdCanvas();

  const [activeDragSlot, setActiveDragSlot] = useState<AdSlot | null>(null);
  const [rightPanel, setRightPanel] = useState<"canvas" | "properties">("canvas");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // evita drag acidental em cliques
    }),
    useSensor(KeyboardSensor)
  );

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const slot = slots.find((s) => s.id === event.active.id);
    if (slot) setActiveDragSlot(slot);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragSlot(null);

    if (!over) return;

    const slotId = String(active.id);
    const zoneId = String(over.id);

    // Verifica se o destino é uma zona válida do canvas
    const isValidZone = CANVAS_ZONES.some((z) => z.id === zoneId);
    if (!isValidZone) return;

    assignToZone(slotId, zoneId);
    setSelectedSlotId(slotId);

    // Abre painel de propriedades após drop
    setRightPanel("properties");
  };

  // ── Toggle entre canvas e propriedades no painel direito ─────────────────────

  const handleSelectSlot = (id: string) => {
    setSelectedSlotId(id);
    setRightPanel("properties");
  };

  // ── Stats do canvas ──────────────────────────────────────────────────────────

  const totalZones  = CANVAS_ZONES.length;
  const filledZones = CANVAS_ZONES.filter((z) => !!assignments[z.id]).length;
  const activeSlots = slots.filter((s) => s.status_ativo).length;

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-400">
        <Loader2 size={36} className="animate-spin text-blue-500" />
        <p className="text-sm font-bold">Carregando Editor de Publicidade...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">

        {/* ── Topbar do editor ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 border-b border-blue-700 shadow-lg z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tighter">Visual Ad Builder <span className="text-blue-100 font-black">v3.0</span></h2>
              <p className="text-[10px] text-blue-100 font-bold uppercase tracking-widest flex items-center gap-2">
                <span>{filledZones}/{totalZones} Zonas • {activeSlots} Ativos</span>
                <span className="text-white font-black bg-blue-500/50 px-1.5 py-0.5 rounded border border-blue-400">DEPLOY ATIVO: 20260428-1510</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle painel direito (mobile/tablet) */}
            <div className="flex lg:hidden bg-slate-100 rounded-xl p-0.5">
              <button
                onClick={() => setRightPanel("canvas")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                  rightPanel === "canvas"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <LayoutPanelLeft size={11} />
                Canvas
              </button>
              <button
                onClick={() => setRightPanel("properties")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                  rightPanel === "properties"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <SlidersHorizontal size={11} />
                Props
              </button>
            </div>

            <button
              onClick={() => addSlot()}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-blue-200 group shadow-sm"
            >
              <Plus size={12} className="group-hover:rotate-90 transition-transform" />
              Adicionar Novo Slot
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* Publicar */}
            <button
              onClick={saveAll}
              disabled={saving}
              className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-xl transition-all shadow-xl shadow-slate-200 hover:shadow-blue-200 active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} className="text-blue-400" />
              )}
              {saving ? "Deploying..." : "Publicar Tudo 🚀"}
            </button>
          </div>
        </div>

        {/* ── Progresso de zonas ── */}
        <div className="px-5 py-2 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalZones ? (filledZones / totalZones) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {Math.round(totalZones ? (filledZones / totalZones) * 100 : 0)}% preenchido
            </span>
          </div>
        </div>

        {/* ── Layout Split View ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Painel esquerdo: Biblioteca de banners (30%) */}
          <div className="w-64 xl:w-72 flex-shrink-0 border-r border-slate-200 bg-slate-50 overflow-hidden flex flex-col">
            <AdBannerLibrary
              slots={slots.filter(s => !s.zone_id)}
              selectedSlotId={selectedSlotId}
              onSelect={handleSelectSlot}
              onToggle={(id, val) => updateSlot(id, { status_ativo: val })}
              onDelete={deleteSlot}
              onUpload={uploadImage}
              onAdd={() => addSlot()}
            />
          </div>

          {/* Painel central: Canvas (ocupa o espaço restante) */}
          <div className={`flex-1 overflow-hidden flex flex-col bg-slate-900
            ${rightPanel === "properties" ? "hidden lg:flex" : "flex"}
          `}>
            <PortalCanvas
              slots={slots}
              assignments={assignments}
              selectedSlotId={selectedSlotId}
              onSelectSlot={handleSelectSlot}
              onRemoveFromZone={removeFromZone}
              latestNews={latestNews}
              portalConfig={portalConfig}
              previewNoticiaId={previewNoticiaId}
              onAddSlot={addSlot}
            />
          </div>

          {/* Painel direito: Propriedades (280px fixo) */}
          <div className={`w-72 xl:w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-hidden flex flex-col
            ${rightPanel === "canvas" ? "hidden lg:flex" : "flex"}
          `}>
            {/* Header do painel de propriedades */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white">
              <SlidersHorizontal size={14} className="text-slate-400" />
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                Propriedades
              </h3>
              {selectedSlot && (
                <button
                  onClick={() => { setSelectedSlotId(null); }}
                  className="ml-auto text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-wider transition-colors"
                >
                  Limpar ✕
                </button>
              )}
            </div>

            <AdPropertiesPanel
              slot={selectedSlot}
              onUpdate={(patch) => selectedSlotId && updateSlot(selectedSlotId, patch)}
              onSave={saveAll}
              saving={saving}
              latestNews={latestNews}
              previewNoticiaId={previewNoticiaId}
              setPreviewNoticiaId={setPreviewNoticiaId}
            />
          </div>
        </div>
      </div>

      {/* Overlay visual durante o drag */}
      <DragOverlay>
        {activeDragSlot ? <DragOverlayCard slot={activeDragSlot} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
