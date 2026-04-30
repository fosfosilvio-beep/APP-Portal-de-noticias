import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const { prompt, content, guidelines, linkUrl } = await req.json();

    if (!prompt && !content && !linkUrl) {
      return NextResponse.json(
        { error: "É necessário um prompt, conteúdo ou link para processar." },
        { status: 400 }
      );
    }

    let linkContext = "";
    if (linkUrl) {
      try {
        console.log(`[generate-news] Processando link: ${linkUrl}`);
        const response = await fetch(linkUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await response.text();
        
        // Limpeza básica de HTML para extrair texto
        // Remove scripts, styles e tags, mantendo o texto bruto
        linkContext = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 15000); // Limita para não estourar o contexto da IA
          
        console.log(`[generate-news] Conteúdo do link extraído (${linkContext.length} chars)`);
      } catch (err) {
        console.error("[generate-news] Erro ao ler link:", err);
        // Prossegue mesmo com erro, a IA pode tentar usar o conhecimento geral se a URL for famosa
      }
    }

    // Define o modo: reescrita, link ou geração nova
    const isLink = !!linkUrl;
    const isRewrite = !!content;

    const systemContext = isLink
      ? `Você é um Jornalista Sênior do portal Nossa Web TV. Sua tarefa é ler a matéria externa fornecida e REESCREVÊ-LA INTEGRALMENTE.
         REGRAS DE OURO:
         1. ORIGINALIDADE ABSOLUTA: Mude a estrutura, o vocabulário e a ordem dos parágrafos para evitar plágio.
         2. FIDELIDADE AOS FATOS: Mantenha todos os dados e fatos reais da matéria original.
         3. TOM EDITORIAL: Use um tom profissional, fluido e informativo, adequado para o público da Nossa Web TV.
         4. FORMATAÇÃO: Crie um título chamativo, um lead (subtítulo) impactante e um corpo organizado.`
      : isRewrite
      ? `Você é o Editor Auditor da IA NEWS. Sua tarefa é REESCREVER e APRIMORAR o texto fornecido.
         Foque em: SEO Avançado, Correção Gramatical Impecável, Tom Jornalístico Profissional (Imparcial e Informativo) e prontidão para o Google News.`
      : `Você é o Agente IA NEWS, um Especialista em Jornalismo Profissional e SEO. Sua tarefa é gerar notícias completas, éticas e atraentes, otimizadas para ranqueamento no Google News.`;

    const userRequest = isLink
      ? `Abaixo está o conteúdo extraído do link "${linkUrl}". Analise as informações e crie uma matéria completa.\n\nCONTEÚDO BRUTO:\n${linkContext || "Não foi possível extrair o texto diretamente, tente usar seu conhecimento sobre este link ou o título se disponível."}`
      : isRewrite
      ? `REESCREVA e OTIMIZE este texto jornalístico, mantendo a estrutura HTML se houver: "${content}"\n\nDIRETRIZES EXTRAS: ${guidelines || "Torne o texto mais profissional, melhore o fluxo e aplique técnicas de SEO sem perder a essência."}`
      : `Escreva uma matéria jornalística profunda e profissional sobre: ${prompt}`;

    const fullPrompt = `${systemContext}

Responda OBRIGATORIAMENTE com um JSON válido contendo EXATAMENTE estas 5 chaves: "titulo", "subtitulo", "conteudo", "seo_tags" e "instagram_suggestion".

REGRAS CRÍTICAS DE ESTRUTURA (IA NEWS v2):
1. TÍTULO: Direto, impactante e com palavras-chave de SEO.
2. SUBTÍTULO: Uma linha fina que complementa o título com dados ou contexto.
3. CONTEÚDO (HTML):
   - LIMITE: Nunca ultrapasse 4500 caracteres totais. Seja objetivo e conciso.
   - Use <h2> para subtópicos internos.
   - Insira um box de resumo no início: <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 shadow-sm"><h3 class="font-black text-slate-900 mb-3">Principais Pontos</h3><ul class="list-disc pl-5 space-y-2 text-slate-700"><li>...</li></ul></div>
   - Use <mark> para destacar as 3 informações mais cruciais da matéria.
   - O tom deve ser imparcial e profissional.
4. SEO_TAGS: Lista de 5 a 8 palavras-chave separadas por vírgula.
5. INSTAGRAM_SUGGESTION: Uma sugestão de legenda curta e criativa para o Instagram, incluindo hashtags relevantes e uma ideia de imagem.

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
