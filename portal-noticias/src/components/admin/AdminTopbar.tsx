"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { usePathname } from "next/navigation";
import { Role } from "@/lib/auth/roles";
import {
  Search,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Newspaper,
  Megaphone,
  Brush,
  ClipboardList,
  BarChart3,
  Tv2,
  ExternalLink,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";

const MOBILE_NAV = [
  { label: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { label: "Métricas", href: "/admin/metricas", icon: BarChart3 },
  { label: "Notícias", href: "/admin/noticias", icon: Newspaper },
  { label: "Colunistas", href: "/admin/colunistas", icon: ClipboardList },
  { label: "Publicidade", href: "/admin/publicidade", icon: Megaphone },
  { label: "Branding & UI", href: "/admin/branding", icon: Brush },
  { label: "Institucional", href: "/admin/institucional", icon: Building2 },
  { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
];

const BREADCRUMBS: Record<string, string> = {
  "/admin": "Dashboard / Visão Geral",
  "/admin/metricas": "Dashboard / Métricas",
  "/admin/noticias": "Conteúdo / Notícias",
  "/admin/noticias/novo": "Notícias / Nova Notícia",
  "/admin/colunistas": "Conteúdo / Colunistas",
  "/admin/auditoria": "Comunicação / Auditoria",
  "/admin/publicidade": "Monetização / Publicidade",
  "/admin/branding": "Configurações / Branding & UI",
  "/admin/institucional": "Configurações / Institucional",
  "/admin/relatorios": "Configurações / Relatórios",
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      let r = data?.role;
      if (!r || error) {
        const adminEmails = ["fosfosilvio@gmail.com", "fosfosilvio.beep@gmail.com"];
        const columnistEmails = ["colunista@gmail.com"];
        if (adminEmails.includes(session.user.email || "")) {
          r = "admin";
        } else if (columnistEmails.includes(session.user.email || "")) {
          r = "colunista";
        } else {
          r = "autor";
        }
      }
      
      setRole(r as Role);
    };

    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const breadcrumb = BREADCRUMBS[pathname] || "Admin";

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-6 gap-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest truncate">{breadcrumb}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl px-4 py-2 text-slate-400 hover:text-slate-600 transition-all text-xs font-bold"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Buscar...</span>
          </button>

          <button className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <Bell size={18} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-2xl px-4 py-2 text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Ver Site</span>
          </Link>

          <div className="w-px h-6 bg-slate-100 mx-1" />

          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
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
              <button onClick={() => setDrawerOpen(false)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-500 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              {!role ? (
                <div className="space-y-4 px-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : (
                MOBILE_NAV.filter(item => {
                  if (role === 'autor') {
                    // Colunistas só veem notícias no mobile
                    return item.label === "Notícias";
                  }
                  return true;
                }).map(({ label, href, icon: Icon }) => {
                  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200",
                        active ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="text-sm">{label}</span>
                    </Link>
                  );
                })
              )}
            </nav>
          </aside>
        </div>
      )}

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </>
  );
}
