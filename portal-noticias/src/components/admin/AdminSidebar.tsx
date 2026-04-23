"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Role } from "@/lib/auth/roles";
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
  ChevronLeft,
  ChevronRight,
  Tv2,
  LayoutTemplate,
  MessageSquare,
  CreditCard,
  Search,
  Rss,
  BookOpen,
  Tv,
  Library,
  Video,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "DASHBOARD",
    items: [
      { label: "Visão Geral", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Métricas", href: "/admin/metricas", icon: BarChart3 },
    ]
  },
  {
    label: "CONTEÚDO",
    items: [
      { label: "Notícias", href: "/admin/noticias", icon: Newspaper },
      { label: "FeedNews RSS", href: "/admin/feednews", icon: Rss },
      { label: "Colunistas", href: "/admin/colunistas", icon: ClipboardList },
      { label: "Transmissão / Live", href: "/admin/transmissao", icon: Tv },
      { label: "Biblioteca", href: "/admin/biblioteca", icon: Library },
    ]
  },
  {
    label: "COMUNICAÇÃO & COMUNIDADE",
    items: [
      { label: "Comentários", href: "/admin/comentarios", icon: MessageSquare },
      { label: "Enquetes", href: "/admin/enquetes", icon: Radio },
      { label: "Push Alertas", href: "/admin/push-alertas", icon: Megaphone },
      { label: "Auditoria", href: "/admin/auditoria", icon: ClipboardList },
    ]
  },
  {
    label: "MONETIZAÇÃO",
    items: [
      { label: "Publicidade", href: "/admin/publicidade", icon: Megaphone },
    ]
  },
  {
    label: "CONFIGURAÇÕES",
    items: [
      { label: "Branding & UI", href: "/admin/branding", icon: Brush },
      { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) setRole(data.role as Role);
    };

    fetchRole();
  }, []);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out shrink-0 shadow-sm",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-50">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
          <Tv2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-black text-slate-800 text-base tracking-tighter">
            ADMIN<span className="text-blue-600">PORTAL</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map(({ label, href, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";
                const isExactActive = href === "/admin" && pathname === "/admin";
                const active = isActive || isExactActive;

                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                      active
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />
                    {!collapsed && (
                      <span className="text-sm truncate">{label}</span>
                    )}
                    {!collapsed && active && (
                      <div className="ml-auto w-1 h-4 rounded-full bg-blue-600 shrink-0" />
                    )}
                    {collapsed && active && (
                      <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all text-xs font-bold"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>Recolher Menu</span>}
        </button>
      </div>
    </aside>
  );
}
