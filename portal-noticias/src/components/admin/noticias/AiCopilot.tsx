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
      const res = await fetch("/api/generate-news", {
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
      toast.error("Erro na IA: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-blue-100 rounded-[2rem] shadow-sm overflow-hidden relative group">
      <div className="px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">IA News</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Geração Automática</p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 space-y-4 relative z-10">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Sobre o que você quer escrever hoje? Ex: Resuma a nova lei aprovada ontem..."
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-transparent outline-none resize-none h-28 transition-all"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isGenerating ? "Processando..." : "Gerar Matéria"}
        </button>
      </div>
    </div>
  );
}
