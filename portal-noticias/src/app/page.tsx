import { createClient } from "@/lib/supabase-server";
import HomeContent from "@/components/home/HomeContent";
import PuckRenderer from "@/components/home/PuckRenderer";
import { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export default async function Home() {
  let supabase: SupabaseClient<any> | null = null;
  let configData = null;
  let noticias: any[] = [];
  let bData: any[] = [];

  try {
    supabase = await createClient();

    if (supabase) {
      // 1. Fetch config - Usando maybeSingle para evitar crash se a tabela estiver vazia
      const { data: configResult, error: configError } = await supabase
        .from("configuracao_portal")
        .select("*")
        .eq("id", 1) // Geralmente o id da config é 1
        .maybeSingle();

      if (configError) {
        console.error('[Home] Supabase config error:', configError.message);
      }
      
      configData = configResult;
    }
  } catch (err) {
    console.error('[Home] Supabase config fetch error:', err);
  }

  if (!configData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Portal em Manutenção</h1>
          <p className="text-slate-500">Em breve voltamos com as notícias</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Puck published layout (Feature 5 — feature flag)
  const usePuck = configData?.ui_settings?.use_puck_home === true;
  
  if (usePuck && supabase) {
    try {
      const { data: layoutData, error: layoutError } = await supabase
        .from("page_layout")
        .select("published_data")
        .eq("slug", "home")
        .maybeSingle();

      if (layoutError) {
        console.error('[Home] Puck layout error:', layoutError.message);
      }

      if (layoutData?.published_data) {
        return <PuckRenderer data={layoutData.published_data} config={configData} />;
      }
    } catch (err) {
      console.error('[Home] Puck layout fetch error:', err);
    }
  }

  // 3. Fallback: layout legado (HomeContent estático)
  if (supabase) {
    try {
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
    } catch (err) {
      console.error('[Home] News fetch error:', err);
    }

    try {
      const { data: livesData } = await supabase
        .from("biblioteca_lives")
        .select("*")
        .order("created_at", { ascending: false });
      bData = livesData || [];
    } catch (err) {
      console.error('[Home] Lives fetch error:', err);
    }
  }

  return (
    <HomeContent 
      initialConfig={configData || {}} 
      todasNoticias={noticias} 
      bibliotecaLives={bData} 
    />
  );
}
