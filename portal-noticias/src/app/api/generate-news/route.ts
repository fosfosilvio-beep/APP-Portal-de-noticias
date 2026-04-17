import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "O prompt é obrigatório." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Chave da API do OpenRouter não encontrada." }, { status: 500 });
    }

    const systemPrompt = `
Você é um experiente jornalista sênior local trabalhando no Portal Nossa Web TV, focado nas notícias de Arapongas e região.
Sua tarefa é receber um texto bruto, link de testemunha ou ideia de pauta, e redigir uma matéria absolutamente profissional.
Você deve responder OBRIGATORIAMENTE em formato JSON válido e puro. Não adicione textos adicionais antes ou depois.
A estrutura do objeto JSON deve corresponder exatamente as chaves abaixo:
{
  "titulo": "Título muito chamativo e profissional (curto e direto)",
  "subtitulo": "Um resumo curto (linha fina) que complementa o título",
  "conteudo": "A notícia completa e muito bem redigida com introdução, desenvolvimento e fim (mínimo de 3 parágrafos fluídos). Não use markdown, coloque o texto diretamente.",
  "categoria": "Classifique em exata UMA destas opções fixas: Arapongas, Esportes, Polícia, Política, Geral"
}`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://nossawebtv.vercel.app", 
        "X-Title": "Portal Nossa Web TV",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Fato a ser noticiado:\n\n${prompt}` }
        ]
      })
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error("OpenRouter API Failed:", errText);
      return NextResponse.json(
        { error: `O Serviço de Inteligência Artificial está temporariamente indisponível (OpenRouter respondeu ${openRouterRes.status}). Tente novamente em alguns instantes.` },
        { status: openRouterRes.status }
      );
    }

    const data = await openRouterRes.json();
    let contentStr = data.choices[0].message.content || "";

    // Garantia de fallback para limpar markdown caso a IA responda "```json ... ```"
    contentStr = contentStr.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsedJson = JSON.parse(contentStr);
      return NextResponse.json({
        titulo: parsedJson.titulo || "",
        subtitulo: parsedJson.subtitulo || "",
        conteudo: parsedJson.conteudo || "",
        categoria: parsedJson.categoria || "Geral"
      });
    } catch (parseError) {
      console.error("Failed to parse AI JSON:", contentStr);
      return NextResponse.json(
        { error: "A Inteligência artificial retornou um texto fora do padrão JSON. Tente reformular a ideia e tentar novamente." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Erro interno Gerador IA:", error);
    return NextResponse.json(
      { error: "Erro crítico no servidor ao se comunicar com a IA." },
      { status: 500 }
    );
  }
}
