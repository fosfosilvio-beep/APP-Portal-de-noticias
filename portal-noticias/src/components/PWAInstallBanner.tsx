"use client";

import { useEffect, useState } from "react";

export default function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se já está rodando como aplicativo instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
      return;
    }

    // Mostrar o banner de download do APK se não estiver instalado
    setIsVisible(true);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="w-full bg-slate-50 border-b border-slate-100 p-0 m-0" 
      style={{ display: 'block', height: 'auto', minHeight: 0, lineHeight: 0 }}
    >
      <div 
        className="max-w-screen-xl mx-auto p-0 m-0"
        style={{ display: 'block', height: 'auto', minHeight: 0, lineHeight: 0 }}
      >
        <a 
          href="/nossawebtv.apk"
          download="NossaWebTV.apk"
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
