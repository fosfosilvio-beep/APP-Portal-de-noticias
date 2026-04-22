import { createClient } from "@/lib/supabase-server";
import HomeContent from "@/components/home/HomeContent";
import FooterAdBanner from "@/components/FooterAdBanner";
import DynamicAdSlot from "@/components/DynamicAdSlot";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch config
  const { data: configData } = await supabase
    .from("configuracao_portal")
    .select("*")
    .limit(1)
    .single();

  // 2. Fetch noticias
  let noticias = [];
  const { data: prioritizedNews, error: prioError } = await supabase
    .from("noticias")
    .select("*")
    .order("ordem_prioridade", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

  if (prioError) {
    const { data: fallbackNews } = await supabase
      .from("noticias")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80);
    noticias = fallbackNews || [];
  } else {
    noticias = prioritizedNews || [];
  }

  // 3. Fetch biblioteca lives
  const { data: bData } = await supabase
    .from("biblioteca_lives")
    .select("*")
    .order("created_at", { ascending: false });

  const bibliotecaLives = bData || [];

  return (
    <HomeContent 
      initialConfig={configData || {}} 
      todasNoticias={noticias} 
      bibliotecaLives={bibliotecaLives} 
    />
  );
}
