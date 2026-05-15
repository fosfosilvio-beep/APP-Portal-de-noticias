"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Se o usuário já fechou o banner anteriormente, não mostrar
    if (localStorage.getItem("pwa_banner_dismissed")) {
      setIsVisible(false);
      return;
    }

    // Verificar se já está rodando como aplicativo instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
      return;
    }

    // Mostrar o banner de download do APK se não estiver instalado
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("pwa_banner_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className="w-full bg-slate-50 border-b border-slate-100 p-0 m-0 relative" 
      style={{ display: 'block', height: 'auto', minHeight: 0, lineHeight: 0 }}
    >
      <div 
        className="max-w-screen-xl mx-auto p-0 m-0 relative"
        style={{ display: 'block', height: 'auto', minHeight: 0, lineHeight: 0 }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 md:p-2 transition-colors cursor-pointer"
          aria-label="Fechar banner"
          style={{ lineHeight: 0 }}
        >
          <X size={16} className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <a 
          href="/nossawebtv.apk"
          download="NossaWebTV.apk"
          onClick={handleDismiss}
          className="w-full p-0 m-0 border-0 block bg-transparent hover:opacity-95 transition-opacity focus:outline-none"
          style={{ display: 'block', height: 'auto', minHeight: 0, maxHeight: '180px', width: '100%', padding: 0, margin: 0, lineHeight: 0 }}
        >
          <img 
            src="/images/pwa-banner.png" 
            alt="Baixar Aplicativo" 
            className="w-full h-auto block m-0 p-0"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'contain' }}
          />
        </a>
      </div>
    </div>
  );
}
