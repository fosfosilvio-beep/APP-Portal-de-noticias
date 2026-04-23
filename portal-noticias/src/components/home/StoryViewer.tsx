"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface StoryViewerProps {
  stories: any[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const story = stories[currentIndex];

  useEffect(() => {
    // Increment view count when a story is opened
    const incrementViews = async () => {
      if (story?.id) {
        fetch("/api/track-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storyId: story.id }),
        }).catch(() => null);
      }
    };

    incrementViews();

    // Bloquear scroll do body
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentIndex, story?.id]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Botão Fechar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
      >
        <X size={24} />
      </button>

      {/* Progress Bar (Visual only for now) */}
      <div className="absolute top-2 left-0 right-0 px-4 flex gap-1 z-50">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-300 ${
                idx === currentIndex ? "w-full" : idx < currentIndex ? "w-full" : "w-0"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-[450px] aspect-[9/16] bg-zinc-900 shadow-2xl overflow-hidden sm:rounded-[2rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full h-full relative"
          >
            <img
              src={story.imagem_capa}
              alt={story.titulo}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Info */}
            <div className="absolute bottom-12 left-0 right-0 p-8 text-center space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg">
                {story.titulo}
              </h2>

              {story.link_destino && (
                <a
                  href={story.link_destino}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                >
                  Saiba Mais <ExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Areas (Tapping) */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 h-full cursor-pointer" onClick={handlePrev} title="Anterior" />
          <div className="flex-1 h-full cursor-pointer" onClick={handleNext} title="Próximo" />
        </div>

        {/* Desktop Navigation Buttons */}
        <div className="hidden sm:block">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
