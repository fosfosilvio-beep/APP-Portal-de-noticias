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
  const normalizedSlug = slug.toLowerCase();
  const searchName = slug.replace(/-/g, " ");
  const searchTerm = `%${searchName}%`;

  // Buscamos primeiro o ID da categoria para garantir o filtro correto
  const { data: catData } = await supabase
    .from("categorias")
    .select("id")
    .or(`slug.eq.${normalizedSlug},nome.ilike.${searchTerm}`)
    .maybeSingle();
  
  let query = supabase
    .from("noticias")
    .select("*, categorias(id, nome, slug)")
    .eq("status", "published");

  // Lógica de isolamento cirúrgico com sincronização de ordem do Admin
  if (slug === "plantao-policial-arapongas") {
    query = query.eq("categoria", "Plantão Policial Arapongas");
  } else {
    query = query
      .neq("categoria", "Plantão Policial Arapongas")
      .or(`categoria.ilike.${searchTerm}${catData ? `,categoria_id.eq.${catData.id}` : ""}`);
  }

  query = query
    .order("ordem_prioridade", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(40);
  
  const { data: noticias, error } = await query;

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
