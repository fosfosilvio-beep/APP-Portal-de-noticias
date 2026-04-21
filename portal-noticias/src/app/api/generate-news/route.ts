import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    console.log("AI Route Payload:", JSON.stringify(rawBody));
    
    const { content, guidelines } = rawBody;

    if (!content) {
      console.warn("AI Route: Conteúdo ausente no payload.");
      return NextResponse.json({ error: "O conteúdo para processamento é obrigatório." }, { status: 400 });
    }

    // Tenta buscar a API Key do Supabase usando SERVICE_ROLE para evitar 401
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || ""
    );

    const { data: config } = await supabaseAdmin
      .from("configuracao_portal")
      .select("openrouter_api_key")
      .limit(1)
      .single();
    
    // Fallback para variável de ambiente se o banco não estiver configurado ou vazio
    const apiKey = config?.openrouter_api_key || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      console.error("AI Route: API Key not found.");
      return NextResponse.json({ error: "Configuração de IA (OpenRouter API Key) não encontrada." }, { status: 400 });
    }

    const systemPrompt = `
Você é um Editor Sênior de grandes portais de notícias (como G1, Folha de S. Paulo e BBC). Sua missão é transformar textos brutos em matérias jornalísticas de altíssimo nível para o Portal Web TV Cidade.

DIRETRIZES DE REDAÇÃO:
1. ORIGINALIDADE TOTAL: Reescreva a estrutura narrativa para eliminar qualquer rastro de plágio da fonte original.
2. FLUIDEZ E MODERNIDADE: Use linguagem séria, ágil e moderna. O texto deve ser envolvente e profissional.
3. FORMATAÇÃO HTML: A saída deve estar pronta para inserção direta em um editor Rich Text (TipTap).
   - Use <p> para parágrafos.
   - Use <h2> para subtítulos internos interessantes.
   - Use <ul> e <li> para listas de fatos ou pontos importantes.
   - Use <strong> para nomes de pessoas, autoridades, locais e datas cruciais.
4. RIGOR TÉCNICO: Mantenha rigorosamente todos os nomes, cargos, valores e horários citados.
5. ADAPTAÇÃO DE TOM: Você deve seguir RIGOROSAMENTE as diretrizes de estilo fornecidas pelo jornalista.

Sua resposta deve conter APENAS o conteúdo reescrito em HTML puro. Não adicione títulos, comentários ou introduções extras.`;

    const instructions = guidelines 
      ? `DIRETRIZES DE ESTILO DO JORNALISTA: ${guidelines}\n\nCONTEÚDO PARA REESCRITA:\n${content}`
      : `REESCREVA O SEGUINTE CONTEÚDO COM ORIGINALIDADE TOTAL:\n${content}`;

    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://webtvcidade.com.br", 
        "X-Title": "Web TV Cidade - Editor IA",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: instructions }
        ]
      })
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error("OpenRouter Response Error:", errText);
      return NextResponse.json(
        { error: `Falha na redação automática (OpenRouter ${openRouterRes.status}): ${errText.slice(0, 100)}` },
        { status: openRouterRes.status }
      );
    }

    const data = await openRouterRes.json();
    let contentStr = data.choices[0].message.content || "";

    // Limpeza de possíveis blocos de código markdown que a IA possa incluir por vício
    contentStr = contentStr.replace(/```html/gi, '').replace(/```/g, '').trim();

    return NextResponse.json({ conteudo: contentStr });

  } catch (error: any) {
    console.error("Erro interno no Editor IA:", error);
    return NextResponse.json(
      { error: "Erro crítico no servidor de Inteligência Artificial." },
      { status: 500 }
    );
  }
}
