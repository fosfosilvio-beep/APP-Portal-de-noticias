import { NextRequest, NextResponse } from "next/server";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

/**
 * Este endpoint agora APENAS cria a entrada do vídeo no Bunny Stream.
 * O upload real (binário) deve ser feito DIRETAMENTE pelo frontend
 * para evitar limites de payload da Vercel (Error 413).
 */
export async function POST(req: NextRequest) {
  try {
    if (!BUNNY_API_KEY || !LIBRARY_ID) {
      return NextResponse.json({ error: "Configuração do Bunny Stream ausente no servidor." }, { status: 500 });
    }

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Título do vídeo é obrigatório." }, { status: 400 });
    }

    // 1. Criar entrada de vídeo no Bunny Stream
    const createResponse = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
      method: "POST",
      headers: {
        "AccessKey": BUNNY_API_KEY,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({ title })
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error("[Bunny] Error creating video:", errorData);
      return NextResponse.json({ error: "Erro ao criar vídeo no Bunny Stream." }, { status: createResponse.status });
    }

    const { guid: videoId } = await createResponse.json();

    return NextResponse.json({ 
      success: true, 
      videoId, 
      libraryId: LIBRARY_ID,
      accessKey: BUNNY_API_KEY // Enviando a chave para o frontend realizar o PUT direto.
    });

  } catch (error: any) {
    console.error("[Create Video API Error]:", error);
    return NextResponse.json({ error: error.message || "Erro interno no servidor." }, { status: 500 });
  }
}
