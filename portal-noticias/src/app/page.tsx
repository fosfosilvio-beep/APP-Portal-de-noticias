import { createClient } from "@/lib/supabase-server";
import HomeContent from "@/components/home/HomeContent";
import PuckRenderer from "@/components/home/PuckRenderer";
import { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const supabase = await createClient();
  const { data: live } = await supabase
    .from("portal_live_status")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const title = live?.is_live 
    ? `AO VIVO: ${live.titulo || "Acompanhe nossa transmissão"}`
    : "Nossa Web TV - O seu portal de notícias";
  
  const description = live?.is_live 
    ? live.descricao || "Assista agora à nossa transmissão ao vivo pelo portal."
    : "Fique por dentro das principais notícias de Arapongas e região em tempo real.";

  // Configurar metadados dinâmicos para SEO e Redes Sociais
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nossawebtv.com.br";
  let ogImage = `${baseUrl}/logo.png`; // Fallback: imagem padrão do portal

  if (live?.is_live && live.url_youtube) {
    const ytId = live.url_youtube.includes("v=") 
      ? live.url_youtube.split("v=")[1]?.split("&")[0]
      : live.url_youtube.split("/").pop();
    if (ytId) ogImage = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
      url: baseUrl,
      type: "website",
      siteName: "Nossa Web TV",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Home() {
  const supabase = await createClient();
  
  if (!supabase) {
    throw new Error("Falha ao inicializar o cliente Supabase");
  }

  // 1. Fetch Config, Live Status e Anúncios em paralelo para performance
  const [configResponse, liveResponse, adsResponse] = await Promise.all([
    supabase.from("configuracao_portal").select("*").eq("id", 1).maybeSingle(),
    supabase.from("portal_live_status").select("*").eq("id", 1).maybeSingle(),
    supabase.from("ad_slots").select("*").eq("status_ativo", true)
  ]);

  if (configResponse.error) {
    console.error('[Home] Erro ao buscar configuracao_portal:', configResponse.error.message);
  }

  if (liveResponse.error) {
    console.error('[Home] Erro ao buscar portal_live_status:', liveResponse.error.message);
  }

  const configData = configResponse.data || {
    id: 1,
    nome_plataforma: "Nossa Web TV",
    ui_settings: { primary_color: "#00AEE0", use_puck_home: false }
  };

  const liveData = liveResponse.data || {
    is_live: false,
    url_youtube: null,
    url_facebook: null,
    titulo: null
  };

  // 2. Fetch Puck published layout se ativado
  const usePuck = configData?.ui_settings?.use_puck_home === true;
  
  if (usePuck) {
    const { data: layoutData } = await supabase
      .from("page_layout")
      .select("published_data")
      .eq("slug", "home")
      .maybeSingle();

    if (layoutData?.published_data) {
      return <PuckRenderer data={layoutData.published_data} config={configData} />;
    }
  }

  // 3. Layout legado (HomeContent)
  const [noticiasRes, livesRes] = await Promise.all([
    supabase
      .from("noticias")
      .select("*, categorias(id, nome, slug)")
      .order("ordem_prioridade", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("biblioteca_lives")
      .select("*")
      .order("created_at", { ascending: false })
  ]);

  return (
    <HomeContent 
      initialConfig={configData} 
      liveStatus={liveData}
      todasNoticias={noticiasRes.data || []} 
      bibliotecaLives={livesRes.data || []} 
      initialAds={adsResponse.data || []}
    />
  );
}
