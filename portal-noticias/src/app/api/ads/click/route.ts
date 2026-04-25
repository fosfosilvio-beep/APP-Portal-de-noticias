import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// We use the service role key to bypass RLS for incrementing clicks anonymously
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_key"
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 1. Fetch current ad details
    const { data: ad, error } = await supabase
      .from("ad_slots")
      .select("link_destino, click_url, validade_ate")
      .eq("id", id)
      .single();

    if (error || !ad) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Increment click count
    const { data: adClicks } = await supabase.from("ad_slots").select("cliques").eq("id", id).single();
    if (adClicks) {
      await supabase.from("ad_slots").update({ cliques: (adClicks.cliques || 0) + 1 }).eq("id", id);
    }

    // 3. Redirect to the destination
    const finalLink = ad.click_url || ad.link_destino;
    
    if (finalLink) {
      // Ensure the link is absolute
      const targetUrl = finalLink.startsWith("http") ? finalLink : `https://${finalLink}`;
      return NextResponse.redirect(targetUrl);
    }

    // If no link, redirect to home
    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("Erro no tracking de anúncio:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
