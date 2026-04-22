"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Puck } from "@measured/puck";
import { puckConfig } from "@/lib/puck-config";
import "@measured/puck/puck.css";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/lib/toast";
import Link from "next/link";

export default function HomeBuilderPage() {
  const supabase = createClient();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    const { data, error } = await supabase.from("page_layout").select("draft_data").eq("slug", "home").single();
    if (data && data.draft_data) {
      setInitialData(data.draft_data);
    } else {
      setInitialData({
        content: [],
        root: { props: { title: "Página Inicial" } }
      });
    }
    setLoading(false);
  };

  const saveLayout = async (data: any) => {
    try {
      const { error } = await supabase.from("page_layout").upsert({
        slug: "home",
        draft_data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: "slug" });

      if (error) throw error;
      toast.success("Rascunho salvo com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar rascunho", err.message);
    }
  };

  const publishLayout = async (data: any) => {
    try {
      const { error } = await supabase.from("page_layout").upsert({
        slug: "home",
        published_data: data,
        draft_data: data,
        published_at: new Date().toISOString()
      }, { onConflict: "slug" });

      if (error) throw error;
      toast.success("Layout da Home Publicado!");
    } catch (err: any) {
      toast.error("Erro ao publicar layout", err.message);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <div className="h-14 bg-slate-950 border-b border-slate-800 flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">Editor Visual (Home)</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Puck
          config={puckConfig}
          data={initialData}
          onPublish={publishLayout}
          onChange={(data) => {
            // Auto-save draft optionally, but let's just use manual for now
            // or we could save layout here with debounce
          }}
          overrides={{
            headerActions: ({ children }) => (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => saveLayout(initialData)} 
                  className="px-4 py-2 text-sm font-bold bg-slate-800 text-white rounded-md hover:bg-slate-700"
                >
                  Salvar Rascunho
                </button>
                {children}
              </div>
            )
          }}
        />
      </div>
    </div>
  );
}
