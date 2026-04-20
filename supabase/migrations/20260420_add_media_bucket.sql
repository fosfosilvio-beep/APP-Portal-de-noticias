-- Migration: Create Storage Bucket for Media/Banners
-- Description: Creates the public bucket "media" if it doesn't exist, and sets policies wrapper.
-- Obs: We assume anon has access for simplicity of the UI, or we restrict insert to authenticated if needed.

DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('media', 'media', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Policy to allow public reads
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'media' );

-- Policy to allow uploads (Assuming public for simplicity unless restricted by auth)
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'media' );
