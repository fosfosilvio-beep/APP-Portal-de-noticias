"use client";

import Link from "next/link";
import { MessageCircle, ChevronUp, MapPin, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { getPublicUrl } from "./FallbackImage";
import { formatExternalUrl } from "@/lib/utils";

interface FooterProps {
  config?: any;
}

export default function Footer({ config }: FooterProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const brandName = config?.ui_settings?.brand_name || "NOSSA WEB TV";
  const primaryColor = config?.ui_settings?.primary_color || "#00AEE0";
  const rawLogoUrl = config?.ui_settings?.logo_url || config?.logo_url;
  const logoUrl = getPublicUrl(rawLogoUrl);

  const whatsappNumber = config?.whatsapp_number || "5543999999999";
  const instagramUrl = formatExternalUrl(config?.instagram_url || "instagram.com/nossawebtv");
  const facebookUrl = formatExternalUrl(config?.facebook_page_url || "facebook.com/nossawebtv1");
  const youtubeUrl = formatExternalUrl(config?.youtube_channel_url || "youtube.com/@nossawebtv");

  return (
    <footer className="bg-[#0f172a] text-slate-300 font-sans border-t-4 border-t-emerald-500 pt-16 pb-8 relative mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Coluna 1: Branding e Bio */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-12 w-auto object-contain brightness-0 invert opacity-90" />
              ) : (
                <span className="uppercase tracking-widest text-lg font-black text-white">{brandName}</span>
              )}
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              O portal de notícias mais inovador de Arapongas e região. Jornalismo hiperlocal, ágil e independente na palma da sua mão.
            </p>
            <div className="flex flex-col gap-2 text-xs font-bold text-slate-500">
              {config?.endereco_rodape && (
                <span className="flex items-center gap-2"><MapPin size={14} /> {config.endereco_rodape}</span>
              )}
              {config?.email_contato && (
                <span className="flex items-center gap-2"><Mail size={14} /> {config.email_contato}</span>
              )}
              {config?.telefone_contato && (
                <span className="flex items-center gap-2"><Phone size={14} /> {config.telefone_contato}</span>
              )}
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Navegação</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Página Inicial</Link></li>
              <li><Link href="/colunistas" className="hover:text-emerald-400 transition-colors">Colunistas e Artigos</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Institucional */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Institucional</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/anuncie" className="hover:text-emerald-400 transition-colors">Mídia Kit & Anuncie</Link></li>
              <li><Link href="/quem-somos" className="hover:text-emerald-400 transition-colors">Quem Somos</Link></li>
              <li><Link href="/termos" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-emerald-400 transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/exclusao-de-dados" className="hover:text-emerald-400 transition-colors">Exclusão de Dados</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Redes Sociais */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Siga-nos</h4>
            <div className="grid grid-cols-2 gap-3">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gradient-to-tr from-pink-500 to-purple-500 text-white p-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                <span className="font-bold text-xs uppercase tracking-wider">Insta</span>
              </a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-emerald-500 text-white p-3 rounded-xl hover:scale-105 transition-transform shadow-lg">
                <MessageCircle size={20} /> <span className="font-bold text-xs uppercase tracking-wider">WhatsApp</span>
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 transition-colors">
                <span className="font-bold text-xs uppercase tracking-wider">Face</span>
              </a>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-red-600 text-white p-3 rounded-xl hover:bg-red-500 transition-colors">
                <span className="font-bold text-xs uppercase tracking-wider">Tube</span>
              </a>
            </div>
            
            <div className="mt-6 flex items-center gap-2 bg-white/5 border border-white/10 p-3 rounded-xl w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PWA Otimizado</span>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <p>{config?.copyright_texto || `© 2008 - ${new Date().getFullYear()} ${brandName}. Todos os direitos reservados.`}</p>
          <p>Powered by <a href="https://webmaster.com.br" target="_blank" className="text-emerald-500 hover:text-emerald-400">WM Soluções Inteligentes</a></p>
        </div>
      </div>

      {/* Botão Flutuante: Voltar ao Topo */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
        aria-label="Voltar ao topo"
      >
        <ChevronUp size={24} />
      </button>
    </footer>
  );
}
