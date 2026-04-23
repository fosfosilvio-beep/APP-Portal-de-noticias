import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { noticiaId, storyId } = await req.json();
    
    if (!noticiaId && !storyId) {
      return NextResponse.json({ error: "noticiaId ou storyId é obrigatório" }, { status: 400 });
    }

    // Apenas insere na tabela de logs. 
    // O gatilho 'tr_increment_views' no banco cuidará de incrementar o contador na tabela noticias ou web_stories.
    const { error } = await supabase.from("page_views").insert([
      { 
        noticia_id: noticiaId || null,
        story_id: storyId || null
      }
    ]);

    if (error) {
      console.error("[track-view] Insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
