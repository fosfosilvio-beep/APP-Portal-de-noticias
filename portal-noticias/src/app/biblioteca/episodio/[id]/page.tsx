import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getEpisodioData(id: string) {
  const { data: ep } = await supabaseAdmin
    .from("episodios")
    .select("*, podcasts(nome, apresentador_nome, apresentador_foto_url, descricao)")
    .eq("id", id)
    .single();
  return ep;
}

// ─── Meta tags OG injetadas no <head> ANTES do redirect ──────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ep = await getEpisodioData(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nossawebtv.com.br";

  if (!ep) {
    return {
      title: "Episódio | Nossa Web TV",
      description: "Assista aos podcasts exclusivos da Nossa Web TV.",
      openGraph: {
        images: [`${siteUrl}/og-default.jpg`],
      },
    };
  }

  const podcast = (ep as any).podcasts;
  const titulo = ep.titulo || "Episódio de Podcast";
  const apresentador = podcast?.apresentador_nome || podcast?.nome || "Nossa Web TV";
  const descricao = ep.convidados
    ? `Com ${ep.convidados} — ${podcast?.descricao || "Podcast da Nossa Web TV"}`
    : podcast?.descricao || "Assista a este episódio exclusivo na Biblioteca da Nossa Web TV.";

  // Prioridade: thumbnail do episódio → foto do apresentador → fallback
  const imagem =
    ep.thumbnail_url ||
    podcast?.apresentador_foto_url ||
    `${siteUrl}/og-default.jpg`;

  const pageUrl = `${siteUrl}/biblioteca/episodio/${id}`;

  return {
    title: `${titulo} | ${apresentador} — Nossa Web TV`,
    description: descricao,
    openGraph: {
      type: "video.episode",
      url: pageUrl,
      title: `🎙️ ${titulo} — ${apresentador}`,
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
      title: `🎙️ ${titulo} — ${apresentador}`,
      description: descricao,
      images: [imagem],
    },
  };
}

// ─── Página com redirect CLIENT-SIDE ─────────────────────────────────────────
// IMPORTANTE: NÃO usar redirect() do servidor aqui pois ele envia HTTP 302
// sem corpo HTML, o que faz os bots do WhatsApp/Facebook ignorarem os OG tags.
// Em vez disso, renderizamos uma página real com meta refresh + JS redirect.
export default async function EpisodioSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ep = await getEpisodioData(id);
  const podcast = ep ? (ep as any).podcasts : null;
  const destUrl = `/biblioteca?ep=${id}`;

  return (
    <html lang="pt-BR">
      <head>
        {/* Meta refresh como fallback para bots que executam JS */}
        <meta httpEquiv="refresh" content={`0;url=${destUrl}`} />
      </head>
      <body
        style={{
          margin: 0,
          background: "#0A0A0A",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
        }}
      >
        {/* Imagem visível para crawlers que renderizam HTML básico */}
        {(ep?.thumbnail_url || podcast?.apresentador_foto_url) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ep?.thumbnail_url || podcast?.apresentador_foto_url}
            alt={ep?.titulo || "Episódio"}
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #2563eb",
            }}
          />
        )}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
            {ep?.titulo || "Carregando episódio..."}
          </h1>
          {podcast?.apresentador_nome && (
            <p style={{ color: "#60a5fa", margin: 0, fontSize: "0.85rem" }}>
              {podcast.apresentador_nome}
            </p>
          )}
        </div>
        <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>
          Redirecionando para a Biblioteca...
        </p>

        {/* JS redirect — mais rápido que meta refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.location.replace("${destUrl}");`,
          }}
        />
      </body>
    </html>
  );
}
