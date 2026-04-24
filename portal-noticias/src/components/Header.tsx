"use client";

import Link from "next/link";
import { useSettingsStore } from "../store/settingsStore";
import NotificationBell from "./NotificationBell";
import LoginModal from "./LoginModal";
import { getPublicUrl } from "./FallbackImage";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { User, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { normalizeCategory } from "../lib/category-utils";
import { useRouter } from "next/navigation";
import { useLiveStatus } from "../hooks/useLiveStatus";

interface HeaderProps {
  isLive?: boolean; // Mantido para compatibilidade, mas useLiveStatus tem precedência
  config?: any;
  categoriaAtiva?: string;
  setCategoriaAtiva?: (cat: string) => void;
  showNavigation?: boolean;
}

const CATEGORIAS = ["Início", "Geral", "Arapongas", "Esportes", "Polícia", "Política", "Entretenimento", "Educação", "Saúde", "Biblioteca"];

export default function Header({
  config,
  categoriaAtiva,
  setCategoriaAtiva,
  showNavigation = true,
}: HeaderProps) {
  const router = useRouter();
  const { ui } = useSettingsStore();
  const { status: liveStatus } = useLiveStatus();
  
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, s: any) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const activeIsLive = liveStatus?.is_live ?? false;

  const handleCategoryClick = (cat: string) => {
    if (cat === "Biblioteca") {
      router.push("/biblioteca");
      return;
    }
    if (cat === "Início") {
      if (setCategoriaAtiva) {
        setCategoriaAtiva("Início");
        window.history.pushState({}, '', '/');
        window.scrollTo(0, 0);
      } else {
        router.push("/");
      }
      setIsMobileMenuOpen(false);
      return;
    }
    
    if (setCategoriaAtiva) {
      setCategoriaAtiva(cat);
      window.scrollTo(0, 0);
    } else {
      router.push(`/${normalizeCategory(cat)}`);
    }
    setIsMobileMenuOpen(false);
  };

  const brandName = config?.ui_settings?.brand_name || ui.siteName || "NOSSA WEB TV";
  const rawLogoUrl = config?.ui_settings?.logo_url || config?.logo_url || ui.logoUrl;
  const logoUrl = getPublicUrl(rawLogoUrl);
  const logoTextoUrl = getPublicUrl(ui.logoTextoUrl);
  const primaryColor = config?.ui_settings?.primary_color || ui.primaryColor || "#00AEE0";
  const fontFamily = config?.ui_settings?.font_family || ui.fontFamily || "Inter, sans-serif";

  // Se não montou, renderizamos uma versão estática mínima para evitar Erro #418
  if (!mounted) {
     return <div className="w-full h-16 bg-black flex items-center px-4"></div>;
  }

  return (
    <>
      <div className="w-full flex flex-col font-sans sticky top-0 z-50">
        <header className="bg-black border-b border-zinc-800/60 shadow-lg w-full">
          <div className="container mx-auto px-4 lg:px-8 py-2.5 flex justify-between items-center">
            
            {/* LOGO */}
            <div className="flex items-center">
              <Link href="/" onClick={() => setCategoriaAtiva?.("Início")} className="relative cursor-pointer group flex items-center gap-3">
                {!logoUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base" style={{ background: primaryColor }}>
                      {brandName.charAt(0)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-1">
                    <img src={logoUrl} alt={brandName} className="h-9 sm:h-11 w-auto object-contain" />
                    {logoTextoUrl && (
                      <div className="h-5 sm:h-8 w-auto border-l border-zinc-700 pl-3">
                        <img src={logoTextoUrl} alt={brandName} className="h-full w-auto object-contain" />
                      </div>
                    )}
                  </div>
                )}
              </Link>
            </div>

            {/* AÇÕES DIREITA */}
            <div className="flex items-center gap-2">
              <div className={`text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-500 ${
                activeIsLive ? "bg-red-900/40 text-red-400 border-red-800/60 font-black animate-pulse" : "bg-zinc-900 text-zinc-500 border-zinc-700"
              }`}>
                <span className="relative flex h-1.5 w-1.5">
                  {activeIsLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${activeIsLive ? "bg-red-500" : "bg-zinc-500"}`} />
                </span>
                <span>{activeIsLive ? "Ao Vivo" : "Offline"}</span>
              </div>

              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300">
                <Menu size={18} />
              </button>

              <div className="hidden lg:flex items-center gap-4 ml-4">
                <NotificationBell />
                <ThemeToggle />
                {session ? (
                  <button onClick={() => supabase.auth.signOut()} className="text-zinc-400 hover:text-white"><LogOut size={18} /></button>
                ) : (
                  <button onClick={() => setIsLoginModalOpen(true)} className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Entrar</button>
                )}
              </div>
            </div>
          </div>
        </header>

        {showNavigation && (
          <nav className="hidden lg:flex bg-zinc-950 border-b border-zinc-800/80 w-full overflow-x-auto">
            <div className="container mx-auto px-4 lg:px-8 flex items-center">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-3 whitespace-nowrap ${
                    categoriaAtiva === cat ? "text-white border-b-2 border-cyan-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* MOBILE MENU (SIMPLIFICADO) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-8 animate-in fade-in duration-300">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-white"><X size={32} /></button>
          <div className="flex flex-col gap-6 mt-12">
            {CATEGORIAS.map((cat) => (
              <button key={cat} onClick={() => handleCategoryClick(cat)} className="text-2xl font-black text-white uppercase tracking-tighter text-left border-b border-white/10 pb-4">
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
