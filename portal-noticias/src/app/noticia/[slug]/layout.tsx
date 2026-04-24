import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

// Build a Supabase client just for fetching metadata (read-only, public key is fine)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  params: any;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  const { data: noticia } = await supabase
    .from("noticias")
    .select("titulo, subtitulo, imagem_capa")
    .eq("slug", slug)
    .single();

  if (!noticia) {
    return {
      title: "Notícia não encontrada | Nossa Web TV",
    };
  }

  // Construct dynamic OG Image URL via our SocialSnap API
  const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nossawebtv.com.br";
  // Resolve URL pública da imagem: se já for http, usa direto; senão constrói via Supabase Storage
  const rawImage = noticia.imagem_capa || "";
  const bgImage = rawImage.startsWith("http")
    ? rawImage
    : rawImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${rawImage}`
    : "";
  
  // URL safe parameters
  const ogUrl = new URL(`${portalUrl}/api/og`);
  ogUrl.searchParams.set("title", noticia.titulo || "");
  if (bgImage) {
    ogUrl.searchParams.set("image", bgImage);
  }

  return {
    title: `${noticia.titulo} | Nossa Web TV`,
    description: noticia.subtitulo || "Leia na Nossa Web TV",
    openGraph: {
      title: noticia.titulo,
      description: noticia.subtitulo || "Leia na Nossa Web TV",
      url: `${portalUrl}/noticia/${slug}`,
      siteName: "Nossa Web TV",
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: noticia.titulo,
        },
      ],
      locale: "pt_BR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: noticia.titulo,
      description: noticia.subtitulo || "Leia na Nossa Web TV",
      images: [ogUrl.toString()],
    },
    alternates: {
      canonical: `${portalUrl}/noticia/${slug}`,
    },
    other: {
      "amphtml": `${portalUrl}/noticia/${slug}/amp`,
    },
  };
}

export default function NoticiaLayout({ children }: Props) {
  return <>{children}</>;
}
