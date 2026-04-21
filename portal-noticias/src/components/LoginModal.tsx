"use client";

import { X, LogIn } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert("Erro ao entrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-4 right-4">
           <button 
             onClick={onClose}
             className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
           >
             <X size={20} />
           </button>
        </div>

        <div className="p-8 md:p-10 flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20">
              <LogIn size={32} />
           </div>
           
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
             Bem-vindo de volta
           </h2>
           <p className="text-zinc-500 text-sm font-medium mb-8">
             Escolha sua rede social preferida para acessar sua conta interna.
           </p>

           <div className="w-full space-y-3">
              {/* GOOGLE BUTTON */}
              <button 
                onClick={() => handleLogin('google')}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Continuar com Google
              </button>

              {/* FACEBOOK BUTTON */}
              <button 
                onClick={() => handleLogin('facebook')}
                disabled={loading}
                className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#1877F2]/20 active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuar com Facebook
              </button>
           </div>

           <p className="mt-8 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
             Ao entrar, você concorda com nossos <br/>
             <a href="/termos" className="text-zinc-400 hover:text-white underline">Termos</a> & <a href="/privacidade" className="text-zinc-400 hover:text-white underline">Privacidade</a>
           </p>
        </div>
      </div>
    </div>
  );
}
