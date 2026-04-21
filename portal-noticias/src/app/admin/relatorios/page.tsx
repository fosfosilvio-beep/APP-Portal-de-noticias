"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { BarChart3, Download, Filter, MapPin, Eye, Calendar, Loader2, FileText } from "lucide-react";
import Link from "next/link";

interface NoticiaView {
  id: string;
  titulo: string;
  categoria: string;
  created_at: string;
  real_views: number;
  slug: string;
}

interface GeoEntry {
  ip: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  timestamp: string;
  noticia_titulo?: string;
}

export default function RelatoriosPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [noticias, setNoticias] = useState<NoticiaView[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState<GeoEntry | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(false);

  // Filtros
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const tableRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      setIsAuthenticated(true);
    } else {
      alert("Senha incorreta.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRelatorio();
      fetchGeo();
    }
  }, [isAuthenticated]);

  const fetchRelatorio = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("noticias")
        .select("id, titulo, categoria, created_at, real_views, slug")
        .order("real_views", { ascending: false })
        .limit(100);

      if (filtroTitulo) query = query.ilike("titulo", `%${filtroTitulo}%`);
      if (filtroDataInicio) query = query.gte("created_at", filtroDataInicio);
      if (filtroDataFim) query = query.lte("created_at", filtroDataFim + "T23:59:59");

      const { data, error } = await query;
      if (!error && data) setNoticias(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeo = async () => {
    setLoadingGeo(true);
    try {
      const res = await fetch("/api/geo");
      const data = await res.json();
      setGeoData({ ...data, timestamp: new Date().toISOString() });
    } catch {
      setGeoData(null);
    } finally {
      setLoadingGeo(false);
    }
  };

  const exportarPDF = async () => {
    const element = tableRef.current;
    if (!element) return;

    // Importa html2pdf dinamicamente (client-only)
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

  const noticiasFiltradas = noticias.filter((n) => {
    if (filtroTitulo && !n.titulo.toLowerCase().includes(filtroTitulo.toLowerCase())) return false;
    if (filtroDataInicio && new Date(n.created_at) < new Date(filtroDataInicio)) return false;
    if (filtroDataFim && new Date(n.created_at) > new Date(filtroDataFim + "T23:59:59")) return false;
    return true;
  });

  const totalViews = noticiasFiltradas.reduce((acc, n) => acc + (n.real_views || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-full max-w-sm p-8 bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white text-center mb-1">Relatórios</h1>
          <p className="text-zinc-500 text-sm text-center font-medium mb-8">Painel de Analytics Privado</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-white rounded-xl px-4 py-3 placeholder-zinc-600 transition-all outline-none"
              placeholder="Senha de Administrador"
            />
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl transition-all">
              Acessar Relatório
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/admin" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              ← Voltar ao Painel Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BarChart3 size={18} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="font-black text-zinc-900 text-lg leading-tight">Relatório de Visualizações</h1>
              <p className="text-xs text-zinc-500 font-medium">Dados reais (sem multiplicação)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportarPDF}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow"
            >
              <Download size={14} />
              Exportar PDF
            </button>
            <Link href="/admin" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-2 border border-zinc-200 rounded-xl bg-white">
              ← Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">Total Matérias</p>
            <h2 className="text-4xl font-black text-zinc-900 border-l-4 border-emerald-500 pl-3">{noticiasFiltradas.length}</h2>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">Views Reais (Banco)</p>
            <h2 className="text-4xl font-black text-zinc-900 border-l-4 border-blue-500 pl-3">{totalViews.toLocaleString("pt-BR")}</h2>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mb-2">Views Públicos (×9)</p>
            <h2 className="text-4xl font-black text-zinc-900 border-l-4 border-amber-500 pl-3">{(totalViews * 9).toLocaleString("pt-BR")}</h2>
          </div>
        </div>

        {/* Localização da Sessão Atual */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={16} className="text-blue-500" />
            <h3 className="font-black text-zinc-800 text-sm uppercase tracking-widest">Geolocalização da Sessão Atual</h3>
            <button
              onClick={fetchGeo}
              className="ml-auto text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors"
            >
              Atualizar
            </button>
          </div>
          {loadingGeo ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Detectando localização...
            </div>
          ) : geoData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "IP", value: geoData.ip },
                { label: "Cidade", value: geoData.city },
                { label: "Estado", value: geoData.state },
                { label: "País", value: `${geoData.country} (${geoData.countryCode})` },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-zinc-800">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Não foi possível detectar a localização.</p>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Filter size={16} className="text-zinc-500" />
            <h3 className="font-black text-zinc-800 text-sm uppercase tracking-widest">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Matéria (título)</label>
              <input
                type="text"
                value={filtroTitulo}
                onChange={(e) => setFiltroTitulo(e.target.value)}
                placeholder="Ex: Lula..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Data Início</label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Data Fim</label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={fetchRelatorio}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all"
            >
              <Filter size={13} /> Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Tabela de Relatórios — esta div é exportada como PDF */}
        <div ref={tableRef} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center gap-2">
            <FileText size={16} className="text-zinc-500" />
            <h3 className="font-black text-zinc-800 text-sm uppercase tracking-widest">Relatório de Views por Matéria</h3>
            <span className="ml-auto text-[10px] font-bold text-zinc-400">
              Gerado em: {new Date().toLocaleString("pt-BR")}
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center gap-2 text-zinc-400">
              <Loader2 size={20} className="animate-spin" /> Carregando dados...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="text-left px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">#</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Matéria</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Categoria</th>
                    <th className="text-left px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Publicação</th>
                    <th className="text-right px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views Reais</th>
                    <th className="text-right px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views Públicos (×9)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {noticiasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400 text-sm font-medium">
                        Nenhuma matéria encontrada com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    noticiasFiltradas.map((n, i) => (
                      <tr key={n.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-3 text-zinc-400 font-bold text-xs">{i + 1}</td>
                        <td className="px-6 py-3 max-w-xs">
                          <p className="font-bold text-zinc-800 line-clamp-2 text-sm">{n.titulo}</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-block bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                            {n.categoria || "Geral"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-zinc-500 font-medium text-xs">
                          {new Date(n.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-black text-zinc-900 text-base">
                            {(n.real_views || 0).toLocaleString("pt-BR")}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="font-black text-amber-600 text-base">
                            {((n.real_views || 0) * 9).toLocaleString("pt-BR")}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {noticiasFiltradas.length > 0 && (
                  <tfoot>
                    <tr className="bg-zinc-50 border-t-2 border-zinc-200">
                      <td colSpan={4} className="px-6 py-3 font-black text-zinc-700 text-xs uppercase tracking-widest">TOTAL</td>
                      <td className="px-6 py-3 text-right font-black text-zinc-900 text-base">{totalViews.toLocaleString("pt-BR")}</td>
                      <td className="px-6 py-3 text-right font-black text-amber-600 text-base">{(totalViews * 9).toLocaleString("pt-BR")}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
