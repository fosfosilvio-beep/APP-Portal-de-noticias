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
      // 1. Fetch config - Blindagem Total
      try {
        const { data: configResult, error: configError } = await supabase
          .from("configuracao_portal")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (!configError && configResult) {
          configData = configResult;
        } else if (configError) {
          console.warn('[Home] Tabela configuracao_portal ausente ou erro:', configError.message);
        }
      } catch (e) {
        console.warn('[Home] Erro crítico no fetch de config:', e);
      }
    }
  } catch (err) {
    console.error('[Home] Falha ao inicializar Supabase:', err);
  }

  // Se configData ainda for nulo (tabela não existe), criamos um objeto padrão para não exibir tela de manutenção
  if (!configData) {
    configData = {
      id: 1,
      nome_plataforma: "Nossa Web TV",
      ui_settings: { primary_color: "#00AEE0", use_puck_home: false }
    };
  }

  // 2. Fetch Puck published layout
  const usePuck = configData?.ui_settings?.use_puck_home === true;
  
  if (usePuck && supabase) {
    try {
      const { data: layoutData, error: layoutError } = await supabase
        .from("page_layout")
        .select("published_data")
        .eq("slug", "home")
        .maybeSingle();

      if (!layoutError && layoutData?.published_data) {
        return <PuckRenderer data={layoutData.published_data} config={configData} />;
      }
    } catch (err) {
      console.warn('[Home] Erro no bypass do Puck:', err);
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

      if (!prioError && prioritizedNews) {
        noticias = prioritizedNews;
      }
    } catch (err) {
      console.warn('[Home] Erro no bypass de noticias:', err);
    }

    try {
      const { data: livesData, error: liveErr } = await supabase
        .from("biblioteca_lives")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!liveErr && livesData) {
        bData = livesData;
      }
    } catch (err) {
      console.warn('[Home] Erro no bypass de lives:', err);
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
