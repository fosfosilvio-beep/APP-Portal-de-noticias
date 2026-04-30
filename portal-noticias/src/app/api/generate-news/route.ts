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
      console.log(`[generate-news] Rastreio de Vídeo: ${videoUrl}`);
      
      // 1. Baixar o vídeo antecipadamente
      let videoBuffer: Buffer;
      try {
        console.log(`[generate-news] Iniciando download do Supabase...`);
        const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        videoBuffer = Buffer.from(videoRes.data);
        console.log(`[generate-news] Sucesso no download. Tamanho: ${videoBuffer.length} bytes`);
      } catch (err: any) {
        console.error(`[generate-news] ERRO NO ACESSO AO VÍDEO (Supabase):`, err.message);
        return NextResponse.json({ 
          error: `Falha ao baixar vídeo do Supabase: ${err.message}. Verifique se o bucket é público.` 
        }, { status: 500 });
      }

      const pegasusPrompt = `Você é um editor sênior da Nossa Web TV. Assista a este vídeo e escreva uma matéria jornalística completa. 
      Retorne obrigatoriamente um JSON puro com os campos: "titulo", "subtitulo" e "corpo_materia". 
      Use um tom profissional e informativo. Não inclua textos fora do JSON.`;

      try {
        // MOTOR EXCLUSIVO: Twelve Labs (Pegasus-1)
        console.log(`[generate-news] Processando via Twelve Labs Pegasus...`);
        provider = "twelve-labs-pegasus";
        
        const { indexId, version } = await twelveLabs.getOrCreateIndex("Portal_NossaWeb");
        const taskId = await twelveLabs.submitTaskDirect(indexId, videoBuffer, "noticia-video.mp4", version);
        const videoId = await twelveLabs.waitForTask(taskId, version);
        
        responseText = await twelveLabs.generateContent(videoId, pegasusPrompt, version);
        console.log(`[generate-news] Sucesso total na geração via Pegasus.`);
      } catch (err: any) {
        console.error("[generate-news] ERRO CRÍTICO TWELVE LABS:", err.message);
        return NextResponse.json({ 
          error: `Erro na Twelve Labs (Pegasus): ${err.message}. Verifique a API Key e o status do serviço.` 
        }, { status: 500 });
      }
    }
 else {
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
