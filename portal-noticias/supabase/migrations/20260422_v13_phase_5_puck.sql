CREATE TABLE page_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  draft_data JSONB,
  published_data JSONB,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

INSERT INTO page_layout (slug, published_data, draft_data)
VALUES (
  'home', 
  '{"content": [], "root": {"props": {"title": "Home"}}}',
  '{"content": [], "root": {"props": {"title": "Home"}}}'
);
