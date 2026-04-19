"use client";

import { useEffect } from "react";

export default function LiveChat() {
  useEffect(() => {
    // Inicializar o SDK do Facebook se ele ainda não estiver presente
    const loadFacebookSDK = () => {
      if (typeof window !== "undefined" && !window.FB) {
        (function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0] as HTMLElement;
          if (d.getElementById(id)) return;
          js = d.createElement(s) as HTMLScriptElement; 
          js.id = id;
          js.src = "https://connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v18.0";
          fjs.parentNode?.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
      } else if (window.FB) {
        window.FB.XFBML.parse();
      }
    };

    loadFacebookSDK();
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 font-sans relative">
      
      {/* Header do Chat */}
      <div className="bg-slate-50 py-4 px-6 border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
        <h3 className="text-slate-900 font-black text-sm tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
          Chat ao Vivo
        </h3>
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Via Facebook</span>
      </div>

      {/* Área do Plugin do Facebook */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <div id="fb-root"></div>
        <div 
          className="fb-comments" 
          data-href={typeof window !== "undefined" ? window.location.origin : "https://portalnossawebtv.com.br"} 
          data-width="100%" 
          data-numposts="15"
          data-colorscheme="light"
        ></div>
        
        {/* Aviso de Moderação */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
           <span className="text-[10px] font-bold uppercase">Este chat é moderado automaticamente pelo Facebook</span>
        </div>
      </div>

      <style jsx global>{`
        /* Ajuste para o iframe do Facebook se comportar bem no container */
        .fb-comments, .fb-comments span, .fb-comments iframe {
          width: 100% !important;
        }
      `}</style>
    </div>
  );
}

// Declarar o objeto FB no window para o TypeScript
declare global {
  interface Window {
    FB: any;
  }
}
