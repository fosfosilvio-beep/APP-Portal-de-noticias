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
      .select("link_destino, validade_ate")
      .eq("id", id)
      .single();

    if (error || !ad) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Increment click count (using rpc if available, but doing it manually here since it's low traffic or using a safe approach)
    // For high concurrency, a Supabase RPC function is better: `increment_click(ad_id)`
    // But we can just use a simple update here for MVP. Or better, tracking it via an edge function.
    // To avoid race conditions, we can just do a simple increment. Wait, Supabase update doesn't support x = x + 1 directly in the API.
    // We will call a generic RPC if we had one. If not, just fetching and adding 1 is okay for this traffic level.
    const { data: adClicks } = await supabase.from("ad_slots").select("cliques").eq("id", id).single();
    if (adClicks) {
      await supabase.from("ad_slots").update({ cliques: (adClicks.cliques || 0) + 1 }).eq("id", id);
    }

    // 3. Redirect to the destination
    if (ad.link_destino) {
      // Ensure the link is absolute
      const targetUrl = ad.link_destino.startsWith("http") ? ad.link_destino : `https://${ad.link_destino}`;
      return NextResponse.redirect(targetUrl);
    }

    // If no link, redirect to home
    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    console.error("Erro no tracking de anúncio:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}
