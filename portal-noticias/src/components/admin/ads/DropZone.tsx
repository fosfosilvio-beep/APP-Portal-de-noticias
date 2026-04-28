"use client";

import { useDroppable } from "@dnd-kit/core";
import { X, ImageIcon } from "lucide-react";
import type { AdSlot, ZoneDefinition } from "@/hooks/useAdCanvas";

interface DropZoneProps {
  zone: ZoneDefinition;
  assignedSlot: AdSlot | null;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export default function DropZone({
  zone,
  assignedSlot,
  isSelected,
  onSelect,
  onRemove,
}: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: zone.id });

  const isEmpty = !assignedSlot;
  const hasImage =
    assignedSlot?.codigo_html_ou_imagem &&
    !assignedSlot.codigo_html_ou_imagem.includes("<");
  const hasHtml =
    assignedSlot?.codigo_html_ou_imagem &&
    assignedSlot.codigo_html_ou_imagem.includes("<");

  // Calculamos a altura proporcional para o preview no canvas (max 120px)
  const aspectRatio = zone.defaultHeight / zone.defaultWidth;
  const previewH = Math.min(Math.round(120 * aspectRatio), 120);

  const borderClass = isSelected
    ? "ring-2 ring-blue-500 border-blue-400"
    : isOver
    ? "ring-2 ring-cyan-400 border-cyan-400 scale-[1.01]"
    : isEmpty
    ? "border-dashed border-slate-600 hover:border-slate-400"
    : "border-solid border-emerald-500/50";

  const bgClass = isOver
    ? "bg-cyan-500/10"
    : isEmpty
    ? "bg-slate-800/40 hover:bg-slate-800/60"
    : "bg-emerald-900/20";

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`relative w-full rounded-lg border-2 transition-all duration-200 cursor-pointer group ${borderClass} ${bgClass}`}
      style={{ minHeight: `${Math.max(previewH, 40)}px` }}
    >
      {/* Label da zona */}
      <div className="absolute -top-2.5 left-2 z-10">
        <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-slate-400">
          {zone.label}
        </span>
      </div>

      {isEmpty ? (
        /* Estado vazio */
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 py-3 px-2">
          {isOver ? (
            <>
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <ImageIcon size={16} className="text-cyan-400" />
              </div>
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                Soltar aqui
              </span>
            </>
          ) : (
            <>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                {zone.defaultWidth} × {zone.defaultHeight}px
              </span>
              <span className="text-[8px] text-slate-700 text-center px-2">
                {zone.description}
              </span>
            </>
          )}
        </div>
      ) : (
        /* Estado ocupado — preview do banner */
        <div className="relative w-full overflow-hidden rounded-md" style={{ minHeight: `${Math.max(previewH, 40)}px` }}>
          {hasImage ? (
            <img
              src={assignedSlot!.codigo_html_ou_imagem!}
              alt={assignedSlot!.nome_slot}
              className="w-full h-full object-cover"
              style={{ maxHeight: "120px" }}
            />
          ) : hasHtml ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-700/50 py-2 px-3">
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">
                ⚡ HTML/Script — {assignedSlot!.nome_slot}
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700/50 py-2">
              <span className="text-[8px] font-bold text-slate-400">
                {assignedSlot!.nome_slot}
              </span>
            </div>
          )}

          {/* Overlay info */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-[9px] font-black uppercase tracking-widest">
              {assignedSlot!.nome_slot}
            </span>
          </div>

          {/* Badge ativo */}
          <div className="absolute top-1 left-1">
            <span className="bg-emerald-500 text-white text-[7px] font-black uppercase px-1 py-0.5 rounded-full">
              ✓ Ativo
            </span>
          </div>

          {/* Botão remover */}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
          >
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  );
}
