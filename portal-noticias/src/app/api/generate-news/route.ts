import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, analyzeVideo } from "@/lib/ai-provider";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, content, guidelines, linkUrl, videoUrl } = await req.json();

    if (!prompt && !content && !linkUrl && !videoUrl) {
      return NextResponse.json(
        { error: "É necessário um prompt, conteúdo, link ou vídeo para processar." },
        { status: 400 }
      );
    }

    let linkContext = "";
    if (linkUrl) {
      try {
        console.log(`[generate-news] Processando link: ${linkUrl}`);
        const response = await fetch(linkUrl, { 
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'pt-BR,pt;q=0.9'
          } 
        });
        const html = await response.text();
        
        const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] ||
                       html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ||
                       html.match(/<title>([^<]*)<\/title>/i)?.[1];

        const bodyText = html
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        linkContext = `DESCRICAO OG: ${ogDesc || 'N/A'}\n\nCONTEUDO: ${bodyText.slice(0, 8000)}`;
      } catch (err) {
        console.error("[generate-news] Erro ao ler link:", err);
      }
    }

    const isVideo = !!videoUrl;
    const isLink = !!linkUrl;
    const isRewrite = !!content;

    const systemContext = isVideo
      ? `Você é o Agente de IA NEWS 2.0 com visão computacional. Sua tarefa é ASSISTIR e ANALISAR o vídeo fornecido.
         Extraia os factos, transcreva falas importantes e crie uma matéria jornalística completa para o portal Nossa Web TV.`
      : isLink
      ? `Você é um Jornalista Sênior do portal Nossa Web TV. 
         DIRETRIZ CRÍTICA: Extraia apenas os factos do link fornecido. Se não conseguir aceder ao conteúdo real (ex: cair em tela de login ou erro), responda APENAS e EXATAMENTE: [ERRO: CONTEÚDO INACESSÍVEL]. 
         Se conseguir, reescreva a matéria integralmente, mudando estrutura e tom para originalidade absoluta (Anti-Plágio).`
      : isRewrite
      ? `Você é o Editor Auditor da IA NEWS. Sua tarefa é REESCREVER e APRIMORAR o texto fornecido.
         Foque em: SEO Avançado, Correção Gramatical Impecável, Tom Jornalístico Profissional (Imparcial e Informativo) e prontidão para o Google News.`
      : `Você é o Agente IA NEWS, um Especialista em Jornalismo Profissional e SEO. Sua tarefa é gerar notícias completas, éticas e atraentes, otimizadas para ranqueamento no Google News.`;

    const userRequest = isVideo
      ? `Assista ao vídeo no link: "${videoUrl}". Crie uma matéria jornalística estruturada baseada no áudio e cenas do vídeo.`
      : isLink
      ? `Abaixo está o conteúdo extraído do link "${linkUrl}". Analise as informações e crie uma matéria original.\n\nCONTEÚDO EXTRAÍDO:\n${linkContext || "Não foi possível extrair o texto."}`
      : isRewrite
      ? `REESCREVA e OTIMIZE este texto jornalístico: "${content}"\n\nDIRETRIZES: ${guidelines || "Profissionalismo e SEO."}`
      : `Escreva sobre: ${prompt}`;

    const fullPrompt = `${systemContext}

Responda OBRIGATORIAMENTE com um JSON válido contendo EXATAMENTE estas 5 chaves: "titulo", "subtitulo", "conteudo", "seo_tags" e "instagram_suggestion".

REGRAS:
1. TÍTULO: Direto e SEO.
2. SUBTÍTULO: Lead impactante.
3. CONTEÚDO (HTML): Máximo 4500 chars. Use <h2>, <mark> e o box de resumo no início.
4. SEO_TAGS: 5-8 tags separadas por vírgula.
5. INSTAGRAM_SUGGESTION: Legenda criativa com hashtags.

${userRequest}`;

    let responseText = "";
    let provider = "";

    if (isVideo) {
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Falha ao baixar vídeo para análise.");
      const buffer = Buffer.from(await response.arrayBuffer());
      const tempFilePath = path.join(os.tmpdir(), `ai-video-${Date.now()}.mp4`);
      fs.writeFileSync(tempFilePath, buffer);
      
      const result = await analyzeVideo(tempFilePath, "video/mp4", fullPrompt);
      responseText = result.text;
      provider = result.provider;
      
      try { fs.unlinkSync(tempFilePath); } catch (e) {}
    } else {
      const result = await generateWithFallback(fullPrompt);
      responseText = result.text;
      provider = result.provider;
    }

    if (responseText.includes("[ERRO: CONTEÚDO INACESSÍVEL]")) {
      return NextResponse.json({ error: "O conteúdo deste link está inacessível." }, { status: 403 });
    }

    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "") // Remove qualquer texto antes do primeiro {
      .replace(/[^}]*$/, "") // Remove qualquer texto depois do último }
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove caracteres de controle
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (!parsed.titulo || !parsed.conteudo) throw new Error("JSON incompleto");
      return NextResponse.json({ ...parsed, _provider: provider });
    } catch (err) {
      console.error(`[generate-news] Falha no parse JSON (provider: ${provider}):`, cleaned);
      return NextResponse.json({ error: "Erro de estrutura da IA. Tente novamente." }, { status: 500 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    console.error("[generate-news] Erro geral:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
