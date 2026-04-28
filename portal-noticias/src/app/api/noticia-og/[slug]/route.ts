import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

async function fetchNoticiaRest(slug: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    if (!supabaseUrl || !supabaseKey) return null;

    // Usando API REST direta do Supabase para evitar cache do SDK/Next.js
    const decodedSlug = decodeURIComponent(slug);
    const apiUrl = `${supabaseUrl}/rest/v1/noticias?select=titulo,subtitulo,imagem_capa_url,imagem_capa,slug,id&slug=eq.${encodeURIComponent(decodedSlug)}&limit=1`;

    let resStatus = 0;
    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      resStatus = res.status;
      if (!res.ok) {
        return { error_debug: `REST Status: ${resStatus}` };
      }
      const data = await res.json();
      return data && data.length > 0 ? data[0] : { error_debug: `Empty data` };
    } catch (err: any) {
      return { error_debug: `Fetch threw: ${err.message}` };
    }
  } catch (e: any) {
    return { error_debug: `Outer throw: ${e.message}` };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const noticia = await fetchNoticiaRest(slug);
  const BASE_URL = "https://www.nossawebtv.com.br";

  const title = noticia?.titulo || "Nossa Web TV | Portal de Notícias";
  const description =
    noticia?.subtitulo ||
    "Leia as últimas notícias de Arapongas e região no portal Nossa Web TV.";

  const rawImage = noticia?.imagem_capa_url || noticia?.imagem_capa || "";
  const imageUrl = rawImage.startsWith("http")
    ? rawImage
    : rawImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${rawImage}`
    : `${BASE_URL}/logo-og.png`;

  const pageUrl = `${BASE_URL}/noticia/${slug}`;
  const usedKey = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const keyPrefix = usedKey ? usedKey.substring(0, 8) + '...' : 'none';
  const debugInfo = noticia?.error_debug ? `ERROR: ${noticia.error_debug}` : (noticia ? "YES(" + noticia.id + ")" : "NO_DATA");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Nossa Web TV">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecionando para <a href="${pageUrl}">${title}</a>...</p>
  <!-- DEBUG: slug_received = ${slug} | noticia_found = ${debugInfo} | key = ${keyPrefix} -->
  <script>window.location.href = "${pageUrl}";</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "all",
    },
  });
}
