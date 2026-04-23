import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  // Service Role Key is used here to bypass RLS since anonymous users can't UPDATE
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  try {
    const { enqueteId, opcaoId } = await req.json();

    if (!enqueteId || !opcaoId) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    // 1. Fetch current enquete
    const { data: enquete, error: fetchError } = await supabase
      .from("enquetes")
      .select("opcoes")
      .eq("id", enqueteId)
      .single();

    if (fetchError || !enquete) {
      return NextResponse.json({ error: "Enquete não encontrada" }, { status: 404 });
    }

    // 2. Increment the vote safely
    const newOpcoes = enquete.opcoes.map((op: any) => {
      if (op.id === opcaoId) {
        return { ...op, votos: (op.votos || 0) + 1 };
      }
      return op;
    });

    // 3. Update the DB
    const { error: updateError } = await supabase
      .from("enquetes")
      .update({ opcoes: newOpcoes })
      .eq("id", enqueteId);

    if (updateError) {
      return NextResponse.json({ error: "Falha ao registrar voto" }, { status: 500 });
    }

    return NextResponse.json({ success: true, opcoes: newOpcoes });
  } catch (error: any) {
    console.error("[Enquetes Vote Error]:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
