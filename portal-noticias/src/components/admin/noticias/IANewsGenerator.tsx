"use client";

import { useState } from "react";
import { 
  Sparkles, Loader2, Send, PenTool, Image as ImageIcon, 
  Zap, ArrowRight, RefreshCw, Check, Copy, Wand2
} from "lucide-react";
import { toast } from "@/lib/toast";

interface IANewsGeneratorProps {
  onGenerated: (data: { titulo: string; subtitulo: string; conteudo: string }) => void;
  onImageGenerated?: (url: string) => void;
  currentContent?: string;
}

export default function IANewsGenerator({ onGenerated, onImageGenerated, currentContent }: IANewsGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState<"news" | "image" | "improve" | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulação de progresso para a sensação de tecnologia
  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 400);
    return interval;
  };

  const handleCreateNews = async () => {
    if (!topic.trim()) {
      toast.error("Insira um tema para a notícia.");
      return;
    }
    
    setLoading("news");
    const interval = startProgress();
    
    try {
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar notícia.");

      onGenerated({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || ""
      });
      
      setProgress(100);
      toast.success("IA NEWS: Notícia estruturada com sucesso!");
    } catch (err: any) {
      toast.error("IA NEWS Erro: " + err.message);
    } finally {
      clearInterval(interval);
      setTimeout(() => setLoading(null), 500);
    }
  };

  const handleImproveText = async () => {
    if (!currentContent || currentContent.length < 20) {
      toast.error("Escreva um texto no editor primeiro para que a IA possa melhorar.");
      return;
    }
    
    setLoading("improve");
    const interval = startProgress();
    
    try {
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: currentContent,
          guidelines: "Melhore o SEO, a gramática e o tom jornalístico. Mantenha a estrutura HTML." 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao melhorar texto.");

      onGenerated({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || ""
      });
      
      setProgress(100);
      toast.success("IA NEWS: Texto aprimorado e otimizado!");
    } catch (err: any) {
      toast.error("IA NEWS Erro: " + err.message);
    } finally {
      clearInterval(interval);
      setTimeout(() => setLoading(null), 500);
    }
  };

  const handleCreateImage = async () => {
    if (!topic.trim()) {
      toast.error("Insira o tema da notícia para gerar a imagem.");
      return;
    }
    
    setLoading("image");
    const interval = startProgress();
    
    try {
      // Aqui chamaríamos uma rota de geração de imagem (DALL-E 3)
      // Como a rota pode não existir ainda, vamos simular ou avisar
      toast.info("Iniciando motor de renderização visual...");
      
      const res = await fetch("/api/gerar-imagem-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar imagem.");

      if (onImageGenerated) onImageGenerated(data.url);
      
      setProgress(100);
      toast.success("IA NEWS: Imagem de capa gerada!");
    } catch (err: any) {
      toast.error("IA NEWS Visual Erro: " + err.message);
    } finally {
      clearInterval(interval);
      setTimeout(() => setLoading(null), 500);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
      {/* Header Marca */}
      <div className="px-8 py-6 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h4 className="font-black text-white text-lg leading-none tracking-tighter">IA NEWS</h4>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Gerador de Conteúdo v2</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-black/20 rounded-full border border-white/10">
          <span className="text-[10px] font-black text-white/80 uppercase">Agente Ativo</span>
        </div>
      </div>

      <div className="p-8 space-y-6 relative z-10 bg-[#141414]">
        {/* Input Principal */}
        <div className="relative">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Qual o tema da notícia? Digite aqui para a IA criar tudo..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white font-medium placeholder:text-white/20 focus:ring-2 focus:ring-red-500/50 focus:border-transparent outline-none resize-none h-32 transition-all shadow-inner"
          />
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8">
              <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-red-600 transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">
                {loading === 'news' ? 'Tecendo Matéria...' : loading === 'image' ? 'Pintando Pixels...' : 'Refinando Texto...'}
              </p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handleCreateNews}
            disabled={!!loading || !topic.trim()}
            className="group flex items-center justify-between bg-white text-black hover:bg-red-600 hover:text-white disabled:bg-white/10 disabled:text-white/20 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl"
          >
            <div className="flex items-center gap-3">
              <PenTool size={18} className="group-hover:rotate-12 transition-transform" />
              Crie Notícias
            </div>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          <button
            type="button"
            onClick={handleCreateImage}
            disabled={!!loading || !topic.trim()}
            className="group flex items-center justify-between bg-white/5 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-black text-xs uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
              Crie Imagens
            </div>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          <button
            type="button"
            onClick={handleImproveText}
            disabled={!!loading || !currentContent}
            className="group flex items-center justify-between bg-white/5 border border-white/10 text-white hover:bg-red-600 hover:border-red-600 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-black text-xs uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="group-hover:animate-spin transition-transform" />
              Melhore Textos
            </div>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>

        {/* Footer Tecnologia */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
           <Wand2 size={12} className="text-red-500" />
           <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Powered by GPT-4 & IA NEWS</span>
        </div>
      </div>
    </div>
  );
}
