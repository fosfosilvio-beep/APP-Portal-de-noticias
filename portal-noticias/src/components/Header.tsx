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
import { normalizeCategory, getVisualCategory } from "../lib/category-utils";
import { useRouter, usePathname } from "next/navigation";
import { useLiveStatus } from "../hooks/useLiveStatus";
import BreakingNewsMarquee from "./BreakingNewsMarquee";
import { useNavigationStore } from "../store/navigationStore";

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
  const pathname = usePathname();
  const { ui } = useSettingsStore();
  const { status: liveStatus } = useLiveStatus();
  const { 
    categoriaAtiva: storeCategoria, 
    setCategoriaAtiva: setStoreCategoria,
    showNavigation: storeShowNavigation 
  } = useNavigationStore();

  // Detecção automática de categoria ativa baseada na URL para uso global no layout
  const inferredCategory = pathname === "/" ? "Início" : getVisualCategory(pathname.replace(/^\//, '').split('/')[0]);
  const activeVisualCategory = categoriaAtiva || storeCategoria || inferredCategory;
  
  // Prioridade: prop showNavigation -> storeShowNavigation
  const finalShowNavigation = showNavigation && storeShowNavigation;
  
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, s: any) => setSession(s));

    // Fetch Config se não vier por prop
    if (!config) {
      supabase.from("configuracao_portal").select("*").eq("id", 1).maybeSingle()
        .then(({ data }: { data: any }) => { if (data) setInternalConfig(data); });
    }

    // Fetch Categorias
    const allowedNormalized = ['geral', 'arapongas', 'esportes', 'policia', 'politica', 'economia', 'entretenimento'];
    supabase.from("categorias").select("id, nome, slug").eq("ativa", true).order("ordem")
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          const filtered = data.filter((cat: any) => {
            const normalized = cat.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return allowedNormalized.includes(normalized);
          }).map(cat => {
            const rawSlug = cat.slug || normalizeCategory(cat.nome);
            return {
              ...cat,
              slug: rawSlug.replace(/^\//, '') // Remove qualquer barra inicial para controle total
            };
          });

          const base = [{ id: "inicio", nome: "Início", slug: "" }, ...filtered];
          setCategorias(base);
        }
      });

    return () => subscription.unsubscribe();
  }, [config]);

  const [internalConfig, setInternalConfig] = useState<any>(null);
  const activeConfig = config || internalConfig;

  const activeIsLive = liveStatus?.is_live ?? false;

  const handleCategoryClick = (catName: string, catSlug?: string) => {
    const isInicio = catName === "Início" || !catSlug || catSlug === "" || catSlug === "inicio";
    const cleanSlug = catSlug ? catSlug.replace(/^\//, '') : normalizeCategory(catName);
    const targetPath = isInicio ? "/" : `/${cleanSlug}`;

    // Se estivermos na Home, usamos o filtro de estado para não recarregar
    if (pathname === "/") {
      const finalSet = setCategoriaAtiva || setStoreCategoria;
      finalSet(isInicio ? "Início" : catName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
      return;
    }

    // Caso contrário, navegamos para a rota absoluta forçada
    router.push(targetPath);
    setIsMobileMenuOpen(false);
  };

  const brandName = activeConfig?.nome_plataforma || activeConfig?.ui_settings?.brand_name || ui.siteName || "NOSSA WEB TV";
  const rawLogoUrl = activeConfig?.logo_url || activeConfig?.ui_settings?.logo_url || ui.logoUrl;
  const logoUrl = getPublicUrl(rawLogoUrl);
  const logoTextoUrl = getPublicUrl(activeConfig?.logo_texto_url || ui.logoTextoUrl);
  const primaryColor = activeConfig?.ui_settings?.primary_color || ui.primaryColor || "#00AEE0";
  const fontFamily = activeConfig?.ui_settings?.font_family || ui.fontFamily || "Inter, sans-serif";

  // Se não montou, renderizamos uma versão estática mínima para evitar Erro #418
  if (!mounted) {
     return null;
  }

  const breakingNews = {
    active: activeConfig?.alerta_urgente_ativo,
    text: activeConfig?.alerta_urgente_texto,
    speed: activeConfig?.ticker_speed || "normal",
    fontSize: activeConfig?.ticker_font_size || 14,
    textColor: activeConfig?.ticker_font_color || "#ffffff"
  };

  return (
    <>
      <div className="w-full flex flex-col font-sans sticky top-0 z-50">
        {breakingNews.active && (
          <BreakingNewsMarquee 
            text={breakingNews.text || ""} 
            speed={breakingNews.speed} 
            fontSize={breakingNews.fontSize}
            textColor={breakingNews.textColor}
          />
        )}
        <header className="bg-black border-b border-zinc-800/60 shadow-lg w-full">
          <div className="container mx-auto px-4 lg:px-8 py-2.5 flex justify-between items-center">
            
            <div className="flex items-center min-w-0 flex-1 mr-4">
              <Link 
                href="/" 
                onClick={() => {
                  setCategoriaAtiva?.("Início");
                  setStoreCategoria("Início");
                }} 
                className="relative cursor-pointer group flex items-center gap-3 min-w-0"
              >
                {logoUrl ? (
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <img 
                      src={logoUrl} 
                      alt={brandName} 
                      className="h-8 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 shrink-0" 
                    />
                    {logoTextoUrl && (
                      <img 
                        src={logoTextoUrl} 
                        alt={`${brandName} Texto`} 
                        className="h-5 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 min-w-0" 
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-lg md:text-xl font-black text-white tracking-tighter uppercase transition-colors group-hover:text-cyan-400 truncate">
                    {brandName}
                  </span>
                )}
              </Link>
            </div>

            {/* AÇÕES DIREITA */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <Link 
                href="/biblioteca"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 group/podcast max-w-[120px] sm:max-w-[140px]"
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
                  <div className="flex items-center gap-3">
                    {session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture ? (
                      <img 
                        src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} 
                        alt="Avatar" 
                        className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <span className="text-[10px] font-black text-white">
                          {(session.user?.user_metadata?.full_name || session.user?.user_metadata?.name || session.user?.email || "US").substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <button onClick={() => supabase.auth.signOut()} className="text-zinc-400 hover:text-white transition-colors" title="Sair">
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsLoginModalOpen(true)} className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Entrar</button>
                )}
              </div>
            </div>
          </div>
        </header>

        {finalShowNavigation && (
          <nav className="hidden lg:flex bg-zinc-950 border-b border-zinc-800/80 w-full overflow-x-auto">
            <div className="container mx-auto px-4 lg:px-8 flex items-center">
              {categorias.map((cat) => {
                const isInicio = cat.nome === "Início" || !cat.slug || cat.slug === "";
                const cleanSlug = cat.slug ? cat.slug.replace(/^\//, '') : "";
                const href = isInicio ? "/" : `/${cleanSlug}`;
                const isActive = activeVisualCategory === cat.nome || (pathname === href) || (isInicio && pathname === "/");

                return (
                  <Link
                    key={cat.id || cat.nome}
                    href={href}
                    onClick={(e) => {
                      if (pathname === "/") {
                        e.preventDefault();
                        handleCategoryClick(cat.nome, cat.slug);
                      }
                    }}
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-3 whitespace-nowrap transition-all border-b-2 ${
                      isActive 
                        ? "text-white border-cyan-400 bg-white/5" 
                        : "text-zinc-500 border-transparent hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    {cat.nome}
                  </Link>
                );
              })}
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
            {categorias.map((cat) => {
              const isInicio = cat.nome === "Início" || !cat.slug || cat.slug === "";
              const cleanSlug = cat.slug ? cat.slug.replace(/^\//, '') : "";
              const href = isInicio ? "/" : `/${cleanSlug}`;
              const isActive = activeVisualCategory === cat.nome || (pathname === href) || (isInicio && pathname === "/");

              return (
                <Link 
                  key={cat.id || cat.nome} 
                  href={href}
                  onClick={(e) => {
                    if (pathname === "/") {
                      e.preventDefault();
                      handleCategoryClick(cat.nome, cat.slug);
                    }
                    setIsMobileMenuOpen(false);
                  }} 
                  className={`text-2xl font-black uppercase tracking-tighter text-left border-b border-white/10 pb-4 transition-colors ${
                    isActive ? "text-cyan-400" : "text-white"
                  }`}
                >
                  {cat.nome}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
