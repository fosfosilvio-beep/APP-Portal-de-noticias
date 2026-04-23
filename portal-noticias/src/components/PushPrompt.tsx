"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function PushPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Verificar se o navegador suporta notificações e service workers
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    setPermission(Notification.permission);

    if (Notification.permission === "default") {
      const timer = setTimeout(() => {
        // Só mostrar se não houver um flag de "ignorado" no session storage
        if (!sessionStorage.getItem("push_prompt_ignored")) {
          setIsVisible(true);
        }
      }, 10000); // 10 segundos
      return () => clearTimeout(timer);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.register("/sw.js");
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
        });

        // Salvar no Supabase
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("push_subscriptions").insert([
          {
            user_id: user?.id || null,
            subscription: subscription.toJSON()
          }
        ]);

        if (error) throw error;
        setIsVisible(false);
      }
    } catch (error) {
      console.error("Erro ao assinar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnore = () => {
    sessionStorage.setItem("push_prompt_ignored", "true");
    setIsVisible(false);
  };

  if (!isVisible || permission === "denied") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[9999] w-full max-w-sm"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-200/50 border border-slate-100 p-6 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full opacity-50" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter leading-tight mb-1">
                  Alertas em Tempo Real
                </h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Deseja receber notificações urgentes de Arapongas e região diretamente no seu dispositivo?
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {loading ? "Processando..." : (
                  <>
                    <ShieldCheck size={14} /> Ativar Alertas
                  </>
                )}
              </button>
              <button
                onClick={handleIgnore}
                className="px-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all"
              >
                Agora não
              </button>
            </div>
          </div>

          <button
            onClick={handleIgnore}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
