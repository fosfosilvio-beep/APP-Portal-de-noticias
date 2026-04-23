import { createClient } from "@supabase/supabase-js";
import { getPublicUrl } from "@/components/FallbackImage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AmpNoticiaPage({ params }: { params: any }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  const { data: noticia } = await supabase
    .from("noticias")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!noticia) {
    return <h1>Notícia não encontrada.</h1>;
  }

  const coverImage = getPublicUrl(noticia.imagem_capa);

  return (
    <>
      {/* We need to inject the AMP scripts and styling using plain HTML conventions */}
      {/* Since Next.js App Router doesn't perfectly support valid AMP out of the box without Custom Document, we render an HTML string that is as close to valid AMP as possible, focusing primarily on extreme lightweight performance. */}
      
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif", lineHeight: "1.6" }}>
        <header style={{ borderBottom: "1px solid #eaeaea", paddingBottom: "10px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ background: "#000", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
              NOSSA WEB TV
            </span>
          </div>
        </header>

        <main>
          <span style={{ color: "#00AEE0", fontSize: "12px", textTransform: "uppercase", fontWeight: "bold" }}>
            {noticia.categoria}
          </span>
          <h1 style={{ fontSize: "28px", marginTop: "10px", marginBottom: "10px", fontWeight: "900", lineHeight: "1.2" }}>
            {noticia.titulo}
          </h1>
          <h2 style={{ fontSize: "18px", color: "#555", fontWeight: "normal", marginBottom: "20px" }}>
            {noticia.subtitulo}
          </h2>

          <div style={{ color: "#888", fontSize: "12px", marginBottom: "20px" }}>
            Publicado em: {new Date(noticia.created_at || noticia.data_publicacao).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </div>

          {coverImage && (
            <div style={{ marginBottom: "30px" }}>
              <img 
                src={coverImage} 
                alt={noticia.titulo} 
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            </div>
          )}

          <article 
            style={{ fontSize: "16px", color: "#333", wordBreak: "break-word" }}
            dangerouslySetInnerHTML={{ __html: noticia.conteudo || "" }} 
          />
        </main>

        <footer style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #eaeaea", textAlign: "center", fontSize: "12px", color: "#888" }}>
          <p>&copy; {new Date().getFullYear()} NOSSA WEB TV. Versão otimizada para leitura rápida.</p>
          <p><a href={`/noticia/${slug}`} style={{ color: "#00AEE0", textDecoration: "none" }}>Ver versão completa do site</a></p>
        </footer>
      </div>
    </>
  );
}
