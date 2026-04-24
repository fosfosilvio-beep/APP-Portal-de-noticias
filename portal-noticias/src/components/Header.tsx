"use client";

import Link from "next/link";
import Image from "next/image";
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

interface HeaderProps {
  isLive?: boolean;
  config?: {
    logo_url?: string;
    tema_cor?: string;
    ui_settings?: {
      logo_mode?: "text" | "image";
      logo_url?: string;
      brand_name?: string;
      font_family?: string;
      font_weight?: string;
      primary_color?: string;
      breaking_news_alert?: { text?: string; speed?: string; color?: string };
    };
  };
  categoriaAtiva?: string;
  setCategoriaAtiva?: (cat: string) => void;
  showNavigation?: boolean;
}

const CATEGORIAS = ["Início", "Geral", "Arapongas", "Esportes", "Polícia", "Política", "Entretenimento", "Educação", "Saúde", "Biblioteca"];

export default function Header({
  isLive = false,
  config,
  categoriaAtiva,
  setCategoriaAtiva,
  showNavigation = true,
}: HeaderProps) {
  const router = useRouter();
  const { ui } = useSettingsStore();
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [isLiveInterno, setIsLiveInterno] = useState(isLive);
  const [configInterno, setConfigInterno] = useState(config);

  useEffect(() => {
    setMounted(true);
    // 1. Auth session
    supabase.auth.getSession().then(({ data: { session } }: any) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, s: any) => setSession(s));

    // 2. Sincronização Live/Config (Bypass Cache)
    const syncConfig = async () => {
      const { data } = await supabase.from("configuracao_portal").select("*").limit(1).single();
      if (data) {
        setIsLiveInterno(data.is_live);
        setConfigInterno(data);
      }
    };
    syncConfig();

    // 3. Realtime Listener
    const channel = supabase
      .channel("header_sync")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "configuracao_portal" }, (payload: any) => {
        setIsLiveInterno(payload.new.is_live);
        setConfigInterno(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // Usar os estados internos que são sincronizados em realtime
  const activeConfig = configInterno || config;
  const activeIsLive = isLiveInterno;


  // Bloqueia scroll do body quando drawer está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
  };

  const handleCategoryClick = (cat: string) => {
    if (cat === "Biblioteca") {
      router.push("/biblioteca");
      return;
    }
    if (cat === "Início") {
      if (setCategoriaAtiva) {
        setCategoriaAtiva("Início");
        // Limpa query params sem recarregar a página se estivermos na home
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
      // Se não houver setter (fora da home), redireciona para a página da categoria
      router.push(`/${normalizeCategory(cat)}`);
    }
    setIsMobileMenuOpen(false);
  };

  const brandName = activeConfig?.ui_settings?.brand_name || ui.siteName || "NOSSA WEB TV";
  const rawLogoUrl = activeConfig?.ui_settings?.logo_url || activeConfig?.logo_url || ui.logoUrl;
  const logoUrl = getPublicUrl(rawLogoUrl);
  const logoTextoUrl = getPublicUrl(ui.logoTextoUrl);
  const primaryColor = activeConfig?.ui_settings?.primary_color || ui.primaryColor || "#00AEE0";
  const fontFamily = activeConfig?.ui_settings?.font_family || ui.fontFamily || "Inter, sans-serif";

  return (
    <>
      <div className="w-full flex flex-col font-sans sticky top-0 z-50">

        {/* ── FAIXA 1: LOGO + AÇÕES ─────────────────────────────────── */}
        <header className="bg-black border-b border-zinc-800/60 shadow-lg w-full">
          <div className="container mx-auto px-4 lg:px-8 py-2.5 flex justify-between items-center">

            {/* LOGO */}
            <div className="flex items-center">
              <Link
                href="/"
                onClick={() => setCategoriaAtiva?.("Início")}
                className="relative cursor-pointer outline-none group flex items-center gap-3"
              >
                {!logoUrl ? (
                  <div className="flex items-center gap-2 bg-transparent">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-base shadow-inner border border-white/10"
                      style={{ background: primaryColor }}
                    >
                      {brandName.charAt(0)}
                    </div>
                    <span
                      className="hidden sm:inline-block uppercase tracking-wider text-sm bg-transparent"
                      style={{ fontFamily, fontWeight: "900", color: primaryColor }}
                    >
                      {brandName}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-transparent py-1">
                    <div className="relative h-9 sm:h-11 w-auto bg-transparent flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt={brandName}
                        className="h-full w-auto object-contain bg-transparent transition-transform group-hover:scale-[1.05]"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </div>
                    {logoTextoUrl && (
                      <div className="h-5 sm:h-8 w-auto bg-transparent border-l border-zinc-700 pl-3 flex items-center justify-center">
                        <img
                          src={logoTextoUrl}
                          alt={`${brandName} Texto`}
                          className="h-full w-auto object-contain bg-transparent transition-opacity opacity-90 group-hover:opacity-100"
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </Link>
            </div>

            {/* AÇÕES DIREITA */}
            <div className="flex items-center gap-2">
              {/* Anuncie */}
              <Link
                href="/anuncie"
                className="hidden sm:flex bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-colors items-center gap-1 shadow-sm"
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                Anuncie
              </Link>

              {/* Sino */}
              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              {/* Perfil */}
              <div className="hidden md:flex items-center">
                {session ? (
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 pl-1.5 pr-3 py-1.5 rounded-full">
                    <img
                      src={session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${session.user.user_metadata.full_name || "U"}`}
                      alt="Perfil"
                      className="w-6 h-6 rounded-full object-cover border border-zinc-600"
                    />
                    <span className="text-[10px] font-black text-white uppercase truncate max-w-[60px]">
                      {session.user.user_metadata.full_name?.split(" ")[0] || "Perfil"}
                    </span>
                    <button onClick={handleLogout} className="ml-1 text-zinc-500 hover:text-red-500 transition-colors">
                      <LogOut size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                  >
                    <User size={12} /> Entrar
                  </button>
                )}
              </div>

              {/* Ao Vivo */}
              <div className={`text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all duration-500 ${
                activeIsLive
                  ? "bg-red-900/40 text-red-400 border-red-800/60 font-black animate-pulse"
                  : "bg-zinc-900 text-zinc-500 border-zinc-700 opacity-70 font-bold"
              }`}>
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  {activeIsLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${activeIsLive ? "bg-red-500" : "bg-zinc-500"}`} />
                </span>
                <span className="hidden sm:inline" suppressHydrationWarning>{activeIsLive ? "Ao Vivo" : "Offline"}</span>
              </div>

              {/* Hambúrguer mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* ── FAIXA 2: NAVEGAÇÃO DE CATEGORIAS (desktop only) ───────── */}
        {showNavigation && (
          <nav className="hidden lg:flex bg-zinc-950 border-b border-zinc-800/80 w-full">
            <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
              {/* Categorias centralizadas */}
              <div className="flex items-center gap-0.5">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`cursor-pointer text-[10px] font-black transition-all uppercase tracking-widest px-3.5 py-2.5 relative ${
                      categoriaAtiva === cat
                        ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-cyan-400"
                        : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* ThemeToggle no canto direito da nav */}
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        )}


        {/* BREAKING NEWS / RADAR */}
        {activeConfig?.ui_settings?.breaking_news_alert?.text ? (
          <div className="w-full overflow-hidden flex items-center h-9 shadow-sm" style={{ backgroundColor: activeConfig.ui_settings.breaking_news_alert.color || "#e11d48" }}>
            <div className="container mx-auto px-4 lg:px-8 flex items-center">
              <span className="font-black text-[9px] uppercase tracking-widest bg-black/20 border border-white/20 text-white px-3 py-1 rounded shadow-inner z-10 shrink-0">Breaking</span>
              <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
                <div className="animate-marquee flex gap-10 opacity-90 text-[11px] font-bold uppercase tracking-tight text-white">
                  <span>{activeConfig.ui_settings.breaking_news_alert.text}</span>
                  <span className="text-white/50">•</span>
                  <span>{activeConfig.ui_settings.breaking_news_alert.text}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#005a78] to-[#00AEE0] text-white border-b border-cyan-800 w-full overflow-hidden flex items-center h-9 shadow-sm">
            <div className="container mx-auto px-4 lg:px-8 flex items-center">
              <span className="font-black text-[9px] uppercase tracking-widest bg-cyan-950/40 border border-cyan-400/20 px-3 py-1 rounded shadow-inner z-10 shrink-0">Radar</span>
              <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
                <div className="animate-marquee flex gap-10 opacity-90 text-[11px] font-bold uppercase tracking-tight">
                  <span>Arapongas/PR - Em Tempo Real...</span>
                  <span className="text-cyan-200">•</span>
                  <span>Ouça nossa programação 24 horas por dia.</span>
                  <span className="text-cyan-200">•</span>
                  <span>Líder de audiência no norte do Paraná.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============ MOBILE DRAWER ============ */}

      {/* OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR DRAWER */}
      <div className={`fixed inset-y-0 right-0 z-[9999] w-[85vw] max-w-[340px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Cabeçalho do Drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: primaryColor }}>
              {brandName.charAt(0)}
            </div>
            <span className="text-white font-black text-sm uppercase tracking-widest">{brandName}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Perfil no Drawer */}
        <div className="px-5 py-4 border-b border-zinc-800/50">
          {session ? (
            <div className="flex items-center gap-3">
              <img
                src={session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=U`}
                alt="Perfil"
                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-600"
              />
              <div className="flex-1">
                <p className="text-white font-black text-sm truncate">{session.user.user_metadata.full_name || "Usuário"}</p>
                <p className="text-zinc-500 text-xs font-medium truncate">{session.user.email}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              <User size={16} /> Entrar com Redes Sociais
            </button>
          )}
        </div>

        {/* Links de Categoria */}
        {showNavigation && setCategoriaAtiva && (
          <div className="flex-1 overflow-y-auto py-3">
            <p className="px-5 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Categorias</p>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`w-full flex items-center justify-between px-5 py-4 text-sm font-bold transition-all ${
                  categoriaAtiva === cat
                    ? "bg-white/5 text-white border-l-2 border-l-cyan-400"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="uppercase tracking-widest text-xs">{cat}</span>
                <ChevronRight size={14} className="opacity-40" />
              </button>
            ))}
          </div>
        )}

        {/* Status ao Vivo */}
        <div className="px-5 py-4 border-t border-zinc-800">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${activeIsLive ? "bg-red-950/50 border border-red-800/50" : "bg-zinc-900 border border-zinc-800"}`}>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {activeIsLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeIsLive ? "bg-red-500" : "bg-zinc-600"}`} />
            </span>
            <span className={`text-xs font-black uppercase tracking-widest ${activeIsLive ? "text-red-400" : "text-zinc-500"}`}>
              {activeIsLive ? "TV Ao Vivo — Assistindo Agora" : "TV Offline"}
            </span>
          </div>
          <p className="text-center text-zinc-700 text-[10px] font-bold mt-3 uppercase tracking-widest">Nossa Web TV © 2025</p>
        </div>
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
}
