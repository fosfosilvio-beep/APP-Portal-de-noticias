"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Settings,
  Menu,
  X,
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
  Tv2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";

const MOBILE_NAV = [
  { label: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { label: "Transmissão", href: "/admin/transmissao", icon: Radio },
  { label: "Notícias", href: "/admin/noticias", icon: Newspaper },
  { label: "Publicidade", href: "/admin/publicidade", icon: Megaphone },
  { label: "Aparência", href: "/admin/aparencia", icon: Palette },
  { label: "Branding", href: "/admin/branding", icon: Brush },
  { label: "Podcasts", href: "/admin/podcasts", icon: Mic2 },
  { label: "Mídia", href: "/admin/midia", icon: Image },
  { label: "Auditoria", href: "/admin/auditoria", icon: ClipboardList },
  { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
];

// Breadcrumb mapping
const BREADCRUMBS: Record<string, string> = {
  "/admin": "Visão Geral",
  "/admin/transmissao": "Transmissão",
  "/admin/noticias": "Notícias",
  "/admin/noticias/novo": "Notícias / Nova Notícia",
  "/admin/publicidade": "Publicidade",
  "/admin/aparencia": "Aparência",
  "/admin/branding": "Branding & UI",
  "/admin/podcasts": "Podcasts",
  "/admin/midia": "Mídia",
  "/admin/auditoria": "Auditoria",
  "/admin/relatorios": "Relatórios",
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const breadcrumb = BREADCRUMBS[pathname] || "Admin";

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 h-14 flex items-center px-4 gap-4">
        {/* Mobile menu button */}
        <button
          id="admin-mobile-menu-btn"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-300 truncate">{breadcrumb}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search / Command palette trigger */}
          <button
            id="admin-command-palette-btn"
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl px-3 py-2 text-slate-400 hover:text-white transition-all text-xs font-semibold"
            aria-label="Abrir busca (Ctrl+K)"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-slate-700 text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-600">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button
            id="admin-notifications-btn"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            aria-label="Notificações"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full border border-slate-950" />
          </button>

          {/* View site */}
          <Link
            href="/"
            target="_blank"
            id="admin-view-site-btn"
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-xl px-3 py-2 text-cyan-400 hover:text-cyan-300 transition-all text-xs font-semibold"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Ver Site</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Tv2 size={16} className="text-white" />
                </div>
                <span className="font-black text-white text-sm tracking-tight">
                  NOSSA<span className="text-cyan-400">WEB</span>TV
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      active
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="text-sm font-semibold">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
