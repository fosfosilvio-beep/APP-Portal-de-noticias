"use client";

import Link from "next/link";
import Image from "next/image";
import { useSettingsStore } from "../store/settingsStore";
import NotificationBell from "./NotificationBell";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { User, LogOut } from "lucide-react";

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

export default function Header({ 
  isLive, 
  config, 
  categoriaAtiva, 
  setCategoriaAtiva, 
  showNavigation = true 
}: HeaderProps) {
  
  const { ui } = useSettingsStore();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const brandName = ui.siteName || config?.ui_settings?.brand_name || 'NOSSA WEB TV';
  const logoUrl = ui.logoUrl || config?.ui_settings?.logo_url || config?.logo_url;
  const primaryColor = ui.primaryColor || config?.ui_settings?.primary_color || '#00AEE0';
  const fontFamily = ui.fontFamily || config?.ui_settings?.font_family || 'Inter, sans-serif';

  return (
    <div className="w-full flex flex-col font-sans sticky top-0 z-50">
      {/* HEADER PRINCIPAL — FUNDO PRETO */}
      <header className="bg-black border-b border-zinc-800 shadow-lg w-full">
        <div className="container mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link 
              href="/" 
              onClick={() => setCategoriaAtiva?.('Início')} 
              className="relative cursor-pointer outline-none group flex items-center gap-4"
            >
               {!logoUrl ? (
                  // LOGO EM TEXTO COM VARIÁVEIS DO PAINEL
                  <div className="flex items-center gap-2">
                     <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/20"
                          style={{ background: primaryColor }}>
                        {brandName.charAt(0)}
                     </div>
                     <span 
                       className="hidden sm:inline-block uppercase tracking-wider" 
                       style={{ 
                          fontFamily: fontFamily,
                          fontWeight: '900',
                          color: primaryColor
                       }}
                     >
                        {brandName}
                     </span>
                  </div>
               ) : (
                 // LOGO EM IMAGEM CUSTOMIZADA + TEXTO SR-ONLY PARA SEO
                 <div className="relative shrink-0 flex items-center gap-3">
                   <h1 className="sr-only">{brandName}</h1>
                   <img 
                     src={logoUrl} 
                     alt={brandName} 
                     className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                   />
                 </div>
               )}
            </Link>
          </div>
          
          <nav className="flex items-center gap-3">
            {showNavigation && setCategoriaAtiva && (
              <div className="hidden lg:flex space-x-1 shrink-0 items-center bg-zinc-900 p-1.5 rounded-full border border-zinc-700">
                {['Início', 'Arapongas', 'Esportes', 'Polícia', 'Política', 'Biblioteca'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => { setCategoriaAtiva(cat); window.scrollTo(0, 0); }} 
                    className={`cursor-pointer text-[11px] font-black transition-all uppercase tracking-widest px-4 py-2 rounded-full ${
                      categoriaAtiva === cat 
                      ? 'bg-white text-zinc-900 shadow-sm' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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

            {/* SINO DE NOTIFICAÇÕES IN-APP */}
            <NotificationBell />

            {/* PERFIL DO USUÁRIO */}
            {session ? (
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-700 pl-1.5 pr-4 py-1.5 rounded-full group">
                <img 
                  src={session.user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${session.user.user_metadata.full_name || 'User'}`} 
                  alt="Perfil" 
                  className="w-8 h-8 rounded-full object-cover border border-zinc-600"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white leading-tight uppercase truncate max-w-[80px]">
                    {session.user.user_metadata.full_name?.split(' ')[0] || 'Perfil'}
                  </span>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="ml-2 text-zinc-500 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  // Pode emitir um evento ou usar um estado global para abrir o modal de login
                  // Por simplicidade, vamos redirecionar para '/' se ele for acionado pelo chat ou exibir o modal lá
                }}
                className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                <User size={14} /> Entrar
              </button>
            )}

            {/* INDICADOR AO VIVO */}
            <div className={`text-[10px] uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-500 shadow-sm ${
              isLive 
              ? 'bg-red-900/40 text-red-400 border-red-800/60 font-black animate-pulse' 
              : 'bg-zinc-900 text-zinc-500 border-zinc-700 opacity-70 font-bold'
            }`}>
              <span className="relative flex h-2 w-2">
                {isLive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-red-500' : 'bg-zinc-500'}`}></span>
              </span>
              {isLive ? "TV Ao Vivo" : "TV Offline"}
            </div>
          </nav>
        </div>
      </header>

      {/* MARQUEE — BREAKING NEWS OU RADAR REGIONAL */}
      {config?.ui_settings?.breaking_news_alert?.text ? (
        <div className="w-full overflow-hidden flex items-center h-9 shadow-sm" style={{ backgroundColor: config.ui_settings.breaking_news_alert.color || '#e11d48' }}>
           <div className="container mx-auto px-4 lg:px-8 flex items-center">
              <span className="font-black text-[9px] uppercase tracking-widest bg-black/20 border border-white/20 text-white px-3 py-1 rounded shadow-inner z-10 shrink-0">Breaking News</span>
              <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
                <div className="animate-marquee flex gap-10 opacity-90 text-[11px] font-bold uppercase tracking-tight text-white">
                   <span>{config.ui_settings.breaking_news_alert.text}</span>
                   <span className="text-white/50">•</span>
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
              <span className="font-black text-[9px] uppercase tracking-widest bg-cyan-950/40 border border-cyan-400/20 px-3 py-1 rounded shadow-inner z-10 shrink-0">Radar Regional</span>
              <div className="w-full flex whitespace-nowrap overflow-hidden pr-4 ml-4">
                <div className="animate-marquee flex gap-10 opacity-90 text-[11px] font-bold uppercase tracking-tight">
                   <span>Arapongas/PR - Em Tempo Real...</span>
                   <span className="text-cyan-200">•</span>
                   <span>Ouça nossa programação e acompanhe o portal 24 horas por dia.</span>
                   <span className="text-cyan-200">•</span>
                   <span>Líder de audiência e credibilidade no norte do Paraná.</span>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
