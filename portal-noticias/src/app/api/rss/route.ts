import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Cache robusto de 30 minutos na Edge da Vercel para não bater no G1 repetidamente
export const revalidate = 1800;

export async function GET() {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'mediaContent', { keepArray: false }], 
        ],
      }
    });
    
    // Alvo: Feed Central de Plantão do G1
    const feed = await parser.parseURL('https://g1.globo.com/rss/g1/');

    // Extrai e Sanitiza apenas as 5 Últimas Manchetes
    const ultimasNoticias = feed.items.slice(0, 5).map(item => {
      
      let proxyImage = null;
      
      // O G1 manda imagem de formas diferentes (As vezes em media:content, as vezes enfiada no HTML da decription)
      const extendedItem = item as any;

      if (extendedItem.mediaContent && extendedItem.mediaContent['$'] && extendedItem.mediaContent['$'].url) {
        proxyImage = extendedItem.mediaContent['$'].url;
      } else if (item.content) {
         const imgRegex = /<img[^>]+src="([^">]+)"/g;
         const match = imgRegex.exec(item.content);
         if (match) proxyImage = match[1];
      }

      return {
        id: item.guid || item.link,
        titulo: item.title || "Plantão de Última Hora",
        link: item.link || "https://g1.globo.com",
        data: item.pubDate || new Date().toISOString(),
        imagem: proxyImage 
      };
    });

    return NextResponse.json(ultimasNoticias);
  } catch (err: any) {
    return NextResponse.json({ error: "Falha ao consultar RSS: " + err.message }, { status: 500 });
  }
}
