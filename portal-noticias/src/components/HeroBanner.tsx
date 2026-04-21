"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroItem {
  image: string;
  duration: number;
  scale: string;
  animation: string;
  title?: string;
  subtitle?: string;
  category?: string;
}

export default function HeroBanner({ items, duration, transition }: { items: HeroItem[], duration?: number, transition?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    
    const slideDuration = items[current]?.duration || duration || 5000;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, slideDuration);

    return () => clearTimeout(timer);
  }, [current, items, duration]);

  if (!items || items.length === 0) return null;

  return (
    // FAIXA RETANGULAR WIDESCREEN — Reduzida para formato "fino"
    <div className="relative w-full h-32 md:h-44 lg:h-52 rounded-none lg:rounded-3xl overflow-hidden shadow-lg border-b border-slate-200 group">
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{ transitionDuration: `${transition || 1000}ms` }}
          className={`absolute inset-0 transition-all ease-in-out ${
            idx === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
          }`}
        >
          <img
            src={item.image}
            alt={`Banner ${idx + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Texto responsive — esconde subtitle no mobile */}
          <div className="absolute inset-x-4 sm:inset-x-8 md:inset-x-16 bottom-6 sm:bottom-10 md:bottom-12 z-20 flex flex-col items-start pointer-events-none">
             {idx === current && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards max-w-3xl">
                  {item.category && (
                    <span className="inline-block bg-cyan-600/90 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full mb-2 shadow-lg border border-white/20">
                      {item.category}
                    </span>
                  )}
                  {item.title && (
                    <h2 className="text-lg sm:text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-xl line-clamp-2">
                      {item.title}
                    </h2>
                  )}
                  {item.subtitle && (
                    <p className="hidden sm:block mt-2 text-white/90 text-xs md:text-sm font-medium max-w-2xl drop-shadow-md line-clamp-2">
                      {item.subtitle}
                    </p>
                  )}
               </div>
             )}
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent((prev) => (prev - 1 + items.length) % items.length)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
          >
            <ChevronRight size={18} />
          </button>
          
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {items.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === current ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
