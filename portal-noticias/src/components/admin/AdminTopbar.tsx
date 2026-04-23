"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
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
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";

const MOBILE_NAV = [
  { label: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { label: "Métricas", href: "/admin/metricas", icon: BarChart3 },
  { label: "Notícias", href: "/admin/noticias", icon: Newspaper },
  { label: "Web Stories", href: "/admin/web-stories", icon: Tv2 },
  { label: "Colunistas", href: "/admin/colunistas", icon: ClipboardList },
  { label: "Publicidade", href: "/admin/publicidade", icon: Megaphone },
  { label: "Branding & UI", href: "/admin/branding", icon: Brush },
  { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
];

// Breadcrumb mapping
const BREADCRUMBS: Record<string, string> = {
  "/admin": "Dashboard / Visão Geral",
  "/admin/metricas": "Dashboard / Métricas",
  "/admin/noticias": "Conteúdo / Notícias",
  "/admin/noticias/novo": "Notícias / Nova Notícia",
  "/admin/web-stories": "Conteúdo / Web Stories",
  "/admin/colunistas": "Conteúdo / Colunistas",
  "/admin/editor-video": "Conteúdo / Editor de Vídeo",
  "/admin/podcasts": "Conteúdo / Podcasts",
  "/admin/midia": "Conteúdo / Mídia",
  "/admin/home-builder": "Conteúdo / Home Builder",
  "/admin/push": "Comunicação / Push Alertas",
  "/admin/newsletters": "Comunicação / Newsletters",
  "/admin/auditoria": "Comunicação / Auditoria",
  "/admin/publicidade": "Monetização / Publicidade",
  "/admin/assinaturas": "Monetização / Assinaturas",
  "/admin/branding": "Configurações / Branding & UI",
  "/admin/aparencia": "Configurações / SEO & Social",
  "/admin/relatorios": "Configurações / Relatórios",
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const breadcrumb = BREADCRUMBS[pathname] || "Admin";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-6 gap-4">
        {/* Mobile menu button */}
        <button
          id="admin-mobile-menu-btn"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest truncate">{breadcrumb}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search / Command palette trigger */}
          <button
            id="admin-command-palette-btn"
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl px-4 py-2 text-slate-400 hover:text-slate-600 transition-all text-xs font-bold"
            aria-label="Abrir busca (Ctrl+K)"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 bg-white text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-slate-100">
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button
            id="admin-notifications-btn"
            className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Notificações"
          >
            <Bell size={18} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
          </button>

          {/* View site */}
          <Link
            href="/"
            id="admin-view-site-btn"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-2xl px-4 py-2 text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Ver Site</span>
          </Link>

          <div className="w-px h-6 bg-slate-100 mx-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sair"
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-100 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <Tv2 size={18} className="text-white" />
                </div>
                <span className="font-black text-slate-800 text-base tracking-tighter">
                  ADMIN<span className="text-blue-600">PORTAL</span>
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              {MOBILE_NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                      active
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="text-sm">{label}</span>
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
