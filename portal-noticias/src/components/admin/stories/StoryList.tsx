"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ExternalLink, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import StoryForm from "./StoryForm";

interface WebStory {
  id: string;
  titulo: string;
  imagem_capa: string;
  link_destino: string | null;
  vistas: number;
  created_at: string;
}

export default function StoryList() {
  const [stories, setStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<WebStory | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("web_stories")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setStories(data as WebStory[]);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta story?")) return;

    const { error } = await supabase.from("web_stories").delete().eq("id", id);
    if (!error) {
      setStories(stories.filter(s => s.id !== id));
    } else {
      alert("Erro ao excluir story: " + error.message);
    }
  };

  const handleOpenForm = (story?: WebStory) => {
    setEditingStory(story || null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">Gerenciar Stories</h3>
          <p className="text-sm text-slate-500 font-medium">Postagens rápidas em formato vertical</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={18} /> Novo Story
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-20 text-center shadow-sm">
          <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={32} />
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Carregando Stories...</p>
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all">
              {/* Preview Image */}
              <div className="aspect-[9/16] relative bg-slate-100">
                {story.imagem_capa ? (
                  <img
                    src={story.imagem_capa}
                    alt={story.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={40} />
                  </div>
                )}
                
                {/* Overlay Ações */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                  <button
                    onClick={() => handleOpenForm(story)}
                    className="w-full bg-white text-slate-900 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="w-full bg-red-500 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>

                {/* View Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                  <Eye size={12} className="text-white" />
                  <span className="text-[10px] font-black text-white">{story.vistas}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="font-bold text-slate-800 text-sm truncate mb-1">{story.titulo}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                  {story.link_destino && (
                    <ExternalLink size={12} className="text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-bold mb-2">Nenhum story criado ainda.</p>
          <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">Comece criando seu primeiro story para aparecer no portal.</p>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <StoryForm
          story={editingStory}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchStories();
          }}
        />
      )}
    </div>
  );
}
