import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, analyzeVideo } from "@/lib/ai-provider";
import { twelveLabs } from "@/lib/twelve-labs";
import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";

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

    if (isVideo) {
      console.log(`[generate-news] Fluxo de Vídeo ativado: ${videoUrl}`);
      
      // 1. Baixar o vídeo antecipadamente (usado tanto por Twelve Labs quanto por Fallback Gemini)
      let videoBuffer: Buffer;
      try {
        console.log(`[generate-news] Baixando vídeo para buffer...`);
        const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        videoBuffer = Buffer.from(videoRes.data);
      } catch (err: any) {
        return NextResponse.json({ error: `Falha ao acessar o vídeo: ${err.message}` }, { status: 500 });
      }

      const pegasusPrompt = `Você é um editor sênior da Nossa Web TV. Assista a este vídeo e escreva uma matéria jornalística completa. 
      Retorne obrigatoriamente um JSON puro com os campos: "titulo", "subtitulo" e "corpo_materia". 
      Use um tom profissional e informativo. Não inclua textos fora do JSON.`;

      try {
        // TENTATIVA 1: Twelve Labs (Especialista em Vídeo)
        provider = "twelve-labs-pegasus";
        const { indexId, version } = await twelveLabs.getOrCreateIndex("Portal_NossaWeb");
        const taskId = await twelveLabs.submitTaskDirect(indexId, videoBuffer, "noticia-video.mp4", version);
        const videoId = await twelveLabs.waitForTask(taskId, version);
        responseText = await twelveLabs.generateContent(videoId, pegasusPrompt, version);
      } catch (err: any) {
        console.error("[generate-news] Twelve Labs falhou, ativando Fallback Gemini Multimodal...", err.message);
        
        // TENTATIVA 2: Gemini 1.5 (Análise Multimodal Nativa)
        const tempPath = path.join(os.tmpdir(), `temp-video-${Date.now()}.mp4`);
        try {
          fs.writeFileSync(tempPath, videoBuffer);
          const result = await analyzeVideo(tempPath, "video/mp4", pegasusPrompt);
          responseText = result.text;
          provider = `gemini-multimodal-fallback`;
        } catch (fallbackErr: any) {
          console.error("[generate-news] Falha total no processamento de vídeo:", fallbackErr.message);
          return NextResponse.json({ 
            error: `Não foi possível analisar o vídeo. (Erro: ${err.message})` 
          }, { status: 500 });
        } finally {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      }
    } else {
      // Fluxo Normal (Links/Temas)
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
        ? `Você é um Jornalista Sênior do portal Nossa Web TV. Extraia os factos e crie uma matéria jornalística original e impactante.`
        : isRewrite
        ? `Você é o Editor Auditor da IA NEWS. Re-escreva e otimize o texto para máxima clareza e SEO.`
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
