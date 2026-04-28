import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Blindagem da Função fetchNoticia (SSR)
 * Garante que erros de banco ou timeout não quebrem o servidor (HTTP 500)
 */
async function fetchNoticia(slug: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      console.warn("[SSR] Variáveis de ambiente do Supabase não encontradas.");
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const decodedSlug = decodeURIComponent(slug);

    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .eq("slug", decodedSlug)
      .maybeSingle();

    if (error) {
      console.error(`[SSR Fetch Error] Erro ao buscar notícia (${decodedSlug}):`, error);
      return null;
    }

    return data;
  } catch (e) {
    console.error("[SSR Fatal Error] Falha crítica na busca da notícia:", e);
    return null; // Retorna null em vez de lançar exceção (evita HTTP 500)
  }
}

import NoticiaClient from "./NoticiaClient";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await params;
  const slug = p.slug;
  const noticia = await fetchNoticia(slug);
  
  const baseUrl = "https://www.nossawebtv.com.br";
  const defaultImage = `${baseUrl}/logo-og.png`;

  if (!noticia) {
    return {
      title: "Nossa Web TV | Portal de Notícias",
      description: "Portal de notícias de Arapongas e região.",
      openGraph: {
        title: "Nossa Web TV",
        description: "Portal de notícias de Arapongas e região.",
        url: baseUrl,
        images: [{ url: defaultImage, width: 1200, height: 630 }],
      }
    };
  }

  const rawImage = noticia.imagem_capa_url || noticia.imagem_capa || "";
  const capaUrl = rawImage.startsWith("http")
    ? rawImage
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${rawImage}`;

  const description = noticia.resumo || noticia.subtitulo || "Leia a notícia completa no portal Nossa Web TV.";

  return {
    title: noticia.titulo,
    description: description,
    other: {
      "fb:app_id": "1316826297252495",
    },
    openGraph: {
      title: noticia.titulo,
      description: description,
      url: `${baseUrl}/noticia/${slug}`,
      images: [
        { 
          url: capaUrl, 
          width: 1200, 
          height: 630,
          alt: noticia.titulo 
        }
      ],
      type: 'article',
      siteName: "Nossa Web TV",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.titulo,
      description: description,
      images: [capaUrl],
    }
  };
}

export default async function NoticiaPage({ params }: PageProps) {
  const p = await params;
  const slug = p.slug;
  const noticia = await fetchNoticia(slug);

  if (!noticia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Notícia não encontrada</h1>
          <a href="/" className="text-blue-600 font-bold">Voltar para o Início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <NoticiaClient slug={slug} initialData={noticia} />
      
      {/* SEO Fallback para robôs e crawlers */}
      <noscript>
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h1 className="text-4xl font-bold">{noticia.titulo}</h1>
          {noticia.subtitulo && <h2 className="text-xl text-zinc-600 mt-2">{noticia.subtitulo}</h2>}
          <div className="mt-8 prose prose-zinc" dangerouslySetInnerHTML={{ __html: noticia.conteudo || "" }} />
        </div>
      </noscript>
    </div>
  );
}
