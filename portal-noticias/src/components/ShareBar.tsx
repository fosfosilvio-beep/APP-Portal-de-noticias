"use client";

import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareBarProps {
  url: string;
  title: string;
}

export default function ShareBar({ url, title }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
  };

  const shareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="flex flex-wrap items-center gap-4 py-6">
      <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest mr-2">Compartilhe:</h4>
      
      <div className="flex items-center gap-3">
        {/* Facebook */}
        <button 
          onClick={shareFacebook}
          className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 transition-all hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 shadow-sm"
          title="Compartilhar no Facebook"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* WhatsApp */}
        <button 
          onClick={shareWhatsApp}
          className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-green-500 transition-all hover:bg-green-500 hover:text-white hover:scale-110 active:scale-95 shadow-sm"
          title="WhatsApp"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 000 12a12 12 0 004 8.718L2 24l5.656-.474A12.015 12.015 0 0012 24c6.627 0 12-5.373 12-12S18.573 0 11.944 0zm0 19A6.994 6.994 0 018.441 18l-3.35.304L6 15.65a6.993 6.993 0 115.944 3.35z"/>
          </svg>
        </button>

        {/* Copy Link */}
        <button 
          onClick={copyToClipboard}
          className={`w-auto px-6 h-12 rounded-full border-2 flex items-center gap-3 transition-all active:scale-95 shadow-sm
            ${copied ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'}
          `}
        >
          {copied ? (
            <>
              <Check size={18} strokeWidth={3} />
              <span className="text-xs font-black uppercase">Copiado!</span>
            </>
          ) : (
            <>
              <Link2 size={18} strokeWidth={3} />
              <span className="text-xs font-black uppercase">Copiar link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
