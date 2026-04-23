"use client";

import { TrendingUp, Users, Smartphone, BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalViews: number;
    topNews: { titulo: string; views: number } | null;
    totalPush: number;
    avgStoryViews: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      title: "Visualizações (Total)",
      value: stats.totalViews.toLocaleString(),
      icon: BarChart2,
      color: "blue",
      detail: "Soma de todos os acessos",
      trend: "+12.5%",
      isPositive: true
    },
    {
      title: "Top Matéria (24h)",
      value: stats.topNews?.views.toLocaleString() || "0",
      icon: TrendingUp,
      color: "emerald",
      detail: stats.topNews?.titulo || "Nenhuma notícia no radar",
      trend: "Recorde",
      isPositive: true
    },
    {
      title: "Inscritos Push",
      value: stats.totalPush.toLocaleString(),
      icon: Smartphone,
      color: "amber",
      detail: "Dispositivos ativos",
      trend: "+5.2%",
      isPositive: true
    },
    {
      title: "Engajamento Stories",
      value: stats.avgStoryViews.toFixed(1),
      icon: Users,
      color: "rose",
      detail: "Média de vistas por Story",
      trend: "-2.1%",
      isPositive: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500 group">
          <div className="flex items-start justify-between">
            <div className={`p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform duration-500`}>
              <card.icon size={24} />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${card.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {card.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {card.trend}
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {card.title}
            </h4>
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic">
              {card.value}
            </div>
          </div>

          <p className="mt-4 text-slate-400 text-[11px] font-medium line-clamp-1">
            {card.detail}
          </p>
        </div>
      ))}
    </div>
  );
}
