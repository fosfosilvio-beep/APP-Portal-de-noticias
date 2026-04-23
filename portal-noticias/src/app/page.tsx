import { createClient } from "@/lib/supabase-server";
import HomeContent from "@/components/home/HomeContent";
import PuckRenderer from "@/components/home/PuckRenderer";

export const revalidate = 30;

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch config
  const { data: configData } = await supabase
    .from("configuracao_portal")
    .select("*")
    .limit(1)
    .single();

  // 2. Fetch Puck published layout (Feature 5 — feature flag)
  const usePuck = configData?.ui_settings?.use_puck_home === true;
  
  if (usePuck) {
    const { data: layoutData } = await supabase
      .from("page_layout")
      .select("published_data")
      .eq("slug", "home")
      .single();

    if (layoutData?.published_data) {
      return <PuckRenderer data={layoutData.published_data} config={configData} />;
    }
  }

  // 3. Fallback: layout legado (HomeContent estático)
  let noticias: any[] = [];
  const { data: prioritizedNews, error: prioError } = await supabase
    .from("noticias")
    .select("*, categorias(id, nome, slug)")
    .order("ordem_prioridade", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

  if (prioError) {
    const { data: fallbackNews } = await supabase
      .from("noticias")
      .select("*, categorias(id, nome, slug)")
      .order("created_at", { ascending: false })
      .limit(80);
    noticias = fallbackNews || [];
  } else {
    noticias = prioritizedNews || [];
  }

  const { data: bData } = await supabase
    .from("biblioteca_lives")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <HomeContent 
      initialConfig={configData || {}} 
      todasNoticias={noticias} 
      bibliotecaLives={bData || []} 
    />
  );
}
