import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teste Bot Facebook - Nossa Web TV",
  description: "Página estática isolada para testar o crawler do Facebook.",
  openGraph: {
    title: "Teste Bot Facebook - Nossa Web TV",
    description: "Página estática isolada para testar o crawler do Facebook.",
    url: "https://www.nossawebtv.com.br/teste-bot",
    images: [
      {
        url: "https://www.nossawebtv.com.br/logo-og.png",
        width: 1200,
        height: 630,
        alt: "Nossa Web TV",
      },
    ],
    type: "article",
    siteName: "Nossa Web TV",
    locale: "pt_BR",
  },
  other: {
    "fb:app_id": "1316826297252495",
  },
};

export default function TesteBotPage() {
  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Página de Teste Estática (Prova Real)</h1>
      <p>Se o Facebook ler esta página com sucesso (Status 200), significa que o erro 403 nas notícias oficiais está sendo causado pelo fetch do Supabase rejeitando o crawler durante o Server-Side Rendering (SSR).</p>
    </div>
  );
}
