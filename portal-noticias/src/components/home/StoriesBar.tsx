"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import StoryViewer from "./StoryViewer";

interface WebStory {
  id: string;
  titulo: string;
  imagem_capa: string;
  link_destino: string | null;
  vistas: number;
}

export default function StoriesBar() {
  const [stories, setStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    const { data } = await supabase
      .from("web_stories")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setStories(data as WebStory[]);
    setLoading(false);
  };

  if (loading && stories.length === 0) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0 animate-pulse">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-800 border-2 border-zinc-700" />
            <div className="h-2 bg-zinc-800 rounded-full w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <section className="w-full py-6 border-b border-zinc-800/50 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
          {stories.map((story, index) => (
            <button
              key={story.id}
              onClick={() => setSelectedStoryIndex(index)}
              className="flex flex-col items-center gap-2 shrink-0 group outline-none"
            >
              {/* Circle Wrapper */}
              <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-blue-600 via-cyan-400 to-emerald-400 group-active:scale-95 transition-transform">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-black overflow-hidden bg-zinc-900">
                  <img
                    src={story.imagem_capa}
                    alt={story.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Live Badge if needed? No, user didn't ask. */}
              </div>
              <span className="text-[10px] sm:text-xs font-black text-zinc-400 uppercase tracking-tighter group-hover:text-white transition-colors truncate max-w-[70px] sm:max-w-[80px]">
                {story.titulo}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}
    </section>
  );
}
