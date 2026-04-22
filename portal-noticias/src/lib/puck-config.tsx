import type { Config } from "@measured/puck";
import { Megaphone, LayoutGrid, Type } from "lucide-react";

export type PuckProps = {
  HeadingBlock: { title: string; align: "left" | "center" | "right" };
  HeroNoticia: { noticiaId: string };
  AdSlotBlock: { position: string };
};

export const puckConfig: Config<PuckProps> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
        align: {
          type: "radio",
          options: [
            { label: "Esquerda", value: "left" },
            { label: "Centro", value: "center" },
            { label: "Direita", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "Últimas Notícias",
        align: "left",
      },
      render: ({ title, align }) => {
        return (
          <div style={{ textAlign: align }} className="py-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
              {title}
            </h2>
          </div>
        );
      },
    },
    HeroNoticia: {
      fields: {
        noticiaId: {
          type: "text", // In a real app, this would be a custom field calling an API or a combobox
        },
      },
      defaultProps: {
        noticiaId: "",
      },
      render: ({ noticiaId }) => {
        return (
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-8 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 min-h-[300px]">
            <div className="text-center">
              <LayoutGrid size={40} className="mx-auto text-slate-400 mb-4" />
              <h3 className="font-bold text-slate-600 dark:text-slate-300">
                {noticiaId ? `Notícia ID: ${noticiaId}` : "Selecione uma Notícia para o Hero"}
              </h3>
            </div>
          </div>
        );
      },
    },
    AdSlotBlock: {
      fields: {
        position: {
          type: "select",
          options: [
            { label: "Leaderboard (Header Superior)", value: "header_top" },
            { label: "MREC (Sidebar Direita)", value: "sidebar_right" },
            { label: "Footer Top (Rodapé)", value: "footer_top" },
          ],
        },
      },
      defaultProps: {
        position: "header_top",
      },
      render: ({ position }) => {
        return (
          <div className="w-full bg-amber-500/10 border-2 border-dashed border-amber-500/30 p-8 rounded-xl flex flex-col items-center justify-center">
            <Megaphone size={24} className="text-amber-500 mb-2" />
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">
              Ad Slot: {position}
            </p>
          </div>
        );
      },
    },
  },
};
