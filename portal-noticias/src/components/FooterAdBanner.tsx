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
          <div className="w-full h-[80px] border-2 border-dashed border-zinc-700 rounded-2xl flex items-center justify-center gap-4 group hover:bg-zinc-800/30 transition-colors cursor-pointer">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              🔖 Espaço Publicitário Premium — Rodapé
            </span>
            <span className="text-[9px] font-medium text-zinc-600">
              Impacte milhares de leitores. Fale conosco.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
