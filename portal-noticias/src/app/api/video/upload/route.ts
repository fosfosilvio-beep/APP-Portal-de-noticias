import { NextRequest, NextResponse } from "next/server";

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;

export async function POST(req: NextRequest) {
  try {
    if (!BUNNY_API_KEY || !LIBRARY_ID) {
      return NextResponse.json({ error: "Configuração do Bunny Stream ausente no servidor." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string || file.name;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
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

    // 2. Upload do arquivo binário
    const arrayBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`, {
      method: "PUT",
      headers: {
        "AccessKey": BUNNY_API_KEY,
        "Content-Type": "application/octet-stream"
      },
      body: Buffer.from(arrayBuffer)
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error("[Bunny] Error uploading video:", errorData);
      return NextResponse.json({ error: "Erro ao enviar arquivo para o Bunny Stream." }, { status: uploadResponse.status });
    }

    // Retorna a URL de embed padrão
    const embedUrl = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`;

    return NextResponse.json({ 
      success: true, 
      videoId, 
      embedUrl 
    });

  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json({ error: error.message || "Erro interno no servidor." }, { status: 500 });
  }
}

// Aumentar o limite do corpo da requisição (Vercel/Next.js)
export const config = {
  api: {
    bodyParser: false, // Desabilitar o bodyParser padrão para lidar com FormData/Stream
  },
};
