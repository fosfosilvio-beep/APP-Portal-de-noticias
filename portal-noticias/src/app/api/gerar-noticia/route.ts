import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai-provider';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório.' }, { status: 400 });
    }

    const fullPrompt = `Você é um jornalista sério e profissional. Responda APENAS com um JSON contendo 'titulo', 'subtitulo' e 'conteudo' formatados em HTML se necessário (apenas <p>, <strong>, etc).

Crie uma notícia completa baseada nisso: ${prompt}`;

    // ── Motor com fallback automático: OpenRouter → Gemini ──────────────────
    const { text: textContent, provider } = await generateWithFallback(fullPrompt);

    // Extrai o bloco JSON da resposta
    const jsonStrMatch = textContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonStrMatch ? jsonStrMatch[0] : textContent;

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error(`[gerar-noticia] Falha no parse JSON (provider: ${provider}):`, textContent);
      return NextResponse.json(
        { error: 'A IA retornou uma resposta em formato inesperado. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...parsed, _provider: provider });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno ao gerar notícia.';
    console.error('[gerar-noticia] Erro:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
