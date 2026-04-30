import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo } from "@/lib/ai-provider";
import fs from "fs";
import path from "path";
import os from "os";

export const maxDuration = 60; // Aumenta o tempo para a IA "assistir" ao vídeo

export async function POST(req: NextRequest) {
  try {
    let videoUrl = "";
    let fileType = "video/mp4";
    let tempFilePath = "";

    // Tenta detectar se é um upload direto ou uma URL do Supabase
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("video") as File;
      if (!file) throw new Error("Nenhum arquivo de vídeo enviado.");
      
      const buffer = Buffer.from(await file.arrayBuffer());
      tempFilePath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.name}`);
      fs.writeFileSync(tempFilePath, buffer);
      fileType = file.type;
    } else {
      const body = await req.json();
      videoUrl = body.videoUrl;
      if (!videoUrl) throw new Error("Nenhum vídeo ou URL fornecido.");
    }

    // Se recebemos uma URL, precisamos baixar o arquivo para o disco temporário para a File API
    if (videoUrl && !tempFilePath) {
      console.log(`[API Video] Baixando vídeo da URL: ${videoUrl}`);
      const response = await fetch(videoUrl);
      if (!response.ok) throw new Error("Falha ao baixar vídeo da URL.");
      const buffer = Buffer.from(await response.arrayBuffer());
      tempFilePath = path.join(os.tmpdir(), `download-${Date.now()}.mp4`);
      fs.writeFileSync(tempFilePath, buffer);
    }

    const prompt = `Você é um Jornalista Sênior do portal Nossa Web TV. 
      ASSISTA a este vídeo local integralmente (imagens e áudio).
      CRIE uma matéria jornalística profunda, profissional e completa.
      REGRAS: 
      1. ORIGINALIDADE: Mude a estrutura e vocabulário para evitar plágio.
      2. Título chamativo e SEO.
      3. Subtítulo (Lead) impactante.
      4. Conteúdo fluido com parágrafos bem estruturados.
      Responda OBRIGATORIAMENTE com um JSON válido contendo EXATAMENTE estas 3 chaves: "titulo", "subtitulo" e "conteudo".
      Não inclua textos adicionais fora do JSON.`;

    const { text } = await analyzeVideo(tempFilePath, fileType, prompt);

    // Limpeza rigorosa do JSON
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove caracteres de controle
      .trim();

    // Remove o arquivo temporário
    try { fs.unlinkSync(tempFilePath); } catch (e) {}

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("[API Video] Falha no parse JSON:", cleaned);
      return NextResponse.json({ error: "Erro de estrutura JSON da IA." }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[API Video] Erro geral:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
