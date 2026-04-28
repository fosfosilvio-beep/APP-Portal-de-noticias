import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Filtro básico de Bots conhecidos para evitar inflar as métricas
 */
function isBot(userAgent: string): boolean {
  const bots = [
    "bot", "crawler", "spider", "google", "facebook", "bing", 
    "yahoo", "yandex", "duckduckgo", "slurp", "baiduspider", "linkedinbot"
  ];
  const ua = userAgent.toLowerCase();
  return bots.some(bot => ua.includes(bot));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bannerId } = await params;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const ip = request.headers.get("x-forwarded-for") || "0.0.0.0";
  const referer = request.headers.get("referer") || "direct";

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/", request.url));

  try {
    // 1. Buscar a URL de destino do banner
    const { data: banner, error: bannerErr } = await supabase
      .from("banners")
      .select("url_destino")
      .eq("id", bannerId)
      .single();

    if (bannerErr || !banner || !banner.url_destino) {
      console.error("[Click API] Banner não encontrado ou sem URL:", bannerId);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Se for humano (não bot), registra a métrica
    if (!isBot(userAgent)) {
      // Registrar log detalhado
      await supabase.from("logs_publicidade").insert({
        banner_id: bannerId,
        evento: "click",
        metadata: {
          ua: userAgent,
          ip: ip.split(',')[0], // Pega apenas o primeiro IP se houver proxy
          ref: referer
        }
      });

      // Incrementar contador atômico via RPC (função que criamos no SQL)
      await supabase.rpc("incrementar_clique_banner", { banner_id: bannerId });
    }

    // 3. Redirecionar o usuário com Status 302 (Found)
    return NextResponse.redirect(new URL(banner.url_destino), 302);

  } catch (err) {
    console.error("[Click API] Erro crítico:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
