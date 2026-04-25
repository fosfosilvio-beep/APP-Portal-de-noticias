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
    <div className="w-full px-4 lg:px-8 py-2 animate-in fade-in slide-in-from-top duration-700">
      <button 
        onClick={handleInstallClick}
        className="w-full group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-500 border border-slate-100 p-0"
      >
        <div className="w-full h-auto flex items-center justify-center">
          <img 
            src="/images/pwa-banner.png" 
            alt="Baixar Aplicativo" 
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>
        {/* Overlay sutil de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
      </button>
    </div>
  );
}
