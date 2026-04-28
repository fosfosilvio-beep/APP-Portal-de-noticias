"use client";

import { useState } from "react";
import { Home, Newspaper, Eye } from "lucide-react";
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
  previewNoticiaId: string | null;
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

function RealHomeWrapper({ latestNews }: { latestNews: any[] }) {
  const todasNoticias = latestNews.length > 0 ? latestNews : MOCK_NOTICIAS.map(n => ({
    ...n,
    created_at: new Date().toISOString()
  }));

  return (
    <div className="pointer-events-auto">
      <HomeContent 
        initialConfig={{
          ui_settings: {
            widgets_visibility: { plantao: false, weather: false }
          }
        }} 
        liveStatus={null} 
        todasNoticias={todasNoticias} 
        bibliotecaLives={[]} 
        initialAds={[]} 
      />
    </div>
  );
}

function RealArticleWrapper({ articleId, latestNews }: { articleId: string | null, latestNews: any[] }) {
  const foundNews = latestNews.find(n => n.id === articleId);
  const mockNews = MOCK_NOTICIAS[0];

  const initialData = {
    id: articleId || mockNews.id,
    titulo: foundNews?.titulo || mockNews.titulo,
    subtitulo: "Subtítulo de exemplo para preview do editor visual",
    categoria: foundNews?.categoria || mockNews.categoria,
    imagem_capa: foundNews?.imagem_capa || mockNews.imagem,
    created_at: new Date().toISOString(),
    conteudo: `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod, nisi vel consectetur interdum, nisl nisi aliquam eros.</p>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.</p>
      <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.</p>
      <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.</p>
      <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.</p>
      <p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis.</p>
    `
  };

  return (
    <div className="pointer-events-auto">
      <NoticiaClient slug="preview" initialData={initialData} />
    </div>
  );
}

// ─── PortalCanvas principal ────────────────────────────────────────────────────

export default function PortalCanvas(props: PortalCanvasProps) {
  // Se o admin selecionou uma notícia específica nas propriedades, forçamos a aba para "article"
  const [activeTab, setActiveTab] = useState<"home" | "article">("home");

  // Mantemos sincronizado com props.previewNoticiaId
  if (props.previewNoticiaId && activeTab === "home") {
     setActiveTab("article");
  }

  const selectedArticleId = props.previewNoticiaId || null;

  const homeZones = CANVAS_ZONES.filter((z) => z.page === "home");
  const articleZones = CANVAS_ZONES.filter((z) => z.page === "article");

  const countAssigned = (zones: ZoneDefinition[]) =>
    zones.filter((z) => !!props.assignments[z.id]).length;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-slate-700 bg-slate-900 sticky top-0 z-10">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-t-lg transition-all border-b-2 -mb-px
            ${activeTab === "home"
              ? "bg-slate-800 text-white border-blue-400"
              : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
        >
          <Home size={12} />
          Home
          <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full text-[8px]">
            {countAssigned(homeZones)}/{homeZones.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("article")}
          className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-t-lg transition-all border-b-2 -mb-px
            ${activeTab === "article"
              ? "bg-slate-800 text-white border-purple-400"
              : "text-slate-500 border-transparent hover:text-slate-300"
            }`}
        >
          <Newspaper size={12} />
          Página da Notícia
          <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full text-[8px]">
            {countAssigned(articleZones)}/{articleZones.length}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1.5 pb-2">
          <Eye size={10} className="text-slate-500" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Preview Live
          </span>
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Contexto da notícia selecionada */}
      {activeTab === "article" && (
        <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center gap-2">
          <Newspaper size={10} className="text-purple-400 flex-shrink-0" />
          <p className="text-[9px] font-bold text-slate-400 truncate flex-1">
            Visualizando: <span className="text-white">
              {props.latestNews.find((n) => n.id === selectedArticleId)?.titulo || "Notícia Exemplo"}
            </span>
          </p>
          {(!props.previewNoticiaId) && (
            <button
              onClick={() => setActiveTab("home")}
              className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-wider transition-colors flex-shrink-0"
            >
              ← Home
            </button>
          )}
        </div>
      )}

      {/* Canvas content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-900 pointer-events-none">
        <AdEditorContext.Provider
          value={{
            isEditing: true,
            slots: props.slots,
            assignments: props.assignments,
            onRemoveFromZone: props.onRemoveFromZone,
            onSelectSlot: props.onSelectSlot,
            selectedSlotId: props.selectedSlotId,
            previewNoticiaId: props.previewNoticiaId,
          }}
        >
          <div className="bg-white rounded-xl shadow-xl min-h-full overflow-hidden scale-[0.65] origin-top">
            {activeTab === "home" ? (
              <RealHomeWrapper latestNews={props.latestNews} />
            ) : (
              <RealArticleWrapper articleId={selectedArticleId} latestNews={props.latestNews} />
            )}
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
