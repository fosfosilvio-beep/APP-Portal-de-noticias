import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Você é um Editor de Jornalismo Profissional.
Sua tarefa é gerar notícias completas a partir de um tópico fornecido pelo usuário.
Você deve responder OBRIGATORIAMENTE em formato JSON válido contendo exatamente as chaves: "titulo", "subtitulo" e "conteudo".

REGRAS PARA O CAMPO "conteudo":
1. Formato HTML: O conteúdo deve estar em HTML limpo, usando <p>, <h2>, <h3>, etc.
2. Box de Resumo (Obrigatório): No início do conteúdo, insira um bloco de resumo estilizado usando listas. Exemplo: <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 shadow-sm"><h3 class="font-black text-slate-900 mb-3">Resumo da Matéria</h3><ul class="list-disc pl-5 space-y-2 text-slate-700"><li>Ponto 1</li><li>Ponto 2</li></ul></div>
3. Marcador Animado (UX Obrigatório): Destaque as partes cruciais do texto usando a tag <mark>. Nossa aplicação usa essa tag para um efeito visual de rolagem suave na cor #00AEE0. Exemplo: <mark>Esta é a informação mais importante do parágrafo.</mark>. Use <mark> pelo menos 3 vezes no texto.`
          },
          {
            role: "user",
            content: `Escreva uma matéria jornalística sobre o seguinte tópico: ${prompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter API Error:", err);
      return NextResponse.json({ error: "Erro na API externa de IA." }, { status: response.status });
    }

    const data = await response.json();
    let contentText = data.choices[0].message.content;

    try {
      // Limpeza de possíveis formatações markdown e tentativa de parse
      contentText = contentText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsedData = JSON.parse(contentText);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse JSON from AI. Raw response:", contentText);
      return NextResponse.json({ error: "A IA gerou uma resposta inválida que não pôde ser lida." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Generate News Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
  }
}
