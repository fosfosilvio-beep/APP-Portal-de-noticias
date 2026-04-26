"use client";

import { useEffect, useState } from "react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevenir que o mini-infobar apareça no mobile
      e.preventDefault();
      // Guardar o evento para ser disparado depois
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Verificar se já foi instalado durante a sessão
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Esperar pela escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

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
        <button 
          onClick={handleInstallClick}
          className="w-full p-0 m-0 border-0 block bg-transparent hover:opacity-95 transition-opacity focus:outline-none"
          style={{ display: 'block', height: 'auto', minHeight: 0, maxHeight: '180px', width: '100%', padding: 0, margin: 0, lineHeight: 0 }}
        >
          <img 
            src="/images/pwa-banner.png" 
            alt="Baixar Aplicativo" 
            className="w-full h-auto block m-0 p-0"
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '180px', objectFit: 'contain' }}
          />
        </button>
      </div>
    </div>
  );
}
