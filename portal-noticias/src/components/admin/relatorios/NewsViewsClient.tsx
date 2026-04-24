"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Download, Filter, FileText, Loader2 } from "lucide-react";

interface NoticiaView {
  id: string;
  titulo: string;
  categoria: string;
  created_at: string;
  real_views: number;
}

export default function NewsViewsClient() {
  const supabase = createClient();
  const [noticias, setNoticias] = useState<NoticiaView[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRelatorio();
  }, []);

  // Re-fetch from Supabase when filter button is clicked
  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("noticias")
        .select("id, titulo, categoria, created_at, real_views")
        .order("real_views", { ascending: false })
        .limit(200);

      if (filtroTitulo) query = query.ilike("titulo", `%${filtroTitulo}%`);
      if (filtroDataInicio) query = query.gte("created_at", filtroDataInicio);
      if (filtroDataFim) query = query.lte("created_at", filtroDataFim + "T23:59:59");

      const { data, error } = await query;
      if (!error && data) setNoticias(data as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    const headers = ["Título", "Categoria", "Data", "Views Reais", "Views Públicos (x9)"];
    const rows = noticias.map((n) => [
      `"${n.titulo.replace(/"/g, '""')}"`,
      n.categoria || "",
      new Date(n.created_at).toLocaleDateString("pt-BR"),
      n.real_views || 0,
      (n.real_views || 0) * 9,
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

  const totalViews = noticias.reduce((acc: number, n: NoticiaView) => acc + (n.real_views || 0), 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Total Matérias</p>
          <h2 className="text-4xl font-black text-white border-l-4 border-blue-500 pl-3">{noticias.length}</h2>
        </div>
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Views Reais</p>
          <h2 className="text-4xl font-black text-white border-l-4 border-emerald-500 pl-3">{totalViews.toLocaleString("pt-BR")}</h2>
        </div>
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2">Views Públicos (×9)</p>
          <h2 className="text-4xl font-black text-white border-l-4 border-amber-500 pl-3">{(totalViews * 9).toLocaleString("pt-BR")}</h2>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={16} className="text-slate-500" />
          <h3 className="font-black text-slate-300 text-sm uppercase tracking-widest">Filtros</h3>
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
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Filter size={13} />} Filtrar no Banco
          </button>
        </div>
      </div>

      {/* Tabela Exportável */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-500" />
            <h3 className="font-black text-slate-300 text-sm uppercase tracking-widest">
              Views por Matéria
              {noticias.length > 0 && <span className="ml-2 text-slate-500 font-normal text-xs">({noticias.length} resultados)</span>}
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
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase">Views Reais</th>
                    <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase">Views Públicos (x9)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {noticias.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-900/50">
                      <td className="px-6 py-3 text-slate-300 font-medium">{n.titulo}</td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{new Date(n.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-3 text-right text-slate-300 font-bold">{(n.real_views || 0)?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right text-amber-500 font-bold">{((n.real_views || 0) * 9).toLocaleString()}</td>
                    </tr>
                  ))}
                  {noticias.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-slate-500">Nenhum dado encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
