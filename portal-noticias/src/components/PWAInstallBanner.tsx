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
    <div className="w-full block leading-none p-0 m-0 border-0 overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <button 
        onClick={handleInstallClick}
        className="w-full group relative overflow-hidden p-0 m-0 border-0 block leading-none"
        style={{ margin: 0, padding: 0, border: 0, outline: 'none' }}
      >
        <div className="w-full h-auto flex items-center justify-center m-0 p-0 leading-none">
          <img 
            src="/images/pwa-banner.png" 
            alt="Baixar Aplicativo" 
            className="w-full h-auto block object-cover m-0 p-0 border-0"
            style={{ display: 'block', margin: 0, padding: 0 }}
          />
        </div>
        {/* Overlay sutil de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </button>
    </div>
  );
}
