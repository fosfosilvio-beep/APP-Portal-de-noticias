import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { noticiaId } = await req.json();
    if (!noticiaId) {
      return NextResponse.json({ error: "noticiaId é obrigatório" }, { status: 400 });
    }

    // Usa a RPC atômica criada na migração
    const { error } = await supabase.rpc("incrementar_views", {
      p_noticia_id: noticiaId,
    });

    if (error) {
      console.error("[track-view] RPC error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
