"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface AcessosChartProps {
  data: { date: string; views: number }[];
}

export default function AcessosChart({ data }: AcessosChartProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-slate-900 font-black uppercase tracking-tighter text-xl italic">
            Audiência <span className="text-blue-600">Últimos 7 Dias</span>
          </h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Volume total de visualizações diárias
          </p>
        </div>
      </div>

      <div className="h-[300px] min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: 'none', 
                borderRadius: '1rem', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '1rem'
              }}
              labelStyle={{ fontWeight: 900, marginBottom: '0.25rem', color: '#0f172a' }}
            />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="#3b82f6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorViews)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
