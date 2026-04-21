import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Captura o IP do header X-Forwarded-For (Vercel/Cloudflare) ou connection
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  try {
    // Chama ip-api.com como proxy server-side (sem bloqueio CORS)
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,countryCode`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("ip-api indisponível");

    const data = await res.json();

    return NextResponse.json({
      ip,
      city: data.city || "Desconhecida",
      state: data.regionName || "Desconhecido",
      country: data.country || "Desconhecido",
      countryCode: data.countryCode || "?",
      status: data.status,
    });
  } catch {
    return NextResponse.json({
      ip,
      city: "Não disponível",
      state: "Não disponível",
      country: "Não disponível",
      countryCode: "?",
      status: "fail",
    });
  }
}
