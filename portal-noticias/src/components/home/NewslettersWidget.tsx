"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "@/lib/toast";

export default function NewslettersWidget() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("newsletters_leads").insert([{ email, origem: "Home Widget" }]);
      
      if (error && error.code !== "23505") throw error; // Ignora se já existir
      
      setSuccess(true);
      toast.success("Inscrição realizada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao assinar a newsletter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-slate-100 rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Mail size={160} />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Fique por dentro das notícias!
          </h3>
          <p className="text-slate-600 text-sm">
            Receba as principais manchetes de Arapongas e região diretamente no seu e-mail. Sem spam, apenas informação de qualidade.
          </p>
        </div>
        
        <div className="w-full md:w-[450px]">
          {success ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center justify-center gap-3 font-bold">
              <CheckCircle2 className="text-green-500" />
              Tudo certo! E-mail cadastrado.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="email"
                placeholder="Seu melhor e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
