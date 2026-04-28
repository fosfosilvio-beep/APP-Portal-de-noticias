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
  latestNews: any[];
  previewNoticiaId: string | null;
  setPreviewNoticiaId: (id: string | null) => void;
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

export default function AdPropertiesPanel({ slot, onUpdate, onSave, saving, latestNews, previewNoticiaId, setPreviewNoticiaId }: AdPropertiesPanelProps) {
  const [keepRatio, setKeepRatio] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
        <div className="flex items-center justify-between mt-1">
          {zone ? (
            <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{zone.label}</span>
          ) : (
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Biblioteca (Template)</span>
          )}
          
          <button
            onClick={() => { if(window.confirm("Remover este slot permanentemente?")) onUpdate({ status_ativo: false, zone_id: null }); }}
            className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-1 transition-colors"
          >
            ✕ Excluir Slot
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        
        {/* CONTEXTO DE EXIBIÇÃO (REGRAS DE NEGÓCIO) */}
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
           <div className="flex items-center justify-between">
             <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest block">
               Onde exibir este banner?
             </label>
             <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
           </div>
           
           <div className="grid grid-cols-3 gap-1 p-1 bg-blue-100/30 rounded-lg border border-blue-100/50">
             {(['global', 'home', 'article'] as const).map((ctx) => (
               <button
                 key={ctx}
                 onClick={() => {
                   onUpdate({ 
                     page_context: ctx, 
                     noticia_id: ctx !== 'article' ? null : slot.noticia_id 
                   });
                 }}
                 className={`py-1.5 text-[9px] font-black uppercase tracking-tight rounded-md transition-all duration-200 ${
                   (slot.page_context === ctx || (!slot.page_context && ctx === 'global'))
                     ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-100"
                     : "text-blue-400 hover:text-blue-500 hover:bg-blue-50/50"
                 }`}
               >
                 {ctx === 'global' ? 'Global' : ctx === 'home' ? 'SÓ Home' : 'SÓ Notícia'}
               </button>
             ))}
           </div>

           {slot.page_context === 'article' && (
             <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-300">
               <div className="relative">
                 <input 
                   type="text"
                   value={searchTerm}
                   placeholder="🔍 Pesquisar notícia por título..."
                   className="w-full text-[10px] font-bold px-3 py-1.5 border border-blue-200 rounded-lg bg-white text-blue-900 outline-none focus:ring-2 focus:ring-blue-400/20 transition-all placeholder:text-blue-300"
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
               
               <div className="relative">
                 <select
                   value={slot.noticia_id || ""}
                   onChange={(e) => {
                     const id = e.target.value || null;
                     onUpdate({ noticia_id: id });
                     if (id) setPreviewNoticiaId(id);
                   }}
                   className="w-full text-[11px] font-bold px-3 py-2.5 pr-8 border border-blue-200 rounded-lg bg-white text-blue-900 outline-none focus:ring-2 focus:ring-blue-400/20 transition-all appearance-none cursor-pointer"
                 >
                   <option value="">Selecione a matéria específica...</option>
                   {latestNews
                    .filter(n => !searchTerm || n.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(news => (
                      <option key={news.id} value={news.id}>
                        {news.titulo.length > 50 ? news.titulo.substring(0, 50) + "..." : news.titulo}
                      </option>
                    ))}
                 </select>
                 <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
               </div>
               
               {slot.noticia_id && (
                 <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-600 rounded-md shadow-sm">
                   <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                   <p className="text-[8px] text-white font-black uppercase tracking-wider">
                     Focado em Matéria Específica
                   </p>
                 </div>
               )}
             </div>
           )}

           {slot.page_context === 'home' && (
             <p className="text-[9px] text-blue-600 font-bold bg-blue-100/50 p-2 rounded-lg leading-tight flex items-center gap-2">
               <span>🏠</span> Este banner aparecerá apenas na página inicial.
             </p>
           )}
           
           {(slot.page_context === 'global' || !slot.page_context) && (
             <p className="text-[9px] text-slate-500 font-bold bg-slate-100/50 p-2 rounded-lg leading-tight flex items-center gap-2">
               <span>🌐</span> Exibição global (todas as notícias e home).
             </p>
           )}
        </div>

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
        <div className="grid grid-cols-1 gap-4">
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
