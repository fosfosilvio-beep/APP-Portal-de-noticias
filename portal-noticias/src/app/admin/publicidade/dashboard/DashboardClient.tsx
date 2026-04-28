"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { 
  BarChart3, 
  TrendingUp, 
  MousePointerClick, 
  Eye, 
  Flag,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trophy,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stats {
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
}

interface BannerStat {
  id: string;
  nome: string;
  url_imagem: string;
  total_views: number;
  total_cliques: number;
  campanha_nome: string;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Stats>({
    activeCampaigns: 0,
    totalImpressions: 0,
    totalClicks: 0,
    avgCtr: 0
  });
  const [banners, setBanners] = useState<BannerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const supabase = createClient();
      
      // 1. Contagem de Campanhas Ativas
      const { count: campaignsCount } = await supabase
        .from("campanhas")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativa");

      // 2. Agregados de Banners (Views e Cliques)
      const { data: bannersData, error } = await supabase
        .from("banners")
        .select(`
          id, 
          nome, 
          url_imagem, 
          total_views, 
          total_cliques,
          campanhas(nome)
        `);

      if (error) throw error;

      const totalViews = bannersData?.reduce((acc: number, b: any) => acc + (b.total_views || 0), 0) || 0;
      const totalClicks = bannersData?.reduce((acc: number, b: any) => acc + (b.total_cliques || 0), 0) || 0;
      const avgCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

      setStats({
        activeCampaigns: campaignsCount || 0,
        totalImpressions: totalViews,
        totalClicks: totalClicks,
        avgCtr: avgCtr
      });

      // Banners formatados para a tabela
      const formattedBanners = bannersData?.map((b: any) => ({
        id: b.id,
        nome: b.nome,
        url_imagem: b.url_imagem,
        total_views: b.total_views || 0,
        total_cliques: b.total_cliques || 0,
        campanha_nome: b.campanhas?.nome || "Sem Campanha"
      })).sort((a: any, b: any) => b.total_cliques - a.total_cliques) || [];

      setBanners(formattedBanners);

    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const calculateCtr = (clicks: number, views: number): string => {
    if (views === 0) return "0";
    return ((clicks / views) * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-zinc-500 font-bold animate-pulse">Processando Inteligência de Dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-zinc-200 shadow-sm overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Campanhas Ativas</CardTitle>
            <Flag className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{stats.activeCampaigns}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full">
              <TrendingUp size={10} /> VEICULAÇÃO ATIVA
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Impressões Totais</CardTitle>
            <Eye className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{stats.totalImpressions.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium">Exibições registradas no mês</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Cliques Totais</CardTitle>
            <MousePointerClick className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{stats.totalClicks.toLocaleString()}</div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-blue-600">
               Auditados pela API de Tracking
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 text-white border-zinc-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">CTR Global</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats.avgCtr.toFixed(2)}%</div>
            <div className="mt-2">
               <Progress value={Math.min(stats.avgCtr * 10, 100)} className="h-1 bg-zinc-800" />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium">Eficiência média de engajamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Performance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-1.5 h-6 rounded-full" />
          <h2 className="text-lg font-black text-zinc-900 tracking-tight">Performance por Criativo</h2>
        </div>
        
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                <TableHead className="font-bold text-zinc-900">Banner</TableHead>
                <TableHead className="font-bold text-zinc-900">Campanha</TableHead>
                <TableHead className="font-bold text-zinc-900 text-center">Impressões</TableHead>
                <TableHead className="font-bold text-zinc-900 text-center">Cliques</TableHead>
                <TableHead className="font-bold text-zinc-900">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => {
                const ctrValue = parseFloat(calculateCtr(banner.total_cliques, banner.total_views).toString());
                return (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-zinc-100 rounded border border-zinc-200 overflow-hidden shrink-0">
                          <img src={banner.url_imagem} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-zinc-900">{banner.nome}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{banner.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold text-zinc-600 bg-zinc-50">
                        {banner.campanha_nome}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-zinc-600">{banner.total_views.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-blue-600">{banner.total_cliques.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-black text-sm",
                          ctrValue > 2 ? "text-green-600" : ctrValue > 0.5 ? "text-blue-600" : "text-zinc-400"
                        )}>
                          {ctrValue}%
                        </span>
                        {ctrValue > 2 && <ArrowUpRight size={14} className="text-green-500" />}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
