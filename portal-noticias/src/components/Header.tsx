"use client";

import Link from "next/link";
import { useSettingsStore } from "../store/settingsStore";
import NotificationBell from "./NotificationBell";
import LoginModal from "./LoginModal";
import { getPublicUrl } from "./FallbackImage";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { User, LogOut, Menu, X, ChevronRight, Headset } from "lucide-react";
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
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, s: any) => setSession(s));

    // Fetch Categorias
    supabase.from("categorias").select("id, nome, slug").eq("ativa", true).order("ordem")
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          const hasInicio = data.some((c: any) => c.nome.toLowerCase() === "início");
          const hasBiblioteca = data.some((c: any) => c.nome.toLowerCase() === "biblioteca");
          let base = [...data];
          if (!hasInicio) base = [{ id: "inicio", nome: "Início", slug: "inicio" }, ...base];
          if (!hasBiblioteca) base = [...base, { id: "biblioteca", nome: "Biblioteca", slug: "biblioteca" }];
          setCategorias(base);
        }
      });

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

  const brandName = config?.nome_plataforma || config?.ui_settings?.brand_name || ui.siteName || "NOSSA WEB TV";
  const rawLogoUrl = config?.logo_url || config?.ui_settings?.logo_url || ui.logoUrl;
  const logoUrl = getPublicUrl(rawLogoUrl);
  const logoTextoUrl = getPublicUrl(config?.logo_texto_url || ui.logoTextoUrl);
  const primaryColor = config?.ui_settings?.primary_color || ui.primaryColor || "#00AEE0";
  const fontFamily = config?.ui_settings?.font_family || ui.fontFamily || "Inter, sans-serif";

  // Se não montou, renderizamos uma versão estática mínima para evitar Erro #418
  if (!mounted) {
     return null;
  }

  return (
    <>
      <div className="w-full flex flex-col font-sans sticky top-0 z-50">
        <header className="bg-black border-b border-zinc-800/60 shadow-lg w-full">
          <div className="container mx-auto px-4 lg:px-8 py-2.5 flex justify-between items-center">
            
            <div className="flex items-center">
              <Link 
                href="/" 
                onClick={() => setCategoriaAtiva?.("Início")} 
                className="relative cursor-pointer group flex items-center gap-3"
              >
                {logoUrl ? (
                  <div className="flex items-center gap-2 md:gap-3">
                    <img 
                      src={logoUrl} 
                      alt={brandName} 
                      className="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                    />
                    {logoTextoUrl && (
                      <img 
                        src={logoTextoUrl} 
                        alt={`${brandName} Texto`} 
                        className="h-5 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-lg md:text-xl font-black text-white tracking-tighter uppercase transition-colors group-hover:text-cyan-400">
                    {brandName}
                  </span>
                )}
              </Link>
            </div>

            {/* AÇÕES DIREITA */}
            <div className="flex items-center gap-2">
              <Link 
                href="/biblioteca"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 group/podcast max-w-[140px]"
              >
                <Headset size={18} className="text-yellow-500 shrink-0" />
                <div className="flex flex-col leading-none">
                  <span className="text-[8px] uppercase text-slate-400 font-bold tracking-tight">Assista nossos</span>
                  <span className="text-[10px] font-black text-white tracking-widest">PODCAST</span>
                </div>
              </Link>

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
              {categorias.map((cat) => (
                <button
                  key={cat.id || cat.nome}
                  onClick={() => handleCategoryClick(cat.nome)}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-3 whitespace-nowrap ${
                    categoriaAtiva === cat.nome ? "text-white border-b-2 border-cyan-400" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {cat.nome}
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
          <div className="flex flex-col gap-6 mt-12 overflow-y-auto max-h-[70vh] pr-4">
            {categorias.map((cat) => (
              <button 
                key={cat.id || cat.nome} 
                onClick={() => {
                  handleCategoryClick(cat.nome);
                  setIsMobileMenuOpen(false);
                }} 
                className={`text-2xl font-black uppercase tracking-tighter text-left border-b border-white/10 pb-4 ${
                  categoriaAtiva === cat.nome ? "text-cyan-400" : "text-white"
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
