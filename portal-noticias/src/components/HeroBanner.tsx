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

export default function HeroBanner({ items }: { items: HeroItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    
    const duration = items[current]?.duration || 5000;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [current, items]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            idx === current ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
          }`}
        >
          <img
            src={item.image}
            alt={`Banner ${idx + 1}`}
            className={`w-full h-full ${item.scale || "object-cover"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* TEXTO SLIDE-UP */}
          <div className="absolute inset-x-8 md:inset-x-16 bottom-16 z-20 flex flex-col items-start pointer-events-none">
             {idx === current && (
               <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-forwards max-w-3xl">
                  {item.category && <span className="inline-block bg-cyan-600/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3 shadow-lg border border-white/20">{item.category}</span>}
                  {item.title && <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-xl">{item.title}</h2>}
                  {item.subtitle && <p className="mt-4 text-white/90 text-sm md:text-base font-medium max-w-2xl drop-shadow-md">{item.subtitle}</p>}
               </div>
             )}
          </div>
        </div>
      ))}

      {items.length > 1 && (
        <>
          <button 
            onClick={() => setCurrent((prev) => (prev - 1 + items.length) % items.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40"
          >
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
