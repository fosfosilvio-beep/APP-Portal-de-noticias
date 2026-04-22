ALTER TABLE ad_slots
  ADD COLUMN width INT,
  ADD COLUMN height INT,
  ADD COLUMN is_sponsored_content BOOLEAN DEFAULT false,
  ADD COLUMN advertiser_name TEXT,
  ADD COLUMN click_url TEXT,
  ADD COLUMN start_date TIMESTAMPTZ,
  ADD COLUMN end_date TIMESTAMPTZ;

-- Removing the constraint for now to avoid breaking existing data, 
-- we will handle validation at the application level via Zod.
-- ALTER TABLE ad_slots ADD CONSTRAINT ad_slots_dimensions_required CHECK (status_ativo = false OR (width IS NOT NULL AND height IS NOT NULL));
