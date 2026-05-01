import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, analyzeVideoWithGemini } from "@/lib/ai-provider";
import axios from "axios";

export const maxDuration = 300; 

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

    const JOURNO_GUIDELINES = `
    DIRETRIZES EDITORIAIS (NOSSA WEB TV):
    1. Você é um Jornalista Sênior.
    2. Escreva em PIRÂMIDE INVERTIDA (o mais importante no primeiro parágrafo).
    3. TÍTULO: Impactante e direto.
    4. SUBTÍTULO: Curto e informativo.
    5. CORPO: Use subtítulos (h2/h3) para organizar a leitura.
    6. TOM: Profissional, imparcial e ágil.
    7. FORMATO: Retorne obrigatoriamente um JSON puro.
    `;

    if (isVideo) {
      console.log(`[generate-news] Processando Vídeo Local com Gemini 2.5 Flash: ${videoUrl}`);
      
      let videoBuffer: Buffer;
      let mimeType = "video/mp4"; // Default
      
      try {
        const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        videoBuffer = Buffer.from(videoRes.data);
        const contentType = videoRes.headers['content-type'];
        if (typeof contentType === 'string') mimeType = contentType;
      } catch (err: any) {
        return NextResponse.json({ 
          error: `Falha ao acessar vídeo: ${err.message}` 
        }, { status: 500 });
      }

      const geminiPrompt = `${JOURNO_GUIDELINES}
      Assista ao vídeo e escreva uma matéria jornalística completa. 
      Retorne um JSON: {"titulo": "...", "subtitulo": "...", "conteudo": "...", "seo_tags": "...", "instagram_suggestion": "..."}
      O campo "conteudo" deve conter o corpo da matéria com tags HTML básicas (p, h2, strong).`;

      try {
        const result = await analyzeVideoWithGemini(videoBuffer, mimeType, geminiPrompt);
        responseText = result.text;
        provider = result.provider;
      } catch (err: any) {
        console.error("[generate-news] ERRO GEMINI VIDEO:", err.message);
        return NextResponse.json({ error: `Erro no Gemini: ${err.message}` }, { status: 500 });
      }
    }
    else {
      // Fluxo Normal (Links/Temas/Melhoria)
      let linkContext = "";
      if (linkUrl) {
        try {
          const response = await fetch(linkUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const html = await response.text();
          const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] || "";
          const bodyText = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "").replace(/<[^>]+>/g, " ").slice(0, 8000);
          linkContext = `FONTE EXTERNA (URL): ${linkUrl}\nDESCRIÇÃO: ${ogDesc}\n\nCONTEÚDO EXTRAÍDO: ${bodyText}`;
        } catch (e) {}
      }

      const isLink = !!linkUrl;
      const isRewrite = !!content;

      const systemContext = isLink
        ? `Aja como Jornalista Sênior. Baseie-se no link fornecido para criar uma matéria original.`
        : isRewrite
        ? `Aja como Editor Sênior. Melhore o texto abaixo mantendo o tom profissional e otimizando o SEO.`
        : `Aja como Jornalista Investigativo. Desenvolva uma matéria completa sobre o tema solicitado.`;

      const fullPrompt = `${JOURNO_GUIDELINES}
      ${systemContext}
      
      RETORNE JSON: {"titulo": "...", "subtitulo": "...", "conteudo": "...", "seo_tags": "...", "instagram_suggestion": "..."}
      
      ${isLink ? `CONTEXTO: ${linkContext}` : isRewrite ? `TEXTO ATUAL: ${content}` : `TEMA: ${prompt}`}
      
      ${guidelines ? `REQUISITOS ADICIONAIS: ${guidelines}` : ""}`;

      const result = await generateWithFallback(fullPrompt);
      responseText = result.text;
      provider = result.provider;
    }

    // Sanitização e Parse
    const cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "")
      .replace(/[^}]*$/, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      // Fallback para campos legados
      if (parsed.corpo_materia && !parsed.conteudo) parsed.conteudo = parsed.corpo_materia;
      return NextResponse.json({ ...parsed, _provider: provider });
    } catch (err) {
      console.error(`[generate-news] JSON Malformado:`, cleaned);
      return NextResponse.json({ error: "A IA gerou um formato inválido. Tente novamente." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[generate-news] Erro:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
