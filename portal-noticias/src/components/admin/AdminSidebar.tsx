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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Visão Geral", href: "/admin", icon: LayoutDashboard, exact: true },
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
        .single();
      
      if (data) setRole(data.role as Role);
    };

    fetchRole();
  }, []);

  const filteredNav = NAV_ITEMS.filter(item => {
    if (!role) return true; // Show all while loading/guest
    if (role === 'autor') {
      const allowed = ['/', '/admin', '/admin/transmissao', '/admin/noticias', '/admin/midia', '/admin/relatorios'];
      return allowed.includes(item.href);
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
          <Tv2 size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-black text-white text-sm tracking-tight">
            NOSSA<span className="text-cyan-400">WEB</span>TV
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredNav.map(({ label, href, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";
          const isExactActive = href === "/admin" && pathname === "/admin";
          const active = isActive || isExactActive;

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-cyan-400" : "text-slate-500 group-hover:text-white"
                )}
              />
              {!collapsed && (
                <span className="text-sm font-semibold truncate">{label}</span>
              )}
              {!collapsed && active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all text-xs font-semibold"
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span>Colapsar</span>}
      </button>
    </aside>
  );
}
