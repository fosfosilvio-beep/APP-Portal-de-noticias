import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "O prompt é obrigatório." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Chave da API do OpenRouter não encontrada no servidor." }, { status: 400 });
    }

    const systemPrompt = `
Você é o Editor-Chefe Sênior do Portal Web TV Cidade. Sua missão é transformar textos brutos, rascunhos ou links de fatos em matérias jornalísticas de altíssimo nível.

DIRETRIZES DE REDAÇÃO:
1. ORIGINALIDADE TOTAL: Reescreva a estrutura narrativa. Elimine qualquer rastro de plágio da fonte original.
2. TONS: Use linguagem séria, ágil e moderna. O texto deve passar credibilidade e urgência.
3. FORMATAÇÃO HTML: A notícia deve vir pronta para o editor Rich Text.
   - Use <p> para parágrafos.
   - Use <h2> para subtítulos internos interessantes.
   - Use <ul> e <li> para listas de fatos ou pontos importantes.
   - Use <strong> para nomes de pessoas, autoridades, locais e datas cruciais.
4. FATOS: Mantenha rigorosamente todos os nomes, cargos, valores e horários citados no texto original.

CONTRATO DE SAÍDA (Obrigatório responder apenas em JSON puro):
{
  "titulo": "Manchete impactante e curta",
  "subtitulo": "Linha fina resumida e informativa",
  "conteudo": "Texto completo em HTML conforme as regras acima",
  "categoria": "Uma destas: Arapongas, Esportes, Polícia, Política, Geral",
  "slug": "url-amigavel-baseada-no-titulo"
}`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://webtvcidade.com.br", 
        "X-Title": "Web TV Cidade - Gerador Mágico",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Fato a ser processado pela redação:\n\n${prompt}` }
        ]
      })
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error("OpenRouter Error:", errText);
      return NextResponse.json(
        { error: `Falha na redação automática (Status ${openRouterRes.status}). Tente novamente em instantes.` },
        { status: openRouterRes.status }
      );
    }

    const data = await openRouterRes.json();
    let contentStr = data.choices[0].message.content || "";

    // Limpeza de blocos de código se a IA persistir neles
    contentStr = contentStr.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsedJson = JSON.parse(contentStr);
      return NextResponse.json({
        titulo: parsedJson.titulo || "",
        subtitulo: parsedJson.subtitulo || "",
        conteudo: parsedJson.conteudo || "",
        categoria: parsedJson.categoria || "Geral",
        slug: (parsedJson.slug || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")
      });
    } catch (parseError) {
      console.error("Failed to parse JSON content:", contentStr);
      return NextResponse.json(
        { error: "A redação automática falhou ao gerar o formato correto. Tente reformular o pedido." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Erro interno no Gerador Mágico:", error);
    return NextResponse.json(
      { error: "Erro crítico no servidor de Inteligência Artificial." },
      { status: 500 }
    );
  }
}
