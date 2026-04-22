CREATE TABLE ad_impressions (
  id BIGSERIAL PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  session_hash TEXT,
  viewport_w INT,
  viewport_h INT
);
CREATE INDEX idx_ad_impressions_slot_time ON ad_impressions(slot_id, viewed_at DESC);

CREATE TABLE ad_clicks (
  id BIGSERIAL PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  session_hash TEXT,
  referrer TEXT
);
CREATE INDEX idx_ad_clicks_slot_time ON ad_clicks(slot_id, clicked_at DESC);
