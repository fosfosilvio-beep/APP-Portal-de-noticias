"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

export interface LiveStatus {
  is_live: boolean;
  url_youtube: string | null;
  url_facebook: string | null;
  titulo: string | null;
  descricao: string | null;
}

export function useLiveStatus() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    let mounted = true;

    async function fetchStatus() {
      try {
        const { data } = await supabase
          .from("portal_live_status")
          .select("*")
          .order("id", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (mounted) {
          if (data) {
            setStatus(data);
          } else {
            setStatus({
              is_live: false,
              url_youtube: null,
              url_facebook: null,
              titulo: null,
              descricao: null,
            });
          }
          setLoading(false);
        }
      } catch (e) {
        console.error("[useLiveStatus] Error:", e);
        if (mounted) setLoading(false);
      }
    }

    fetchStatus();

    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`live_status_sync_${channelId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portal_live_status" },
        (payload: any) => {
          if (mounted) {
            setStatus((prev) => ({ ...prev, ...payload.new } as LiveStatus));
          }
        }
      )
      .subscribe((status: string, err?: Error) => {
        if (err) {
          console.error("[useLiveStatus] Realtime error:", err);
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { status, loading };
}
