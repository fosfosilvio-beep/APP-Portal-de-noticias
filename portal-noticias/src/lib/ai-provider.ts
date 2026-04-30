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

  console.log(`[ai-provider] Ingestão File API: ${filePath} (${mimeType})`);
  
  try {
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: "Análise Multimodal IA NEWS",
    });

    console.log(`[ai-provider] Vídeo carregado: ${uploadResult.file.uri}. Analisando com 1.5 Flash...`);

    // Usamos gemini-1.5-flash para velocidade e eficiência multimodal
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: 'v1' }
    );
    
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
    return { text, provider: "gemini" };
  } catch (err: any) {
    console.error("[ai-provider] Falha Crítica na File API/Gemini:", err);
    throw new Error(`IA Error (File API): ${err.message || "Falha na comunicação com o modelo 1.5 Flash"}`);
  }
}

/**
 * Tenta gerar conteúdo com cascata de resiliência.
 */
export async function generateWithFallback(
  prompt: string,
  openRouterModel = "openai/gpt-oss-20b:free"
): Promise<AIProviderResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    // Ordem de preferência: 1.5 Flash (veloz) -> 1.5 Pro (denso)
    const models = ["gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of models) {
      try {
        console.log(`[ai-provider] Tentando ${modelName} (v1)...`);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) return { text, provider: "gemini" };
      } catch (err: any) {
        if (err.message?.includes("429") || err.message?.includes("quota")) {
          console.warn(`[ai-provider] Limite atingido em ${modelName}.`);
          continue;
        }
      }
    }
  }

  // 2. TENTATIVA COM OPENROUTER (FALLBACK EXTERNO)
  if (openRouterKey) {
    try {
      console.log(`[ai-provider] Tentando OpenRouter (${openRouterModel})...`);
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
        
        // Limpeza rigorosa e multi-camadas do JSON
        const cleaned = text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .replace(/^[^{]*/, "") // Remove qualquer texto antes do primeiro {
          .replace(/[^}]*$/, "") // Remove qualquer texto depois do último }
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove caracteres de controle
          .trim();
          
        if (cleaned) return { text: cleaned, provider: "openrouter" };
      }
    } catch (err) {
    }
  }

  if (!geminiKey) throw new Error("Nenhum provedor de IA disponível.");

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return { text, provider: "gemini" };
}
