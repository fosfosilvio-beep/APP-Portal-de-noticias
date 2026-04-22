"use client";

import { Megaphone, LayoutTemplate, Image as ImageIcon, BookOpen, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SlotsTab from "@/components/admin/ads/SlotsTab";
import CreativesTab from "@/components/admin/ads/CreativesTab";
import GuidelinesTab from "@/components/admin/ads/GuidelinesTab";
import PreviewTab from "@/components/admin/ads/PreviewTab";

export default function PublicidadePage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Megaphone size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Ad Manager Premium</h1>
          <p className="text-sm text-slate-400">Gestão de espaços publicitários, banners e campanhas patrocinadas.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <Tabs defaultValue="slots" className="w-full">
          <TabsList className="bg-slate-950 border border-slate-800 h-auto p-1.5 rounded-xl mb-6">
            <TabsTrigger value="slots" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 font-bold px-5 py-2.5 flex items-center gap-2">
              <LayoutTemplate size={16} /> Slots & Posições
            </TabsTrigger>
            <TabsTrigger value="criativos" className="rounded-lg data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-400 font-bold px-5 py-2.5 flex items-center gap-2">
              <ImageIcon size={16} /> Criativos
            </TabsTrigger>
            <TabsTrigger value="diretrizes" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 font-bold px-5 py-2.5 flex items-center gap-2">
              <BookOpen size={16} /> Diretrizes
            </TabsTrigger>
            <TabsTrigger value="preview" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 font-bold px-5 py-2.5 flex items-center gap-2">
              <Eye size={16} /> Preview Global
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="slots" className="outline-none">
            <SlotsTab />
          </TabsContent>
          
          <TabsContent value="criativos" className="outline-none">
            <CreativesTab />
          </TabsContent>
          
          <TabsContent value="diretrizes" className="outline-none">
            <GuidelinesTab />
          </TabsContent>

          <TabsContent value="preview" className="outline-none">
            <PreviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
