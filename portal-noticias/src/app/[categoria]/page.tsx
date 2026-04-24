import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import NewsGrid from "@/components/home/NewsGrid";
import { getVisualCategory } from "@/lib/category-utils";
import BreakingNewsMarquee from "@/components/BreakingNewsMarquee";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: { categoria: string } }) {
  const { categoria: slug } = params;
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Portal em Manutenção</h1>
          <p className="text-slate-500">Em breve voltamos com as notícias</p>
        </div>
      </div>
    );
  }

  // 1. Fetch config
  const { data: configData } = await supabase
    .from("configuracao_portal")
    .select("*")
    .single();

  // 2. Fetch news for this category
  // Normalizamos o slug para busca robusta removendo acentos do termo de busca 
  // para bater com o que está no banco (que o usuário disse estar sem acento)
  const normalizedTerm = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const searchTerm = `%${normalizedTerm}%`;
  
  const { data: noticias, error } = await supabase
    .from("noticias")
    .select("*, categorias(id, nome, slug)")
    .ilike("categoria", searchTerm)
    .order("created_at", { ascending: false })
    .limit(40);

  const visualTitle = getVisualCategory(slug);

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isLive={configData?.is_live} 
        config={configData} 
        categoriaAtiva={visualTitle}
      />
      
      {configData?.ui_settings?.breaking_news_alert?.active && (
        <BreakingNewsMarquee 
          text={configData.ui_settings.breaking_news_alert.text}
          speed={configData.ui_settings.breaking_news_alert.speed}
          visible={true}
        />
      )}

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <NewsGrid 
          title={`Notícias: ${visualTitle}`} 
          news={noticias || []} 
          limit={40} 
        />
        
        {(!noticias || noticias.length === 0) && (
          <div className="py-20 text-center">
            <p className="text-slate-500 font-bold uppercase tracking-widest">Nenhuma matéria registrada em {visualTitle}.</p>
          </div>
        )}
      </main>
    </div>
  );
}
