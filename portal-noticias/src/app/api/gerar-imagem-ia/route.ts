import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt é necessário" }, { status: 400 });
    }

    // Otimização do Prompt para Estilo Jornalístico / DALL-E
    const optimizedPrompt = encodeURIComponent(
      `Professional journalistic photography, news banner style, high resolution, 8k, related to: ${prompt}. Cinematic lighting, documentary style.`
    );

    // Usando Pollinations.ai para geração rápida e gratuita de alta qualidade
    // Formato: https://image.pollinations.ai/prompt/{prompt}?width=1280&height=720&nologo=true
    const imageUrl = `https://image.pollinations.ai/prompt/${optimizedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    // Simulamos um pequeno delay para a sensação de "IA processando" conforme pedido pelo usuário
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
