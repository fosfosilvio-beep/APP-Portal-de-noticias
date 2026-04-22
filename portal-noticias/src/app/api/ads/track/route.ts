import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    if (!bodyText) return NextResponse.json({ ok: true });
    
    const payload = JSON.parse(bodyText);
    const supabase = await createClient();

    // LGPD compliant session hash
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const dateSalt = new Date().toISOString().slice(0, 10); // changes daily
    const session_hash = crypto.createHash('sha256').update(`${ip}-${userAgent}-${dateSalt}`).digest('hex').substring(0, 16);

    const impressions = payload.impressions?.map((imp: any) => ({
      slot_id: imp.slot_id,
      noticia_id: imp.noticia_id || null,
      viewport_w: imp.viewport_w,
      viewport_h: imp.viewport_h,
      viewed_at: imp.viewed_at,
      user_agent: userAgent,
      session_hash
    })) || [];

    const clicks = payload.clicks?.map((clk: any) => ({
      slot_id: clk.slot_id,
      noticia_id: clk.noticia_id || null,
      clicked_at: clk.clicked_at,
      referrer: clk.referrer,
      session_hash
    })) || [];

    if (impressions.length > 0) {
      await supabase.from("ad_impressions").insert(impressions);
    }
    
    if (clicks.length > 0) {
      await supabase.from("ad_clicks").insert(clicks);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Ads Track] Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
