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

interface HeaderProps {
  isLive: boolean;
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

const CATEGORIAS = ["Início", "Arapongas", "Esportes", "Polícia", "Política", "Biblioteca"];

export default function Header({
  isLive,
  config,
  categoriaAtiva,
  setCategoriaAtiva,
  showNavigation = true,
}: HeaderProps) {
  const { ui } = useSettingsStore();
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

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
      window.location.href = "/biblioteca";
      return;
    }
    setCategoriaAtiva?.(cat);
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  const brandName = config?.ui_settings?.brand_name || ui.siteName || "NOSSA WEB TV";
  const rawLogoUrl = config?.ui_settings?.logo_url || config?.logo_url || ui.logoUrl;
  const logoUrl = getPublicUrl(rawLogoUrl);
  const logoTextoUrl = getPublicUrl(ui.logoTextoUrl);
  const primaryColor = config?.ui_settings?.primary_color || ui.primaryColor || "#00AEE0";
  const fontFamily = config?.ui_settings?.font_family || ui.fontFamily || "Inter, sans-serif";

  return (
    <>
      <div className="w-full flex flex-col font-sans sticky top-0 z-50">
        {/* HEADER PRINCIPAL */}
        <header className="bg-black border-b border-zinc-800 shadow-lg w-full">
          <div className="container mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">

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
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-inner border border-white/10 bg-transparent"
                      style={{ background: primaryColor }}
                    >
                      {brandName.charAt(0)}
                    </div>
                    <span
                      className="hidden sm:inline-block uppercase tracking-wider text-sm sm:text-base bg-transparent"
                      style={{ fontFamily, fontWeight: "900", color: primaryColor }}
                    >
                      {brandName}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-transparent py-1">
                    {/* Logo Ícone/Normal */}
                    <div className="relative h-10 sm:h-12 w-auto bg-transparent flex items-center justify-center">
                      <img
                        src={logoUrl}
                        alt={brandName}
                        className="h-full w-auto object-contain bg-transparent transition-transform group-hover:scale-[1.05]"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </div>
                    
                    {/* Logo Texto (Opcional) */}
                    {logoTextoUrl && (
                      <div className="h-6 sm:h-9 w-auto bg-transparent border-l border-zinc-800 pl-3 flex items-center justify-center">
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

            {/* ÁREA DE NAVEGAÇÃO DESKTOP */}
            <nav className="flex items-center gap-2 sm:gap-3">

              {/* LINKS DESKTOP (hidden no mobile) */}
              {showNavigation && setCategoriaAtiva && (
                <div className="hidden lg:flex space-x-1 shrink-0 items-center bg-zinc-900 p-1.5 rounded-full border border-zinc-700">
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`cursor-pointer text-[11px] font-black transition-all uppercase tracking-widest px-4 py-2 rounded-full ${
                        categoriaAtiva === cat
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {!showNavigation && (
                <Link
                  href="/"
                  className="hidden sm:flex text-zinc-400 hover:text-white font-bold transition-colors text-xs uppercase tracking-widest outline-none items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-700"
                >
                  ← Voltar ao Início
                </Link>
              )}

              {/* THEME TOGGLE */}
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {/* SINO — apenas desktop */}
              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              {/* PERFIL — apenas desktop */}
              <div className="hidden md:flex items-center">
                {session ? (
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 pl-1.5 pr-3 py-1.5 rounded-full">
                    <img
                      src={session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${session.user.user_metadata.full_name || "U"}`}
                      alt="Perfil"
                      className="w-7 h-7 rounded-full object-cover border border-zinc-600"
                    />
                    <span className="text-[10px] font-black text-white uppercase truncate max-w-[70px]">
                      {session.user.user_metadata.full_name?.split(" ")[0] || "Perfil"}
                    </span>
                    <button onClick={handleLogout} className="ml-1 text-zinc-500 hover:text-red-500 transition-colors">
                      <LogOut size={13} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                  >
                    <User size={13} /> Entrar
                  </button>
                )}
              </div>

              {/* INDICADOR AO VIVO (compacto no mobile) */}
              <div className={`text-[10px] uppercase tracking-widest flex items-center gap-1.5 px-3 py-2 rounded-full border transition-all duration-500 shadow-sm ${
                isLive
                  ? "bg-red-900/40 text-red-400 border-red-800/60 font-black animate-pulse"
                  : "bg-zinc-900 text-zinc-500 border-zinc-700 opacity-70 font-bold"
              }`}>
                <span className="relative flex h-2 w-2 shrink-0">
                  {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-red-500" : "bg-zinc-500"}`} />
                </span>
                <span className="hidden sm:inline">{isLive ? "Ao Vivo" : "Offline"}</span>
              </div>

              {/* HAMBURGER (apenas mobile/tablet) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-full text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Abrir menu"
              >
                <Menu size={20} />
              </button>
            </nav>
          </div>
        </header>

        {/* BREAKING NEWS / RADAR */}
        {config?.ui_settings?.breaking_news_alert?.text ? (
          <div className="w-full overflow-hidden flex items-center h-9 shadow-sm" style={{ backgroundColor: config.ui_settings.breaking_news_alert.color || "#e11d48" }}>
            <div className="container mx-auto px-4 lg:px-8 flex items-center">
              <span className="font-black text-[9px] uppercase tracking-widest bg-black/20 border border-white/20 text-white px-3 py-1 rounded shadow-inner z-10 shrink-0">Breaking</span>
              <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
                <div className="animate-marquee flex gap-10 opacity-90 text-[11px] font-bold uppercase tracking-tight text-white">
                  <span>{config.ui_settings.breaking_news_alert.text}</span>
                  <span className="text-white/50">•</span>
                  <span>{config.ui_settings.breaking_news_alert.text}</span>
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
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isLive ? "bg-red-950/50 border border-red-800/50" : "bg-zinc-900 border border-zinc-800"}`}>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLive ? "bg-red-500" : "bg-zinc-600"}`} />
            </span>
            <span className={`text-xs font-black uppercase tracking-widest ${isLive ? "text-red-400" : "text-zinc-500"}`}>
              {isLive ? "TV Ao Vivo — Assistindo Agora" : "TV Offline"}
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
