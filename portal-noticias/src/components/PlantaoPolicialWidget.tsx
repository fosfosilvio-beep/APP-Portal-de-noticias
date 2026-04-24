"use client";

import { Siren, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Ocorrencia {
  id: string;
  conteudo: string;
  urgencia: string;
  created_at: string;
}

export default function PlantaoPolicialWidget() {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOcorrencias();

    const channel = supabase
      .channel("realtime-plantao")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plantao_policial" },
        () => {
          fetchOcorrencias();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOcorrencias = async () => {
    try {
      const { data, error } = await supabase
        .from("plantao_policial")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.warn("[PlantaoPolicial] Fetch error:", error.message);
        return;
      }
      if (data) setOcorrencias(data);
    } catch (err) {
      console.error("Erro ao buscar plantão:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "--:--";
    try {
      return new Date(dateStr).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "--:--";
    }
  };

  return (
    <div className="bg-white border border-red-100 rounded-xl p-6 shadow-sm relative overflow-hidden group min-h-[200px]">
      {/* Detalhe visual de alerta */}
      <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>

      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40"></span>
          <div className="relative inline-flex rounded-full h-8 w-8 bg-red-100 items-center justify-center border border-red-200">
            <Siren size={18} className="text-red-600 animate-pulse" />
          </div>
        </div>
        <h3 className="font-black text-slate-900 uppercase tracking-tight">
          Plantão <span className="text-red-600">Policial</span>
        </h3>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin text-red-600" size={20} />
          </div>
        ) : ocorrencias.length > 0 ? (
          ocorrencias.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0 last:pb-0"
            >
              <span className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 w-10 shrink-0">
                {formatTime(item.created_at)}
              </span>
              <p
                className={`text-xs font-semibold leading-relaxed ${
                  item.urgencia === "urgente" ? "text-red-700" : "text-slate-600"
                }`}
              >
                {item.conteudo}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-4">
            Sem ocorrências recentes.
          </p>
        )}
      </div>

      <button className="w-full mt-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-slate-100 hover:border-red-200">
        Ver Ocorrências
      </button>
    </div>
  );
}
