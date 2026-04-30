import { createClient } from "@/lib/supabase-server";
import NewsGrid from "@/components/home/NewsGrid";
import { getVisualCategory } from "@/lib/category-utils";

export const dynamic = "force-dynamic";

export default async function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
    .eq("id", 1)
    .maybeSingle();

  // 2. Fetch news for this category
  // Normalizamos o slug para busca robusta
  const normalizedTerm = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, " ");
  const searchTerm = `%${normalizedTerm}%`;
  
  const { data: noticias, error } = await supabase
    .from("noticias")
    .select("*, categorias(id, nome, slug)")
    .or(`categoria.ilike.${searchTerm},categorias.slug.eq.${slug}`)
    .order("created_at", { ascending: false })
    .limit(40);

  const visualTitle = getVisualCategory(slug);

  return (
    <div className="min-h-screen bg-white">
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
