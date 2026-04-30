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
        conteudo: data.conteudo || "",
        seo_tags: data.seo_tags || ""
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

      // 2. Chamada para a API unificada via JSON
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: publicUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao analisar o vídeo.");

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
        conteudo: data.conteudo || "",
        seo_tags: data.seo_tags || ""
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
        {/* TEMA DA NOTÍCIA */}
        <div>
          <label className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">Tema ou Ideia Central</label>
          <div className="relative group/input">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: O impacto da nova tecnologia na saúde..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-red-500/50 focus:bg-white/[0.08] transition-all resize-none shadow-inner"
            />
            <div className="absolute right-4 bottom-4 flex gap-2">
               <button 
                onClick={handleCreateNews}
                disabled={!!loading || !topic.trim()}
                className="p-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl shadow-lg transition-all active:scale-95"
                title="Gerar via Tema"
               >
                 {loading === 'news' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
               </button>
            </div>
          </div>
        </div>

        {/* LINK EXTERNO */}
        <div>
          <label className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">Link Externo (G1, CNN, YouTube...)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Cole a URL da matéria ou vídeo..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all"
            />
            <button
              onClick={handleGenerateFromLink}
              disabled={!!loading || !linkUrl.trim()}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {loading === 'link' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Ler e Adaptar
            </button>
          </div>
        </div>

        {/* DIVISOR */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-white/5 flex-1" />
          <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em]">OU USE VÍDEO LOCAL</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>

        {/* Upload de Vídeo Local */}
        <div className="relative space-y-4">
          <label className="flex flex-col items-center justify-center w-full h-48 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:bg-white/[0.07] hover:border-red-500/30 transition-all group/upload overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-3 group-hover/upload:scale-110 transition-transform">
                <Video className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Upload de Ficheiro Local</p>
              <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest">MP4, MOV ou AVI</p>
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
              <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
              <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] text-center animate-pulse">A IA está assistindo...</p>
            </div>
          )}
        </div>

        {/* AÇÕES DE REFINAMENTO */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleImproveText}
            disabled={!!loading || !currentContent}
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 px-4 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
          >
            {loading === 'improve' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            Melhorar Texto
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 px-4 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
            title="Funcionalidade em breve"
          >
            <ImageIcon size={16} />
            Melhores Imagens
          </button>
        </div>

        {/* INSIGHTS (TAGS E INSTAGRAM) */}
        {insights && (
          <div className="pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-bottom-4 duration-700">
            {insights.tags && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tags SEO Sugeridas</span>
                </div>
                <p className="text-[11px] font-bold text-blue-100/60 leading-relaxed italic">
                  {insights.tags}
                </p>
              </div>
            )}
            {insights.instagram && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle size={14} className="text-red-400" />
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Sugestão p/ Instagram</span>
                </div>
                <p className="text-[11px] font-bold text-red-100/60 leading-relaxed italic line-clamp-3">
                  {insights.instagram}
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(insights.instagram!);
                    toast.success("Legenda copiada!");
                  }}
                  className="mt-3 text-[9px] font-black text-red-400 uppercase tracking-widest hover:underline flex items-center gap-1"
                >
                  <Copy size={10} /> Copiar Legenda
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Marca */}
      <div className="pt-4 pb-6 border-t border-white/5 flex items-center justify-center gap-2">
        <Sparkles size={12} className="text-red-500" />
        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Powered by Nossa Web AI</span>
      </div>
    </div>
  );
}
