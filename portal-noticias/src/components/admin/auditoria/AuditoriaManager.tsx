"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Loader2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface AdminAction {
  id: number;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  diff: any;
  created_at: string;
  profiles?: {
    nome_completo: string;
    email: string;
  };
}

export default function AuditoriaManager() {
  const supabase = createClient();
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    const { data, error } = await supabase
      .from("admin_actions")
      .select(`
        *,
        profiles:user_id ( nome_completo, email )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) setActions(data as unknown as AdminAction[]);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Auditoria de <span className="text-blue-600">Sistema</span></h1>
            <p className="text-slate-500 font-medium mt-1">Rastreabilidade completa de ações administrativas e de conteúdo.</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entidade</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Afetado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {actions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                      {format(new Date(act.created_at), "dd/MM/yyyy HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{act.profiles?.nome_completo || 'Sistema'}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{act.profiles?.email || act.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        act.action.includes('delete') ? 'bg-rose-50 text-rose-600' :
                        act.action.includes('update') ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {act.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-bold text-xs uppercase tracking-wider">
                      {act.entity_type}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                      {act.entity_id}
                    </td>
                  </tr>
                ))}
                {actions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-12 text-slate-400 font-bold">Nenhuma ação registrada no sistema.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
