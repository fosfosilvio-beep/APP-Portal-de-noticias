"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Settings, ShieldCheck } from "lucide-react";
import NewsEditorForm from "../../../../components/admin/NewsEditorForm";

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // Reutilizando lógica simples de auth do admin base
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl">
           <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                 <ShieldCheck className="text-white" size={24} />
              </div>
           </div>
           <h1 className="text-xl font-black text-white text-center mb-1">Acesso à Redação</h1>
           <p className="text-zinc-500 text-xs text-center font-bold uppercase tracking-widest mb-8">Nível Enterprise</p>
           
           <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-blue-500 text-white rounded-xl px-4 py-3 placeholder-zinc-600 transition-all outline-none"
                placeholder="Insira a Senha Master"
              />
              <button type="submit" className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all">
                Autenticar Edição
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-[family-name:var(--font-inter)]">
      <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 font-bold text-sm transition-colors group">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
              <ChevronLeft size={16} />
            </div>
            Voltar ao Painel
          </Link>
          <div className="w-[1px] h-8 bg-zinc-200" />
          <div className="flex flex-col">
            <h2 className="font-black text-zinc-900 text-lg tracking-tight">Editar Matéria</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">ID: {id}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-end mr-3">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Modo</span>
            <span className="text-xs font-black text-blue-600">GRAVAÇÃO DIRETA</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400">
            <Settings size={20} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto pb-20">
          <NewsEditorForm editId={id} onSuccess={() => window.location.href = '/admin'} />
        </div>
      </main>
    </div>
  );
}
