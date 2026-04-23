"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import { ChevronLeft, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getPublicUrl } from "@/components/FallbackImage";

const FlipbookViewer = dynamic(() => import("@/components/edicoes/FlipbookViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col justify-center items-center h-[600px] bg-slate-50 rounded-3xl animate-pulse">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparando Leitor Digital...</p>
    </div>
  )
});

export default function EdicaoDigitalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [edicao, setEdicao] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchEdicao();
  }, [id]);

  async function fetchEdicao() {
    const { data, error } = await supabase
      .from("edicoes_digitais")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      router.push("/");
    } else {
      setEdicao(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header showNavigation={false} />
        <div className="flex justify-center items-center h-[70vh]">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </main>
    );
  }

  if (!edicao) return null;

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-blue-200 flex flex-col">
      <Header showNavigation={false} />

      <div className="container mx-auto px-4 lg:px-8 py-8 flex-grow">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors mb-4">
              <ChevronLeft size={16} /> Voltar para o Portal
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <BookOpen size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">{edicao.titulo}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
                  Publicado em {new Date(edicao.data_publicacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full relative z-10">
          {edicao.pdf_url ? (
            <FlipbookViewer pdfUrl={getPublicUrl(edicao.pdf_url) || ""} />
          ) : (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center">
              <p className="font-bold">Arquivo PDF não encontrado para esta edição.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
