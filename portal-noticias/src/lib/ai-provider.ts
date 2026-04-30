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

    // Ordem de tentativa para vídeo em v1beta: Pro Latest -> Pro 002 -> Flash Latest
    const videoModels = ["gemini-1.5-pro-latest", "gemini-1.5-pro-002", "gemini-1.5-flash-latest"];
    let lastError = null;

    for (const modelName of videoModels) {
      try {
        console.log(`[ai-provider] Tentando análise com ${modelName} (v1beta)...`);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
        
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
        lastError = err;
        if (err.message?.includes("404") || err.message?.includes("not found")) {
          console.warn(`[ai-provider] Modelo ${modelName} indisponível. Tentando próximo...`);
          continue;
        }
        break; // Se for outro erro (como quota), interrompe e joga para o catch externo
      }
    }
    throw lastError;
  } catch (err: any) {
    console.error("[ai-provider] Falha Crítica na File API (v1beta):", err);
    throw new Error(`IA Error (v1beta): ${err.message || "Falha na análise do vídeo"}`);
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
    // Tentamos aliases 'latest' para garantir compatibilidade em v1beta
    const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of models) {
      try {
        console.log(`[ai-provider] Tentando ${modelName} (v1beta)...`);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) return { text, provider: "gemini" };
      } catch (err: any) {
        if (err.message?.includes("429") || err.message?.includes("quota")) {
          console.warn(`[ai-provider] Limite atingido em ${modelName}.`);
          continue;
        }
        if (err.message?.includes("404") || err.message?.includes("not found")) {
          console.warn(`[ai-provider] Modelo ${modelName} não encontrado em v1beta. Pulando...`);
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
