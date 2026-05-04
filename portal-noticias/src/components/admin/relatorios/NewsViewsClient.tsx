"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase-browser";
import { Download, Filter, FileText, Loader2, BarChart3, TrendingUp, MapPin } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  CartesianGrid
} from "recharts";
import NewsAuditModal from "./NewsAuditModal";

interface NoticiaView {
  id: string;
  titulo: string;
  categoria: string;
  created_at: string;
  views_reais: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function NewsViewsClient() {
  const supabase = createClient();
  const [noticias, setNoticias] = useState<NoticiaView[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const [topCities, setTopCities] = useState<any[]>([]);
  const [peakHours, setPeakHours] = useState<any[]>([]);
  
  const [selectedNews, setSelectedNews] = useState<{ id: string, titulo: string } | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRelatorio();
    fetchAnalytics();
  }, []);

  const [totalGeral, setTotalGeral] = useState(0);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("noticias")
        .select("id, titulo, categoria, created_at, views_reais")
        .order("views_reais", { ascending: false })
        .limit(200);

      if (filtroTitulo) query = query.ilike("titulo", `%${filtroTitulo}%`);
      if (filtroDataInicio) query = query.gte("created_at", filtroDataInicio);
      if (filtroDataFim) query = query.lte("created_at", filtroDataFim + "T23:59:59");

      const { data, error } = await query;
      if (!error && data) setNoticias(data as any[]);

      let countQuery = supabase
        .from("noticias")
        .select("*", { count: "exact", head: true });
      
      if (filtroTitulo) countQuery = countQuery.ilike("titulo", `%${filtroTitulo}%`);
      if (filtroDataInicio) countQuery = countQuery.gte("created_at", filtroDataInicio);
      if (filtroDataFim) countQuery = countQuery.lte("created_at", filtroDataFim + "T23:59:59");

      const { count } = await countQuery;
      setTotalGeral(count || 0);
    } catch (err) {
      console.error('[NewsViewsClient] Erro no fetchRelatorio:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      // 1. Top Cidades
      const { data: cities } = await supabase.rpc('get_top_cities', { limit_count: 5 });
      if (cities) setTopCities(cities);

      // 2. Horários de Pico
      const { data: hours } = await supabase.rpc('get_peak_hours');
      if (hours) setPeakHours(hours);
    } catch (err) {
      console.error('[NewsViewsClient] Erro no fetchAnalytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const exportarPDF = async () => {
    const element = tableRef.current;
    if (!element) return;
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf()
      .set({
        margin: 10,
        filename: `relatorio-views-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(element)
      .save();
  };

  const exportarCSV = () => {
    const headers = ["Título", "Categoria", "Data", "Views Reais"];
    const rows = noticias.map((n) => [
      `"${n.titulo.replace(/"/g, '""')}"`,
      n.categoria || "",
      new Date(n.created_at).toLocaleDateString("pt-BR"),
      n.views_reais || 0,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-views-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalViews = noticias.reduce((acc: number, n: NoticiaView) => acc + (n.views_reais || 0), 0);

  return (
    <div className="space-y-6">
      {/* Gráficos de Inteligência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cidades */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={18} className="text-rose-500" />
            <h3 className="font-black text-slate-300 text-sm uppercase tracking-widest">Top 5 Cidades</h3>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            {loadingAnalytics ? (
              <Loader2 className="animate-spin text-slate-700" />
            ) : topCities.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCities}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="cidade"
                  >
                    {topCities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                    formatter={(value, name) => [value, name === "Localização não identificada" ? "Não Identificada" : name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-600 text-xs font-bold uppercase">Sem dados geográficos</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
             {topCities.map((item, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                 <span className="text-[10px] font-bold text-slate-400 uppercase truncate">
                    {item.cidade === "Localização não identificada" ? "Não Identificada" : item.cidade}: {item.total}
                 </span>
               </div>
             ))}
          </div>
        </div>

        {/* Horários de Pico */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="font-black text-slate-300 text-sm uppercase tracking-widest">Acessos (24h)</h3>
          </div>
          <div className="h-[250px] w-full">
            {loadingAnalytics ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-700" />
              </div>
            ) : peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="hora" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-600 text-xs font-bold uppercase">Sem logs nas últimas 24h</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Total Matérias (Filtrado)</p>
          <h2 className="text-4xl font-black text-white border-l-4 border-blue-500 pl-3">{totalGeral}</h2>
        </div>
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Soma Total de Views</p>
          <h2 className="text-4xl font-black text-white border-l-4 border-emerald-500 pl-3">{totalViews.toLocaleString("pt-BR")}</h2>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={16} className="text-slate-500" />
          <h3 className="font-black text-slate-300 text-sm uppercase tracking-widest">Filtros de Pesquisa</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Matéria (título)</label>
            <input
              type="text"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchRelatorio()}
              placeholder="Buscar por título..."
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Data Início</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Data Fim</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={fetchRelatorio}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-xl transition-all"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Filter size={13} />} Filtrar
          </button>
        </div>
      </div>

      {/* Tabela Exportável */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <h3 className="font-black text-slate-300 text-sm uppercase tracking-widest">
              Relatório por Matéria
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportarCSV} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              <Download size={14} /> CSV
            </button>
            <button onClick={exportarPDF} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              <Download size={14} /> PDF
            </button>
          </div>
        </div>

        <div ref={tableRef} className="p-1" style={{ backgroundColor: '#0f172a' }}>
          {loading ? (
             <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Matéria</th>
                    <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase">Publicação</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase">Ações / Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {noticias.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/50 group">
                      <td className="px-6 py-3 text-slate-300 font-medium">{n.titulo}</td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{new Date(n.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-3 text-right">
                        <button 
                          onClick={() => setSelectedNews({ id: n.id, titulo: n.titulo })}
                          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tighter transition-all"
                        >
                          {(n.views_reais || 0)?.toLocaleString()} <span className="ml-1 opacity-60">AUDITAR</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedNews && (
          <NewsAuditModal 
            noticiaId={selectedNews.id} 
            noticiaTitulo={selectedNews.titulo} 
            onClose={() => setSelectedNews(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
