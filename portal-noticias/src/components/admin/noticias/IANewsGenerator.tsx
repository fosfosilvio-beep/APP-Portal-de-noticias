"use client";

import { useState } from "react";
import { 
  Sparkles, Loader2, Send, PenTool, Image as ImageIcon, 
  Zap, ArrowRight, RefreshCw, Check, Copy, Wand2,
  Video, Upload, PlayCircle, FileVideo
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [insights, setInsights] = useState<{ instagram?: string; tags?: string } | null>(null);
  const supabase = createClient();

  const handleGenerate = async () => {
    if (!topic.trim() && !linkUrl.trim() && !videoFile) {
      toast.error("Insira um Tema, Link ou selecione um Vídeo.");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      let payload: any = {};
      
      // 1. Prioridade: VÍDEO LOCAL
      if (videoFile) {
        toast.info("Fazendo upload do vídeo para análise...");
        const ext = videoFile.name.split(".").pop();
        const path = `temp_ai_videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, videoFile);

        if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        payload = { videoUrl: publicUrl };
        setProgress(40);
      } 
      // 2. Segunda Prioridade: LINK
      else if (linkUrl.trim()) {
        payload = { linkUrl: linkUrl.trim() };
        setProgress(30);
      } 
      // 3. Terceira Prioridade: TEMA
      else {
        payload = { prompt: topic.trim() };
        setProgress(30);
      }

      // Chamada para a API Unificada
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no processamento da IA.");

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
      toast.success("IA NEWS: Matéria gerada com sucesso!");
      
      // Limpa após sucesso
      setLinkUrl("");
      setVideoFile(null);
      setTopic("");
    } catch (err: any) {
      console.error("[IA NEWS ERROR]:", err);
      toast.error("Erro IA NEWS: " + err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleImproveText = async () => {
    if (!currentContent || currentContent.length < 20) {
      toast.error("Escreva um texto no editor para melhorar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: currentContent,
          guidelines: "Melhore o SEO e a gramática. Mantenha a estrutura HTML." 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onGenerated(data);
      toast.success("IA NEWS: Texto aprimorado!");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    } finally {
      setLoading(false);
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
            <h4 className="font-black text-white text-lg leading-none tracking-tighter">IA NEWS 2.0</h4>
            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Unificação Multimodal</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6 bg-[#141414]">
        {/* 1. TEMA */}
        <div>
          <label className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">Opção 1: Tema Manual</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Sobre o que vamos escrever hoje?"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all resize-none"
          />
        </div>

        {/* 2. LINK */}
        <div>
          <label className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">Opção 2: Link Externo (G1, YouTube...)</label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Cole a URL aqui..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all"
          />
        </div>

        {/* 3. VÍDEO */}
        <div>
          <label className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 ml-1">Opção 3: Vídeo Local</label>
          <label className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${videoFile ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10 hover:border-red-500/30'}`}>
            <Video size={20} className={videoFile ? 'text-red-500' : 'text-white/40'} />
            <div className="flex-1">
              <p className="text-[11px] font-black text-white uppercase tracking-widest">
                {videoFile ? videoFile.name : 'Selecionar Vídeo do PC'}
              </p>
              {!videoFile && <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">MP4, MOV, AVI</p>}
            </div>
            {videoFile && <RefreshCw size={14} className="text-white/40" onClick={(e) => { e.preventDefault(); setVideoFile(null); }} />}
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* BOTÃO ÚNICO MESTRE */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="group-hover/btn:scale-125 transition-transform" />}
          {loading ? "Processando..." : "GERAR MATÉRIA"}
        </button>

        {/* REFINAMENTO */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleImproveText}
            disabled={loading || !currentContent}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/60 hover:text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-20"
          >
            <Wand2 size={14} /> Melhorar Texto
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/20 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed">
            <ImageIcon size={14} /> IA Imagens
          </button>
        </div>

        {/* INSIGHTS */}
        {insights && (
          <div className="pt-6 border-t border-white/5 space-y-4">
            {insights.tags && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-2">Tags SEO Sugeridas</span>
                <p className="text-[10px] font-bold text-blue-100/60 leading-relaxed italic">{insights.tags}</p>
              </div>
            )}
            {insights.instagram && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 relative group/ins">
                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-2">Instagram (Copy)</span>
                <p className="text-[10px] font-bold text-red-100/60 leading-relaxed italic line-clamp-3">{insights.instagram}</p>
                <button 
                  onClick={() => { navigator.clipboard.writeText(insights.instagram!); toast.success("Copiado!"); }}
                  className="mt-2 flex items-center gap-1 text-[8px] font-black text-red-400 hover:underline uppercase tracking-widest"
                >
                  <Copy size={10} /> Copiar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar (Visual) */}
      {loading && (
        <div className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
      )}
    </div>
  );
}
