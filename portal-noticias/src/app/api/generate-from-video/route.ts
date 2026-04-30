import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo } from "@/lib/ai-provider";
import fs from "fs";
import path from "path";
import os from "os";

export const config = {
  api: {
    bodyParser: false, // Necessário para multipart/form-data
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo de vídeo enviado." }, { status: 400 });
    }

    // Salva temporariamente no disco para o Google AI File Manager
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${file.name}`);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[API Video] Arquivo salvo temporariamente em: ${tempFilePath}`);

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

    const { text } = await analyzeVideo(tempFilePath, file.type, prompt);

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
