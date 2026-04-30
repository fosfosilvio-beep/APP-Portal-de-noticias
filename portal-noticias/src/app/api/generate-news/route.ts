import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai-provider";
import { twelveLabs } from "@/lib/twelve-labs";

export const maxDuration = 120; // Twelve Labs precisa de tempo para indexar

export async function POST(req: NextRequest) {
  try {
    const { prompt, content, guidelines, linkUrl, videoUrl } = await req.json();

    if (!prompt && !content && !linkUrl && !videoUrl) {
      return NextResponse.json(
        { error: "É necessário um prompt, conteúdo, link ou vídeo para processar." },
        { status: 400 }
      );
    }

    const isVideo = !!videoUrl;
    let responseText = "";
    let provider = "";

    if (isVideo) {
      console.log(`[generate-news] Iniciando Twelve Labs para: ${videoUrl}`);
      provider = "twelve-labs-pegasus";
      
      try {
        const indexId = await twelveLabs.getOrCreateIndex();
        const taskId = await twelveLabs.submitTask(indexId, videoUrl);
        const videoId = await twelveLabs.waitForTask(taskId);
        
        const pegasusPrompt = `Você é um editor sênior da Nossa Web TV. Assista a este vídeo e escreva uma matéria jornalística completa. 
        Retorne obrigatoriamente um JSON puro com os campos: "titulo", "subtitulo" e "corpo_materia". 
        Use um tom profissional e informativo. Não inclua textos fora do JSON.`;

        responseText = await twelveLabs.generateContent(videoId, pegasusPrompt);
      } catch (err: any) {
        console.error("[TwelveLabs] Falha no fluxo:", err.message);
        return NextResponse.json({ error: "Falha na análise Twelve Labs: " + err.message }, { status: 500 });
      }
    } else {
      let linkContext = "";
      if (linkUrl) {
        try {
          const response = await fetch(linkUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const html = await response.text();
          const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] || "";
          const bodyText = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "").replace(/<[^>]+>/g, " ").slice(0, 8000);
          linkContext = `DESCRICAO OG: ${ogDesc}\n\nCONTEUDO: ${bodyText}`;
        } catch (e) {}
      }

      const isLink = !!linkUrl;
      const isRewrite = !!content;

      const systemContext = isLink
        ? `Você é um Jornalista Sênior do portal Nossa Web TV. Extraia os factos e crie uma matéria original.`
        : isRewrite
        ? `Você é o Editor Auditor da IA NEWS. Re-escreva e otimize o texto.`
        : `Você é o Agente IA NEWS, especialista em Jornalismo e SEO.`;

      const fullPrompt = `${systemContext}
      Responda com JSON: {"titulo": "...", "subtitulo": "...", "conteudo": "...", "seo_tags": "...", "instagram_suggestion": "..."}
      
      ${isLink ? `Conteúdo extraído: ${linkContext}` : isRewrite ? `Texto: ${content}` : `Tema: ${prompt}`}`;

      const result = await generateWithFallback(fullPrompt);
      responseText = result.text;
      provider = result.provider;
    }

    // Sanitização Universal
    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.corpo_materia) parsed.conteudo = parsed.corpo_materia;
      return NextResponse.json({ ...parsed, _provider: provider });
    } catch (err) {
      console.error(`[generate-news] Falha no parse JSON (${provider}):`, cleaned);
      return NextResponse.json({ error: "A IA retornou um formato inválido." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[generate-news] Erro geral:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
