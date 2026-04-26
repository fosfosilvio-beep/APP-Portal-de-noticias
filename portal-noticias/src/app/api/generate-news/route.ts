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
      ? `Você é o Editor Auditor da IA NEWS. Sua tarefa é REESCREVER e APRIMORAR o texto fornecido.
Foque em: SEO Avançado, Correção Gramatical Impecável, Tom Jornalístico Profissional (Imparcial e Informativo) e prontidão para o Google News.`
      : `Você é o Agente IA NEWS, um Especialista em Jornalismo Profissional e SEO. Sua tarefa é gerar notícias completas, éticas e atraentes, otimizadas para ranqueamento no Google News.`;

    const userRequest = isRewrite
      ? `REESCREVA e OTIMIZE este texto jornalístico, mantendo a estrutura HTML se houver: "${content}"\n\nDIRETRIZES EXTRAS: ${guidelines || "Torne o texto mais profissional, melhore o fluxo e aplique técnicas de SEO sem perder a essência."}`
      : `Escreva uma matéria jornalística profunda e profissional sobre: ${prompt}`;

    const fullPrompt = `${systemContext}

Responda OBRIGATORIAMENTE com um JSON válido contendo EXATAMENTE estas 3 chaves: "titulo", "subtitulo" e "conteudo".

REGRAS CRÍTICAS DE ESTRUTURA (IA NEWS v2):
1. TÍTULO: Direto, impactante e com palavras-chave de SEO.
2. SUBTÍTULO: Uma linha fina que complementa o título com dados ou contexto.
3. CONTEÚDO (HTML):
   - Mínimo de 600 palavras.
   - Use <h2> para subtópicos internos.
   - Insira um box de resumo no início: <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 shadow-sm"><h3 class="font-black text-slate-900 mb-3">Principais Pontos</h3><ul class="list-disc pl-5 space-y-2 text-slate-700"><li>...</li></ul></div>
   - Use <mark> para destacar as 3 informações mais cruciais da matéria.
   - O tom deve ser imparcial, citando fontes (reais ou fictícias verossímeis se o tema for genérico).

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
