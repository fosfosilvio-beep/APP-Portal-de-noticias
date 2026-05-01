import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { twelveLabs } from "./twelve-labs";

export interface AIProviderResult {
  text: string;
  provider: "openrouter" | "gemini" | "twelve-labs-pegasus";
}

/**
 * Motor de IA para análise profunda de vídeo via Gemini 2.5 Flash (v1beta).
 * Recomendado por ser mais rápido e eficiente para vídeos curtos.
 */
export async function analyzeVideoWithGemini(
  videoBuffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<AIProviderResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error("GEMINI_API_KEY não configurada.");

  console.log(`[ai-provider] Analisando vídeo com Gemini 2.5 Flash (v1beta)...`);

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    // Usamos v1beta para suporte a fileData e processamento multimodal avançado
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1beta" });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: videoBuffer.toString("base64"),
          mimeType: mimeType
        }
      }
    ]);

    const text = result.response.text();
    return { text, provider: "gemini" };
  } catch (err: any) {
    console.error("[ai-provider] Erro Gemini Video:", err);
    throw new Error(`Gemini Video Error: ${err.message}`);
  }
}

/**
 * Motor de IA para análise profunda de vídeo via Twelve Labs (Pegasus-1).
 */
export async function analyzeVideo(
  filePath: string,
  mimeType: string,
  prompt: string
): Promise<AIProviderResult> {
  console.log(`[ai-provider] Análise Profunda (Twelve Labs Pegasus): ${filePath}`);
  
  try {
    const videoBuffer = fs.readFileSync(filePath);
    const { indexId, version } = await twelveLabs.getOrCreateIndex("Portal_NossaWeb");
    const taskId = await twelveLabs.submitTaskDirect(indexId, videoBuffer, "analise-video.mp4", version);
    const videoId = await twelveLabs.waitForTask(taskId, version);
    const text = await twelveLabs.generateContent(videoId, prompt, version);
    
    return { 
      text: typeof text === 'string' ? text : JSON.stringify(text), 
      provider: "twelve-labs-pegasus"
    };
  } catch (err: any) {
    console.error("[ai-provider] Falha Crítica Twelve Labs:", err);
    throw new Error(`Twelve Labs Error: ${err.message || "Falha na análise do vídeo"}`);
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
    const configurations = [
      { model: "gemini-2.5-flash", version: "v1beta" },
      { model: "gemini-2.5-pro", version: "v1beta" },
      { model: "gemini-1.5-pro-latest", version: "v1" },
      { model: "gemini-1.5-flash", version: "v1" }
    ];
    
    for (const config of configurations) {
      try {
        console.log(`[ai-provider] Tentando ${config.model} (${config.version})...`);
        const model = genAI.getGenerativeModel({ model: config.model }, { apiVersion: config.version as any });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) return { text, provider: "gemini" };
      } catch (err: any) {
        console.warn(`[ai-provider] Falha em ${config.model} (${config.version}): ${err.message}`);
        if (err.message?.includes("429") || err.message?.includes("quota")) continue;
        if (err.message?.includes("404") || err.message?.includes("not found")) continue;
      }
    }
  }

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
        const cleaned = text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .replace(/^[^{]*/, "")
          .replace(/[^}]*$/, "")
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .trim();
          
        if (cleaned) return { text: cleaned, provider: "openrouter" };
      }
    } catch (err) {}
  }

  if (!geminiKey) throw new Error("Nenhum provedor de IA disponível.");

  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1beta" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return { text, provider: "gemini" };
}

