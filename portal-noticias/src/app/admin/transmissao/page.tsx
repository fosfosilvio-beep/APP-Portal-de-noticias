import { createClient } from "@/lib/supabase-server";
import TransmissaoClient from "@/components/admin/transmissao/TransmissaoClient";

export default async function TransmissaoPage() {
  const supabase = await createClient();

  // Fetch initial config for the form
  const { data: config } = await supabase
    .from("configuracao_portal")
    .select("is_live, titulo_live, descricao_live, url_live_youtube, url_live_facebook, mostrar_live_facebook, fake_viewers_boost, organic_views_enabled")
    .limit(1)
    .single();

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-black text-white">Transmissão Ao Vivo</h1>
        <p className="text-sm text-slate-400">Cockpit master de transmissão e moderação de chat.</p>
      </div>
      
      <TransmissaoClient initialConfig={config || {}} />
    </div>
  );
}
