"use client";

import { useState, useEffect } from "react";
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
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      try {
        const { data, error } = await supabase
          .from("portal_live_status")
          .select("*")
          .eq("id", 1)
          .maybeSingle();

        if (mounted) {
          if (data) {
            setStatus(data);
          } else {
            // Fallback se a tabela não existir ou estiver vazia
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

    // Realtime Sync
    const channel = supabase
      .channel("live_status_sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "portal_live_status" },
        (payload) => {
          if (mounted) {
            setStatus((prev) => ({ ...prev, ...payload.new } as LiveStatus));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { status, loading };
}
