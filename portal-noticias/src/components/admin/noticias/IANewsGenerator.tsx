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
      // 1. Upload para Supabase Storage
      const ext = file.name.split(".").pop();
      const path = `temp_ai_videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      setUploadProgress(100);
      
      // 2. Chamada para API de Processamento de Vídeo
      const interval = startProgress();
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: publicUrl }),
      });

      const data = await res.json();
      clearInterval(interval);

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

      setProgress(100);
      toast.success("IA NEWS: Vídeo analisado e matéria gerada!");
      
      // Limpeza opcional: deletar vídeo temporário do storage
      // await supabase.storage.from("media").remove([path]);

    } catch (err: any) {
      toast.error("IA NEWS Erro no Vídeo: " + err.message);
    } finally {
      setTimeout(() => {
        setLoading(null);
        setUploadProgress(0);
      }, 500);
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
        {/* Input Principal */}
        <div className="relative space-y-4">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Qual o tema da notícia? Digite aqui para a IA criar tudo..."
            className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white font-medium placeholder:text-white/20 focus:ring-2 focus:ring-red-500/50 focus:border-transparent outline-none resize-none h-32 transition-all shadow-inner"
          />

          <div className="relative group/link">
             <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within/link:text-red-500 transition-colors">
                <Send size={16} className="rotate-45" />
             </div>
             <input 
               type="url"
               value={linkUrl}
               onChange={(e) => setLinkUrl(e.target.value)}
               placeholder="Cole um link (YouTube, FB, Portal) para gerar..."
               className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white font-bold placeholder:text-white/20 focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
             />
          </div>

          <label className="flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/[0.07] hover:border-red-500/30 transition-all group/upload">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Video className="w-8 h-8 mb-2 text-white/20 group-hover/upload:text-red-500 transition-colors" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest group-hover/upload:text-white/60">Arraste ou clique para Upload de Vídeo</p>
              <p className="text-[8px] text-white/20 uppercase mt-1">MP4, MOV ou AVI (IA NEWS 2.0)</p>
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
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-8">
              <Loader2 size={32} className="animate-spin text-red-500 mb-4" />
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-red-600 transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse text-center">
                {loading === 'news' ? 'Tecendo Matéria...' : 
                 loading === 'improve' ? 'Refinando Texto...' : 
                 loading === 'video' && uploadProgress < 100 ? `Fazendo Upload do Vídeo (${uploadProgress}%)...` :
                 loading === 'video' ? 'IA a assistir e analisar o vídeo...' :
                 'Lendo e Adaptando Matéria...'}
              </p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handleGenerateFromLink}
            disabled={!!loading || !linkUrl.trim()}
            className="group flex items-center justify-between bg-white text-black hover:bg-red-600 hover:text-white disabled:bg-white/10 disabled:text-white/20 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5"
          >
            <div className="flex items-center gap-3">
              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              Ler e Adaptar Matéria
            </div>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>

          <button
            type="button"
            onClick={handleCreateNews}
            disabled={!!loading || !topic.trim()}
            className="group flex items-center justify-between bg-white/5 border border-white/10 text-white hover:bg-white/10 disabled:bg-white/10 disabled:text-white/20 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-black text-xs uppercase tracking-widest"
          >
            <div className="flex items-center gap-3">
              <PenTool size={18} className="group-hover:rotate-12 transition-transform" />
              Crie via Tema/Texto
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

        {/* Insights de Divulgação (Wildcard) */}
        {insights && (
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-indigo-500/20 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} /> Insights de Divulgação
              </h5>
              <button 
                onClick={() => setInsights(null)}
                className="text-[10px] font-bold text-white/20 hover:text-white uppercase transition-colors"
              >
                Limpar
              </button>
            </div>

            {insights.tags && (
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Tags SEO Sugeridas</p>
                <div className="flex flex-wrap gap-1.5">
                  {insights.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-black px-2 py-0.5 rounded-md">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insights.instagram && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Sugestão de Instagram</p>
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <p className="text-[11px] text-white/80 font-medium italic leading-relaxed">
                    "{insights.instagram}"
                  </p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(insights.instagram!);
                      toast.success("Legenda copiada!");
                    }}
                    className="mt-2 flex items-center gap-1.5 text-[9px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase"
                  >
                    <Copy size={10} /> Copiar Legenda
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Tecnologia */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
           <Wand2 size={12} className="text-red-500" />
           <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Powered by Gemini 1.5 Pro & IA NEWS</span>
        </div>
      </div>
    </div>
  );
}
