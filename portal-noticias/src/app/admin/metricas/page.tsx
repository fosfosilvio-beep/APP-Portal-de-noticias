import { createClient } from "@/lib/supabase-server";
import { BarChart2, TrendingUp, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AcessosChart from "@/components/admin/dashboard/AcessosChart";

export default async function MetricasPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center">
        <h2 className="text-xl font-black text-slate-900 mb-2">Erro de Conexão</h2>
        <p className="text-slate-500 max-w-md mx-auto">As credenciais do banco de dados não foram encontradas.</p>
      </div>
    );
  }

  // Fetch detailed metrics for the chart
  const { data: views7dRes } = await supabase.from("page_views")
    .select("created_at")
    .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());

  // Process 30 days chart
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const chartData = last30Days.map(date => {
    const count = views7dRes?.filter((v: any) => v.created_at.startsWith(date)).length || 0;
    return { date: date.split("-").reverse().slice(0, 2).join("/"), views: count };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="p-3 bg-white rounded-2xl border border-slate-50 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Relatórios de <span className="text-blue-600">Audiência</span></h1>
          <p className="text-slate-500 font-medium">Análise detalhada do tráfego nos últimos 30 dias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter">Crescimento Mensal</h3>
          </div>
          <AcessosChart data={chartData} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Users size={20} />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Origem do Tráfego</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Direto / Orgânico</span>
                  <span className="text-sm font-black text-slate-900">72%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[72%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Redes Sociais</span>
                  <span className="text-sm font-black text-slate-900">18%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 w-[18%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-600">Referência / Ads</span>
                  <span className="text-sm font-black text-slate-900">10%</span>
                </div>
                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[10%]" />
                </div>
              </div>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <BarChart2 size={120} className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <h3 className="text-2xl font-black tracking-tighter mb-4">Exportar Dados</h3>
            <p className="text-blue-100 text-sm font-medium mb-8 leading-relaxed">Gere um relatório em PDF ou Excel com todas as métricas detalhadas para sua equipe comercial.</p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20">
              Gerar Relatório (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
