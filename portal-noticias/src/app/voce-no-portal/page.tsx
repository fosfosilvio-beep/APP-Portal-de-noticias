"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, Upload, Camera, MapPin, CheckCircle2, User, Phone, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VoceNoPortalPage() {
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    localizacao: "",
    relato: ""
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 4) {
        return toast.error("Máximo de 4 arquivos permitidos.");
      }
      setFiles([...files, ...newFiles]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.whatsapp || !formData.relato) {
      return toast.error("Preencha nome, WhatsApp e o seu relato.");
    }

    setIsSubmitting(true);
    try {
      const midia_urls: string[] = [];

      // Faz upload dos arquivos para o bucket 'colaboracao'
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("colaboracao").upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from("colaboracao").getPublicUrl(path);
          midia_urls.push(data.publicUrl);
        }
      }

      // Salva no banco
      const { error } = await supabase.from("vocenoportal_sugestoes").insert([{
        ...formData,
        midia_urls
      }]);

      if (error) throw error;

      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar sugestão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          {/* Header */}
          <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto text-white mb-4 border border-white/20">
              <Megaphone size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Você no Portal</h1>
            <p className="text-emerald-50 font-medium">Sua voz, seu bairro, nossa notícia. Mande sua sugestão ou denúncia.</p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-12 text-center"
              >
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Relato Enviado!</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Nossa redação já recebeu seu material. Analisaremos e entraremos em contato via WhatsApp caso vire matéria.
                </p>
                <button 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ nome: "", whatsapp: "", localizacao: "", relato: "" });
                    setFiles([]);
                  }}
                  className="text-emerald-600 font-bold uppercase tracking-widest text-xs"
                >
                  Enviar Outro Relato
                </button>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="p-8 flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Seu Nome Completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input 
                      type="tel" 
                      placeholder="Seu WhatsApp (com DDD)"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Localização (Bairro, Rua...)"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <textarea 
                  placeholder="Descreva o que está acontecendo..."
                  value={formData.relato}
                  onChange={(e) => setFormData({...formData, relato: e.target.value})}
                  rows={5}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-colors resize-none"
                  required
                />

                {/* Upload Section */}
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-300 transition-colors">
                  <input 
                    type="file" 
                    id="media-upload" 
                    className="hidden" 
                    multiple 
                    accept="image/*,video/mp4,video/quicktime"
                    onChange={handleUpload}
                  />
                  <label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm mb-3">
                      <Camera size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 block mb-1">Toque para anexar Fotos/Vídeos</span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Máximo 4 arquivos</span>
                  </label>
                  
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-4 pt-4 border-t border-slate-200">
                      {files.map((f, i) => (
                        <div key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 flex items-center gap-2">
                          <Upload size={12} className="text-emerald-500" />
                          <span className="truncate max-w-[100px]">{f.name}</span>
                          <button type="button" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 ml-1">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-widest text-sm"
                >
                  {isSubmitting ? "Enviando..." : <><Send size={18} /> Enviar Sugestão de Pauta</>}
                </button>
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                  Você manterá o anonimato se preferir.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
