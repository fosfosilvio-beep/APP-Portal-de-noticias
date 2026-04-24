"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { toast } from "@/lib/toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Erro no Login", error.message);
      setLoading(false);
    } else {
      // Buscar role para redirecionar corretamente
      const { data: { user } } = await supabase.auth.getUser();
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .maybeSingle();

      const role = roleData?.role || "autor";

      toast.success("Login bem sucedido!");
      
      // Forçamos o reload completo para o middleware capturar a sessão imediatamente
      if (role === "autor") {
        window.location.href = "/admin/noticias";
      } else {
        window.location.href = "/admin/dashboard";
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
            <Lock className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">Acesso Restrito</h1>
          <p className="text-sm text-slate-400 mt-1">Insira suas credenciais de equipe</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="E-mail"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Senha"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest py-3 rounded-xl transition-all flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
