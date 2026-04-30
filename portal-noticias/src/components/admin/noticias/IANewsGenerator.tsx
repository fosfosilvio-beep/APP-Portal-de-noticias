"use client";

import { useState } from "react";
import { 
  Sparkles, Loader2, Send, PenTool, Image as ImageIcon, 
  Zap, ArrowRight, RefreshCw, Check, Copy, Wand2,
  Video, Upload, PlayCircle
} from "lucide-react";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase-browser";

interface IANewsGeneratorProps {
  onGenerated: (data: { titulo: string; subtitulo: string; conteudo: string; seo_tags?: string }) => void;
  onImageGenerated?: (url: string) => void;
  currentContent?: string;
}

export default function IANewsGenerator({ onGenerated, onImageGenerated, currentContent }: IANewsGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState<"news" | "image" | "improve" | "link" | "video" | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [insights, setInsights] = useState<{ instagram?: string; tags?: string } | null>(null);
  const supabase = createClient();

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

  const handleGenerateFromLink = async () => {
    if (!linkUrl.trim() || !linkUrl.startsWith("http")) {
      toast.error("Insira uma URL válida (YouTube, Portal de Notícias, etc).");
      return;
    }
    
    setLoading("link");
    const interval = startProgress();
    
    try {
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkUrl: linkUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar o link.");

      onGenerated({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || "",
        seo_tags: data.seo_tags || ""
      });

      if (data.instagram_suggestion || data.seo_tags) {
        setInsights({
          instagram: data.instagram_suggestion,
          tags: data.seo_tags
        });
      }
      
      setProgress(100);
      toast.success("IA NEWS: Link processado e matéria gerada!");
      setLinkUrl(""); // Limpa após gerar
    } catch (err: any) {
      toast.error("IA NEWS Erro no Link: " + err.message);
    } finally {
      clearInterval(interval);
      setTimeout(() => setLoading(null), 500);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Por favor, selecione um ficheiro de vídeo válido.");
      return;
    }

    setLoading("video");
    setUploadProgress(0);
    setProgress(0);

    try {
      // 1. Upload para Supabase Storage (evita limite de 4.5MB da Vercel)
      const ext = file.name.split(".").pop();
      const path = `temp_ai_videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      // 2. Chamada para a API via JSON (URL em vez de arquivo gigante)
      const res = await fetch("/api/generate-from-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: publicUrl }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao analisar o vídeo.");

      onGenerated({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || ""
      });

      toast.success("IA NEWS: Vídeo analisado e matéria gerada!");
    } catch (err: any) {
      toast.error("IA NEWS Erro no Vídeo: " + err.message);
    } finally {
      setLoading(null);
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
        {/* Upload Principal (Foco 100%) */}
        <div className="relative space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-64 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:bg-white/[0.07] hover:border-red-500/30 transition-all group/upload overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform">
                <Video className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm font-black text-white uppercase tracking-widest mb-1">Arraste seu Vídeo Aqui</p>
              <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">MP4, MOV ou AVI • A IA assistirá o vídeo inteiro</p>
            </div>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVideoUpload(file);
              }}
            />
          </label>

          {loading === 'video' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center p-8 z-20 animate-in fade-in duration-500">
              <div className="relative">
                <Loader2 size={48} className="animate-spin text-red-500 mb-6" />
                <div className="absolute inset-0 blur-xl bg-red-500/20 animate-pulse" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-[0.3em] text-center animate-pulse max-w-[200px]">
                A IA está assistindo ao vídeo... isso pode levar um minuto
              </p>
              <div className="mt-8 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-red-600 animate-loading-bar" />
              </div>
            </div>
          )}
        </div>

        {/* Botão de Criação Manual (Secundário) */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handleCreateNews}
            disabled={!!loading || !topic.trim()}
            className="group flex items-center justify-between bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-black text-[10px] uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <PenTool size={16} />
              Criar via Tema (Manual)
            </div>
          </button>
        </div>

        {/* Footer Tecnologia */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
           <Wand2 size={12} className="text-red-500" />
           <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Multimodal Engine v2.0 • Gemini 1.5 Pro</span>
        </div>
      </div>
    </div>
  );
}
