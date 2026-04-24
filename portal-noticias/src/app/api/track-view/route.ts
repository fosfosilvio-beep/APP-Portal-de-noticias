import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { createClient } from '@supabase/supabase-js';

const TrackViewSchema = z.object({
  noticiaId: z.string().uuid().optional(),
  storyId: z.string().uuid().optional(),
}).refine((data) => data.noticiaId || data.storyId, {
  message: 'noticiaId ou storyId e obrigatorio',
});

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  );

  try {
    const body = await req.json();
    const parsed = TrackViewSchema.parse(body);

    const { error } = await supabase.from('page_views').insert([
      {
        noticia_id: parsed.noticiaId || null,
        story_id: parsed.storyId || null,
      },
    ]);

    if (error) {
      console.error('[track-view] Insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
