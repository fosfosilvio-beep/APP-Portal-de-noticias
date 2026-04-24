import { createClient } from "@/lib/supabase-server";
import { 
  Plus, ExternalLink, Globe, ShieldCheck, Smartphone, 
  Lock, BarChart2
} from "lucide-react";
import Link from "next/link";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import AcessosChart from "@/components/admin/dashboard/AcessosChart";
import ColunistasRanking from "@/components/admin/dashboard/ColunistasRanking";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-[2.5rem] border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Erro de Conexão</h2>
        <p className="text-slate-500 max-w-md mx-auto">As credenciais do banco de dados não foram encontradas. Verifique as variáveis de ambiente na Vercel.</p>
      </div>
    );
  }

  // 1. Fetch KPI Stats
  const [noticiasRes, pushRes, storiesRes, topNews24hRes, views7dRes, colRankingRes] = await Promise.all([
    // Total Views (Aggregated)
    supabase.from("noticias").select("view_count"),
    // Total Push Subscriptions
    supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
    // Total de Matérias
    supabase.from("noticias").select("id", { count: "exact", head: true }),
    // Top News 24h (from page_views log)
    supabase.from("page_views")
      .select("noticia_id, noticias(titulo)")
      .not("noticia_id", "is", null)
      .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    // Chart Data (7 days)
    supabase.from("page_views")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    // Columnist Ranking
    supabase.from("colunistas")
      .select("id, nome, foto_perfil, noticias(view_count)")
  ]);

  // Process Stats
  const totalViews = noticiasRes.data?.reduce((acc: number, n: any) => acc + (n.view_count || 0), 0) || 0;
  const totalPush = pushRes.count || 0;
  const totalNoticias = storiesRes.count || 0;

  // Process Top News 24h
  const topNewsMap = new Map();
  topNews24hRes.data?.forEach((pv: any) => {
    const id = pv.noticia_id;
    const current = topNewsMap.get(id) || { titulo: pv.noticias?.titulo, views: 0 };
    topNewsMap.set(id, { ...current, views: current.views + 1 });
  });
  const topNewsArray = Array.from(topNewsMap.values()).sort((a, b) => b.views - a.views);
  const topNews = topNewsArray.length > 0 ? topNewsArray[0] : null;

  // Process Chart Data (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const count = views7dRes.data?.filter((v: any) => v.created_at.startsWith(date)).length || 0;
    return { date: date.split("-").slice(1).reverse().join("/"), views: count };
  });

  // Process Columnist Ranking
  const ranking = colRankingRes.data?.map((col: any) => ({
    id: col.id,
    nome: col.nome,
    foto_perfil: col.foto_perfil,
    totalViews: col.noticias?.reduce((acc: number, n: any) => acc + (n.view_count || 0), 0) || 0,
    countMaterias: col.noticias?.length || 0
  })).sort((a: any, b: any) => b.totalViews - a.totalViews).slice(0, 5) || [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* Header Soft UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <BarChart2 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Painel de <span className="text-blue-600">Inteligência</span></h1>
            <p className="text-slate-500 font-medium mt-1">Visão geral do engajamento e métricas de audiência.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/noticias/novo" className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-2">
            <Plus size={16} /> Nova Matéria
          </Link>
          <Link href="/" target="_blank" className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
             Ver Portal <ExternalLink size={16} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardStats stats={{ totalViews, topNews, totalPush, totalNoticias }} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <AcessosChart data={chartData} />
        </div>

        {/* Sidebar Rankings & Status */}
        <div className="space-y-8">
          <ColunistasRanking ranking={ranking} />
          
          {/* Status System Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm p-8 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Integridade do Sistema</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Segurança RLS</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Proteção Ativa</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">PWA & Push</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Sincronizado</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">SSL / HTTPS</p>
                  <p className="text-[10px] font-bold text-purple-600 uppercase">Criptografado</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-1"><Globe size={10} /> sa-east-1</span>
              <span>v2.5.0-metrics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
