"use client";

import { ExternalLink } from "lucide-react";

interface FooterAdBannerProps {
  imageUrl?: string;
  link?: string;
  altText?: string;
  visible?: boolean;
}

export default function FooterAdBanner({
  imageUrl,
  link = "#",
  altText = "Publicidade",
  visible = true,
}: FooterAdBannerProps) {
  if (!visible) return null;

  return (
    <div className="w-full bg-[#0f172a] border-t border-zinc-800/60 py-4 px-4 lg:px-8">
      <div className="container mx-auto">
        {imageUrl ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full block rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-zinc-700/40 hover:border-zinc-600 bg-black/20"
            aria-label={altText}
          >
            <img
              src={imageUrl}
              alt={altText}
              className="w-full aspect-[4/1] sm:aspect-[8/1] md:aspect-[12/1] object-contain sm:max-h-[120px] group-hover:scale-[1.01] transition-transform duration-700 rounded-2xl"
            />
            {/* Overlay com selo de publicidade */}
            <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">
                Publicidade
              </span>
              <ExternalLink size={9} className="text-white/60" />
            </div>
          </a>
        ) : (
          /* Slot vazio — placeholder para venda */
          <a href="/anuncie" className="w-full h-[80px] border-2 border-dashed border-zinc-700 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 group hover:bg-zinc-800/30 hover:border-cyan-500/50 transition-colors cursor-pointer">
            <span className="text-[10px] font-black text-zinc-500 group-hover:text-cyan-400 uppercase tracking-widest transition-colors">
              🔖 Espaço Publicitário Premium — Rodapé
            </span>
            <span className="text-[9px] font-medium text-zinc-600 group-hover:text-cyan-600 transition-colors">
              Impacte milhares de leitores. Fale conosco.
            </span>
          </a>
        )}
        
        {/* FOOTER LINKS */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-zinc-800/60">
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} NOSSA WEB TV. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="/anuncie" className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
              Anuncie Conosco
            </a>
            <a href="/privacidade" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors">
              Privacidade
            </a>
            <a href="/termos" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors">
              Termos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
