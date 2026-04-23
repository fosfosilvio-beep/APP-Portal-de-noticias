"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, Eye, MousePointerClick, Percent } from "lucide-react";

export default function AdAnalyticsClient() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch slots
      const { data: slots } = await supabase.from("ad_slots").select("id, nome_slot");
      if (!slots) return;

      // In a real app, use an RPC or View. For this demo, fetch all stats or use a count query.
      // Since we don't have a view, let's fetch counts per slot using an aggregate if possible, or just raw.
      // Actually, we can fetch all clicks and impressions and group them in JS for simplicity.
      const { data: impressions } = await supabase.from("ad_impressions").select("slot_id");
      const { data: clicks } = await supabase.from("ad_clicks").select("slot_id");

      const impMap: Record<string, number> = {};
      const clickMap: Record<string, number> = {};

      impressions?.forEach((imp) => {
        impMap[imp.slot_id] = (impMap[imp.slot_id] || 0) + 1;
      });

      clicks?.forEach((clk) => {
        clickMap[clk.slot_id] = (clickMap[clk.slot_id] || 0) + 1;
      });

      const aggregated = slots.map((s) => {
        const imp = impMap[s.id] || 0;
        const clk = clickMap[s.id] || 0;
        const ctr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : 0;
        return {
          name: s.nome_slot,
          impressions: imp,
          clicks: clk,
          ctr: Number(ctr),
        };
      });

      setData(aggregated.filter(a => a.impressions > 0 || a.clicks > 0)); // Only show active
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  const totalImpressions = data.reduce((acc, d) => acc + d.impressions, 0);
  const totalClicks = data.reduce((acc, d) => acc + d.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1"><Eye size={14}/> Impressões (Viewability IAB)</p>
          <h2 className="text-4xl font-black text-white">{totalImpressions.toLocaleString()}</h2>
        </div>
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1"><MousePointerClick size={14}/> Cliques</p>
          <h2 className="text-4xl font-black text-white">{totalClicks.toLocaleString()}</h2>
        </div>
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1"><Percent size={14}/> CTR Médio Global</p>
          <h2 className="text-4xl font-black text-amber-500">{avgCtr}%</h2>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
        <h3 className="font-bold text-white text-lg mb-6">Desempenho por Posição (Slot)</h3>
        {data.length === 0 ? (
          <div className="text-center p-12 text-slate-500">
            Nenhum dado de publicidade registrado ainda.
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#cbd5e1" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="impressions" name="Impressões" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="clicks" name="Cliques" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="ctr" name="CTR (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
