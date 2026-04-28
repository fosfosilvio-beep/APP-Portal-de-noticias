"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Upload, Eye, EyeOff, Trash2, GripVertical,
  ImageIcon, Code2, MonitorOff
} from "lucide-react";
import type { AdSlot } from "@/hooks/useAdCanvas";

// ─── Item arrastável individual ────────────────────────────────────────────────

interface DraggableBannerProps {
  slot: AdSlot;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: (val: boolean) => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
}

function DraggableBanner({
  slot, isSelected, onSelect, onToggle, onDelete, onUpload
}: DraggableBannerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: slot.id,
    data: { slot },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const hasImage = slot.codigo_html_ou_imagem && !slot.codigo_html_ou_imagem.includes("<");
  const hasHtml  = slot.codigo_html_ou_imagem && slot.codigo_html_ou_imagem.includes("<");

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`relative bg-white border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md
        ${isSelected  ? "border-blue-400 ring-2 ring-blue-300" : "border-slate-200"}
        ${isDragging  ? "shadow-2xl rotate-1" : ""}
      `}
    >
      {/* Thumbnail */}
      <div className="relative h-20 bg-slate-100 overflow-hidden">
        {hasImage ? (
          <img
            src={slot.codigo_html_ou_imagem!}
            alt={slot.nome_slot}
            className="w-full h-full object-cover"
          />
        ) : hasHtml ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <Code2 size={20} className="text-slate-400" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <MonitorOff size={20} className="text-slate-300" />
          </div>
        )}

        {/* Upload overlay */}
        <label
          className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Upload size={14} className="text-white" />
          <span className="text-white text-[9px] font-black uppercase">Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }}
          />
        </label>

        {/* Status badge */}
        <div className="absolute top-1 left-1">
          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${
            slot.status_ativo ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
          }`}>
            {slot.status_ativo ? "Ativo" : "Pausado"}
          </span>
        </div>

        {/* Drag handle */}
        <div
          className="absolute top-1 right-1 bg-black/30 backdrop-blur-sm rounded-md p-1 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={12} className="text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="px-2.5 py-2">
        <p className="text-[11px] font-black text-slate-800 truncate">{slot.nome_slot}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          {slot.dimensoes || "—"}
          {slot.zone_id && (
            <span className="ml-1 text-blue-400">• {slot.zone_id.split("__")[0]}</span>
          )}
        </p>
      </div>

      {/* Ações rápidas */}
      <div className="flex border-t border-slate-100">
        <button
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-black text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest"
          onClick={(e) => { e.stopPropagation(); onToggle(!slot.status_ativo); }}
        >
          {slot.status_ativo ? <EyeOff size={10} /> : <Eye size={10} />}
          {slot.status_ativo ? "Pausar" : "Ativar"}
        </button>
        <div className="w-px bg-slate-100" />
        <button
          className="flex items-center justify-center px-3 py-1.5 text-slate-300 hover:text-red-500 transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Biblioteca (painel esquerdo) ──────────────────────────────────────────────

interface AdBannerLibraryProps {
  slots: AdSlot[];
  selectedSlotId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string, val: boolean) => void;
  onDelete: (id: string) => void;
  onUpload: (id: string, file: File) => void;
  onAdd: () => void;
}

export default function AdBannerLibrary({
  slots,
  selectedSlotId,
  onSelect,
  onToggle,
  onDelete,
  onUpload,
  onAdd,
}: AdBannerLibraryProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-sm font-black text-slate-900">Banco de Banners</h3>
          <p className="text-[10px] text-slate-400 font-medium">
            {slots.filter((s) => s.status_ativo).length}/{slots.length} ativos
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={12} />
          Novo
        </button>
      </div>

      {/* Instrução */}
      <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">
          ✦ Arraste um banner para o canvas ao lado
        </p>
      </div>

      {/* Lista de banners */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {slots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-300">
            <ImageIcon size={32} />
            <p className="text-xs font-bold text-center">
              Nenhum banner ainda.<br />Clique em &quot;Novo&quot; para criar.
            </p>
          </div>
        ) : (
          slots.map((slot) => (
            <DraggableBanner
              key={slot.id}
              slot={slot}
              isSelected={selectedSlotId === slot.id}
              onSelect={() => onSelect(slot.id)}
              onToggle={(val) => onToggle(slot.id, val)}
              onDelete={() => onDelete(slot.id)}
              onUpload={(file) => onUpload(slot.id, file)}
            />
          ))
        )}
      </div>
    </div>
  );
}
