import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nossawebtv.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${BASE_URL}/anuncie`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/videos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // 1. Fetch latest published news
    const { data: noticias } = await supabase
      .from('noticias')
      .select('slug, updated_at, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (noticias) {
      noticias.forEach((noticia) => {
        routes.push({
          url: `${BASE_URL}/noticia/${noticia.slug}`,
          lastModified: new Date(noticia.updated_at || noticia.created_at),
          changeFrequency: 'hourly',
          priority: 0.9,
        });
      });
    }

    // 2. Fetch categories (unique categories from noticias)
    const { data: categorias } = await supabase
      .from('noticias')
      .select('categoria')
      .eq('status', 'published');
      
    if (categorias) {
      const uniqueCats = Array.from(new Set(categorias.map((c: any) => c.categoria).filter(Boolean)));
      uniqueCats.forEach((cat) => {
        routes.push({
          url: `${BASE_URL}/${cat.toLowerCase().replace(/\s+/g, '-')}`,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    }

    // 3. Fetch Edições Digitais
    const { data: edicoes } = await supabase
      .from('edicoes_digitais')
      .select('id, updated_at, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100);

    if (edicoes) {
      edicoes.forEach((edicao) => {
        routes.push({
          url: `${BASE_URL}/edicoes-digitais/${edicao.id}`,
          lastModified: new Date(edicao.updated_at || edicao.created_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }

  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
