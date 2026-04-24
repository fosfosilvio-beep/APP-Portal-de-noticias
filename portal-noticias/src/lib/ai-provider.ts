/**
 * [LIB] ai-provider.ts
 * Motor de IA centralizado com fallback automático:
 *   1ª tentativa → OpenRouter (modelo configurável)
 *   2ª tentativa (fallback) → Google Gemini 2.0 Flash
 *
 * Responsabilidade única: receber um prompt e retornar o texto bruto da IA,
 * independente de qual provedor foi utilizado.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIProviderResult {
  text: string;
  provider: "openrouter" | "gemini";
}

/**
 * Tenta gerar conteúdo via OpenRouter primeiro.
 * Em caso de falha (erro de rede, quota, chave inválida etc.),
 * cai automaticamente para o Google Gemini.
 */
export async function generateWithFallback(
  prompt: string,
  openRouterModel = "anthropic/claude-3.5-sonnet:beta"
): Promise<AIProviderResult> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // ─── Tentativa 1: OpenRouter ──────────────────────────────────────────────
  if (openRouterKey) {
    try {
      console.log("[ai-provider] Tentando OpenRouter...");
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

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content ?? "";

      if (!text) throw new Error("OpenRouter retornou conteúdo vazio.");

      console.log("[ai-provider] Sucesso via OpenRouter.");
      return { text, provider: "openrouter" };
    } catch (err) {
      console.warn(
        "[ai-provider] OpenRouter falhou, ativando fallback Gemini:",
        err
      );
    }
  } else {
    console.warn("[ai-provider] OPENROUTER_API_KEY ausente. Pulando para Gemini.");
  }

  // ─── Tentativa 2 (Fallback): Google Gemini ───────────────────────────────
  if (!geminiKey) {
    throw new Error(
      "Nenhum provedor de IA disponível. Configure OPENROUTER_API_KEY ou GEMINI_API_KEY."
    );
  }

  console.log("[ai-provider] Usando fallback: Google Gemini 2.0 Flash.");
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) throw new Error("Gemini retornou conteúdo vazio.");

  console.log("[ai-provider] Sucesso via Gemini (fallback).");
  return { text, provider: "gemini" };
}
