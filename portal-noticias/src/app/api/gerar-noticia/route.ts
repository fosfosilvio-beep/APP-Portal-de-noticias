import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt é obrigatório.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: config } = await supabase.from('configuracao_portal').select('openrouter_api_key').single();
    const apiKey = config?.openrouter_api_key || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        titulo: "Notícia Gerada por IA (Modo de Teste)",
        subtitulo: "Configure a OpenRouter API Key no painel 'Copiloto IA' ou ANTHROPIC_API_KEY no .env.local",
        conteudo: `(Esta é uma simulação gerada de forma offline pois a sua chave de API não foi detectada. Quando a chave for informada, o modelo escreverá de fato um texto embasado na sua ideia).\n\nSua ideia original foi: "${prompt}"`
      });
    }

    // Using OpenRouter standard endpoint (OpenAI compatible)
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://nossawebtv.com",
        "X-Title": "Nossa Web TV"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet:beta",
        messages: [
          {
            role: "system",
            content: "Você é um jornalista sério e profissional. Responda APENAS com um JSON contendo 'titulo', 'subtitulo' e 'conteudo' formatados em HTML se necessário (apenas <p>, <strong>, etc)."
          },
          {
            role: "user",
            content: `Crie uma notícia completa baseada nisso: ${prompt}`
          }
        ]
      })
    });

    const data = await res.json();
    const textContent = data.choices?.[0]?.message?.content || "";
    
    // Tratamento para extrair JSON
    const jsonStrMatch = textContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonStrMatch ? jsonStrMatch[0] : textContent;
    
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Erro na Geração de Notícia (OpenRouter):", error);
    return NextResponse.json({ error: error.message || 'Erro interno ao gerar notícia.' }, { status: 500 });
  }
}
