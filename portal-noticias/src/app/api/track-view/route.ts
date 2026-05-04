import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const TrackViewSchema = z.object({
  noticiaId: z.string().uuid().optional(),
  storyId: z.string().uuid().optional(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
}).refine((data) => data.noticiaId || data.storyId, {
  message: 'noticiaId ou storyId e obrigatorio',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TrackViewSchema.parse(body);
    
    // Identificar Usuário (se logado)
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
    
    // Capturar Geolocalização (Prioridade: Payload > Headers Vercel)
    const cidadeRaw = parsed.location?.city || req.headers.get('x-vercel-ip-city');
    const estadoRaw = parsed.location?.region || req.headers.get('x-vercel-ip-country-region');
    
    const cidade = cidadeRaw ? decodeURIComponent(cidadeRaw) : 'Localização não identificada';
    const estado = estadoRaw || 'Localização não identificada';
    
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
          cidade: cidade,
          estado: estado,
          ip_address: ip,
          user_agent: userAgent,
        },
      ]);

      if (logError) {
        console.error('[track-view] Log error:', logError.message);
      } else {
        // Sincronização Total: Atualizar Contador Atômico na tabela noticias
        await supabase.rpc('update_news_view_count', { p_noticia_id: parsed.noticiaId });
      }
    }

    // Compatibilidade Legada
    try {
      await supabase.from('page_views').insert([
        {
          noticia_id: parsed.noticiaId || null,
          story_id: parsed.storyId || null,
        },
      ]);
    } catch (e) {}

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
