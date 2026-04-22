"use client";

// Buffer to avoid overwhelming the server with single requests
let impressionBuffer: any[] = [];
let clickBuffer: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

const FLUSH_INTERVAL = 3000; // Flush every 3s

function flush() {
  if (impressionBuffer.length === 0 && clickBuffer.length === 0) return;

  const payload = {
    impressions: [...impressionBuffer],
    clicks: [...clickBuffer]
  };

  impressionBuffer = [];
  clickBuffer = [];

  // Use sendBeacon if possible (non-blocking, works during page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/ads/track', JSON.stringify(payload));
  } else {
    fetch('/api/ads/track', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    }).catch(console.error);
  }
}

function scheduleFlush() {
  if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flush();
      flushTimeout = null;
    }, FLUSH_INTERVAL);
  }
}

export function trackImpression(slotId: string, noticiaId?: string) {
  impressionBuffer.push({
    slot_id: slotId,
    noticia_id: noticiaId,
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    viewed_at: new Date().toISOString()
  });
  scheduleFlush();
}

export function trackClick(slotId: string, noticiaId?: string) {
  clickBuffer.push({
    slot_id: slotId,
    noticia_id: noticiaId,
    referrer: document.referrer,
    clicked_at: new Date().toISOString()
  });
  // Flush immediately on click to avoid losing it if they navigate away
  flush();
}

// Attach to page hide/unload to flush any remaining
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flush);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
