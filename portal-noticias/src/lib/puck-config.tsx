import type { Config } from "@measured/puck";
import Link from "next/link";
import { ChevronRight, Megaphone } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type PuckProps = {
  HeadingBlock: {
    title: string;
    align: "left" | "center" | "right";
    accentColor: string;
  };
  GradeNoticias: {
    titulo: string;
    categoria: string;
    limite: number;
    colunas: 2 | 3 | 4;
  };
  HeroNoticia: {
    noticiaId: string;
    showSubtitulo: boolean;
  };
  AdSlotBlock: {
    position: string;
    label: string;
  };
  Separador: {
    altura: number;
    mostrarLinha: boolean;
  };
  Giro24h: {
    titulo: string;
    limite: number;
  };
  PlantaoPolicialBlock: {
    titulo: string;
  };
  SliderNoticias: {
    titulo: string;
    categoria: string;
    limite: number;
    autoplay: boolean;
  };
  TextoLivre: {
    conteudo: string;
    align: "left" | "center" | "right";
  };
};

// ─────────────────────────────────────────────
// Helper: preview badge
// ─────────────────────────────────────────────
const PreviewBadge = ({ label, color = "bg-blue-500" }: { label: string; color?: string }) => (
  <div className={`${color} text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-block mb-1`}>
    {label}
  </div>
);

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────
export const puckConfig: Config<PuckProps> = {
  components: {

    // ── 1. Heading (Título de Seção)
    HeadingBlock: {
      label: "Título de Seção",
      fields: {
        title: { type: "text", label: "Texto do Título" },
        align: {
          type: "radio",
          label: "Alinhamento",
          options: [
            { label: "Esquerda", value: "left" },
            { label: "Centro", value: "center" },
            { label: "Direita", value: "right" },
          ],
        },
        accentColor: {
          type: "select",
          label: "Cor de Destaque",
          options: [
            { label: "Azul (Padrão Portal)", value: "#00AEE0" },
            { label: "Vermelho (Urgente)", value: "#ef4444" },
            { label: "Verde (Destaque)", value: "#22c55e" },
            { label: "Âmbar (Policial)", value: "#f59e0b" },
          ],
        },
      },
      defaultProps: {
        title: "Últimas Notícias",
        align: "left",
        accentColor: "#00AEE0",
      },
      render: ({ title, align, accentColor }) => (
        <div style={{ textAlign: align }} className="py-4">
          <h2
            className="text-2xl font-black text-slate-900 uppercase tracking-tighter"
            style={{ borderLeft: align === "left" ? `6px solid ${accentColor}` : "none", paddingLeft: align === "left" ? "12px" : "0" }}
          >
            {title}
          </h2>
        </div>
      ),
    },

    // ── 2. Grade de Notícias (News Grid)
    GradeNoticias: {
      label: "Grade de Notícias",
      fields: {
        titulo: { type: "text", label: "Título da Seção" },
        categoria: {
          type: "select",
          label: "Filtrar Categoria",
          options: [
            { label: "Todas (Mais Recentes)", value: "" },
            { label: "Policial", value: "Policial" },
            { label: "Política", value: "Política" },
            { label: "Esportes", value: "Esportes" },
            { label: "Cidade", value: "Cidade" },
            { label: "Entretenimento", value: "Entretenimento" },
          ],
        },
        limite: {
          type: "number",
          label: "Quantidade de Notícias",
          min: 2,
          max: 20,
        },
        colunas: {
          type: "radio",
          label: "Colunas",
          options: [
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
          ],
        },
      },
      defaultProps: {
        titulo: "Últimas Notícias",
        categoria: "",
        limite: 6,
        colunas: 3,
      },
      render: ({ titulo, categoria, limite, colunas }) => {
        const colClass = colunas === 2 ? "grid-cols-2" : colunas === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3";
        return (
          <div className="py-2">
            <PreviewBadge label={`📰 Grade de Notícias`} color="bg-blue-600" />
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="font-black text-slate-700 text-sm mb-3">{titulo}</p>
              <div className={`grid ${colClass} gap-3`}>
                {Array.from({ length: Math.min(limite, 6) }).map((_, i) => (
                  <div key={i} className="bg-slate-200 animate-pulse rounded-lg h-28" />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Mostrando até {limite} notícias {categoria ? `de "${categoria}"` : "(todas as categorias)"}
              </p>
            </div>
          </div>
        );
      },
    },

    // ── 3. Hero Notícia (Notícia Destaque)
    HeroNoticia: {
      label: "Notícia em Destaque (Hero)",
      fields: {
        noticiaId: {
          type: "text",
          label: "ID ou Slug da Notícia",
        },
        showSubtitulo: {
          type: "radio",
          label: "Exibir Subtítulo",
          options: [
            { label: "Sim", value: true },
            { label: "Não", value: false },
          ],
        },
      },
      defaultProps: {
        noticiaId: "",
        showSubtitulo: true,
      },
      render: ({ noticiaId, showSubtitulo }) => (
        <div className="py-2">
          <PreviewBadge label="⭐ Notícia Destaque (Hero)" color="bg-purple-600" />
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 flex items-center gap-4 min-h-[120px]">
            <div className="flex-1">
              {noticiaId ? (
                <p className="font-black text-white text-sm">ID/Slug: <span className="text-cyan-400 font-mono">{noticiaId}</span></p>
              ) : (
                <p className="text-slate-400 text-sm font-bold">⚠️ Configure o ID ou Slug da notícia no painel direito</p>
              )}
              {showSubtitulo && <p className="text-slate-400 text-xs mt-1">Subtítulo visível</p>}
            </div>
          </div>
        </div>
      ),
    },

    // ── 4. Ad Slot (Anúncio)
    AdSlotBlock: {
      label: "Slot de Anúncio",
      fields: {
        position: {
          type: "select",
          label: "Posição do Slot",
          options: [
            { label: "Header Top (728×90)", value: "header_top" },
            { label: "Sidebar Direita 1 (300×250)", value: "sidebar_right_1" },
            { label: "Sidebar Direita 2 (300×600)", value: "sidebar_right_2" },
            { label: "Rodapé (970×90)", value: "footer_top" },
            { label: "Entre Notícias (300×250)", value: "inline_news" },
          ],
        },
        label: {
          type: "text",
          label: "Rótulo Interno (não exibido ao público)",
        },
      },
      defaultProps: {
        position: "inline_news",
        label: "Banner da Home",
      },
      render: ({ position, label }) => (
        <div className="py-2">
          <div className="w-full bg-amber-500/10 border-2 border-dashed border-amber-500/40 p-6 rounded-xl flex flex-col items-center justify-center">
            <Megaphone size={20} className="text-amber-500 mb-2" />
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">{label || "Slot de Anúncio"}</p>
            <p className="text-[10px] text-amber-400/60 mt-1">Posição: {position}</p>
          </div>
        </div>
      ),
    },

    // ── 5. Separador
    Separador: {
      label: "Separador / Espaçamento",
      fields: {
        altura: {
          type: "number",
          label: "Altura (px)",
          min: 8,
          max: 120,
        },
        mostrarLinha: {
          type: "radio",
          label: "Mostrar Linha",
          options: [
            { label: "Sim", value: true },
            { label: "Não (Só Espaço)", value: false },
          ],
        },
      },
      defaultProps: {
        altura: 32,
        mostrarLinha: false,
      },
      render: ({ altura, mostrarLinha }) => (
        <div style={{ height: `${altura}px` }} className="flex items-center">
          {mostrarLinha && <div className="w-full border-t border-slate-200" />}
        </div>
      ),
    },

    // ── 6. Giro 24h (Sidebar Widget)
    Giro24h: {
      label: "Giro 24h (Widget Lateral)",
      fields: {
        titulo: { type: "text", label: "Título do Widget" },
        limite: {
          type: "number",
          label: "Número de Notícias",
          min: 3,
          max: 10,
        },
      },
      defaultProps: {
        titulo: "Giro 24h",
        limite: 5,
      },
      render: ({ titulo, limite }) => (
        <div className="py-2">
          <PreviewBadge label="🔵 Giro 24h" color="bg-cyan-600" />
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="font-black text-slate-800 text-sm mb-3">{titulo}</p>
            <div className="space-y-2">
              {Array.from({ length: Math.min(limite, 5) }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl font-black text-cyan-300">{i + 1}</span>
                  <div className="h-3 bg-slate-100 rounded flex-1 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },

    // ── 7. Plantão Policial
    PlantaoPolicialBlock: {
      label: "Plantão Policial (Widget)",
      fields: {
        titulo: { type: "text", label: "Título do Widget" },
      },
      defaultProps: {
        titulo: "🚔 Plantão Policial",
      },
      render: ({ titulo }) => (
        <div className="py-2">
          <PreviewBadge label="🚔 Plantão Policial" color="bg-red-700" />
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-700">
            <p className="font-black text-sm text-red-400 uppercase tracking-widest">{titulo}</p>
            <div className="mt-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-3 bg-slate-700 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      ),
    },

    // ── 8. Slider de Notícias
    SliderNoticias: {
      label: "Slider de Notícias",
      fields: {
        titulo: { type: "text", label: "Título da Seção" },
        categoria: {
          type: "select",
          label: "Filtrar Categoria",
          options: [
            { label: "Todas", value: "" },
            { label: "Policial", value: "Policial" },
            { label: "Política", value: "Política" },
            { label: "Esportes", value: "Esportes" },
          ],
        },
        limite: {
          type: "number",
          label: "Quantidade",
          min: 3,
          max: 12,
        },
        autoplay: {
          type: "radio",
          label: "Autoplay",
          options: [
            { label: "Sim", value: true },
            { label: "Não", value: false },
          ],
        },
      },
      defaultProps: {
        titulo: "Radar Automático",
        categoria: "",
        limite: 6,
        autoplay: true,
      },
      render: ({ titulo, categoria, limite, autoplay }) => (
        <div className="py-2">
          <PreviewBadge label="🎠 Slider de Notícias" color="bg-slate-700" />
          <div className="bg-slate-800 rounded-xl p-4">
            <p className="font-black text-white text-sm mb-2">{titulo}</p>
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-slate-600 rounded-lg h-20 w-28 shrink-0 animate-pulse" />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">{limite} itens {categoria ? `| ${categoria}` : ""} {autoplay ? "| Autoplay ativo" : ""}</p>
          </div>
        </div>
      ),
    },

    // ── 9. Texto Livre
    TextoLivre: {
      label: "Texto / Nota Editorial",
      fields: {
        conteudo: {
          type: "textarea",
          label: "Conteúdo",
        },
        align: {
          type: "radio",
          label: "Alinhamento",
          options: [
            { label: "Esquerda", value: "left" },
            { label: "Centro", value: "center" },
            { label: "Direita", value: "right" },
          ],
        },
      },
      defaultProps: {
        conteudo: "Escreva uma nota editorial ou aviso aqui.",
        align: "left",
      },
      render: ({ conteudo, align }) => (
        <div style={{ textAlign: align }} className="py-3 px-1">
          <p className="text-slate-700 text-sm leading-relaxed">{conteudo}</p>
        </div>
      ),
    },

  },
};
