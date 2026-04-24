import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  // Protect this route if necessary, e.g., using a secret token
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const supabase = await createClient();
    
    // Find all scheduled news whose publish_at time is now or in the past
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("noticias")
      .update({ status: "published" })
      .eq("status", "scheduled")
      .lte("publish_at", now)
      .select("id, titulo");
      
    if (error) throw error;

    if (data && data.length > 0) {
      console.log(`[CRON] Published ${data.length} scheduled news.`);
      
      // Log in admin_actions
      const actions = data.map((news: any) => ({
        user_id: null, // System action
        action: "auto_publish",
        entity_type: "noticias",
        entity_id: news.id,
        diff: { status: "published" }
      }));
      
      await supabase.from("admin_actions").insert(actions);
    }

    return NextResponse.json({ ok: true, publishedCount: data?.length || 0 });
  } catch (error) {
    console.error("[CRON] Error publishing scheduled news:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
