"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Flag, 
  LayoutGrid, 
  ImageIcon, 
  ChevronRight,
  Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "banners", label: "Banners & Criativos", href: "/admin/publicidade/banners", icon: ImageIcon },
  { id: "campanhas", label: "Campanhas", href: "/admin/publicidade/campanhas", icon: Flag },
  { id: "anunciantes", label: "Anunciantes", href: "/admin/publicidade/anunciantes", icon: Users },
  { id: "slots", label: "Slots (Espaços)", href: "/admin/publicidade/slots", icon: LayoutGrid },
];

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col space-y-6">
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shadow-blue-200">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Smart Ads Manager</h1>
            <p className="text-zinc-500 text-sm font-medium">Gestão profissional de inventário e anunciantes</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
          <span>ADMIN</span>
          <ChevronRight size={14} />
          <span className="text-blue-600">PUBLICIDADE</span>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-xl border border-zinc-200/60 w-fit">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                isActive 
                  ? "bg-white text-blue-600 shadow-sm border border-zinc-200" 
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Conteúdo da Página */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {children}
      </div>
    </div>
  );
}
