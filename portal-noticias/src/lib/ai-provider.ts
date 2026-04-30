import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

export interface AIProviderResult {
  text: string;
  provider: "openrouter" | "gemini";
}

/**
 * Motor de IA para análise profunda de vídeo via Google AI File API.
 */
export async function analyzeVideo(
  filePath: string,
  mimeType: string,
  prompt: string
): Promise<AIProviderResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("GEMINI_API_KEY não configurada.");

  const fileManager = new GoogleAIFileManager(geminiKey);
  const genAI = new GoogleGenerativeAI(geminiKey);

  console.log(`[ai-provider] Fazendo upload do vídeo para Google AI File API...`);
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: "Vídeo para IA NEWS",
  });

  console.log(`[ai-provider] Arquivo enviado: ${uploadResult.file.uri}. Processando...`);

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResult.file.mimeType,
        fileUri: uploadResult.file.uri,
      },
    },
    { text: prompt },
  ]);

  const text = result.response.text();
  
  // Limpeza opcional do arquivo após processamento (o Google deleta após 48h automaticamente)
  // try { await fileManager.deleteFile(uploadResult.file.name); } catch (e) {}

  return { text, provider: "gemini" };
}

/**
 * Tenta gerar conteúdo via OpenRouter primeiro... (manter anterior se necessário ou simplificar)
 */
export async function generateWithFallback(
  prompt: string,
  openRouterModel = "openai/gpt-oss-20b:free"
): Promise<AIProviderResult> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openRouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://nossawebtv.com",
          "X-Title": "Nossa Web TV",
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? "";
        if (text) return { text, provider: "openrouter" };
      }
    } catch (err) {
      console.warn("[ai-provider] Fallback para Gemini ativo.");
    }
  }

  if (!geminiKey) throw new Error("Nenhum provedor de IA disponível.");

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return { text, provider: "gemini" };
}
