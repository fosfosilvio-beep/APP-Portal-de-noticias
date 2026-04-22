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

export default function AdminActionsClient() {
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

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
        <ShieldAlert size={18} className="text-blue-500" />
        <h3 className="font-black text-white uppercase tracking-widest text-sm">Trilha de Auditoria (Logs)</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800">
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Data/Hora</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Usuário</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Ação</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Entidade</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">ID Afetado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {actions.map((act) => (
              <tr key={act.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                  {format(new Date(act.created_at), "dd/MM/yyyy HH:mm:ss")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">{act.profiles?.nome_completo || 'Sistema'}</span>
                    <span className="text-[10px] text-slate-500">{act.profiles?.email || act.user_id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    act.action.includes('delete') ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                    act.action.includes('update') ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  }`}>
                    {act.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300 font-medium text-xs">
                  {act.entity_type}
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-[10px]">
                  {act.entity_id}
                </td>
              </tr>
            ))}
            {actions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-12 text-slate-500">Nenhuma ação registrada no sistema.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
