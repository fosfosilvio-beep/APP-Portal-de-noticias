"use client";

import { useState, useEffect } from "react";
import {
  Link2, Calendar, User, Maximize2, Minimize2, Eye, EyeOff,
  Save, ChevronDown
} from "lucide-react";
import type { AdSlot, ZoneDefinition } from "@/hooks/useAdCanvas";
import { CANVAS_ZONES } from "@/hooks/useAdCanvas";

interface AdPropertiesPanelProps {
  slot: AdSlot | null;
  onUpdate: (patch: Partial<AdSlot>) => void;
  onSave: () => void;
  saving: boolean;
}

// Slider com label
function DimensionControl({
  label, value, min, max, onChange
}: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 text-[11px] font-black text-center text-slate-900 border border-slate-200 rounded-md px-1 py-0.5 bg-white outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          />
          <span className="text-[9px] text-slate-400 font-bold">px</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-[8px] text-slate-400 font-bold">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function AdPropertiesPanel({ slot, onUpdate, onSave, saving }: AdPropertiesPanelProps) {
  const [keepRatio, setKeepRatio] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Zona atual do slot
  const zone: ZoneDefinition | undefined = CANVAS_ZONES.find((z) => z.id === slot?.zone_id);
  const defaultW = zone?.defaultWidth ?? 728;
  const defaultH = zone?.defaultHeight ?? 90;

  const currentW = slot?.custom_width ?? defaultW;
  const currentH = slot?.custom_height ?? defaultH;

  useEffect(() => {
    if (keepRatio && currentW && currentH) {
      setAspectRatio(currentH / currentW);
    }
  }, [keepRatio, currentW, currentH]);

  const handleWidthChange = (w: number) => {
    if (!slot) return;
    if (keepRatio && aspectRatio) {
      onUpdate({ custom_width: w, custom_height: Math.round(w * aspectRatio) });
    } else {
      onUpdate({ custom_width: w });
    }
  };

  const handleHeightChange = (h: number) => {
    if (!slot) return;
    if (keepRatio && aspectRatio) {
      onUpdate({ custom_height: h, custom_width: Math.round(h / aspectRatio) });
    } else {
      onUpdate({ custom_height: h });
    }
  };

  const handleResetDimensions = () => {
    if (!slot) return;
    onUpdate({ custom_width: null, custom_height: null });
  };

  if (!slot) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-slate-300 px-6 text-center">
        <Maximize2 size={28} />
        <p className="text-xs font-bold text-slate-400">
          Selecione um banner no canvas ou na biblioteca para editar suas propriedades.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Título */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Propriedades</p>
        <h4 className="text-sm font-black text-slate-900 truncate">{slot.nome_slot}</h4>
        {zone && (
          <span className="text-[9px] text-blue-500 font-bold">{zone.label}</span>
        )}
      </div>

      <div className="p-4 space-y-5">

        {/* Informações básicas */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
            Nome do Banner
          </label>
          <input
            type="text"
            value={slot.nome_slot}
            onChange={(e) => onUpdate({ nome_slot: e.target.value })}
            className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Cliente */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <User size={10} />Cliente / Anunciante
          </label>
          <input
            type="text"
            value={slot.cliente_nome || ""}
            onChange={(e) => onUpdate({ cliente_nome: e.target.value })}
            placeholder="Ex: Supermercado Avenida"
            className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* URL de destino */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Link2 size={10} />URL de Destino
          </label>
          <input
            type="url"
            value={slot.link_destino || ""}
            onChange={(e) => onUpdate({ link_destino: e.target.value })}
            placeholder="https://anunciante.com.br"
            className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* URL / HTML */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
            Arte (URL ou HTML)
          </label>
          <textarea
            value={slot.codigo_html_ou_imagem || ""}
            onChange={(e) => onUpdate({ codigo_html_ou_imagem: e.target.value })}
            rows={3}
            placeholder="Cole URL de imagem ou snippet HTML/Script..."
            className="w-full text-[11px] font-mono px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none"
          />
        </div>

        {/* Separador */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Dimensões
            </p>
            <div className="flex items-center gap-2">
              {(slot.custom_width || slot.custom_height) && (
                <button
                  onClick={handleResetDimensions}
                  className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-wider"
                >
                  Resetar padrão
                </button>
              )}
              <button
                onClick={() => setKeepRatio(!keepRatio)}
                className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full transition-colors ${
                  keepRatio ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                }`}
              >
                {keepRatio ? <Minimize2 size={9} /> : <Maximize2 size={9} />}
                {keepRatio ? "Proporção Livre" : "Manter Proporção"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <DimensionControl
              label={`Largura (Padrão: ${defaultW}px)`}
              value={currentW}
              min={50}
              max={1920}
              onChange={handleWidthChange}
            />
            <DimensionControl
              label={`Altura (Padrão: ${defaultH}px)`}
              value={currentH}
              min={20}
              max={600}
              onChange={handleHeightChange}
            />
          </div>

          {zone && (
            <p className="mt-2 text-[9px] text-slate-400 font-medium">
              Padrão da zona: {defaultW}×{defaultH}px
              {(slot.custom_width || slot.custom_height) && (
                <span className="ml-1 text-amber-500 font-black">• Dimensão customizada</span>
              )}
            </p>
          )}
        </div>

        {/* Data de expiração */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar size={10} />Expira em
          </label>
          <input
            type="date"
            value={slot.validade_ate ? new Date(slot.validade_ate).toISOString().split("T")[0] : ""}
            onChange={(e) => onUpdate({ validade_ate: e.target.value ? new Date(e.target.value).toISOString() : "" })}
            className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Toggle status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="text-xs font-black text-slate-800">Status do Banner</p>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">
              {slot.status_ativo ? "Visível no portal" : "Oculto do portal"}
            </p>
          </div>
          <button
            onClick={() => onUpdate({ status_ativo: !slot.status_ativo })}
            className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${
              slot.status_ativo
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            {slot.status_ativo ? <Eye size={11} /> : <EyeOff size={11} />}
            {slot.status_ativo ? "Ativo" : "Pausado"}
          </button>
        </div>

        {/* Zona selecionada */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
            Zona Alocada
          </label>
          <select
            value={slot.zone_id || ""}
            onChange={(e) => onUpdate({ zone_id: e.target.value || null })}
            className="w-full text-xs font-bold px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-400 transition-all appearance-none cursor-pointer"
          >
            <option value="">— Sem zona definida —</option>
            {CANVAS_ZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.page === "home" ? "🏠" : "📰"} {z.label}
              </option>
            ))}
          </select>
        </div>

        {/* Métricas */}
        {slot.cliques !== undefined && (
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Cliques Recebidos</p>
            <span className="text-lg font-black text-emerald-700">{slot.cliques}</span>
          </div>
        )}

        {/* Salvar */}
        <button
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm px-4 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <Save size={14} />
          {saving ? "Publicando..." : "Publicar Alterações"}
        </button>
      </div>
    </div>
  );
}
