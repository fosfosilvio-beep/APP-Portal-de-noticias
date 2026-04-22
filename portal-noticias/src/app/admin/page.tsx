import { createClient } from "@/lib/supabase-server";
import { Newspaper, Eye, Radio, HardDrive, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Fetch quick stats
  const [noticiasRes, configRes, todayViewsRes] = await Promise.all([
    supabase.from("noticias").select("id, titulo, real_views, created_at, status").order("real_views", { ascending: false }).limit(5),
    supabase.from("configuracao_portal").select("is_live, titulo_live").limit(1).single(),
    supabase.from("noticias").select("real_views").gte("created_at", new Date(Date.now() - 86400000).toISOString()),
  ]);

  const topNoticias = noticiasRes.data || [];
  const config = configRes.data;
  const todayViews = todayViewsRes.data?.reduce((acc, n) => acc + (n.real_views || 0), 0) || 0;
  const totalNoticias = noticiasRes.data?.length || 0;

  const stats = [
    {
      label: "Leitores Hoje",
      value: (todayViews * 9).toLocaleString("pt-BR"),
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Top Notícias",
      value: String(totalNoticias),
      icon: Newspaper,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Status da Live",
      value: config?.is_live ? "AO VIVO" : "Offline",
      icon: Radio,
      color: config?.is_live ? "text-red-400" : "text-slate-400",
      bg: config?.is_live ? "bg-red-500/10 border-red-500/20" : "bg-slate-800 border-slate-700",
    },
    {
      label: "Views Reais (dia)",
      value: todayViews.toLocaleString("pt-BR"),
      icon: TrendingUp,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  const quickLinks = [
    { label: "Nova Notícia", href: "/admin/noticias/novo", desc: "Criar nova matéria", color: "border-l-emerald-500" },
    { label: "Gerenciar Transmissão", href: "/admin/transmissao", desc: "Cockpit da live", color: "border-l-red-500" },
    { label: "Editor Visual (Home)", href: "/admin/home-builder", desc: "Arrastar e soltar blocos", color: "border-l-purple-500" },
    { label: "Publicidade", href: "/admin/publicidade", desc: "Ad slots e banners", color: "border-l-amber-500" },
    { label: "Auditoria", href: "/admin/auditoria", desc: "Log de ações", color: "border-l-blue-500" },
    { label: "Relatórios", href: "/admin/relatorios", desc: "Analytics e views", color: "border-l-cyan-500" },
  ];

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Visão Geral</h1>
        <p className="text-sm text-slate-400 mt-1">Resumo do portal e acesso rápido às ferramentas.</p>
      </div>

      {/* Live Badge */}
      {config?.is_live && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <p className="font-black text-red-400 text-sm uppercase tracking-widest">Portal AO VIVO: {config.titulo_live || "Transmissão em andamento"}</p>
          <Link href="/admin/transmissao" className="ml-auto text-xs text-red-400 font-bold hover:underline flex items-center gap-1">
            Gerenciar <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-slate-900 border rounded-2xl p-5 ${stat.bg}`}>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${stat.bg}`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Links */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">Acesso Rápido</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between p-3 bg-slate-950 rounded-xl border-l-4 hover:bg-slate-800/60 transition-colors group ${link.color}`}
              >
                <div>
                  <p className="font-bold text-white text-sm">{link.label}</p>
                  <p className="text-xs text-slate-500">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Top Notícias */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Mais Lidas</h2>
            <Link href="/admin/relatorios" className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {topNoticias.map((n, i) => (
              <div key={n.id} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-black text-slate-600 w-5 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{n.titulo}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={10} className="text-slate-600" />
                    <span className="text-[10px] text-slate-500">{new Date(n.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400">{((n.real_views || 0) * 9).toLocaleString("pt-BR")}</p>
                  <p className="text-[9px] text-slate-600 uppercase">views</p>
                </div>
              </div>
            ))}
            {topNoticias.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">Nenhuma notícia publicada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
