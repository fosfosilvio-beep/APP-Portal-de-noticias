"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function PushSender() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "https://www.nossawebtv.com.br",
    icon: "/icon-192x192.png"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      toast.error("Preencha o título e a mensagem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Alerta enviado para ${data.count} inscritos!`);
        setFormData({ ...formData, title: "", body: "" });
      } else {
        throw new Error(data.error || "Erro ao enviar");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulário */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
        <div>
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter flex items-center gap-2">
            <BellRing className="text-blue-600" size={20} /> Compor Novo Alerta
          </h3>
          <p className="text-slate-500 text-sm font-medium">Envie uma notificação push para todos os navegadores inscritos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Título do Alerta</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: URGENTE: Nova matéria publicada"
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Mensagem Curta</label>
            <textarea
              required
              rows={3}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Descreva brevemente o conteúdo do alerta..."
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">Link de Destino</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            Disparar para todos os inscritos
          </button>
        </form>
      </div>

      {/* Preview Visual */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white h-full flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-20" />
          
          <div className="max-w-xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Visualização no Dispositivo</h4>
            
            {/* Notificação Simulada */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-4 flex gap-4 text-left animate-in fade-in slide-in-from-right duration-500">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <BellRing size={24} />
              </div>
              <div>
                <p className="font-black text-xs text-white truncate w-40">{formData.title || "Título do Alerta"}</p>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1">{formData.body || "Sua mensagem aparecerá aqui para os usuários..."}</p>
              </div>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} /> Sistema Pronto
              </div>
              <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">
                "As notificações push têm uma taxa de abertura 3x maior que e-mails."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
