"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Newspaper, Eye, Loader2, ChevronLeft } from "lucide-react";
import type { AdSlot, CanvasAssignments, ZoneDefinition } from "@/hooks/useAdCanvas";
import { CANVAS_ZONES } from "@/hooks/useAdCanvas";
import { AdEditorContext } from "@/contexts/AdEditorContext";
import HomeContent from "@/components/home/HomeContent";
import NoticiaClient from "@/app/noticia/[slug]/NoticiaClient";

// ─── Mock de notícias para o preview interativo ────────────────────────────────

const MOCK_NOTICIAS = [
  {
    id: "mock-1",
    titulo: "Prefeitura anuncia novo investimento em infraestrutura",
    categoria: "Política",
    imagem: "https://picsum.photos/seed/news1/400/220",
    destaque: true,
  },
  {
    id: "mock-2",
    titulo: "Festival de Cultura movimenta o centro da cidade neste fim de semana",
    categoria: "Cultura",
    imagem: "https://picsum.photos/seed/news2/400/220",
    destaque: false,
  },
  {
    id: "mock-3",
    titulo: "Equipe local conquista campeonato regional de futsal",
    categoria: "Esportes",
    imagem: "https://picsum.photos/seed/news3/400/220",
    destaque: false,
  },
  {
    id: "mock-4",
    titulo: "Saúde: unidades de saúde passam a funcionar em horário estendido",
    categoria: "Saúde",
    imagem: "https://picsum.photos/seed/news4/400/220",
    destaque: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface PortalCanvasProps {
  slots: AdSlot[];
  assignments: CanvasAssignments;
  selectedSlotId: string | null;
  onSelectSlot: (id: string) => void;
  onRemoveFromZone: (zoneId: string) => void;
  latestNews: any[];
  portalConfig: any;
  previewNoticiaId: string | null;
  onAddSlot: (zoneId: string) => void;
}

function getSlotForZone(
  zoneId: string,
  assignments: CanvasAssignments,
  slots: AdSlot[]
): AdSlot | null {
  const slotId = assignments[zoneId];
  return slotId ? (slots.find((s) => s.id === slotId) ?? null) : null;
}

function getZone(id: string): ZoneDefinition {
  return CANVAS_ZONES.find((z) => z.id === id)!;
}

// ─── Componentes Reais Embrulhados ──────────────────────────────────────────

function RealHomeWrapper({ latestNews, portalConfig }: { latestNews: any[], portalConfig: any }) {
  const todasNoticias = latestNews.length > 0 ? latestNews : MOCK_NOTICIAS.map(n => ({
    ...n,
    created_at: new Date().toISOString()
  }));

  const initialConfig = portalConfig || {
    ui_settings: {
      widgets_visibility: { plantao: false, weather: false }
    }
  };

  return (
    <div className="pointer-events-auto">
      <HomeContent 
        initialConfig={initialConfig} 
        liveStatus={null} 
        todasNoticias={todasNoticias} 
        bibliotecaLives={[]} 
        initialAds={[]} 
      />
    </div>
  );
}

function RealArticleWrapper({ articleId, latestNews }: { articleId: string | null, latestNews: any[] }) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setArticle(null);
      return;
    }
    
    const found = latestNews.find(n => n.id === articleId);
    if (found && found.conteudo) {
      setArticle(found);
      return;
    }

    // Se não tem conteúdo completo (só resumo do fetch de 20), busca o artigo completo
    async function fetchFull() {
      setLoading(true);
      const { createClient } = await import("@/lib/supabase-browser");
      const supabase = createClient();
      const { data } = await supabase.from("noticias").select("*").eq("id", articleId).single();
      if (data) setArticle(data);
      setLoading(false);
    }
    fetchFull();
  }, [articleId, latestNews]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Carregando Matéria Real...</p>
      </div>
    );
  }

  const mockNews = MOCK_NOTICIAS[0];
  const finalData = article || {
    id: articleId || mockNews.id,
    titulo: mockNews.titulo,
    conteudo: "<p>Carregando conteúdo real da notícia...</p>",
    categoria: mockNews.categoria,
    imagem_capa: mockNews.imagem
  };

  return (
    <div className="pointer-events-auto">
      <NoticiaClient slug={finalData.slug || finalData.id || "preview"} initialData={finalData} />
    </div>
  );
}

// ─── PortalCanvas principal ────────────────────────────────────────────────────

