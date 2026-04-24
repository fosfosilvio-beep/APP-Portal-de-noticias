import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const { prompt, content, guidelines } = await req.json();

    if (!prompt && !content) {
      return NextResponse.json(
        { error: "É necessário um prompt ou conteúdo para processar." },
        { status: 400 }
      );
    }

    // Define o modo: reescrita ou geração nova
    const isRewrite = !!content;

    const systemContext = isRewrite
      ? `Você é um Editor de Jornalismo Sênior. Sua tarefa é REESCREVER o texto fornecido pelo usuário.
Mantenha a essência jornalística, melhore o vocabulário e siga RIGOROSAMENTE as diretrizes extras fornecidas.`
      : `Você é um Editor de Jornalismo Profissional. Sua tarefa é gerar notícias completas e profissionais a partir de um tópico fornecido.`;

    const userRequest = isRewrite
      ? `REESCREVA este texto jornalístico: "${content}"\n\nDIRETRIZES EXTRAS: ${guidelines || "Torne o texto mais profissional e atraente, evitando plágio."}`
      : `Escreva uma matéria jornalística completa sobre o seguinte tópico: ${prompt}`;

    const fullPrompt = `${systemContext}

Responda OBRIGATORIAMENTE com um JSON válido contendo EXATAMENTE estas 3 chaves: "titulo", "subtitulo" e "conteudo".

REGRAS PARA O CAMPO "conteudo":
1. Formato HTML limpo, usando <p>, <h2>, <h3>.
2. No início do conteúdo, insira um box de resumo: <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 shadow-sm"><h3 class="font-black text-slate-900 mb-3">Resumo da Matéria</h3><ul class="list-disc pl-5 space-y-2 text-slate-700"><li>Ponto 1</li><li>Ponto 2</li><li>Ponto 3</li></ul></div>
3. Use a tag <mark> pelo menos 3 vezes para destacar trechos importantes.
4. Mínimo de 4 parágrafos de conteúdo jornalístico.

SOLICITAÇÃO DO USUÁRIO:
${userRequest}`;

    // ── Motor com fallback automático: OpenRouter → Gemini ──────────────────
    const { text: responseText, provider } = await generateWithFallback(fullPrompt);

    // Limpa possíveis resíduos de markdown e faz o parse
    const cleaned = responseText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error(`[generate-news] Falha no parse JSON (provider: ${provider}):`, responseText);
      return NextResponse.json(
        { error: "A IA retornou uma resposta em formato inesperado. Tente novamente." },
        { status: 500 }
      );
    }

    if (!parsed.titulo || !parsed.conteudo) {
      return NextResponse.json(
        { error: "Estrutura JSON inválida retornada pela IA." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ...parsed, _provider: provider });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    console.error("[generate-news] Erro geral:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
