"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Puck, type Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck-config";
import "@measured/puck/puck.css";
import { Loader2, ArrowLeft, Eye, Save, Globe, RotateCcw } from "lucide-react";
import { toast } from "@/lib/toast";
import Link from "next/link";

const EMPTY_DATA: Data = {
  content: [],
  root: { props: { title: "Página Inicial" } },
};

// Debounce helper
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  ) as T;
}

export default function HomeBuilderPage() {
  const supabase = createClient();
  const [initialData, setInitialData] = useState<Data>(EMPTY_DATA);
  const [currentData, setCurrentData] = useState<Data>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    const { data, error } = await supabase
      .from("page_layout")
      .select("draft_data, published_data, updated_at")
      .eq("slug", "home")
      .single();

    if (data?.draft_data) {
      const parsed = typeof data.draft_data === "string" ? JSON.parse(data.draft_data) : data.draft_data;
      setInitialData(parsed);
      setCurrentData(parsed);
      if (data.updated_at) setLastSaved(new Date(data.updated_at));
    }
    setLoading(false);
  };

  const saveLayout = async (dataToSave?: Data) => {
    setIsSaving(true);
    try {
      const payload = dataToSave || currentData;
      const { error } = await supabase.from("page_layout").upsert(
        {
          slug: "home",
          draft_data: payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );
      if (error) throw error;
      toast.success("Rascunho salvo!");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err: any) {
      toast.error("Erro ao salvar", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const publishLayout = async (dataToPublish: Data) => {
    setIsPublishing(true);
    try {
      const { error } = await supabase.from("page_layout").upsert(
        {
          slug: "home",
          published_data: dataToPublish,
          draft_data: dataToPublish,
          updated_at: new Date().toISOString(),
          published_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );
      if (error) throw error;
      toast.success("🚀 Home publicada com sucesso! As alterações estão no ar.");
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err: any) {
      toast.error("Erro ao publicar", err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const discardChanges = async () => {
    if (!confirm("Descartar alterações e voltar ao último rascunho salvo?")) return;
    setLoading(true);
    await loadLayout();
    setHasUnsavedChanges(false);
    toast.success("Alterações descartadas.");
  };

  // Auto-save draft every 30s
  const autoSave = useDebounce((data: Data) => {
    saveLayout(data);
  }, 30000);

  const handleChange = (data: Data) => {
    setCurrentData(data);
    setHasUnsavedChanges(true);
    autoSave(data);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10 mx-auto mb-4" />
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Carregando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Custom Header Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-4 shrink-0 z-10">
        <Link
          href="/admin"
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-white uppercase tracking-widest">Editor Visual</span>
          <span className="text-slate-600">/</span>
          <span className="text-sm text-slate-400">Home Page</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 ml-2">
          {hasUnsavedChanges ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Alterações não salvas
            </span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Salvo {lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Responsive preview toggle */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === "desktop" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              🖥 Desktop
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${previewMode === "mobile" ? "bg-slate-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              📱 Mobile
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <Eye size={14} /> Ver Home
          </Link>

          <button
            onClick={discardChanges}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-slate-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw size={14} /> Descartar
          </button>

          <button
            onClick={() => saveLayout()}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar Rascunho
          </button>

          <button
            onClick={() => publishLayout(currentData)}
            disabled={isPublishing}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest px-5 py-2 rounded-lg transition-colors shadow-lg"
          >
            {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            Publicar
          </button>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <Puck
          config={puckConfig}
          data={initialData}
          onPublish={publishLayout}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
