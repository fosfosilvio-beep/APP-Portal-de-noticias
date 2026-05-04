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
  const cookieStore = cookies();
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

  try {
    const body = await req.json();
    const parsed = TrackViewSchema.parse(body);
    
    // 1. Identificar Usuário (se logado)
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. Capturar Geolocalização (Headers da Vercel)
    const cidade = req.headers.get('x-vercel-ip-city') || 'Desconhecido';
    const estado = req.headers.get('x-vercel-ip-country-region') || 'Desconhecido';
    const userAgent = req.headers.get('user-agent') || 'Desconhecido';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    // 3. Inserir Log Granular
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
        // 4. Atualizar Contador Atômico via RPC
        await supabase.rpc('update_news_view_count', { p_noticia_id: parsed.noticiaId });
      }
    }

    // Compatibilidade com a tabela antiga enquanto migra
    await supabase.from('page_views').insert([
      {
        noticia_id: parsed.noticiaId || null,
        story_id: parsed.storyId || null,
      },
    ]).catch(() => null);

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
