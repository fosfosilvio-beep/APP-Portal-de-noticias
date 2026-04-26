import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Server-side Supabase client (sem cookies, apenas leitura pública)
// ─────────────────────────────────────────────────────────────────────────────
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// Fetch do episódio + podcast para metadados OG
// ─────────────────────────────────────────────────────────────────────────────
async function getEpisodioData(id: string) {
  const { data: ep } = await supabaseAdmin
    .from("episodios")
    .select("*, podcasts(nome, apresentador_nome, apresentador_foto_url, descricao)")
    .eq("id", id)
    .single();
  return ep;
}

// ─────────────────────────────────────────────────────────────────────────────
// generateMetadata — injetado no <head> pelo Next.js (lido pelo WhatsApp/FB/TW)
// ─────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ep = await getEpisodioData(id);

  if (!ep) {
    return {
      title: "Episódio | Nossa Web TV",
      description: "Assista aos podcasts exclusivos da Nossa Web TV.",
    };
  }

  const podcast = (ep as any).podcasts;
  const titulo = ep.titulo || "Episódio de Podcast";
  const apresentador = podcast?.apresentador_nome || podcast?.nome || "Nossa Web TV";
  const descricao = ep.convidados
    ? `Com ${ep.convidados} — ${podcast?.descricao || "Podcast da Nossa Web TV"}`
    : podcast?.descricao || "Assista a este episódio exclusivo na Biblioteca da Nossa Web TV.";
  
  // Imagem: usa thumbnail do episódio, senão foto do apresentador, senão fallback
  const imagem =
    ep.thumbnail_url ||
    podcast?.apresentador_foto_url ||
    "https://www.nossawebtv.com.br/og-default.jpg";

  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.nossawebtv.com.br"}/biblioteca/episodio/${id}`;

  return {
    title: `${titulo} | ${apresentador} — Nossa Web TV`,
    description: descricao,
    openGraph: {
      type: "video.episode",
      url: pageUrl,
      title: `${titulo} | ${apresentador}`,
      description: descricao,
      siteName: "Nossa Web TV | Portal de Notícias",
      images: [
        {
          url: imagem,
          width: 1280,
          height: 720,
          alt: titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${titulo} | ${apresentador}`,
      description: descricao,
      images: [imagem],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Página em si — redireciona para /biblioteca?ep=id mantendo os meta OG
// ─────────────────────────────────────────────────────────────────────────────
export default async function EpisodioSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/biblioteca?ep=${id}`);
}
