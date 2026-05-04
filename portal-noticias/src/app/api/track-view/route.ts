import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const TrackViewSchema = z.object({
  noticiaId: z.string().uuid().optional(),
  storyId: z.string().uuid().optional(),
  // Opcionais passados pelo cliente se ele já tiver os dados
  userName: z.string().optional(),
  userEmail: z.string().optional(),
}).refine((data) => data.noticiaId || data.storyId, {
  message: 'noticiaId ou storyId e obrigatorio',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TrackViewSchema.parse(body);
    
    // Identificar Usuário (se logado) - cookies() é async no Next.js 15+
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    // Capturar Geolocalização (Headers da Vercel)
    const cidade = req.headers.get('x-vercel-ip-city') || 'Desconhecido';
    const estado = req.headers.get('x-vercel-ip-country-region') || 'Desconhecido';
    const userAgent = req.headers.get('user-agent') || 'Desconhecido';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // Inserir Log Granular
    if (parsed.noticiaId) {
      const { error: logError } = await supabase.from('noticia_logs').insert([
        {
          noticia_id: parsed.noticiaId,
          user_id: user?.id || null,
          nome_usuario: user?.user_metadata?.full_name || user?.user_metadata?.name || parsed.userName || 'Anônimo',
          email_usuario: user?.email || parsed.userEmail || null,
          cidade: decodeURIComponent(cidade),
          estado: estado,
          ip_address: ip,
          user_agent: userAgent,
        },
      ]);

      if (logError) {
        console.error('[track-view] Log error:', logError.message);
      } else {
        // Atualizar Contador Atômico via RPC
        // IMPORTANTE: p_noticia_id deve corresponder ao nome do parâmetro na função SQL
        await supabase.rpc('update_news_view_count', { p_noticia_id: parsed.noticiaId });
      }
    }

    // Compatibilidade com a tabela antiga enquanto migra
    try {
      await supabase.from('page_views').insert([
        {
          noticia_id: parsed.noticiaId || null,
          story_id: parsed.storyId || null,
        },
      ]);
    } catch (e) {
      // Ignorar erros na tabela legada
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }
    const error = err as Error;
    console.error('[track-view] Exception:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
