import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ]
  }
});

export async function POST(req: Request) {
  try {
    // 1. Fetch active feeds
    const { data: feeds, error: fetchError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("status", "active");

    if (fetchError || !feeds) throw fetchError;

    let importedCount = 0;

    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        
        for (const item of feedData.items) {
          // Extrair a URL da imagem (media:content, enclosure, ou tentar via Regex na description)
          let imageUrl = null;
          if (item.media && item.media.$ && item.media.$.url) {
            imageUrl = item.media.$.url;
          } else if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
          } else if (item.contentEncoded) {
            const imgMatch = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) imageUrl = imgMatch[1];
          } else if (item.description) {
            const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch) imageUrl = imgMatch[1];
          }

          // Montar conteúdo
          const conteudo = item.contentEncoded || item.description || "Conteúdo não disponível via RSS.";
          
          // Gerar um slug único (título + hash para evitar colisões com as mesmas matérias)
          const slugBase = (item.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, "").replace(/ +/g, "-");
          const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

          // Verificar se já existe (usando link como identificador único se for o caso, 
          // mas vamos assumir inserção caso o título não bata exatamente ou usar upsert na tabela se link fosse unique.
          // Como 'noticias' não tem link unique, vamos verificar pelo título nas últimas 24h)
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data: existing } = await supabase
            .from("noticias")
            .select("id")
            .eq("titulo", item.title)
            .gte("created_at", twentyFourHoursAgo)
            .limit(1);

          if (!existing || existing.length === 0) {
            const payload = {
              titulo: item.title,
              subtitulo: item.contentSnippet?.substring(0, 150) || "",
              conteudo: `<p><em>Importado de ${feed.nome} via RSS.</em></p><br/>${conteudo}<br/><a href="${item.link}" target="_blank">Ler original</a>`,
              categoria: feed.categoria_padrao,
              slug: slug,
              status: "draft",
              imagem_capa: imageUrl,
            };

            await supabase.from("noticias").insert([payload]);
            importedCount++;
          }
        }

        // Atualizar timestamp do feed
        await supabase.from("rss_feeds").update({ last_fetched: new Date().toISOString() }).eq("id", feed.id);
        
      } catch (e) {
        console.error(`Erro ao processar feed ${feed.nome} (${feed.url}):`, e);
      }
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (error: any) {
    console.error("Erro na cron / fetch-rss:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Para Vercel Cron, pode ser GET dependendo da configuração.
  // Vercel cron triggers enviam um Header de autorização `Authorization: Bearer CRON_SECRET`
  // Para simplicidade, podemos apenas redirecionar para o POST se não for exposto abertamente.
  return POST(req);
}
