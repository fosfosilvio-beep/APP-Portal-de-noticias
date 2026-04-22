"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { BarChart3, Download, Filter, FileText, Megaphone, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdAnalyticsClient from "@/components/admin/relatorios/AdAnalyticsClient";
import NewsViewsClient from "@/components/admin/relatorios/NewsViewsClient";

export default function RelatoriosPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <BarChart3 size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Relatórios & Analytics</h1>
            <p className="text-sm text-slate-400">Desempenho de matérias e campanhas publicitárias.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <Tabs defaultValue="ads" className="w-full">
          <TabsList className="bg-slate-950 border border-slate-800 h-auto p-1.5 rounded-xl mb-6">
            <TabsTrigger value="ads" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-400 font-bold px-5 py-2.5 flex items-center gap-2">
              <Megaphone size={16} /> Analytics de Publicidade
            </TabsTrigger>
            <TabsTrigger value="news" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-400 font-bold px-5 py-2.5 flex items-center gap-2">
              <FileText size={16} /> Views de Notícias
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ads" className="outline-none">
            <AdAnalyticsClient />
          </TabsContent>
          
          <TabsContent value="news" className="outline-none">
            <NewsViewsClient />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
