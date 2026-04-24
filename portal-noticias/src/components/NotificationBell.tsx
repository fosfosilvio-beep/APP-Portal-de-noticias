"use client";

import { useEffect, useState } from "react";
import { Bell, X, Newspaper } from "lucide-react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

interface Notificacao {
  id: string;
  noticia_id: string;
  titulo: string;
  created_at: string;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [open, setOpen] = useState(false);
  const [lidas, setLidas] = useState<Set<string>>(new Set());

  // Carregar do localStorage quais notificações já foram lidas
  useEffect(() => {
    const stored = localStorage.getItem("notifs_lidas");
    if (stored) setLidas(new Set(JSON.parse(stored)));
  }, []);

  // Buscar notificações recentes (últimas 10)
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from("notificacoes")
        .select("id, noticia_id, titulo, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setNotifs(data);
    };

    fetchNotifs();

    // Escutar novas notificações via Realtime
    const channel = supabase
      .channel("notificacoes_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes" },
        (payload: any) => {
          setNotifs((prev) => [payload.new as Notificacao, ...prev.slice(0, 9)]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const naoLidas = notifs.filter((n) => !lidas.has(n.id));

  const marcarTodasLidas = () => {
    const novas = new Set([...Array.from(lidas), ...notifs.map((n) => n.id)]);
    setLidas(novas);
    localStorage.setItem("notifs_lidas", JSON.stringify(Array.from(novas)));
  };

  const marcarLida = (id: string) => {
    const novas = new Set([...Array.from(lidas), id]);
    setLidas(novas);
    localStorage.setItem("notifs_lidas", JSON.stringify(Array.from(novas)));
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
  };

  return (
    <div className="relative">
      <button
        id="notification-bell-btn"
        onClick={() => { setOpen(!open); if (open) marcarTodasLidas(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
        aria-label="Notificações"
      >
        <Bell size={16} className="text-slate-600" />
        {naoLidas.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm border border-white animate-pulse">
            {naoLidas.length > 9 ? "9+" : naoLidas.length}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setOpen(false); marcarTodasLidas(); }}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-slate-500" />
                <span className="font-black text-slate-800 text-xs uppercase tracking-widest">
                  Notificações
                </span>
                {naoLidas.length > 0 && (
                  <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                    {naoLidas.length} nova{naoLidas.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={() => { setOpen(false); marcarTodasLidas(); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifs.length === 0 ? (
                <div className="py-10 flex flex-col items-center gap-2 text-slate-300">
                  <Bell size={28} />
                  <p className="text-xs font-bold text-slate-400">Nenhuma notificação ainda.</p>
                </div>
              ) : (
                notifs.map((n) => {
                  const isLida = lidas.has(n.id);
                  return (
                    <Link
                      key={n.id}
                      href={`/noticia/${n.noticia_id}`}
                      onClick={() => { marcarLida(n.id); setOpen(false); }}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group ${!isLida ? "bg-blue-50/40" : ""}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${!isLida ? "bg-blue-100" : "bg-slate-100"}`}>
                        <Newspaper size={14} className={!isLida ? "text-blue-600" : "text-slate-400"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug line-clamp-2 ${!isLida ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                          {!isLida && (
                            <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 mb-0.5" />
                          )}
                          Nova matéria: {n.titulo}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                          {formatTime(n.created_at)}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {notifs.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2.5">
                <button
                  onClick={marcarTodasLidas}
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
                >
                  Marcar todas como lidas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