export default function PortalCanvas(props: PortalCanvasProps) {
  const [activeTab, setActiveTab] = useState<"home" | "article">("home");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(props.previewNoticiaId);
  const [zoom, setZoom] = useState(0.6);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sincroniza tab com previewNoticiaId externo
  useEffect(() => {
    if (props.previewNoticiaId) {
      setSelectedArticleId(props.previewNoticiaId);
      setActiveTab("article");
    }
  }, [props.previewNoticiaId]);

  // Calcula zoom para caber na tela
  useEffect(() => {
    const updateZoom = () => {
      if (canvasRef.current) {
        const parentW = canvasRef.current.clientWidth - 100; // margem maior para respiro
        const newZoom = Math.min(parentW / 1920, 1);
        setZoom(newZoom);
      }
    };
    updateZoom();
    window.addEventListener('resize', updateZoom);
    return () => window.removeEventListener('resize', updateZoom);
  }, []);

  const homeZones = CANVAS_ZONES.filter((z) => z.page === "home");
  const articleZones = CANVAS_ZONES.filter((z) => z.page === "article");

  const countAssigned = (zones: ZoneDefinition[]) =>
    zones.filter((z) => !!props.assignments[z.id]).length;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-t-xl transition-all border-b-2 -mb-px
            ${activeTab === "home"
              ? "bg-slate-800 text-blue-400 border-blue-500 shadow-[0_-4px_12px_rgba(59,130,246,0.15)]"
              : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
        >
          <Home size={12} />
          Portal Home
          <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-full text-[8px] ring-1 ring-blue-500/20">
            {countAssigned(homeZones)}/{homeZones.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("article")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-t-xl transition-all border-b-2 -mb-px
            ${activeTab === "article"
              ? "bg-slate-800 text-purple-400 border-purple-500 shadow-[0_-4px_12px_rgba(168,85,247,0.15)]"
              : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
        >
          <Newspaper size={12} />
          Página Interna
          <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-full text-[8px] ring-1 ring-purple-500/20">
            {countAssigned(articleZones)}/{articleZones.length}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2 pb-2 px-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full ring-1 ring-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">
              Live Preview
            </span>
          </div>
        </div>
      </div>

      {/* Contexto da notícia selecionada */}
      {activeTab === "article" && (
        <div className="px-4 py-2 bg-slate-800/80 border-b border-white/5 flex items-center gap-2 backdrop-blur-sm">
          <Newspaper size={10} className="text-purple-400 flex-shrink-0" />
          <p className="text-[9px] font-bold text-slate-400 truncate flex-1">
            Matéria em Foco: <span className="text-white italic">
              {props.latestNews.find((n) => n.id === selectedArticleId)?.titulo || "Carregando..."}
            </span>
          </p>
          {(!props.previewNoticiaId) && (
            <button
              onClick={() => setActiveTab("home")}
              className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-wider transition-colors flex-shrink-0 flex items-center gap-1"
            >
              <ChevronLeft size={8} /> Voltar à Home
            </button>
          )}
        </div>
      )}

      {/* Canvas content */}
      <div 
        ref={canvasRef}
        className="flex-1 overflow-auto p-12 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] flex flex-col items-center custom-scrollbar"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const link = target.closest('a');
          if (link) {
            const href = link.getAttribute('href');
            if (href && (href.includes('/noticia/') || href.startsWith('noticia/'))) {
              e.preventDefault();
              const parts = href.split('/');
              const slug = parts[parts.length - 1];
              
              if (slug) {
                const news = props.latestNews.find(n => n.slug === slug || n.id === slug);
                if (news) {
                  setSelectedArticleId(news.id);
                  setActiveTab("article");
                } else {
                  // Fallback: se for um ID mas não está no fetch inicial de 50
                  setSelectedArticleId(slug);
                  setActiveTab("article");
                }
              }
            }
          }
        }}
      >
        <AdEditorContext.Provider
          value={{
            isEditing: true,
            slots: props.slots,
            assignments: props.assignments,
            onRemoveFromZone: props.onRemoveFromZone,
            onSelectSlot: props.onSelectSlot,
            selectedSlotId: props.selectedSlotId,
            previewNoticiaId: selectedArticleId,
            onAddSlot: props.onAddSlot,
          }}
        >
          {/* Viewport 1920px (Full HD) para fidelidade absoluta */}
          <div 
            className="bg-white shadow-[0_32px_64px_rgba(0,0,0,0.5)] origin-top transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)" 
            style={{ 
              width: '1920px', 
              minHeight: '3000px',
              transform: `scale(${zoom})`, 
              marginBottom: `-${3000 * (1 - zoom)}px` 
            }}
          >
            <div className="pointer-events-auto">
              {activeTab === "home" ? (
                <RealHomeWrapper latestNews={props.latestNews} portalConfig={props.portalConfig} />
              ) : (
                <RealArticleWrapper articleId={selectedArticleId} latestNews={props.latestNews} />
              )}
            </div>
          </div>
        </AdEditorContext.Provider>
      </div>

      {/* Footer instrução */}
      <div className="px-4 py-2 bg-slate-800 border-t border-slate-700">
        {activeTab === "home" ? (
          <p className="text-[9px] font-bold text-slate-500">
            ✦ Clique em um card de notícia no preview para ver o layout interno da página de artigo.
          </p>
        ) : (
          <p className="text-[9px] font-bold text-slate-500">
            ✦ Arraste banners para as zonas <span className="text-purple-400">In-Article</span> para inserir publicidade dentro do texto.
          </p>
        )}
      </div>
    </div>
  );
}
