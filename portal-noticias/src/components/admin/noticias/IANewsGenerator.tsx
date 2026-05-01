"use client";

import { useState } from "react";
import { 
  Sparkles, Loader2, Zap, Copy, Wand2,
  Video, PlayCircle, Globe, PenTool, Image as ImageIcon
} from "lucide-react";
import { toast } from "@/lib/toast";
import { createClient } from "@/lib/supabase-browser";

interface IANewsGeneratorProps {
  onGenerated: (data: { titulo: string; subtitulo: string; conteudo: string; seo_tags?: string }) => void;
  onImageGenerated?: (url: string) => void;
  currentContent?: string;
}

export default function IANewsGenerator({ onGenerated, onImageGenerated, currentContent }: IANewsGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"link" | "topic" | "video">("link");
  const [topic, setTopic] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [insights, setInsights] = useState<{ instagram?: string; tags?: string } | null>(null);
  const supabase = createClient();

  const handleGenerate = async () => {
    if (activeTab === "topic" && !topic.trim()) return toast.error("Insira um Tema.");
    if (activeTab === "link" && !linkUrl.trim()) return toast.error("Insira um Link.");
    if (activeTab === "video" && !videoFile) return toast.error("Selecione um Vídeo.");

    setLoading(true);
    setProgress(10);

    try {
      let payload: any = {};
      
      if (activeTab === "video" && videoFile) {
        setProgress(20);
        const ext = videoFile.name.split(".").pop();
        const path = `temp_ai_videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, videoFile);

        if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
        payload = { videoUrl: publicUrl };
        setProgress(50);
      } 
      else if (activeTab === "link") {
        payload = { linkUrl: linkUrl.trim() };
        setProgress(30);
      } 
      else {
        payload = { prompt: topic.trim() };
        setProgress(30);
      }

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
          guidelines: "Melhore o SEO e a gramática jornalística. Mantenha a estrutura HTML." 
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
    <div className="bg-[#111111] border border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative group">
      {/* Header Unificado */}
      <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-lg">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h4 className="font-black text-white text-base leading-none tracking-tight">IA NEWS 3.0</h4>
            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1">Nossa Web TV Recovery</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-3 bg-white/5 border-b border-white/5 p-1">
        <button
          onClick={() => setActiveTab("link")}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === "link" ? "bg-red-600 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
        >
          <Globe size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Link</span>
        </button>
        <button
          onClick={() => setActiveTab("topic")}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === "topic" ? "bg-red-600 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
        >
          <PenTool size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Tema</span>
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${activeTab === "video" ? "bg-red-600 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
        >
          <Video size={16} />
          <span className="text-[9px] font-black uppercase tracking-widest">Vídeo</span>
        </button>
      </div>

      <div className="p-6 space-y-5 bg-[#0a0a0a]">
        {/* Content based on Tab */}
        <div className="min-h-[100px] flex flex-col justify-center">
          {activeTab === "link" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">URL da Fonte (G1, YouTube, Insta...)</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://g1.globo.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all"
              />
            </div>
          )}

          {activeTab === "topic" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Sobre o que vamos escrever?</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Inauguração do novo hospital em Arapongas..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-white/20 outline-none focus:border-red-500/50 transition-all resize-none"
              />
            </div>
          )}

          {activeTab === "video" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Vídeo para análise (Gemini 2.5 Flash)</label>
              <label className={`flex items-center gap-3 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${videoFile ? 'bg-red-500/10 border-red-500/40' : 'bg-white/5 border-white/10 hover:border-red-500/20'}`}>
                <div className={`p-2 rounded-lg ${videoFile ? 'bg-red-600 text-white' : 'bg-white/5 text-white/20'}`}>
                  <PlayCircle size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">
                    {videoFile ? videoFile.name : 'Selecionar Vídeo'}
                  </p>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Análise multimodal instantânea</p>
                </div>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}
        </div>

        {/* BOTÃO MESTRE */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] py-4 rounded-xl shadow-xl shadow-red-900/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group/btn"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="group-hover/btn:scale-110 transition-transform" />}
          {loading ? "PROCESSANDO..." : "GERAR MATÉRIA"}
        </button>

        {/* REFINAMENTO */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleImproveText}
            disabled={loading || !currentContent}
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/60 hover:text-white px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-20"
          >
            <Wand2 size={12} /> Refinar Texto
          </button>
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/20 px-3 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed">
            <ImageIcon size={12} /> IA Imagens
          </button>
        </div>

        {/* INSIGHTS */}
        {insights && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="bg-red-600/5 border border-red-600/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Instagram Suggestion</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(insights.instagram!); toast.success("Copiado!"); }}
                  className="text-[8px] font-black text-white/40 hover:text-white flex items-center gap-1 uppercase"
                >
                  <Copy size={10} /> Copiar
                </button>
              </div>
              <p className="text-[10px] font-bold text-white/60 leading-relaxed italic line-clamp-3">{insights.instagram}</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-1000" style={{ width: `${progress}%` }} />
      )}
    </div>
  );
}

