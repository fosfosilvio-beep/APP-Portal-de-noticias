"use client";

import { useState } from "react";
import { Sparkles, Loader2, Send } from "lucide-react";
import { toast } from "@/lib/toast";

interface AiCopilotProps {
  onGenerated: (data: { titulo: string; subtitulo: string; conteudo: string }) => void;
}

export default function AiCopilot({ onGenerated }: AiCopilotProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Insira um prompt ou link para a IA.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gerar-noticia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar notícia.");

      onGenerated({
        titulo: data.titulo || "",
        subtitulo: data.subtitulo || "",
        conteudo: data.conteudo || ""
      });
      toast.success("Notícia gerada com sucesso!");
    } catch (err: any) {
      toast.error("Erro na IA", err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
      
      <div className="px-5 py-4 border-b border-indigo-900/50 flex items-center gap-3">
        <Sparkles className="text-indigo-400" size={18} />
        <h4 className="font-black text-white text-sm">Copiloto IA</h4>
      </div>

      <div className="p-5 space-y-4 relative z-10">
        <p className="text-xs text-indigo-200/70 font-medium">
          Cole um link, título de vídeo ou rascunho. O Copiloto vai gerar título, linha fina e o corpo da matéria formatado.
        </p>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Resuma as principais falas do vídeo neste link https://youtube.com/..."
          className="w-full bg-slate-950/50 border border-indigo-900/50 rounded-xl p-3 text-sm text-white placeholder:text-indigo-900/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-28 font-medium"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isGenerating ? "Gerando Matéria..." : "Gerar com IA"}
        </button>
      </div>
    </div>
  );
}
