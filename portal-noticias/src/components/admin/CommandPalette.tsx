"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Radio,
  Newspaper,
  Megaphone,
  Palette,
  Brush,
  Mic2,
  Image,
  ClipboardList,
  BarChart3,
  Plus,
  ExternalLink,
} from "lucide-react";

const PAGES: { label: string; href: string; icon: any; group: string; external?: boolean }[] = [
  { label: "Visão Geral", href: "/admin", icon: LayoutDashboard, group: "Módulos" },
  { label: "Transmissão", href: "/admin/transmissao", icon: Radio, group: "Módulos" },
  { label: "Notícias", href: "/admin/noticias", icon: Newspaper, group: "Módulos" },
  { label: "Publicidade", href: "/admin/publicidade", icon: Megaphone, group: "Módulos" },
  { label: "Aparência", href: "/admin/aparencia", icon: Palette, group: "Módulos" },
  { label: "Branding & UI", href: "/admin/branding", icon: Brush, group: "Módulos" },
  { label: "Podcasts", href: "/admin/podcasts", icon: Mic2, group: "Módulos" },
  { label: "Mídia", href: "/admin/midia", icon: Image, group: "Módulos" },
  { label: "Auditoria", href: "/admin/auditoria", icon: ClipboardList, group: "Módulos" },
  { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3, group: "Módulos" },
];

const ACTIONS: { label: string; href: string; icon: any; group: string; external?: boolean }[] = [
  { label: "Nova Notícia", href: "/admin/noticias/novo", icon: Plus, group: "Ações Rápidas" },
  { label: "Ver o Portal", href: "/", icon: ExternalLink, group: "Ações Rápidas", external: true },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Toggle is handled externally via the open prop
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = useCallback(
    (href: string, external?: boolean) => {
      onClose();
      if (external) {
        window.open(href, "_blank");
      } else {
        router.push(href);
      }
    },
    [router, onClose]
  );

  const allItems = [...PAGES, ...ACTIONS];
  const groups = ["Ações Rápidas", "Módulos"];

  return (
    <CommandDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <CommandInput placeholder="Buscar módulo ou ação..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {groups.map((group) => {
          const items = allItems.filter((i) => i.group === group);
          return (
            <CommandGroup key={group} heading={group}>
              {items.map(({ label, href, icon: Icon, external }) => (
                <CommandItem
                  key={href}
                  value={label}
                  onSelect={() => navigate(href, external)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Icon size={16} className="text-slate-400 shrink-0" />
                  <span>{label}</span>
                  {external && <ExternalLink size={12} className="ml-auto text-slate-500" />}
                </CommandItem>
              ))}
              <CommandSeparator />
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
