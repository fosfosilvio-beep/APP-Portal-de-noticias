"use client";

import { useState } from "react";
import { Home, Newspaper, Eye, ChevronRight } from "lucide-react";
import DropZone from "./DropZone";
import type { AdSlot, CanvasAssignments, ZoneDefinition } from "@/hooks/useAdCanvas";
import { CANVAS_ZONES } from "@/hooks/useAdCanvas";

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

// ─── Canvas da HOME ────────────────────────────────────────────────────────────

function HomeCanvas({
  slots,
  assignments,
  selectedSlotId,
  onSelectSlot,
  onRemoveFromZone,
  onArticleClick,
}: PortalCanvasProps & { onArticleClick: (noticiaId: string) => void }) {
  const dropZoneProps = (zoneId: string) => ({
    zone: getZone(zoneId),
    assignedSlot: getSlotForZone(zoneId, assignments, slots),
    isSelected: assignments[zoneId] === selectedSlotId,
    onSelect: () => {
      const slotId = assignments[zoneId];
      if (slotId) onSelectSlot(slotId);
    },
    onRemove: () => onRemoveFromZone(zoneId),
  });

  return (
    <div className="space-y-3">
      {/* Simulação: Header */}
      <div className="bg-slate-800 rounded-lg px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-24 h-4 bg-slate-600 rounded-full" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-2.5 bg-slate-700 rounded-full" />
            ))}
          </div>
        </div>
        <div className="w-6 h-6 bg-red-500/60 rounded-full" />
      </div>

      {/* Zona: header_top */}
      <DropZone {...dropZoneProps("home__header_top")} />

      {/* Simulação: HeroBanner carrossel */}
      <div className="bg-slate-700/40 rounded-lg h-28 flex items-center justify-center relative overflow-hidden">
        <img
          src={MOCK_NOTICIAS[0].imagem}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 space-y-1 text-center px-4">
          <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest bg-blue-500/20 px-2 py-0.5 rounded-full">
            {MOCK_NOTICIAS[0].categoria}
          </span>
          <p className="text-[11px] font-black text-white">{MOCK_NOTICIAS[0].titulo}</p>
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? "bg-white" : "bg-white/30"}`} />
          ))}
        </div>
      </div>

      {/* Zona: hero_below */}
      <DropZone {...dropZoneProps("home__hero_below")} />

      {/* Corpo: feed + sidebar */}
      <div className="flex gap-3">
        {/* Feed de notícias */}
        <div className="flex-1 space-y-2">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
            Feed de Notícias
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_NOTICIAS.map((n) => (
              <button
                key={n.id}
                onClick={() => onArticleClick(n.id)}
                className="group text-left bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="relative h-14 overflow-hidden">
                  <img src={n.imagem} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-1 left-1.5">
                    <span className="text-[7px] font-black text-white bg-blue-500/80 px-1 py-0.5 rounded uppercase">
                      {n.categoria}
                    </span>
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 rounded text-white p-0.5">
                    <ChevronRight size={8} />
                  </div>
                </div>
                <div className="p-1.5">
                  <p className="text-[8px] font-black text-slate-800 leading-tight line-clamp-2">
                    {n.titulo}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Zona: between_articles */}
          <DropZone {...dropZoneProps("home__between_articles")} />

          {/* Mais cards simulados */}
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2 bg-white border border-slate-100 rounded-lg p-2">
                <div className="w-12 h-8 bg-slate-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-slate-200 rounded-full w-4/5" />
                  <div className="h-1.5 bg-slate-100 rounded-full w-3/5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-28 space-y-2 flex-shrink-0">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sidebar</p>
          <DropZone {...dropZoneProps("home__sidebar_1")} />
          <DropZone {...dropZoneProps("home__sidebar_2")} />
          {/* Widgets simulados */}
          <div className="bg-slate-100 rounded-lg p-2 space-y-1">
            <div className="h-2 bg-slate-200 rounded-full w-4/5" />
            <div className="h-1.5 bg-slate-200 rounded-full w-3/5" />
            <div className="h-1.5 bg-slate-200 rounded-full w-4/5" />
          </div>
        </div>
      </div>

      {/* Zona: footer_top */}
      <DropZone {...dropZoneProps("home__footer_top")} />

      {/* Simulação: Footer */}
      <div className="bg-slate-800 rounded-lg px-4 py-3">
        <div className="flex gap-6">
          <div className="flex-1 space-y-1">
            <div className="w-16 h-3 bg-slate-600 rounded-full" />
            <div className="w-20 h-2 bg-slate-700 rounded-full" />
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 bg-slate-700 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Canvas da PÁGINA DE NOTÍCIA ──────────────────────────────────────────────

function ArticleCanvas({
  slots,
  assignments,
  selectedSlotId,
  onSelectSlot,
  onRemoveFromZone,
  articleId,
}: PortalCanvasProps & { articleId: string | null }) {
  const noticia = MOCK_NOTICIAS.find((n) => n.id === articleId) || MOCK_NOTICIAS[0];

  const dropZoneProps = (zoneId: string) => ({
    zone: getZone(zoneId),
    assignedSlot: getSlotForZone(zoneId, assignments, slots),
    isSelected: assignments[zoneId] === selectedSlotId,
    onSelect: () => {
      const slotId = assignments[zoneId];
      if (slotId) onSelectSlot(slotId);
    },
    onRemove: () => onRemoveFromZone(zoneId),
  });

  const paragraphs = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum euismod, nisi vel consectetur interdum, nisl nisi aliquam eros.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam.",
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.",
    "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.",
    "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
    "Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis.",
  ];

  return (
    <div className="space-y-3">
      {/* Header simulado */}
      <div className="bg-slate-800 rounded-lg px-4 py-2.5 flex items-center gap-3">
        <div className="w-24 h-4 bg-slate-600 rounded-full" />
        <div className="flex gap-2 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-2.5 bg-slate-700 rounded-full" />
          ))}
        </div>
      </div>

      {/* Zona: article header */}
      <DropZone {...dropZoneProps("article__header_top")} />

      {/* Artigo + Sidebar */}
      <div className="flex gap-3">
        {/* Conteúdo do artigo */}
        <div className="flex-1 space-y-2">
          {/* Capa */}
          <div className="relative rounded-lg overflow-hidden h-24">
            <img src={noticia.imagem} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2">
              <span className="text-[7px] font-black text-white bg-blue-500/80 px-1.5 py-0.5 rounded-full uppercase">
                {noticia.categoria}
              </span>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-slate-900 leading-tight">
              {noticia.titulo}
            </div>
            <div className="text-[8px] text-slate-400 font-medium">
              28 de abril de 2026 • Por Redação NossaWebTV
            </div>
          </div>

          {/* Parágrafos com zonas in-article */}
          <div className="space-y-2 text-[8px] text-slate-600 leading-relaxed">
            {paragraphs.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <DropZone {...dropZoneProps("article__in_article_1")} />
            {paragraphs.slice(2, 5).map((p, i) => (
              <p key={i + 2}>{p}</p>
            ))}
            <DropZone {...dropZoneProps("article__in_article_2")} />
            {paragraphs.slice(5).map((p, i) => (
              <p key={i + 5}>{p}</p>
            ))}
          </div>
        </div>

        {/* Sidebar da notícia */}
        <div className="w-28 space-y-2 flex-shrink-0">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sidebar</p>
          <DropZone {...dropZoneProps("article__sidebar_1")} />
          {/* Leia também simulado */}
          <div className="bg-slate-100 rounded-lg p-2 space-y-1.5">
            <p className="text-[7px] font-black text-slate-500 uppercase">Leia Também</p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-1.5">
                <div className="w-8 h-6 bg-slate-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-slate-200 rounded-full" />
                  <div className="h-1.5 bg-slate-200 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zona: article footer */}
      <DropZone {...dropZoneProps("article__footer_top")} />

      {/* Footer simulado */}
      <div className="bg-slate-800 rounded-lg px-4 py-3">
        <div className="flex gap-6">
          <div className="flex-1 space-y-1">
            <div className="w-16 h-3 bg-slate-600 rounded-full" />
            <div className="w-20 h-2 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PortalCanvas principal ────────────────────────────────────────────────────

export default function PortalCanvas(props: PortalCanvasProps) {
  const [activeTab, setActiveTab] = useState<"home" | "article">("home");
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const handleArticleClick = (id: string) => {
    setSelectedArticleId(id);
    setActiveTab("article");
  };

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
              {MOCK_NOTICIAS.find((n) => n.id === selectedArticleId)?.titulo || MOCK_NOTICIAS[0].titulo}
            </span>
          </p>
          <button
            onClick={() => setActiveTab("home")}
            className="text-[8px] font-black text-slate-500 hover:text-white uppercase tracking-wider transition-colors flex-shrink-0"
          >
            ← Home
          </button>
        </div>
      )}

      {/* Canvas content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
        <div className="bg-white rounded-xl p-3 shadow-xl min-h-full">
          {activeTab === "home" ? (
            <HomeCanvas {...props} onArticleClick={handleArticleClick} />
          ) : (
            <ArticleCanvas {...props} articleId={selectedArticleId} />
          )}
        </div>
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
